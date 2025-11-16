const File = require('../models/File');
const Activity = require('../models/Activity');
const { getFileCategory, formatFileSize, deleteFile } = require('../utils/fileHelper');
const AnalyticsController = require('./analyticsController');
const path = require('path');

class FileController {
    static isDBAvailable() {
        try {
            return File.collection.conn && File.collection.conn.readyState === 1;
        } catch (e) {
            return false;
        }
    }

    static async uploadFiles(req, res, next) {
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files were uploaded',
                });
            }

            const uploadedFiles = [];
            const fs = require('fs');
            const crypto = require('crypto');
            
            // Handle both single file and multiple files from express-fileupload
            let files = req.files.files || req.files.file || [];
            if (!Array.isArray(files)) {
                files = [files];
            }

            // Ensure uploads directory exists
            const uploadsDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
            const dbAvailable = FileController.isDBAvailable();

            for (const file of files) {
                const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
                const uploadPath = path.join(uploadsDir, filename);

                // Save file from express-fileupload
                await file.mv(uploadPath);

                // If database is available, save to MongoDB; otherwise return mock data
                if (dbAvailable) {
                    try {
                        // Create file document
                        const fileDoc = new File({
                            originalName: file.name,
                            filename,
                            filepath: uploadPath,
                            mimeType: file.mimetype,
                            size: file.size,
                            category: getFileCategory(file.mimetype),
                            metadata: {
                                description: metadata.description || '',
                                tags: metadata.tags || [],
                                category: metadata.category || getFileCategory(file.mimetype),
                                comments: metadata.comments || '',
                            },
                            fileStats: {
                                processingTime: Math.random() * 100,
                                accuracy: 85 + Math.random() * 15,
                                processedAt: new Date(),
                            },
                        });

                        const savedFile = await fileDoc.save();

                        // Create activity record
                        try {
                            await Activity.create({
                                fileId: savedFile.fileId,
                                type: 'upload',
                                fileName: file.name,
                                fileSize: file.size,
                                fileCategory: savedFile.category,
                                description: `File "${file.name}" uploaded successfully`,
                                status: 'success',
                            });
                        } catch (activityError) {
                            console.warn('Activity creation failed:', activityError.message);
                        }

                        uploadedFiles.push({
                            fileId: savedFile.fileId,
                            originalName: savedFile.originalName,
                            filename: savedFile.filename,
                            mimeType: savedFile.mimeType,
                            size: formatFileSize(savedFile.size),
                            category: savedFile.category,
                            uploadedAt: savedFile.uploadedAt,
                        });

                        // Emit real-time updates
                        const SocketHandler = require('../utils/socketHandler');
                        SocketHandler.broadcastFileUpdate({ action: 'upload', file: savedFile });
                        SocketHandler.broadcastActivityUpdate({ type: 'upload', fileName: file.name });

                        // Broadcast stats update
                        const stats = await AnalyticsController.getDashboardStats({}, { json: () => {} }, () => {});
                        if (stats && stats.data) {
                            SocketHandler.broadcastStatsUpdate(stats.data);
                        }
                    } catch (dbError) {
                        console.error('Database save error:', dbError);
                        throw dbError;
                    }
                } else {
                    // Database unavailable - generate mock ID and return success
                    const mockFileId = crypto.randomUUID();
                    uploadedFiles.push({
                        fileId: mockFileId,
                        originalName: file.name,
                        filename,
                        mimeType: file.mimetype,
                        size: formatFileSize(file.size),
                        category: getFileCategory(file.mimetype),
                        uploadedAt: new Date().toISOString(),
                    });
                }
            }

            res.status(201).json({
                success: true,
                message: `${uploadedFiles.length} file(s) uploaded successfully`,
                data: uploadedFiles,
                count: uploadedFiles.length,
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Upload failed',
            });
        }
    }

    static async getFiles(req, res, next) {
        try {
            const fs = require('fs');
            const crypto = require('crypto');
            const mime = require('mime-types');
            const dbAvailable = FileController.isDBAvailable();
            const category = req.query.category || '';
            const search = req.query.search || '';
            const sort = req.query.sort || 'newest';
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, parseInt(req.query.limit) || 12);
            const skip = (page - 1) * limit;

            let files = [];
            let total = 0;

            if (!dbAvailable) {
                const uploadsDir = path.join(__dirname, '../../uploads');
                
                if (fs.existsSync(uploadsDir)) {
                    const fileNames = fs.readdirSync(uploadsDir);
                files = fileNames.map(fileName => {
                    const filePath = path.join(uploadsDir, fileName);
                    const stat = fs.statSync(filePath);
                    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
                    const parts = fileName.split('-');
                    const origName = parts.length > 2 ? parts.slice(2).join('-') : fileName;

                    return {
                        fileId: fileName, // Use filename as fileId for consistency
                        originalName: origName,
                        filename: fileName,
                        mimeType,
                        size: formatFileSize(stat.size),
                        sizeBytes: stat.size,
                        category: getFileCategory(mimeType),
                        uploadedAt: stat.mtime.toISOString(),
                    };
                });
                }
                
                // Filter by category
                if (category && category !== 'all') {
                    files = files.filter(f => f.category === category);
                }
                
                // Filter by search
                if (search) {
                    const searchLower = search.toLowerCase();
                    files = files.filter(f => f.originalName.toLowerCase().includes(searchLower));
                }
                
                // Sort
                if (sort === 'oldest') {
                    files.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
                } else if (sort === 'name') {
                    files.sort((a, b) => a.originalName.localeCompare(b.originalName));
                } else if (sort === 'size') {
                    files.sort((a, b) => b.sizeBytes - a.sizeBytes);
                } else {
                    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
                }
                
                total = files.length;
                files = files.slice(skip, skip + limit);

                return res.status(200).json({
                    success: true,
                    data: files,
                    pagination: {
                        total,
                        page,
                        limit,
                        pages: Math.ceil(total / limit) || 0,
                    },
                });
            }

            // MongoDB is available
            const query = { isDeleted: false };

            if (category && category !== 'all') {
                query.category = category;
            }

            if (search) {
                query.$or = [
                    { originalName: { $regex: search, $options: 'i' } },
                    { 'metadata.description': { $regex: search, $options: 'i' } },
                    { 'metadata.tags': { $regex: search, $options: 'i' } },
                ];
            }

            let sortObj = { uploadedAt: -1 };
            if (sort === 'oldest') sortObj = { uploadedAt: 1 };
            else if (sort === 'name') sortObj = { originalName: 1 };
            else if (sort === 'size') sortObj = { size: -1 };

            total = await File.countDocuments(query);
            files = await File.find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit));

            const formattedFiles = files.map(file => ({
                fileId: file.fileId,
                originalName: file.originalName,
                filename: file.filename,
                mimeType: file.mimeType,
                size: formatFileSize(file.size),
                sizeBytes: file.size,
                category: file.category,
                uploadedAt: file.uploadedAt,
                metadata: file.metadata,
                fileStats: file.fileStats,
            }));

            res.status(200).json({
                success: true,
                data: formattedFiles,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteFile(req, res, next) {
        try {
            const { fileId } = req.params;
            const fs = require('fs');
            const crypto = require('crypto');
            const mime = require('mime-types');
            const dbAvailable = FileController.isDBAvailable();

            if (!dbAvailable) {
                // File system mode - find and delete file from uploads directory
                const uploadsDir = path.join(__dirname, '../../uploads');

                if (!fs.existsSync(uploadsDir)) {
                    return res.status(404).json({
                        success: false,
                        message: 'File not found',
                    });
                }

                const fileNames = fs.readdirSync(uploadsDir);
                let fileToDelete = null;
                let filePath = null;

                // Find the file by checking if any filename matches the fileId
                for (const fileName of fileNames) {
                    if (fileName === fileId) {
                        const fullPath = path.join(uploadsDir, fileName);
                        const stat = fs.statSync(fullPath);

                        fileToDelete = {
                            fileId: fileId,
                            filename: fileName,
                            filepath: fullPath,
                            originalName: fileName.split('-').slice(2).join('-') || fileName,
                            size: stat.size,
                            mimeType: mime.lookup(fullPath) || 'application/octet-stream',
                            category: getFileCategory(mime.lookup(fullPath) || 'application/octet-stream'),
                        };
                        filePath = fullPath;
                        break;
                    }
                }

                if (!fileToDelete || !filePath) {
                    return res.status(404).json({
                        success: false,
                        message: 'File not found',
                    });
                }

                // Delete physical file
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.warn('Physical file deletion warning:', err.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to delete file',
                    });
                }

                // Emit real-time updates
                const SocketHandler = require('../utils/socketHandler');
                SocketHandler.broadcastFileUpdate({ action: 'delete', file: fileToDelete });
                SocketHandler.broadcastActivityUpdate({ type: 'delete', fileName: fileToDelete.originalName });

                return res.status(200).json({
                    success: true,
                    message: 'File deleted successfully',
                });
            }

            // Database mode - existing logic
            const file = await File.findOne({ fileId, isDeleted: false });
            if (!file) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found',
                });
            }

            // Delete physical file
            try {
                await deleteFile(file.filepath);
            } catch (err) {
                console.warn('Physical file deletion warning:', err.message);
            }

            // Mark as deleted
            file.isDeleted = true;
            await file.save();

            // Create activity record
            try {
                await Activity.create({
                    fileId: file.fileId,
                    type: 'delete',
                    fileName: file.originalName,
                    fileSize: file.size,
                    fileCategory: file.category,
                    description: `File "${file.originalName}" deleted`,
                    status: 'success',
                });
            } catch (activityError) {
                console.warn('Activity creation failed:', activityError.message);
            }

            // Emit real-time updates
            const SocketHandler = require('../utils/socketHandler');
            SocketHandler.broadcastFileUpdate({ action: 'delete', file: file });
            SocketHandler.broadcastActivityUpdate({ type: 'delete', fileName: file.originalName });

            res.status(200).json({
                success: true,
                message: 'File deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    static async getFileById(req, res, next) {
        try {
            const { fileId } = req.params;

            const file = await File.findOne({ fileId, isDeleted: false });
            if (!file) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found',
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    fileId: file.fileId,
                    originalName: file.originalName,
                    filename: file.filename,
                    mimeType: file.mimeType,
                    size: formatFileSize(file.size),
                    sizeBytes: file.size,
                    category: file.category,
                    uploadedAt: file.uploadedAt,
                    metadata: file.metadata,
                    fileStats: file.fileStats,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateFileBroadcast(io) {
        try {
            const stats = await File.aggregate([
                { $match: { isDeleted: false } },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        totalSize: { $sum: '$size' },
                    },
                },
            ]);

            const totalFiles = await File.countDocuments({ isDeleted: false });

            io.emit('fileUpdate', {
                totalFiles,
                stats,
                timestamp: new Date(),
            });
        } catch (error) {
            console.error('Broadcast error:', error);
        }
    }
}

module.exports = FileController;
