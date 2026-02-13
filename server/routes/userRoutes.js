import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData, getUserBookings } from "../controllers/userControllers.js";
const userRouter = express.Router();
userRouter.get('/data', userAuth, getUserData);
userRouter.get('/bookings', userAuth, getUserBookings);
export default userRouter;