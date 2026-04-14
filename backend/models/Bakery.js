import mongoose from 'mongoose';

const bakerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: String,
  contactNumber: String,
  isOpen: { type: Boolean, default: true },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Bakery', bakerySchema);