import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_STRING);
        console.log("DATABASE CONNECTED");
    } catch (error){
        console.error("Error connecting to database", error);
        process.exit(1) 
    }
}

export default connectDB;