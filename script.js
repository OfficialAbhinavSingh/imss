// ============================================
// IntelliStore - Complete Application Logic
// ============================================

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Auth Configuration
const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// File Categories and their MIME types
const FILE_CATEGORIES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/x-icon'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/webm'],
    document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
    json: ['application/json'],
    code: ['text/javascript', 'text/css', 'text/html', 'application/xml', 'text/xml', 'text/x-python', 'text/x-java'],
    archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip']
};

// ============================================
// API Service
// ============================================
class APIService {
    static async uploadFiles(formData, metadata = {}) {
        try {
            formData.append('metadata', JSON.stringify(metadata));
            const response = await fetch(`${API_BASE_URL}/files/upload`, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    static async getFiles(category = 'all', search = '', sort = 'newest', page = 1) {
        try {
            const params = new URLSearchParams({
                category: category !== 'all' ? category : '',
                search,
                sort,
                page,
                limit: 12,
            });
            const response = await fetch(`${API_BASE_URL}/files?${params}`);
            return await response.json();
        } catch (error) {
            console.error('Fetch files error:', error);
            throw error;
        }
    }

    static async deleteFile(fileId) {
        try {
            const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
                method: 'DELETE',
            });
            return await response.json();
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }

    static async getFile(fileId) {
        try {
            const response = await fetch(`${API_BASE_URL}/files/${fileId}`);
            return await response.json();
        } catch (error) {
            console.error('Get file error:', error);
            throw error;
        }
    }

    static async getDashboardStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/dashboard-stats`);
            return await response.json();
        } catch (error) {
            console.error('Dashboard stats error:', error);
            throw error;
        }
    }

    static async getStorageBreakdown() {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/storage-breakdown`);
            return await response.json();
        } catch (error) {
            console.error('Storage breakdown error:', error);
            throw error;
        }
    }

    static async getFileDistribution() {
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/distribution`);
            return await response.json();
        } catch (error) {
            console.error('Distribution error:', error);
            throw error;
        }
    }

    static async getActivities(limit = 5) {
        try {
            const response = await fetch(`${API_BASE_URL}/activities?limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Activities error:', error);
            throw error;
        }
    }

    static async deleteActivities() {
        try {
            const response = await fetch(`${API_BASE_URL}/activities/clear`, {
                method: 'DELETE',
            });
            return await response.json();
        } catch (error) {
            console.error('Clear activities error:', error);
            throw error;
        }
    }

    // Auth methods
    static async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async signup(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            return await response.json();
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    static async logout() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
            });
            return await response.json();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    static async getProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`);
            return await response.json();
        } catch (error) {
            console.error('Profile error:', error);
            throw error;
        }
    }
}

// ============================================
// WebSocket Manager
// ============================================
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        this.socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            console.log('WebSocket connected');
            this.socket.emit('subscribeToUpdates');
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('WebSocket disconnected');
        });

        this.socket.on('statsUpdate', (data) => {
            console.log('Stats updated:', data);
            updateDashboard(data.data);
        });

        this.socket.on('fileUpdated', (data) => {
            console.log('File updated:', data);
            loadGalleryFiles();
        });

        this.socket.on('activityUpdated', (data) => {
            console.log('Activity updated:', data);
            loadActivities();
        });

        this.socket.on('analyticsUpdated', (data) => {
            console.log('Analytics updated:', data);
            if (analyticsManager) {
                analyticsManager.loadAnalytics();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

// ============================================
// Theme Manager
// ============================================
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.apply();
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.apply();
    }

    apply() {
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateIcon();
    }

    updateIcon() {
        const icon = document.querySelector('.theme-toggle i');
        if (icon) {
            icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

// ============================================
// Upload Manager
// ============================================
class UploadManager {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        this.setupListeners();
    }

    setupListeners() {
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Click to upload
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        this.handleFiles(files);
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.handleFiles(files);
        this.fileInput.value = ''; // Reset input
    }

    handleFiles(files) {
        if (files.length === 0) return;

        const formData = new FormData();
        let validFiles = 0;

        for (let file of files) {
            if (this.validateFile(file)) {
                formData.append('files', file);
                validFiles++;
            }
        }

        if (validFiles === 0) {
            showNotification('No valid files to upload', 'error');
            return;
        }

        this.uploadFiles(formData, validFiles);
    }

    validateFile(file) {
        // Check file size (max 500MB)
        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            showNotification(`File ${file.name} is too large (max 500MB)`, 'error');
            return false;
        }

        // Check file type - allow by extension as fallback
        const allMimeTypes = Object.values(FILE_CATEGORIES).flat();
        const isValidMime = allMimeTypes.includes(file.type);
        
        // Fallback: check by file extension
        const extension = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico',
                               'mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv',
                               'mp3', 'wav', 'flac', 'aac', 'weba',
                               'pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'csv',
                               'json',
                               'js', 'css', 'html', 'xml',
                               'zip', 'rar', '7z', 'gz'];
        const isValidExt = validExtensions.includes(extension);
        
        if (!isValidMime && !isValidExt) {
            showNotification(`File type (.${extension}) not supported`, 'error');
            return false;
        }

        return true;
    }

    async uploadFiles(formData, count) {
        try {
            this.uploadProgress.style.display = 'block';
            this.progressFill.style.width = '0%';
            this.progressText.textContent = '0%';

            // Simulate progress
            const interval = setInterval(() => {
                const currentWidth = parseInt(this.progressFill.style.width);
                if (currentWidth < 90) {
                    const newWidth = currentWidth + Math.random() * 30;
                    this.progressFill.style.width = Math.min(newWidth, 90) + '%';
                    this.progressText.textContent = Math.floor(Math.min(newWidth, 90)) + '%';
                }
            }, 200);

            const result = await APIService.uploadFiles(formData);

            clearInterval(interval);
            this.progressFill.style.width = '100%';
            this.progressText.textContent = '100%';

            if (result.success) {
                showNotification(`Successfully uploaded ${count} file(s)`, 'success');
                setTimeout(() => {
                    this.uploadProgress.style.display = 'none';
                    loadGalleryFiles();
                    loadActivities();
                }, 500);
            } else {
                showNotification(result.message || 'Upload failed', 'error');
                this.uploadProgress.style.display = 'none';
            }
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('Upload failed', 'error');
            this.uploadProgress.style.display = 'none';
        }
    }
}

// ============================================
// Gallery Manager
// ============================================
class GalleryManager {
    constructor() {
        this.galleryGrid = document.getElementById('galleryGrid');
        this.searchInput = document.getElementById('searchInput');
        this.searchClear = document.getElementById('searchClear');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        this.paginationContainer = document.getElementById('paginationContainer');
        
        this.currentCategory = 'all';
        this.currentSort = 'newest';
        this.currentPage = 1;
        this.currentSearch = '';
        this.totalPages = 1;

        this.setupListeners();
        this.loadFiles();
    }

    setupListeners() {
        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.currentPage = 1;
            this.loadFiles();
        });

        this.searchClear.addEventListener('click', () => {
            this.searchInput.value = '';
            this.currentSearch = '';
            this.currentPage = 1;
            this.loadFiles();
        });

        // Filter
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.currentPage = 1;
                this.loadFiles();
            });
        });

        // Sort
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.currentPage = 1;
            this.loadFiles();
        });

        // Pagination
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadFiles();
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadFiles();
            }
        });
    }

    async loadFiles() {
        try {
            const result = await APIService.getFiles(
                this.currentCategory,
                this.currentSearch,
                this.currentSort,
                this.currentPage
            );

            if (result.success && result.data.length > 0) {
                this.totalPages = result.pagination?.pages || 1;
                this.renderFiles(result.data);
                this.updatePagination();
            } else {
                this.showEmptyState();
                this.paginationContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading files:', error);
            this.showEmptyState();
        }
    }

    renderFiles(files) {
        this.galleryGrid.innerHTML = '';
        
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            const fileSize = typeof file.size === 'string' ? file.size : this.formatSize(file.sizeBytes || 0);
            item.innerHTML = `
                <div class="gallery-thumbnail">
                    <i class="fas ${this.getIcon(file.mimeType)}"></i>
                </div>
                <div class="gallery-info">
                    <div class="gallery-title">${this.truncate(file.originalName || file.name || 'Unknown', 20)}</div>
                    <div class="gallery-meta">
                        <span class="gallery-size">${fileSize}</span>
                        <span class="gallery-date">${new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="gallery-actions">
                        ${file.mimeType === 'application/json' ? `
                            <button class="action-btn edit-json" data-id="${file.fileId}" title="Edit JSON">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn preview-btn" data-id="${file.fileId}" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${file.fileId}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            this.galleryGrid.appendChild(item);
        });

        // Add event listeners to action buttons
        this.galleryGrid.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteFile(btn.dataset.id);
            });
        });

        this.galleryGrid.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.previewFile(btn.dataset.id);
            });
        });

        this.galleryGrid.querySelectorAll('.edit-json').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editJSON(btn.dataset.id);
            });
        });
    }

    async deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            try {
                const result = await APIService.deleteFile(fileId);
                if (result.success) {
                    showNotification('File deleted successfully', 'success');
                    this.loadFiles();
                    loadActivities();
                } else {
                    showNotification('Failed to delete file', 'error');
                }
            } catch (error) {
                console.error('Delete error:', error);
                showNotification('Delete failed', 'error');
            }
        }
    }

    async previewFile(fileId) {
        try {
            const result = await APIService.getFile(fileId);
            if (result.success) {
                const file = result.data;
                const modal = document.getElementById('previewModal');
                const previewContent = document.getElementById('previewContent');
                const previewTitle = document.getElementById('previewTitle');

                previewTitle.textContent = file.originalName;

                if (file.mimeType.startsWith('image/')) {
                    previewContent.innerHTML = `<img src="/uploads/${file.filename}" style="max-width: 100%; height: auto;">`;
                } else if (file.mimeType.startsWith('video/')) {
                    previewContent.innerHTML = `<video width="100%" height="auto" controls><source src="/uploads/${file.filename}"></video>`;
                } else if (file.mimeType === 'application/json') {
                    previewContent.innerHTML = `<pre><code>${JSON.stringify(file.metadata, null, 2)}</code></pre>`;
                } else {
                    previewContent.innerHTML = `<p>Preview not available for this file type</p>`;
                }

                modal.classList.add('active');
            }
        } catch (error) {
            console.error('Preview error:', error);
            showNotification('Preview failed', 'error');
        }
    }

    async editJSON(fileId) {
        try {
            const result = await APIService.getFile(fileId);
            if (result.success && result.data.mimeType === 'application/json') {
                const file = result.data;
                const modal = document.getElementById('jsonModal');
                const container = document.getElementById('jsonEditor');

                // Initialize JSON Editor
                const options = {
                    mode: 'tree',
                    onChange: () => {}
                };

                const editor = new JSONEditor(container, options);
                editor.set(file.metadata || {});

                // Save button
                document.querySelector('.btn-save').onclick = async () => {
                    const updatedData = editor.get();
                    // You can add API call to save the JSON here
                    showNotification('JSON updated (save feature in progress)', 'success');
                    modal.classList.remove('active');
                };

                // Cancel button
                document.querySelector('.btn-cancel').onclick = () => {
                    modal.classList.remove('active');
                };

                // Close button
                document.querySelector('.modal-close').onclick = () => {
                    modal.classList.remove('active');
                };

                modal.classList.add('active');
            }
        } catch (error) {
            console.error('JSON edit error:', error);
            showNotification('Failed to edit JSON', 'error');
        }
    }

    updatePagination() {
        const pageInfo = document.getElementById('pageInfo');
        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        
        document.getElementById('prevBtn').disabled = this.currentPage === 1;
        document.getElementById('nextBtn').disabled = this.currentPage === this.totalPages;
        
        if (this.totalPages > 1) {
            this.paginationContainer.style.display = 'flex';
        }
    }

    showEmptyState() {
        this.galleryGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No files found</p>
            </div>
        `;
    }

    getIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'fa-image';
        if (mimeType.startsWith('video/')) return 'fa-video';
        if (mimeType.startsWith('audio/')) return 'fa-music';
        if (mimeType === 'application/json') return 'fa-code';
        if (mimeType === 'application/pdf') return 'fa-file-pdf';
        if (mimeType.startsWith('application/vnd') || mimeType.startsWith('text/')) return 'fa-file-alt';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('gzip')) return 'fa-archive';
        return 'fa-file';
    }

    truncate(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// ============================================
// Analytics Manager
// ============================================
class AnalyticsManager {
    constructor() {
        this.storageBreakdown = document.getElementById('storageBreakdown');
        this.distributionChart = document.getElementById('distributionChart');
        this.loadAnalytics();
    }

    async loadAnalytics() {
        try {
            const breakdownResult = await APIService.getStorageBreakdown();
            const distributionResult = await APIService.getFileDistribution();

            if (breakdownResult.success) {
                this.renderStorageBreakdown(breakdownResult.data);
            }

            if (distributionResult.success) {
                this.renderDistribution(distributionResult.data);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    renderStorageBreakdown(data) {
        if (!data || data.length === 0) {
            this.storageBreakdown.innerHTML = '<p>No data available</p>';
            return;
        }

        let html = '';
        const total = data.reduce((sum, item) => sum + (item.sizeBytes || 0), 0);

        data.forEach(item => {
            const sizeBytes = item.sizeBytes || 0;
            const percentage = total > 0 ? ((sizeBytes / total) * 100).toFixed(1) : 0;
            html += `
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-name">${item.name || item.category}</span>
                        <span class="breakdown-percentage">${percentage}%</span>
                    </div>
                    <div class="breakdown-bar">
                        <div class="breakdown-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="breakdown-details">
                        <span>${item.count || 0} files</span>
                        <span>${item.size || this.formatSize(sizeBytes)}</span>
                    </div>
                </div>
            `;
        });

        this.storageBreakdown.innerHTML = html || '<p>No data available</p>';
    }

    renderDistribution(data) {
        if (!data || data.length === 0) {
            this.distributionChart.innerHTML = '<p>No data available</p>';
            return;
        }

        let html = '<div class="distribution-items">';
        
        data.forEach(item => {
            html += `
                <div class="distribution-item">
                    <div class="distribution-label">${item.category || item.type || 'Unknown'}</div>
                    <div class="distribution-count">${item.count || 0}</div>
                </div>
            `;
        });

        html += '</div>';
        this.distributionChart.innerHTML = html || '<p>No data available</p>';
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// ============================================
// Navigation Manager
// ============================================
class NavigationManager {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');
        this.setupListeners();
    }

    setupListeners() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.dataset.page;
                this.switchPage(pageId);
            });
        });
    }

    switchPage(pageId) {
        // Update active link
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            }
        });

        // Update active page
        this.pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === pageId) {
                page.classList.add('active');
                // Refresh data when switching to that page
                if (pageId === 'gallery') {
                    setTimeout(() => galleryManager?.loadFiles(), 100);
                } else if (pageId === 'analytics') {
                    setTimeout(() => analyticsManager?.loadAnalytics(), 100);
                }
            }
        });
    }
}

