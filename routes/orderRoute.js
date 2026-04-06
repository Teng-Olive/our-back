import express from 'express'
import { userOrders, allOrders, placeOrder, placeOrderRazorpay, updateStatus } from '../controllers/orderControllers.js'
import { placeOrderMoMo, verifyMoMo } from '../controllers/momoControllers.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list',adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment Features
orderRouter.post('/place',authUser, placeOrder)
orderRouter.post('/razorpay', authUser,placeOrderRazorpay)

// MoMO mobile money endpoints
orderRouter.post('/momo', authUser, placeOrderMoMo)
orderRouter.post('/verifyMoMo', authUser, verifyMoMo)

// User feature
orderRouter.post('/userorders', authUser, userOrders)

export default orderRouter