import validator from "validator";
import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Function to create a JWT token for a user
const createToken = (id)=> {
    // Signs a JWT token using the user's ID and a secret key
    return jwt.sign({id}, process.env.JWT_SECRET)
}
// Function to handle user login
const loginUser = async (req, res) => {
   
    try {
        // Extract email and password from the request body
        const { email, password } = req.body;

        // Find a user in the database by email
        const user = await User.findOne({ where: { email } });
        // If no user is found, return an error response
        if(!user){
            return res.status(404).json({error: "User not found"})
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        // If passwords match, generate a JWT token and return a success response
        if(isMatch){
            // Create a token for the user
            const token = createToken(user.id);
            res.json({success:true,message:"Login Successful", token})
        } 
        // If passwords do not match, return an error message
        else{
            res.json({success:false, message:"Incorrect password entered"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

// Function to register a new user
const registerUser = async(req,res) => {
   
    try {
        // Extract name, email, and password from request body
        const {name, email, password} = req.body;

        // Check if the user already exists in the database
        const exists = await User.findOne({ where: { email } });
        if (exists) {
            return res.status(400).json({message: "User already exist"})

        }

        // Validate email format using the validator package
        if(!validator.isEmail(email)){
            return res.status(400).json({success:false, message: "Invalid email address"})
        }
        // Ensure the password is at least 8 characters long for security
        if(password.length < 8){
            return res.status(400).json({success:false, message: "Please enter strong password"})
        }

        // Hash the user's password before saving to the database
        const salt = await bcrypt.genSalt(10) // Generate salt for hashing
        const hashedPassword = await bcrypt.hash(password, salt) // Hash the password

        // Create a new user in the database
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword,
            cartData: {}
        });
        
        // Generate a JWT token for authentication
        const token = createToken(user.id)
        // Send success response with token
        res.json({success:true, message:"Account created successfully", token})


    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
        
    }
}


// Function for admin login
const adminLogin= async(req,res) => {
    try {
         // Extract email and password from request body
        const {email,password} = req.body
        // Check if email and password match the stored admin credentials
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
             // Create a JWT token for the admin
            const token = jwt.sign({ id: email + password }, process.env.JWT_SECRET)
            res.json({success:true, token})
        } else {
            // If credentials are incorrect, return an error message
            res.json({sucess:false, message: 'Invalid details'})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

export {loginUser, registerUser,adminLogin}