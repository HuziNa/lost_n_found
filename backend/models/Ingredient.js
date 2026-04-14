import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },
    name: { type: String, required: true }, // e.g., 'Flour', 'Eggs', 'Cocoa'
    quantity: { type: Number, required: true }, // e.g., 5000
    unit: { type: String, default: 'grams' }, // grams, kg, units
    alertThreshold: { type: Number, default: 500 } // notify owner when below this
}, { timestamps: true });

export default mongoose.model('Ingredient', ingredientSchema);