// Import the Express framework to create a router for handling product-related API requests
import express from 'express'
import { listProducts,addProduct,removeProduct,singleProduct } from '../controllers/productControllers.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

// Create an instance of an Express Router
const productRouter = express.Router();


// Define the API routes for product management

// Route to add a new product
// - Uses `upload.single("image")` to handle image uploads
// - `adminAuth` middleware ensures only admins can add products
// - Calls `addProduct` controller to handle the request
productRouter.post('/add', upload.single("image"),adminAuth, addProduct)

// Route to get a list of all products
// - Calls `listProducts` controller to fetch all products
productRouter.get('/list', listProducts)

// Route to remove a product
// - `adminAuth` middleware ensures only admins can remove products
// - Calls `removeProduct` controller to handle deletion
productRouter.post('/remove',adminAuth, removeProduct)

// Route to get details of a single product
// - Calls `singleProduct` controller to fetch details of a specific product
productRouter.get('/single', singleProduct)

export default productRouter