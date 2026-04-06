
import {v2 as cloudinary} from "cloudinary"
import Product from '../models/Product.js';


/* 
 * Function to add a new product
 * It accepts product details and an image, uploads the image to Cloudinary,
 * and saves the product information to the database.
 */
const addProduct = async (req, res) => { 
    try {
        // Extract product details from the request body
        const { name, price, description, category } = req.body;
        
        // Extract the uploaded image from the request
        const image = req.file; 

        // Check if an image was uploaded, if not, return an error
        if (!image) {
            return res.json({ success: false, message: "Please upload an image." });
        }

        // Upload the image to Cloudinary and get the secure URL
        let result = await cloudinary.uploader.upload(image.path, { resource_type: 'image' });
        
        // Create a new product object with all necessary details
        const productData = {
            name,
            description,
            category,
            price: Number(price), // Ensure price is stored as a number
            image: result.secure_url, // Store the image URL from Cloudinary
            date: Date.now() // Save the current timestamp
        };

        console.log(productData);

        // Create and save the product to the database using Sequelize
        await Product.create(productData);

        // Send a success response to the client
        res.json({ success: true, message: 'Product added successfully!' });
    } catch (error) {
        console.log("Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

/* 
 * Function to list all products
 * Retrieves all products from the database and sends them in the response.
 */
const listProducts = async (req,res) => {
    
    try {
        // Fetch all products
        const products = await Product.findAll();
        res.json({success:true, products})
    } catch (error) {
        console.log("Error:", error.message);
        res.json({ success: false, message: error.message });
    }
    
}

/* 
 * Function to remove a product
 * Finds a product by its ID and deletes it from the database.
 */
const removeProduct = async (req,res) => {
    
    try {
        // Delete product by ID
        await Product.destroy({ where: { id: req.body._id } })
        res.json({success:true, message:'Product removed' })
        } catch (error) {
            console.log("Error:", error.message);
            res.json({ success: false, message: error.message });
        }
    }

/* 
 * Function to fetch details of a single product
 * Retrieves a product from the database using its ID.
 */
const singleProduct = async (req,res) => {
    try {
        // Extract product ID from request body
        const {productId} = req.body
        // Find product by ID
        const product = await Product.findByPk(productId)
        res.json({success:true, product})
    } catch (error) {
        console.log("Error:", error.message);
        res.json({ success: false, message: error.message });
    }

}

export {listProducts, addProduct, removeProduct, singleProduct}