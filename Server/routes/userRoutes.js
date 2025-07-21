import express from "express"
import { protectRoute } from "../middleware/auth.js";
import { checkAuth, login, signup, updateProfile,logout } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.put("/update-profile", protectRoute, updateProfile)
userRouter.get("/check",protectRoute,checkAuth)
userRouter.post("/logout",logout)


export default userRouter