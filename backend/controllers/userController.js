import User from "../models/userModel.js"
import asyncHandler from 'express-async-handler'
import generateToken from "../utils/generateToken.js";
import twilio from 'twilio'
import dotenv from "dotenv"

dotenv.config()

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, {
    lazyLoading: true
});

// route for the user registration route
const registerUser = asyncHandler(async (req, res) => {
   
      const { name, email, mobileNumber, password } = req.body;
      const userExists = await User.findOne({$or: [{ email: email }, { mobileNumber: mobileNumber }]})
      if(userExists){
          res.status(400)
          throw new Error("User already exists")
      }
      const newUser = new User({ name, email, mobileNumber, password });
      const savedUser = await newUser.save();
  
      if (savedUser){
        res.status(201).json({
            _id : savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            mobileNumber: savedUser.mobileNumber,
            token: generateToken(savedUser._id)
        })
    } })

// route for the user registration route
const sendOTP = asyncHandler(async (req, res) => {
    const { name, email, mobileNumber, password } = req.body;

    // Check if the user with the given email or mobile number already exists
    const userExists = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    try {
        // Create a new user document with mobileNumber and temporary flag
        const newUser = new User({ name, email, mobileNumber, password, isVerified: false });


        // Send an OTP via Twilio
        const verification = await client.verify.services(process.env.TWILIO_SERVICE_ID).verifications.create({
            to: mobileNumber,
            channel: 'sms',
        });

        // Verify the response
        if (verification.status === 'pending') {
            res.status(200).json({
                message: 'OTP sent successfully',
            });
        } else {
            res.status(400).json({
                error: 'Failed to send OTP',
            });
        }
        
        // Save the new user to the database
        const savedUser = await newUser.save();
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});


const verifyOTP = asyncHandler(async (req, res) => {
    const { mobileNumber, otp } = req.body;

    try {
        // Verify the OTP using the verificationSid from the user's document
        const user = await User.findOne({ mobileNumber, isVerified: false });
        if (!user) {
            res.status(400).json({
                error: 'User not found or already verified',
            });
            return;
        }

        const verifyResponse = await client.verify.services(process.env.TWILIO_SERVICE_ID).verificationChecks.create({
            to: mobileNumber,
            code: otp,
        });

        if (verifyResponse.status === 'approved') {
            // Update the user's document to set isVerified to true
            user.isVerified = true;
            await user.save();

            res.status(200).json({
                message: 'OTP verified successfully',
            });
        } else {
            res.status(400).json({
                error: 'Failed to verify OTP',
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});




    const authUser = asyncHandler(async (req, res) => {
      const {email, password, mobileNumber} = req.body
      const user = await User.findOne({$or: [{ email: email }, { mobileNumber: mobileNumber }]})
  
      if (user && (await user.matchPassword(password))){
          res.json({
              _id : user._id,
              name: user.name,
              email: user.email,
              mobileNumber: user.mobileNumber,
              token: generateToken(user._id)
          })
      }else {
          res.status(401)
          throw new Error("Invalid email or Password")
      }
  })

    const getAllUsers = asyncHandler(async (req, res) => {
      
      const users = await User.find()
  
      if(users){
        res.status(200)
        res.json({users})
      }
      else {
          res.status(401)
          throw new Error("Invalid email or Password")
      }
  })

  export {registerUser, authUser, getAllUsers, sendOTP, verifyOTP}