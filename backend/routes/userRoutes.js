import express from "express";
import { authUser, getAllUsers, registerUser } from "../controllers/userController.js";
const router = express.Router()



router.route('/').post(registerUser)
router.route('/login').post(authUser)
router.route('/all').get(getAllUsers)


export default router