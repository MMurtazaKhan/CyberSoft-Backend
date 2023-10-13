import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import { errorHandler, notFound } from "./middleware/error.js";

dotenv.config()

connectDB()

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Routes
app.use("/api/users", userRoutes)

// Define a sample route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.use(notFound)
app.use(errorHandler)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});