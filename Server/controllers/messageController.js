import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except logged-in user
export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

        let objectUserId;
        try {
            objectUserId = new mongoose.Types.ObjectId(userId);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid User ID format" });
        }

        const filteredUsers = await User.find({ _id: { $ne: objectUserId } }).select("-password");

        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: objectUserId,
                seen: false,
            });
            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });
        await Promise.all(promises);

        console.log("Filtered Users:", filteredUsers.map((u) => u._id.toString()));
        return res.json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.error("Error in getUserForSidebar:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(selectedUserId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ],
        });
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { seen: true }
        );
        res.json({ success: true, messages });
    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// API to mark message as seen using message ID
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid message ID" });
        }
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });
    } catch (error) {
        console.error("Error in markMessageAsSeen:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ success: false, message: "Text or image is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ success: false, message: "Invalid receiver ID" });
        }
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ success: false, message: "Invalid sender ID" });
        }

        let imageUrl = "";
        if (image) {
            if (typeof image !== "string" || !image.startsWith("data:image/")) {
                return res.status(400).json({ success: false, message: "Invalid image data" });
            }
            try {
                console.log("Uploading image to Cloudinary, size:", image.length); // Debug log
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    resource_type: "image",
                    folder: "chat_images",
                });
                imageUrl = uploadResponse.secure_url;
                console.log("Image uploaded:", imageUrl);
            } catch (error) {
                console.error("Cloudinary upload error:", error.message, error);
                return res.status(500).json({ success: false, message: `Failed to upload image: ${error.message}` });
            }
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text || "",
            image: imageUrl,
        });

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            console.log("Emitting newMessage to socket:", receiverSocketId);
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.json({ success: true, newMessage });
    } catch (error) {
        console.error("Error in sendMessage:", error.message, error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};