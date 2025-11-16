const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/intellistore';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✓ MongoDB Connected Successfully');
        return mongoose.connection;
    } catch (error) {
        console.warn('⚠ MongoDB Connection Error:', error.message);
        console.warn('Server will continue running without database (read-only mode)');
        return null;
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✓ MongoDB Disconnected');
    } catch (error) {
        console.error('✗ MongoDB Disconnection Error:', error.message);
    }
};

module.exports = { connectDB, disconnectDB };
