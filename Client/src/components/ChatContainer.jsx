import React, { useEffect, useRef } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast"; // Import toast for error handling

const ChatContainer = () => {
    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
    const { authUser, onlineusers } = useContext(AuthContext); // Changed to onlineusers
    const scrollEnd = useRef();
    const [input, setInput] = useState("");

    // Handle sending a message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (!selectedUser || !selectedUser._id) {
            toast.error("No user selected");
            return;
        }
        try {
            await sendMessage({ text: input.trim() });
            setInput("");
        } catch (error) {
            toast.error("Failed to send message");
            console.error("Error in handleSendMessage:", error.message);
        }
    };

    // Handle sending an image
    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (!selectedUser || !selectedUser._id) {
            toast.error("No user selected");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                await sendMessage({ image: reader.result });
                e.target.value = "";
            } catch (error) {
                toast.error("Failed to send image");
                console.error("Error in handleSendImage:", error.message);
            }
        };
        reader.readAsDataURL(file);
    };

    // Fetch messages when selectedUser changes
    useEffect(() => {
        if (selectedUser?._id && authUser?._id) {
            getMessages(selectedUser._id).catch((error) => {
                toast.error("Failed to load messages");
                console.error("Error in getMessages:", error.message);
            });
        }
    }, [selectedUser, authUser]);

    // Scroll to the latest message when messages change
    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // Depend on messages to scroll on update

    // Return fallback if no user is selected or authUser is not available
    if (!authUser || !selectedUser) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
                <img src={assets.chat_icon} className="max-w-16" alt="" />
                <p className="text-lg font-medium text-white">Chat anytime, anywhere with your closed ones</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-scroll relative backdrop-blur-lg">
            {/* Header */}
            <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
                <img
                    src={selectedUser.profilePic || assets.avatar_icon}
                    alt=""
                    className="w-8 rounded-full"
                />
                <p className="flex-1 text-lg text-white flex items-center gap-2">
                    {selectedUser.fullName}
                    {onlineusers.includes(selectedUser._id) && (
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    )}
                </p>
                <img
                    onClick={() => setSelectedUser(null)}
                    src={assets.arrow_icon}
                    alt=""
                    className="md:hidden max-w-7 cursor-pointer"
                />
                <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
            </div>
            {/* Chat Area */}
            <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center">No messages yet</p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-end gap-2 justify-end ${
                                msg.senderId !== authUser._id && "flex-row-reverse"
                            }`}
                        >
                            {msg.image ? (
                                <img
                                    src={msg.image}
                                    alt=""
                                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                                />
                            ) : (
                                <p
                                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                                        msg.senderId === authUser._id ? "rounded-br-none" : "rounded-bl-none"
                                    }`}
                                >
                                    {msg.text}
                                </p>
                            )}
                            <div className="text-center text-xs">
                                <img
                                    src={
                                        msg.senderId === authUser._id
                                            ? authUser?.profilePic || assets.avatar_icon
                                            : selectedUser?.profilePic || assets.avatar_icon
                                    }
                                    alt=""
                                    className="w-7 rounded-full"
                                />
                                <p className="text-gray-500">
                                    {msg.createdAt ? formatMessageTime(msg.createdAt) : "Unknown time"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={scrollEnd}></div>
            </div>
            {/* Bottom Area */}
            <div className="absolute left-0 right-0 bottom-0 flex items-center gap-3 p-3">
                <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
                    <input
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
                        type="text"
                        placeholder="Send a message"
                        className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
                    />
                    <input
                        onChange={handleSendImage}
                        type="file"
                        id="image"
                        accept="image/png, image/jpeg"
                        hidden
                    />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
                    </label>
                </div>
                <img
                    onClick={handleSendMessage}
                    src={assets.send_button}
                    alt=""
                    className="w-7 cursor-pointer"
                />
            </div>
        </div>
    );
};

export default ChatContainer;