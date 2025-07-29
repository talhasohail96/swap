import express from 'express'
import { addToCart, getUserCart, updateCart, restoreAbandonedCartInventory }from '../controllers/cartController.js'
import authUser from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

const cartRouter = express.Router ()

cartRouter.post('/get',authUser, getUserCart)
cartRouter.post('/add',authUser, addToCart)
cartRouter.post('/update',authUser, updateCart)
cartRouter.post('/restore-inventory', adminAuth, restoreAbandonedCartInventory)

export default cartRouter 
