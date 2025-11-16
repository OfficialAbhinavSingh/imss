# Complete IntelliStore Setup Instructions

## Quick Start (5 minutes)

### 1. Frontend Setup
The frontend files are already in place:
- `index.html` - Main HTML
- `script.js` - Frontend logic (updated with backend integration)
- `styles.css` - Styling

### 2. Backend Setup

#### Step 1: Install MongoDB

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Run installer and select "Install MongoDB as a Service"
- Default installation path: `C:\Program Files\MongoDB\Server\X.X\`

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

#### Step 2: Backend Installation

Navigate to backend directory:
```bash
cd "C:\Users\ishua\OneDrive\Desktop\Project IIMS\backend"
```

Install dependencies:
```bash
npm install
```

Create `.env` file:
```bash
copy .env.example .env
```

Edit `.env` with your settings (should work as-is for local development):
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

#### Step 3: Start MongoDB

**Windows (Service is running by default after installation)**

Or manually:
```powershell
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
```

**macOS/Linux:**
```bash
brew services start mongodb-community
# or
sudo systemctl start mongod
```

#### Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   IntelliStore Backend Server Ready    ║
╚════════════════════════════════════════╝
Port: 5000
Environment: development
Database: mongodb://localhost:27017/intellistore
CORS Origin: http://localhost:3000
```

#### Step 5: Serve Frontend

Open `index.html` in a browser or use a local server:

**Using Python (built-in):**
```bash
cd "C:\Users\ishua\OneDrive\Desktop\Project IIMS"
python -m http.server 3000
```

**Using Node.js (http-server):**
```bash
npm install -g http-server
cd "C:\Users\ishua\OneDrive\Desktop\Project IIMS"
http-server -p 3000
```

Then open: `http://localhost:3000`

## Architecture Overview

### Frontend
- **JavaScript Framework**: Vanilla JS with ES6 classes
- **Real-time**: Socket.io for WebSocket communication
- **API Client**: Fetch API for HTTP requests
- **Pages**: Dashboard, Gallery, Analytics
- **Themes**: Light/Dark mode support

### Backend
- **Server**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io server
- **File Upload**: Multer middleware
- **API**: RESTful endpoints

### Data Flow
```
User Action
    ↓
Frontend (HTML/CSS/JS)
    ↓
API Request (HTTP)
    ↓
Backend (Express)
    ↓
MongoDB (Database)
    ↓
Response
    ↓
Real-time Update (WebSocket)
    ↓
UI Update
```

## Features Implementation

### 1. File Upload
- Drag and drop support
- Multiple file selection
- File validation
- Progress indication
- Real-time processing

### 2. Database Storage
- MongoDB integration
- File metadata storage
- Activity logging
- Analytics calculation

### 3. Real-time Analytics
- WebSocket updates every 5 seconds
- File count tracking
- Storage monitoring
- Performance metrics
- Trend analysis

### 4. Search & Filter
- Search by filename
- Filter by file type (image, video, JSON)
- Sort options (newest, oldest, name, size)
- Pagination support

### 5. Activity Tracking
- Upload tracking
- Delete tracking
- View tracking
- Timestamp recording

## Testing the System

### Test File Upload
1. Go to Dashboard
2. Click "Drop files here or click to browse"
3. Select image, video, or JSON files
4. Optionally add metadata
5. Files should be uploaded and appear in Gallery

### Test Real-time Updates
1. Upload files in one tab
2. Open Dashboard in another tab
3. Stats should update in real-time

### Test Analytics
1. Go to Analytics page
2. Check storage breakdown
3. View performance metrics
4. Check trend data

### Test Gallery
1. Go to Gallery page
2. Try different filters
3. Test search functionality
4. Try sorting options

## Database Management

### View MongoDB Data
```bash
# Connect to MongoDB
mongosh

# List databases
show dbs

# Use intellistore database
use intellistore

# List collections
show collections

# View files
db.files.find().pretty()

# View analytics
db.analytics.find().pretty()

# View activities
db.activities.find().pretty()
```

### Backup Database
```bash
mongodump --db intellistore --out ./backup
```

### Restore Database
```bash
mongorestore ./backup
```

## Environment Configuration

### Development (.env)
```
NODE_ENV=development
DEBUG=true
```

### Production (.env)
```
NODE_ENV=production
DEBUG=false
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/intellistore
```

## Troubleshooting

### Issue: "Cannot find module 'mongoose'"
**Solution:**
```bash
npm install mongoose
```

### Issue: MongoDB connection fails
**Solution:**
1. Ensure MongoDB service is running
2. Check MongoDB URI in .env
3. Verify port 27017 is available

### Issue: CORS error in console
**Solution:**
- Ensure backend is running on port 5000
- Check CORS_ORIGIN in .env matches frontend URL

### Issue: Socket.io connection fails
**Solution:**
- Ensure socket.io client is loaded (check script tags)
- Verify backend WebSocket is listening

### Issue: Files not uploading
**Solution:**
- Check file size limit (default 100MB)
- Verify file type is allowed
- Check uploads folder exists and is writable

### Issue: Port 5000 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

## Performance Optimization

1. **Database Indexing**: Already implemented for common queries
2. **Pagination**: Implemented for file list (10 items per page)
3. **Compression**: Enabled with gzip
4. **Caching**: Consider adding Redis for frequently accessed data
5. **File Optimization**: Consider image resizing, video encoding

## Security Considerations

1. **File Validation**: Only allowed MIME types accepted
2. **File Size Limits**: 100MB limit (configurable)
3. **CORS**: Restricted to specific origin
4. **Error Messages**: Sanitized in production
5. **Future**: Add authentication/authorization layer

## Deployment

### Heroku Deployment
1. Create Heroku account
2. Install Heroku CLI
3. `heroku create intellistore`
4. Add MongoDB Atlas connection string
5. `git push heroku main`

### AWS Deployment
1. Use EC2 for server
2. Use S3 for file storage
3. Use RDS for database
4. Use CloudFront for CDN

### Docker Deployment
Create `Dockerfile`:
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t intellistore .
docker run -p 5000:5000 intellistore
```

## API Documentation

See backend/README.md for detailed API documentation

## Support

For issues or questions, refer to:
- MongoDB documentation: https://docs.mongodb.com/
- Express documentation: https://expressjs.com/
- Socket.io documentation: https://socket.io/
- Node.js documentation: https://nodejs.org/

## License

MIT License
