import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['customer', 'owner', 'admin'],
    default: 'customer'
  },

  // if owner
  bakeryManaged: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bakery'
  },

  phoneNumber: { type: String, required: true },

  address: {
    street: String,
    city: String,
    postalCode: String
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);