// ============================================
// Activity Manager
// ============================================
class ActivityManager {
    constructor() {
        this.activityList = document.getElementById('activityList');
        this.loadActivities();
    }

    async loadActivities() {
        try {
            const result = await APIService.getActivities(5);
            if (result.success && result.data.length > 0) {
                this.renderActivities(result.data);
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Error loading activities:', error);
        }
    }

    renderActivities(activities) {
        this.activityList.innerHTML = '';

        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';

            const icon = this.getActivityIcon(activity.type);
            const date = new Date(activity.timestamp);
            const timeAgo = this.getTimeAgo(date);

            item.innerHTML = `
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${this.getActivityTitle(activity)}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;

            this.activityList.appendChild(item);
        });
    }

    showEmptyState() {
        this.activityList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No recent activity</p>
            </div>
        `;
    }

    getActivityIcon(type) {
        const icons = {
            upload: 'fa-cloud-upload-alt',
            delete: 'fa-trash',
            view: 'fa-eye',
            download: 'fa-download',
            update: 'fa-sync'
        };
        return icons[type] || 'fa-file';
    }

    getActivityTitle(activity) {
        return `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - ${activity.fileName}`;
    }

    getTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }
}

// ============================================
// Auth Manager
// ============================================
class AuthManager {
    constructor() {
        this.authModal = document.getElementById('authModal');
        this.authForm = document.getElementById('authForm');
        this.authTabs = document.querySelectorAll('.auth-tab');
        this.authModalTitle = document.getElementById('authModalTitle');
        this.authSubmitBtn = document.querySelector('.auth-submit-btn');
        this.authMessage = document.getElementById('authMessage');
        this.confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        this.authBtn = document.getElementById('authBtn');
        this.userProfile = document.getElementById('userProfile');
        this.userEmail = document.getElementById('userEmail');
        this.logoutBtn = document.getElementById('logoutBtn');

        this.currentMode = 'login';
        this.isAuthenticated = false;
        this.user = null;

        this.setupListeners();
        this.checkAuthStatus();
    }

