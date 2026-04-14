import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bakery: { type: mongoose.Schema.Types.ObjectId, ref: 'Bakery', required: true },

    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        customDetails: {
            spongeType: String,
            frostingColor: String,
            toppings: [String],
            messageOnCake: String
        },
        priceAtPurchase: Number
    }],

    totalPrice: { type: Number, required: true },

    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    },
    
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);