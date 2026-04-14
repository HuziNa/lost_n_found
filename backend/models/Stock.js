import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },

  name: { type: String, required: true },

  quantityAvailable: { type: Number, required: true },

  unit: { type: String, default: 'grams' },

  alertThreshold: { type: Number, default: 500 } // can be used to send notification to owner
}, { timestamps: true });

export default mongoose.model('Stock', stockSchema);