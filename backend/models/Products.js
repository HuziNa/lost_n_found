import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },
    name: { type: String, required: true },
    description: String,
    basePrice: { type: Number, required: true },
    category: { type: String, enum: ['Cake', 'Cupcake', 'Pastry', 'Bread'] },
    isCustomizable: { type: Boolean, default: false },

    recipe: [{
        ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
        amountRequired: Number
    }]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);