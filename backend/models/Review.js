import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);