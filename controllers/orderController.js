import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Controller to place an order
export const createOrder = async (req, res) => {
  const { userId, cart, billingDetails, totalAmount } = req.body;

  try {
    // Step 1: Ensure all products are available in stock
    const productIds = cart.map(item => item._id); // ✅ Changed from productId to _id
    const products = await Product.find({ '_id': { $in: productIds } });

    const outOfStockProducts = products.filter(product => {
      const cartItem = cart.find(item => item._id === product._id.toString());
      return cartItem && product.stock < cartItem.quantity;
    });

    if (outOfStockProducts.length > 0) {
      return res.status(400).json({
        message: 'Some products are out of stock.',
        outOfStockProducts: outOfStockProducts.map(product => product.title),
      });
    }

    // Step 2: Create the order with cart items, user details, and billing info
    const orderItems = cart.map(item => ({
      productId: item._id, // ✅ _id from CartContext
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
    }));

    const newOrder = new Order({
      userId,
      billingDetails,
      orderItems,
      totalAmount,
      status: 'Pending',
    });

    // Save order to the database
    await newOrder.save();

    // Step 3: Reduce product stock based on the order quantity
    await Promise.all(
      cart.map(async (item) => {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: -item.quantity },
        });
      })
    );

    // Step 4: Respond with the order information
    res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to place the order', error: error.message });
  }
};

// Controller to fetch all orders (admin view)
export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 }) // Sort by most recent
        .populate('orderItems.productId', 'title price image');
  
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      res.status(500).json({ message: 'Failed to retrieve all orders', error: error.message });
    }
  };

  
// Controller to fetch a user's orders
export const getUserOrders = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 }) // most recent first
        .populate('orderItems.productId', 'title price image');
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found' });
      }
  
      res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
    }
  };
  
  // Controller to update order status
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params; // Order ID from the URL
  const { status } = req.body; // New status from the request body

  // Check if the status is valid
  const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Invalid status. Allowed values are: Pending, Shipped, Delivered, Cancelled.',
    });
  }

  try {
    // Find the order by ID and update the status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return the updated order after modification
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Respond with the updated order information
    res.status(200).json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};
