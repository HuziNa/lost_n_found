import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  bakery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bakery',
    required: true
  },

  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem'
    }
  ],

  totalPrice: { type: Number, required: true },

  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },

  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);