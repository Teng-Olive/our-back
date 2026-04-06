import User from '../models/User.js';

// function to add product to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Fetch user data by ID
    const userData = await User.findByPk(userId);
    
    // Check if user exists
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize cartData if it's missing, and ensure it's an object
    let cartData = userData.cartData || {};
    if (typeof cartData === "string") {
      try {
        cartData = JSON.parse(cartData);
      } catch (err) {
        // If parsing fails, reset to an empty object
        cartData = {};
      }
    }

    // Check if the product with the given `itemId` already exists in the `cartData`
    if (cartData[itemId]) {
      // If the product exists, increment the quantity by 1
      cartData[itemId] += 1;
    } else {
      // If the product doesn't exist in the cart, initialize it with a quantity of 1
      cartData[itemId] = 1;
    }

    // Update the user's `cartData` in the database
    await userData.update({ cartData });

    // Send a JSON response indicating success and a confirmation message
    res.json({ success: true, message: "Product added to cart" });
  } catch (error) {
    console.log("Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// function to update cart
const updateCart = async (req, res) => {
    try {
        // Destructure `userId`, `itemId`, `size`, and `quantity` from the request body
        const { userId, itemId, quantity } = req.body;
    
        // Fetch the user's data from the database using their `userId`
        const userData = await User.findByPk(userId);
    
        // Check if user exists
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
    
        // Retrieve the user's current cart data
        let cartData = userData.cartData || {};
    
        // Update the specified product with the new quantity in the cart
        cartData[itemId] = quantity;
    
        // Save the updated cart data back to the database for the user
        await userData.update({ cartData });
    
        // Send a success response indicating the cart has been updated
        res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        // Log any errors to the console for debugging
        console.log(error);
    
        // Send a failure response with the error message
        res.json({ success: false, message: error.message });
    }
    
};

// function to get user cart
const getUserCart = async (req, res) => {
    try {
        // Destructure `userId` from the request body
        const { userId } = req.body;
    
        // Fetch the user's data from the database using their `userId`
        const userData = await User.findByPk(userId);
    
        // Check if the user exists in the database
        if (!userData) {
            // If no user is found, send a failure response with an appropriate message
            return res.json({ success: false, message: "User not found" });
        }
    
        // Retrieve the user's cart data
        const cartData = userData.cartData || {};
    
        // Send a success response along with the user's cart data
        res.json({ success: true, cartData });
    } catch (error) {
        // Log the error to the console for debugging
        console.error(error);
    
        // Send a failure response with the error message
        res.json({ success: false, message: error.message });
    }
    
};

export { addToCart, updateCart, getUserCart };
