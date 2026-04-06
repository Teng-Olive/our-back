import OrderModel from '../models/OrderModel.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Stripe from 'stripe'

//GATEWAY INITIALIZE
const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe;
if (stripeKey) {
    // set apiVersion to a stable Stripe API version
    stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16' });
} else {
    console.warn('STRIPE_SECRET_KEY is not set. Stripe features will be disabled until you set it in backend/.env');
} 

// global variables
const currency = 'usd'
const deliveryCharge = 12

// Placing order using COD (cash on delivery) Method
const placeOrder = async (req, res) => {
    try {
        const { userId, amount, address } = req.body;

        // Fetch user data to get cart items
        const userData = await User.findByPk(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch product details and include name in items array
        let cartData = userData.cartData || {};
        if (typeof cartData === "string") {
            try {
                cartData = JSON.parse(cartData);
            } catch (err) {
                cartData = {};
            }
        }

        const items = await Promise.all(
            Object.entries(cartData).map(async ([itemId, quantity]) => {
                const product = await Product.findByPk(itemId);
                
                if (!product) {
                    throw new Error(`Product with ID ${itemId} not found`);
                }

                return {
                    itemId,
                    name: product.name, // Fetch product name
                    image: product.image, // Fetch product image 
                    price: product.price, // Fetch product price
                    quantity,
                };
            })
        );

        if (items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Prepare order data object
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
        };

        // Create and save the order to database
        await OrderModel.create(orderData);

        // Clear the user's cart
        await userData.update({ cartData: {} });

        // Send success response
        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

  

// Placing order using stripe
// This code sets up a Stripe checkout session for processing payments, including product details, prices, and a delivery charge, with redirection URLs for success and cancellation outcomes.
const placeOrderStripe = async (req, res) => {
    try {
      // Extract user ID, amount, and address from request body
      const { userId, amount, address } = req.body;
      // Get the origin URL from request headers (used for redirect URLs in Stripe)
      const { origin } = req.headers;
  
      // Fetch user data from the database using userId
      const userData = await User.findByPk(userId);
      // If the user does not exist, return an error response
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Retrieve the user's cart items, mapping each item to fetch product details
      const items = await Promise.all(
        Object.entries(userData.cartData).map(async ([itemId, quantity]) => {
          const product = await Product.findByPk(itemId);
          return {
            itemId, // Product ID
            name: product.name,
            image: product.image,
            price: product.price,
            quantity,
          };
        })
      );
  
      // If cart is empty, return an error response
      if (items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }
  
      // Create a new order object to store in the database
      const orderData = {
        userId,  // User ID placing the order
        items, // List of items in the cart
        amount,
        address,
        paymentMethod: "Stripe",
        payment: false,
        date: Date.now(),
      };
  
      // Save the new order to the database
      const newOrder = await OrderModel.create(orderData);
  
      // Convert items into Stripe's required format for checkout session
      const line_items = items.map((item) => ({
        price_data: {
          currency: currency,  // Currency (e.g., USD)
          product_data: { name: item.name },
          unit_amount: item.price * 100,  // Convert price to cents
        },
        quantity: item.quantity,
      }));
  
      // Add a delivery charge as a separate item in Stripe checkout
      line_items.push({
        price_data: {
          currency: currency,
          product_data: { name: "Delivery Charge" }, // Label for delivery charge
          unit_amount: deliveryCharge * 100, // Convert delivery charge to cents
        },
        quantity: 1, // Always 1 delivery charge per order
      });
  
      // Ensure Stripe is configured before trying to create a session
      if (!stripe) {
        return res.status(500).json({ success: false, message: 'Stripe not configured. Set STRIPE_SECRET_KEY in backend/.env' });
      }

      // Create a Stripe checkout session with success & cancel URLs
      const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/verify?success=true&orderId=${newOrder.id}`, // Redirect on successful payment
        cancel_url: `${origin}/verify?success=false&orderId=${newOrder.id}`,  // Redirect on payment failure
        line_items, // Items to be purchased
        mode: "payment", // Mode set to payment
      });
  
      // Send back the Stripe session URL to the frontend for redirection
      res.json({ success: true, session_url: session.url });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  
//this function is crucial for verifying payment status and ensuring that only paid orders remain in the database.
// Verify Stripe 
const verifyStripe = async (req,res) => {
  // Extract orderId, success status, and userId from request body
    const { orderId, success, userId} =  req.body

    try {
       // If payment was successful
        if (success === "true") {
          // Update the order status to mark it as paid
            await OrderModel.update({ payment: true }, { where: { id: orderId } })
            // Clear the user's cart after successful payment
            const user = await User.findByPk(userId);
            await user.update({ cartData: {} });

            res.json({success:true});
        } else {
          // If payment failed, delete the order from the database
            await OrderModel.destroy({ where: { id: orderId } })
            res.json({success:false})
        }
    } catch (error) {     
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req,res)=>{

}

// All Orders data for admin panel
const allOrders = async (req,res)=> {
    try {
        // Fetch all orders from the database
        const orders = await OrderModel.findAll();
    
        // Send a success response to the client, including the retrieved orders
        res.json({ success: true, orders });
    
    } catch (error) {
        // Log the error to the console for debugging
        console.log(error);
    
        // Send a failure response with the error message
        res.json({ success: false, message: error.message });
    }
    
}

// user order data for frontend
const userOrders = async (req, res) => {
    try {
      const { userId } = req.body;
      const orders = await OrderModel.findAll({ 
        where: { userId },
        order: [['date', 'DESC']]
      });
      res.json({ success: true, orders });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
    }
  };
  

// update order status from admin
const updateStatus = async (req,res)=> {
    try {
        // Extract the orderId and status from the request body
        const { orderId, status } = req.body;
    
        // Update the status of the specified order in the database
        await OrderModel.update({ status }, { where: { id: orderId } });
    
        // Send a success response to the client indicating the status was updated
        res.json({ success: true, message: 'Status Updated' });
    
    } catch (error) {
        // Log the error to the console for debugging
        console.log(error);
    
        // Send a failure response with the error message
        res.json({ success: false, message: error.message });
    }
}

export {placeOrder,verifyStripe, placeOrderRazorpay, placeOrderStripe, userOrders, updateStatus, allOrders}