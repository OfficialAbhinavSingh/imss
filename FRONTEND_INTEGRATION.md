# IntelliStore Frontend Integration Guide

## API Client Setup

The frontend includes an `APIService` class that handles all backend communication.

### Configuration

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';
```

Update these URLs if your backend is hosted elsewhere.

## API Methods

### File Management

#### Upload Files
```javascript
const formData = new FormData();
formData.append('files', fileObject);

const metadata = {
    description: 'File description',
    tags: ['tag1', 'tag2'],
    category: 'image'
};

const response = await APIService.uploadFiles(formData, metadata);
// Response: { success: true, data: [...], count: 1 }
```

#### Get Files
```javascript
const response = await APIService.getFiles(
    category = 'image',  // 'image', 'video', 'json', or 'all'
    search = '',         // Search query
    sort = 'newest',     // 'newest', 'oldest', 'name', 'size'
    page = 1             // Page number
);
// Response: { success: true, data: [...], pagination: {...} }
```

#### Delete File
```javascript
const response = await APIService.deleteFile(fileId);
// Response: { success: true, message: '...' }
```

### Analytics

#### Dashboard Stats
```javascript
const response = await APIService.getDashboardStats();
// Response includes: totalFiles, fileCount, storageUsed, efficiency
```

#### Storage Breakdown
```javascript
const response = await APIService.getStorageBreakdown();
// Response includes: storage by category with percentages
```

#### Trend Data
```javascript
const response = await APIService.getTrendData(period = '7d');
// Period: '7d', '30d', or '90d'
// Response includes: trend data for chart display
```

#### File Distribution
```javascript
const response = await APIService.getFileDistribution();
// Response includes: distribution of file types with percentages
```

#### Performance Metrics
```javascript
const response = await APIService.getPerformanceMetrics();
// Response includes: processingSpeed, accuracy, efficiency
```

### Activity Management

#### Get Activities
```javascript
const response = await APIService.getActivities(limit = 10, page = 1);
// Response includes: activity list with pagination
```

#### Clear Activities
```javascript
const response = await APIService.clearActivities();
// Response: { success: true, message: '...' }
```

## WebSocket Manager

Real-time updates are handled through the `WebSocketManager` class.

### Connection Status
```javascript
const wsManager = new WebSocketManager();
console.log(wsManager.isConnected); // boolean
```

### Subscribe to Events
```javascript
wsManager.subscribe('statsUpdate', (data) => {
    console.log('Stats updated:', data);
});
```

### Emit Events
```javascript
wsManager.emit('subscribeToUpdates', {});
```

### Available Events

**From Server:**
- `statsUpdate` - Real-time statistics
- `fileUpdated` - File changes
- `analyticsUpdated` - Analytics changes
- `activityUpdated` - Activity updates

**To Server:**
- `subscribeToUpdates` - Subscribe to file updates
- `subscribeToAnalytics` - Subscribe to analytics
- `subscribeToActivity` - Subscribe to activity

## Real-time Updates Handler

The `RealtimeHandler` class automatically processes WebSocket events and updates the UI.

### Handled Events
```javascript
window.addEventListener('statsUpdate', (e) => {
    // Update dashboard stats
    // e.detail contains the data
});

window.addEventListener('fileUpdated', (e) => {
    // Refresh gallery
});

window.addEventListener('analyticsUpdated', (e) => {
    // Update analytics view
});

window.addEventListener('activityUpdated', (e) => {
    // Update activity log
});
```

## Error Handling

All API calls include error handling:

```javascript
try {
    const response = await APIService.uploadFiles(formData);
    if (response.success) {
        // Handle success
    } else {
        console.error('API error:', response.message);
    }
} catch (error) {
    console.error('Request error:', error);
}
```

## Performance Tips

1. **Pagination**: Always use pagination for file lists
2. **Debouncing**: Debounce search input to reduce API calls
3. **Caching**: Consider caching dashboard stats
4. **Lazy Loading**: Load gallery items as needed
5. **Error Recovery**: Implement retry logic for failed requests

## Example Usage

### Complete Upload Flow
```javascript
// 1. Prepare files
const files = [...];
const metadata = {
    description: 'My files',
    tags: ['work', 'important']
};

