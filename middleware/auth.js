// Import the `jsonwebtoken` package to handle authentication using JWT tokens
import jwt from 'jsonwebtoken'

// Middleware function to authenticate a user before allowing certain actions (e.g., adding items to cart)
const authUser = async (req, res, next) => {
    // Extract the token from the request headers
    const {token} = req.headers;

     // If no token is provided, return a response prompting the user to log in
    if(!token){
        return res.json({success:false, message: 'Login to add items to cart'})
    }

    try {
         // Verify the token using the secret key stored in environment variables
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
         // Attach the user's ID (decoded from the token) to the request body for later use in the request
        req.body.userId = token_decode.id
         // Proceed to the next middleware or route handler
        next()
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }

}
// Export the `authUser` middleware so it can be used to protect routes
export default authUser