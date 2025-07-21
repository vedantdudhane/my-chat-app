import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io"

// Create express app and http server

const app = express()
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server,{
    cors: {origin : "*"}
})

// Store online users
export const userSocketMap = {}        // {userId: socketId}

// Socket.io connection handler 
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId)

    if(userId) userSocketMap[userId] = socket.id

// Emit online users to all conected clients
io.emit("getOnlineUsers", Object.keys(userSocketMap))

socket.on("disconnect",()=>{
    console.log("User Disconnected",userId);
    delete userSocketMap[userId]
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
})

})

// Middleware setup
app.use(express.json({limit: "40mb"}))
app.use(express.urlencoded({ extended: true, limit: "40mb" }));
app.use(cors()) 

// Route setup
app.use("/api/status",(req,res)=> res.send("Server is live"))
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

// Connect mongodb

await connectDB();

if(process.env.NODE_ENV !=='production'){
const PORT = process.env.port || 5000;
server.listen(PORT,()=> console.log("Server is Running on Port: "+ PORT));
}

// Exporting for vercel
export default server;