// 2. Upload
try {
    const response = await APIService.uploadFiles(
        formData, 
        metadata
    );
    
    if (response.success) {
        console.log(`Uploaded ${response.count} files`);
        
        // 3. Refresh view
        await galleryManager.loadGalleryItems();
        
        // 4. Update stats
        await uploadManager.updateStats();
    }
} catch (error) {
    console.error('Upload failed:', error);
    showErrorMessage(error.message);
}
```

### Real-time Dashboard Update
```javascript
// Listen for stats updates
window.addEventListener('statsUpdate', (e) => {
    const { totalFiles, byCategory } = e.detail;
    
    // Update UI
    document.getElementById('mediaCount').textContent = 
        totalFiles.toString();
    document.getElementById('jsonCount').textContent = 
        byCategory.json.toString();
});

// Statistics update every 5 seconds automatically
```

### Search and Filter
```javascript
// 1. Set up filter
const category = 'image';
const search = 'family';
const sort = 'newest';

// 2. Fetch results
const response = await APIService.getFiles(
    category, 
    search, 
    sort, 
    page = 1
);

// 3. Update gallery
galleryManager.updateGallery(response.data);
```

## Class Reference

### APIService
Static methods for HTTP communication with backend.

**Methods:**
- `uploadFiles(formData, metadata)`
- `getFiles(category, search, sort, page)`
- `deleteFile(fileId)`
- `getDashboardStats()`
- `getStorageBreakdown()`
- `getTrendData(period)`
- `getFileDistribution()`
- `getPerformanceMetrics()`
- `getActivities(limit, page)`
- `clearActivities()`

### WebSocketManager
Manages real-time WebSocket connections.

**Methods:**
- `init()` - Initialize connection
- `subscribe(eventName, callback)` - Subscribe to event
- `emit(eventName, data)` - Emit event to server

**Properties:**
- `socket` - Socket.io instance
- `isConnected` - Connection status
- `retryCount` - Number of retries
- `maxRetries` - Max retry attempts

### RealtimeHandler
Automatically handles WebSocket events and updates UI.

**Methods:**
- `setupWindowListeners()` - Set up event listeners
- `handleStatsUpdate(data)` - Update stats
- `handleFileUpdate(data)` - Update gallery
- `handleAnalyticsUpdate(data)` - Update analytics
- `handleActivityUpdate(data)` - Update activity

## Debugging

Enable console logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');

// Then reload page
```

Monitor WebSocket:
```javascript
// In browser console
window.wsManager.socket.on('*', (event, ...args) => {
    console.log('WebSocket event:', event, args);
});
```

Monitor API calls:
```javascript
// Wrap fetch to log all API calls
const originalFetch = fetch;
window.fetch = function(...args) {
    console.log('API call:', args[0]);
    return originalFetch(...args);
};
```

## Troubleshooting

### API calls failing
- Check backend is running (`npm run dev`)
- Verify API_BASE_URL is correct
- Check browser console for CORS errors

### Real-time updates not working
- Verify Socket.io is loaded
- Check SOCKET_URL is correct
- Ensure backend Socket.io server is running

### File upload not working
- Check file size limit (100MB default)
- Verify file type is allowed
- Check uploads directory exists

### Gallery not updating
- Verify API response contains data
- Check for JavaScript errors in console
- Ensure galleryManager is initialized

## Best Practices

1. **Always check response.success** before using data
2. **Use try-catch** for async operations
3. **Debounce search input** to reduce API calls
4. **Show loading states** during API calls
5. **Handle network errors** gracefully
6. **Update UI in real-time** using WebSocket
7. **Validate file types** before uploading
8. **Use pagination** for large lists
9. **Cache frequently accessed data**
10. **Log errors** for debugging
