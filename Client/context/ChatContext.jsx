import { useContext, useState, useEffect } from "react";
import { createContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const { socket, axios, authUser: user, onlineusers } = useContext(AuthContext);

    // Function to get all users at sidebar
    const getUsers = async () => {
        if (!user || !user._id) {
            console.log("No user available, skipping getUsers");
            return;
        }
        try {
            console.log("Fetching users for userId:", user._id);
            const { data } = await axios.get(`/api/messages/users?userId=${user._id}`);
            if (data.success) {
                console.log("Users fetched:", data.users);
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            } else {
                toast.error(data.message || "Failed to fetch users");
            }
        } catch (error) {
            console.error("Error in getUsers:", error.message);
            toast.error("Failed to load users");
        }
    };

    // Function to get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error in getMessages:", error.message);
            toast.error("Failed to load messages");
        }
    };

    // Function to send message to selected user
    const sendMessage = async (messageData) => {
    try {
        if (!selectedUser || !selectedUser._id) {
            throw new Error("No user selected");
        }
        console.log("Sending message to:", selectedUser._id, "data:", messageData); // Debug log
        const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
        if (data.success) {
            console.log("Message sent:", data.newMessage);
            setMessages((prevMessages) => [...prevMessages, data.newMessage]);
        } else {
            throw new Error(data.message || "Failed to send message");
        }
    } catch (error) {
        console.error("Error in sendMessage:", error.message, error); // Enhanced debug log
        throw error; // Re-throw to be caught in handleSendImage
    }
};

    // Function to subscribe to messages for selected user
    const subscribeToMessages = () => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
                        ? prevUnseenMessages[newMessage.senderId] + 1
                        : 1,
                }));
            }
        });
    };

    // Function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    };

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    useEffect(() => {
        if (user && user._id) {
            getUsers();
        }
    }, [user]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};