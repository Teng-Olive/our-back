import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: 'Not Authorized. Login Again' });
        }

        // 1. Decode the token (which is now an object { id: '...' })
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // 2. Compare the 'id' property of the object
        const adminIdentity = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;

        if (token_decode.id !== adminIdentity) {
            return res.json({ success: false, message: 'Not Authorized. Login Again' });
        }

        next();
    } catch (error) {
        console.error("JWT Auth Error:", error.message);
        return res.json({ success: false, message: "Session expired or invalid. Please login again." });
    }
}

export default adminAuth;