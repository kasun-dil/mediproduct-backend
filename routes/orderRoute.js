import express from 'express';
import { createOrder, getUserOrders, updateOrderStatus } from '../controllers/orderController.js';
import { getAllOrders } from '../controllers/orderController.js';

const router = express.Router();

// Route to place a new order
router.post('/create', createOrder);

// Route to fetch all orders for a user
router.get('/:userId', getUserOrders);

// Route to fetch all orders (admin view)
router.get('/', getAllOrders);

// Route to update order status (admin)
router.put('/:orderId/status', updateOrderStatus);

export default router;
