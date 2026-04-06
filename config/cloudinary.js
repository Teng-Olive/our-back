// Import the Cloudinary library (v2 version) for handling cloud-based media storage
import {v2 as cloudinary} from 'cloudinary'

// Function to configure and connect Cloudinary
const connectCloudinary = async ()=> {
     // Set up Cloudinary configuration using environment variables
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    })

}

// Export the connectCloudinary function so it can be used in other parts of the project
export default connectCloudinary