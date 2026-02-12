import mongoose from "mongoose";

const normalizeEnv = (value) => {
   if (!value) return value;
   return value.trim().replace(/^['"]|['"]$/g, '');
};

const connectDB = async () => {
   const mongoUri = normalizeEnv(process.env.MONGODB_URI);
   if (!mongoUri) {
      throw new Error('MONGODB_URI is missing');
   }

   mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
   });

   mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
   });

   return mongoose.connect(mongoUri);
};

export default connectDB;
