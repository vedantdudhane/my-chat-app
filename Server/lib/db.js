import mongoose from "mongoose";

// Function to connect to mongodb
export const connectDB = async () =>{
    try{
        mongoose.connection.on('connected', ()=> console.log("Database Connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}/my-chat-app`)
    }
    catch (error){
        console.log(error)
    }
}