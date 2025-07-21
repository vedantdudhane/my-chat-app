import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineusers, setOnlineusers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is authenticated and set user data
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                console.log("User restored:", data.user);
                connectSocket(data.user);
            } else {
                setAuthUser(null);
                localStorage.removeItem("token");
                setToken(null);
                console.log("No user session found");
            }
        } catch (error) {
            console.error("Error in checkAuth:", error.message);
            setAuthUser(null);
            localStorage.removeItem("token");
            setToken(null);
        }
    };

    // Login function to handle user authentication and socket connection
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                connectSocket(data.userData);
                console.log("User logged in:", data.userData);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Login error:", error.message);
            toast.error(error.message);
        }
    };

    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        try {
            console.log("Token sent in logout request:", axios.defaults.headers.common["token"]);
            const response = await axios.post("/api/auth/logout");
            console.log("Logout response:", response.data);
            localStorage.removeItem("token");
            setToken(null);
            setAuthUser(null);
            setOnlineusers([]);
            axios.defaults.headers.common["token"] = null;
            if (socket && socket.connected) {
                socket.disconnect();
                setSocket(null);
            }
            console.log("User logged out");
            toast.success("Logged out successfully");
            return true;
        } catch (error) {
            console.error("Logout error:", error.response?.data || error.message);
            toast.error("Logout failed: " + (error.response?.data?.message || error.message));
            return false;
        }
    };

    // Update profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put(
                "/api/auth/update-profile",
                body,
                {
                    headers: {
                        "Content-Type": "application/json",
                        token: token,
                    },
                }
            );
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error in updateProfile:", error.message);
            toast.error(error.message);
        }
    };

    // Connect socket function to handle socket connection and online users updates
    const connectSocket = (userData) => {
        if (!userData || !userData._id || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            },
        });
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineusers(userIds);
            console.log("Online users:", userIds);
        });
        console.log("Socket connected for user:", userData._id);
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            checkAuth();
        } else {
            setAuthUser(null);
            setOnlineusers([]);
            if (socket && socket.connected) socket.disconnect();
            setSocket(null);
        }
    }, [token]);

    const value = {
        axios,
        token,
        authUser,
        onlineusers,
        socket,
        login,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};