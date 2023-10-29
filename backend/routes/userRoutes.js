import express from "express";
import { authUser, getAllUsers, registerUser, sendOTP, verifyOTP } from "../controllers/userController.js";
const router = express.Router()



router.route('/').post(registerUser)
router.route('/login').post(authUser)
router.route('/all').get(getAllUsers)
router.route('/send-otp').post(sendOTP)
router.route('/verify-otp').post(verifyOTP)


export default router