    setupListeners() {
        // Auth button click
        this.authBtn.addEventListener('click', () => this.showAuthModal());

        // Tab switching
        this.authTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submission
        this.authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth();
        });

        // Logout
        this.logoutBtn.addEventListener('click', () => this.logout());

        // Modal close
        this.authModal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideAuthModal();
        });

        // Click outside to close
        this.authModal.addEventListener('click', (e) => {
            if (e.target === this.authModal) {
                this.hideAuthModal();
            }
        });
    }

    showAuthModal(mode = 'login') {
        this.switchTab(mode);
        this.authModal.classList.add('active');
        this.clearForm();
        this.clearMessage();
    }

    hideAuthModal() {
        this.authModal.classList.remove('active');
        this.clearForm();
        this.clearMessage();
    }

    switchTab(mode) {
        this.currentMode = mode;

        // Update tabs
        this.authTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === mode) {
                tab.classList.add('active');
            }
        });

        // Update form
        this.authModalTitle.textContent = mode === 'login' ? 'Login' : 'Sign Up';
        this.authSubmitBtn.textContent = mode === 'login' ? 'Login' : 'Sign Up';

        // Show/hide confirm password
        this.confirmPasswordGroup.style.display = mode === 'signup' ? 'block' : 'none';

        // Update form validation
        const confirmPassword = document.getElementById('confirmPassword');
        confirmPassword.required = mode === 'signup';
    }

    async handleAuth() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (this.currentMode === 'signup' && password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            this.setLoading(true);
            let result;

            if (this.currentMode === 'login') {
                result = await APIService.login(email, password);
            } else {
                result = await APIService.signup(email, password);
            }

            if (result.success) {
                this.setAuthData(result.token, result.user);
                this.updateUI();
                this.hideAuthModal();
                showNotification(`Welcome ${result.user.email}!`, 'success');
            } else {
                this.showMessage(result.message || 'Authentication failed', 'error');
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showMessage('Authentication failed', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async logout() {
        try {
            await APIService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }

        this.clearAuthData();
        this.updateUI();
        showNotification('Logged out successfully', 'success');
    }

    checkAuthStatus() {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');

        if (token && user) {
            this.setAuthData(token, user);
        }

        this.updateUI();
    }

    setAuthData(token, user) {
        this.isAuthenticated = true;
        this.user = user;

        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Add token to API requests
        this.addAuthHeader(token);
    }

    clearAuthData() {
        this.isAuthenticated = false;
        this.user = null;

        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        // Remove auth header
        this.removeAuthHeader();
    }

    addAuthHeader(token) {
        // Override fetch to include auth header
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            options.headers = options.headers || {};
            options.headers['Authorization'] = `Bearer ${token}`;
            return originalFetch(url, options);
        };
    }

    removeAuthHeader() {
        // Reset fetch to original
        window.fetch = window.originalFetch || window.fetch;
    }

    updateUI() {
        if (this.isAuthenticated && this.user) {
            this.authBtn.style.display = 'none';
            this.userProfile.style.display = 'flex';
            this.userEmail.textContent = this.user.email;
        } else {
            this.authBtn.style.display = 'flex';
            this.userProfile.style.display = 'none';
        }
    }

    clearForm() {
        this.authForm.reset();
    }

    showMessage(message, type) {
        this.authMessage.textContent = message;
        this.authMessage.className = `auth-message ${type}`;
    }

    clearMessage() {
        this.authMessage.textContent = '';
        this.authMessage.className = 'auth-message';
    }

    setLoading(loading) {
        this.authSubmitBtn.disabled = loading;
        this.authSubmitBtn.textContent = loading ?
            (this.currentMode === 'login' ? 'Logging in...' : 'Signing up...') :
            (this.currentMode === 'login' ? 'Login' : 'Sign Up');
    }
}

// ============================================
// Utility Functions
// ============================================

async function updateDashboard(stats) {
    document.getElementById('imageCount').textContent = stats.image || 0;
    document.getElementById('videoCount').textContent = stats.video || 0;
    document.getElementById('audioCount').textContent = stats.audio || 0;
    document.getElementById('documentCount').textContent = stats.document || 0;
    document.getElementById('jsonCount').textContent = stats.json || 0;
    document.getElementById('archiveCount').textContent = stats.archive || 0;
    document.getElementById('totalCount').textContent = (stats.image || 0) + (stats.video || 0) + (stats.audio || 0) + (stats.document || 0) + (stats.json || 0) + (stats.archive || 0);
    document.getElementById('storageUsed').textContent = formatBytes(stats.totalSize || 0);
}

async function loadGalleryFiles() {
    galleryManager?.loadFiles();
}

async function loadActivities() {
    activityManager?.loadActivities();
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-exclamation' : 'fa-info'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Fade out and remove
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// Modal Management
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });
});

