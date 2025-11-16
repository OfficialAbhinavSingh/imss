# IntelliStore Backend Setup Guide

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── constants.js         # Constants and configurations
│   ├── controllers/
│   │   ├── fileController.js    # File operations
│   │   ├── analyticsController.js # Analytics operations
│   │   └── activityController.js  # Activity logging
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handling
│   │   └── uploadMiddleware.js  # File upload validation
│   ├── models/
│   │   ├── File.js              # File model
│   │   ├── Analytics.js         # Analytics model
│   │   └── Activity.js          # Activity log model
│   ├── routes/
│   │   ├── fileRoutes.js        # File endpoints
│   │   ├── analyticsRoutes.js   # Analytics endpoints
│   │   └── activityRoutes.js    # Activity endpoints
│   ├── utils/
│   │   ├── fileHelper.js        # File utilities
│   │   ├── analyticsHelper.js   # Analytics calculations
│   │   └── socketHandler.js     # WebSocket management
│   └── server.js                # Main server file
├── uploads/                      # Uploaded files directory
├── package.json
├── .env.example
└── README.md
```

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intellistore
NODE_ENV=development
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp,video/mp4,video/mpeg,application/json
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
DATABASE_NAME=intellistore
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 5000 (or specified PORT in .env).

## API Endpoints

### File Management
- **POST** `/api/files/upload` - Upload files
- **GET** `/api/files` - Get all files (with pagination, filtering, sorting)
- **GET** `/api/files/:fileId` - Get file details
- **DELETE** `/api/files/:fileId` - Delete file

### Analytics
- **GET** `/api/analytics/dashboard-stats` - Dashboard statistics
- **GET** `/api/analytics/storage-breakdown` - Storage breakdown by type
- **GET** `/api/analytics/trend-data?period=7d|30d|90d` - Trend data
- **GET** `/api/analytics/distribution` - File type distribution
- **GET** `/api/analytics/performance` - Performance metrics
- **POST** `/api/analytics/snapshot` - Create analytics snapshot

### Activities
- **GET** `/api/activities` - Get activity log
- **GET** `/api/activities/stats` - Activity statistics
- **DELETE** `/api/activities/clear` - Clear all activities

## Database Models

### File
- fileId (unique)
- originalName
- filename
- filepath
- mimeType
- size
- category (image, video, json)
- metadata (description, tags, comments)
- fileStats (processingTime, accuracy)
- uploadedAt
- isDeleted

### Analytics
- analyticsId (unique)
- timestamp
- totalFiles
- totalSize
- fileCount (by category)
- storageUsed (by category)
- processingMetrics
- storageEfficiency

### Activity
- activityId (unique)
- fileId
- type (upload, delete, update, view, download)
- fileName
- fileSize
- fileCategory
- timestamp
- status (success, failed, pending)

## WebSocket Events

### Client → Server
- `subscribeToUpdates` - Subscribe to file updates
- `subscribeToAnalytics` - Subscribe to analytics updates
- `subscribeToActivity` - Subscribe to activity updates

### Server → Client
- `statsUpdate` - Real-time statistics update
- `fileUpdated` - File change notification
- `analyticsUpdated` - Analytics change notification
- `activityUpdated` - Activity update notification

## Features

✓ File upload with validation
✓ Real-time file processing
✓ MongoDB database integration
✓ RESTful API endpoints
✓ WebSocket real-time updates
✓ Analytics and metrics calculation
✓ Activity logging
✓ Error handling
✓ CORS support
✓ File categorization (image, video, JSON)
✓ Pagination, filtering, sorting
✓ Storage tracking

## Error Handling

The backend includes comprehensive error handling:
- Validation errors
- File upload errors
- Database errors
- WebSocket connection errors
- Graceful error responses

## Real-time Analytics

The system provides real-time analytics including:
- File count by category
- Storage usage breakdown
- Processing metrics
- Storage efficiency
- Performance monitoring
- Trend analysis

## Security Features

- CORS enabled
- Helmet security headers
- File type validation
- File size limits
- Input sanitization
- Error message sanitization

## Monitoring

The server includes:
- Morgan HTTP request logging
- Error logging
- Connection status tracking
- Real-time update broadcasts every 5 seconds

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify MongoDB credentials

### Port Already in Use
- Change PORT in .env
- Or kill process using port 5000

### CORS Error
- Ensure CORS_ORIGIN matches frontend URL
- Default is http://localhost:3000

### File Upload Error
- Check MAX_FILE_SIZE limit
- Verify file mime type is allowed
- Ensure uploads directory exists

## Performance Tips

1. Use MongoDB indexes for efficient queries
2. Implement pagination for large file lists
3. Use compression middleware
4. Monitor WebSocket connections
5. Clean up old analytics data periodically

## Future Enhancements

- Authentication/Authorization
- File encryption
- Advanced AI categorization
- Cloud storage integration
- Image thumbnail generation
- Video streaming
- Advanced search capabilities
- Data backup/restore
- Multi-user support
- Rate limiting
