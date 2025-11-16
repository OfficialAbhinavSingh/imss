require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const fileUpload = require('express-fileupload');
const path = require('path');

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const SocketHandler = require('./utils/socketHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload({
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 536870912 },
    useTempFiles: true,
    tempFileDir: path.join(__dirname, '../temp'),
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activityRoutes);

// Socket.IO initialization
SocketHandler.initializeSocket(io);

// Real-time update handler
const broadcastUpdates = async () => {
    try {
        const mongoose = require('mongoose');
        // Only broadcast if database is connected
        if (mongoose.connection.readyState !== 1) {
            return;
        }

        const File = require('./models/File');
        const files = await File.find({ isDeleted: false });
        
        // Calculate stats
        const stats = {
            totalFiles: files.length,
            totalSize: files.reduce((sum, f) => sum + f.size, 0),
            byCategory: {
                images: files.filter(f => f.category === 'image').length,
                videos: files.filter(f => f.category === 'video').length,
                json: files.filter(f => f.category === 'json').length,
            },
        };

        SocketHandler.broadcastToAll(io, 'statsUpdate', stats);
    } catch (error) {
        // Silently ignore errors when DB is not available
        if (error.message && error.message.includes('buffering timed out')) {
            // Expected when MongoDB is unavailable
            return;
        }
        console.error('Broadcast error:', error.message);
    }
};

// Broadcast updates every 5 seconds
setInterval(broadcastUpdates, 5000);

// Error handling
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await connectDB();
        
        server.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║   IntelliStore Backend Server Ready    ║
╚════════════════════════════════════════╝
Port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/intellistore'}
CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
