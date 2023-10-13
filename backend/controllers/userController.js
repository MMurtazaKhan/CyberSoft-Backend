import User from "../models/userModel.js"
import asyncHandler from 'express-async-handler'
import generateToken from "../utils/generateToken.js";


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

  export {registerUser, authUser, getAllUsers}