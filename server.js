import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { connectDB } from './config/database.js'
import connectCloudinary from './config/cloudinary.js'

import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'

// Models (keep for initialization)
import User from './models/User.js'
import Product from './models/Product.js'
import OrderModel from './models/OrderModel.js'

const app = express()
const port = process.env.PORT || 4000

// ========================
// ENV VALIDATION (FIXED)
// ========================
const requiredEnvs = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'DB_PASSWORD',
  'JWT_SECRET'
]

const missingRequired = requiredEnvs.filter((k) => !process.env[k])

if (missingRequired.length > 0) {
  console.error(
    `❌ Missing required environment variable(s): ${missingRequired.join(', ')}`
  )
  console.error('👉 Please add them in your Render Environment Variables')
  process.exit(1)
}

// Optional Stripe warning
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    '⚠️ STRIPE_SECRET_KEY is not set. Payments will be disabled.'
  )
}

// ========================
// CONNECT SERVICES
// ========================
connectDB()
connectCloudinary()

// ========================
// MIDDLEWARE
// ========================
app.use(express.json())

app.use(
  cors({
    origin: 'https://mamas-food.vercel.app',
    credentials: true
  })
)

// ========================
// API ROUTES
// ========================
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

// ========================
// TEST ROUTE
// ========================
app.get('/', (req, res) => {
  res.send('API Working')
})

// ========================
// START SERVER
// ========================
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server started on port: ${port}`)
})