// ============================================
// Application Initialization
// ============================================

let themeManager;
let uploadManager;
let galleryManager;
let analyticsManager;
let navigationManager;
let activityManager;
let authManager;
let wsManager;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    themeManager = new ThemeManager();
    uploadManager = new UploadManager();
    navigationManager = new NavigationManager();
    activityManager = new ActivityManager();
    analyticsManager = new AnalyticsManager();
    galleryManager = new GalleryManager();
    authManager = new AuthManager();

    // WebSocket connection
    wsManager = new WebSocketManager();
    wsManager.connect();

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        themeManager.toggle();
    });

    // Load initial data
    updateDashboard({
        imageCount: 0,
        videoCount: 0,
        jsonCount: 0,
        totalSize: 0
    });

    // Real-time data update interval
    setInterval(async () => {
        try {
            const stats = await APIService.getDashboardStats();
            if (stats.success) {
                updateDashboard(stats.data);
            }
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }, 5000); // Update every 5 seconds

    // Socket listeners for real-time updates
    wsManager.socket.on('fileUpdated', (data) => {
        console.log('File updated:', data);
        // Refresh gallery and dashboard
        galleryManager.loadFiles();
        updateDashboard(data.stats || {});
    });

    wsManager.socket.on('statsUpdate', (data) => {
        console.log('Stats updated:', data);
        updateDashboard(data);
    });

    wsManager.socket.on('analyticsUpdated', (data) => {
        console.log('Analytics updated:', data);
        // Refresh analytics page if active
        if (document.getElementById('analytics').classList.contains('active')) {
            analyticsManager.loadAnalytics();
        }
    });
});

// Log app ready
console.log('IntelliStore Application Ready');
