import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  paymentMethod: { type: String, enum: ['card', 'cash'], required: true },
});

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: String,
  price: Number,
  quantity: Number,
  imageUrl: String,
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    billingDetails: billingSchema,
    orderItems: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, 
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], 
      default: 'Pending' },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
