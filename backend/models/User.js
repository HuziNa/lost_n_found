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

    // if they are an owner, we link them to their bakery
    bakeryManaged: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Bakery' 
    },

    // address for delivery
    address: {
        street: String,
        city: { type: String, default: 'Islamabad' }, // Default for NUST area?
        postalCode: String,
        houseNumber: String
    },

    phoneNumber: { type: String, required: true } 
}, { timestamps: true });

export default mongoose.model('User', userSchema);