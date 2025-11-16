const { STORAGE_UNITS, ALLOWED_MIME_TYPES } = require('../config/constants');
const fs = require('fs');

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = [STORAGE_UNITS.BYTE, STORAGE_UNITS.KB, STORAGE_UNITS.MB, STORAGE_UNITS.GB];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileCategory = (mimeType) => {
    return ALLOWED_MIME_TYPES[mimeType]?.category || 'unknown';
};

const getFileExtension = (mimeType) => {
    return ALLOWED_MIME_TYPES[mimeType]?.ext || 'bin';
};

const deleteFile = (filepath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filepath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

const validateFileSize = (size, maxSize) => {
    return size <= maxSize;
};

const calculateStorageStats = (files) => {
    const stats = {
        totalSize: 0,
        totalFiles: 0,
        image: 0,
        video: 0,
        audio: 0,
        document: 0,
        json: 0,
        code: 0,
        archive: 0,
        byCategory: {
            image: { count: 0, size: 0 },
            video: { count: 0, size: 0 },
            audio: { count: 0, size: 0 },
            document: { count: 0, size: 0 },
            json: { count: 0, size: 0 },
            code: { count: 0, size: 0 },
            archive: { count: 0, size: 0 },
        },
    };

    files.forEach(file => {
        stats.totalSize += file.size;
        stats.totalFiles += 1;
        const category = file.category || 'unknown';
        if (stats.byCategory[category]) {
            stats.byCategory[category].count += 1;
            stats.byCategory[category].size += file.size;
            stats[category] = stats.byCategory[category].count;
        }
    });

    return stats;
};

module.exports = {
    formatFileSize,
    getFileCategory,
    getFileExtension,
    deleteFile,
    validateFileSize,
    calculateStorageStats,
};
