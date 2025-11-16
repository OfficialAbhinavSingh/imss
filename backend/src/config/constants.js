const ALLOWED_MIME_TYPES = {
    'image/jpeg': { category: 'image', ext: 'jpg' },
    'image/png': { category: 'image', ext: 'png' },
    'image/gif': { category: 'image', ext: 'gif' },
    'image/webp': { category: 'image', ext: 'webp' },
    'image/svg+xml': { category: 'image', ext: 'svg' },
    'image/bmp': { category: 'image', ext: 'bmp' },
    'image/tiff': { category: 'image', ext: 'tiff' },
    'image/x-icon': { category: 'image', ext: 'ico' },
    'video/mp4': { category: 'video', ext: 'mp4' },
    'video/mpeg': { category: 'video', ext: 'mpeg' },
    'video/webm': { category: 'video', ext: 'webm' },
    'video/ogg': { category: 'video', ext: 'ogg' },
    'video/quicktime': { category: 'video', ext: 'mov' },
    'video/x-msvideo': { category: 'video', ext: 'avi' },
    'video/x-matroska': { category: 'video', ext: 'mkv' },
    'audio/mpeg': { category: 'audio', ext: 'mp3' },
    'audio/wav': { category: 'audio', ext: 'wav' },
    'audio/ogg': { category: 'audio', ext: 'ogg' },
    'audio/flac': { category: 'audio', ext: 'flac' },
    'audio/aac': { category: 'audio', ext: 'aac' },
    'audio/webm': { category: 'audio', ext: 'weba' },
    'application/pdf': { category: 'document', ext: 'pdf' },
    'text/plain': { category: 'document', ext: 'txt' },
    'application/msword': { category: 'document', ext: 'doc' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { category: 'document', ext: 'docx' },
    'application/vnd.ms-excel': { category: 'document', ext: 'xls' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { category: 'document', ext: 'xlsx' },
    'text/csv': { category: 'document', ext: 'csv' },
    'application/json': { category: 'json', ext: 'json' },
    'text/javascript': { category: 'code', ext: 'js' },
    'text/css': { category: 'code', ext: 'css' },
    'text/html': { category: 'code', ext: 'html' },
    'application/xml': { category: 'code', ext: 'xml' },
    'text/xml': { category: 'code', ext: 'xml' },
    'text/x-python': { category: 'code', ext: 'py' },
    'text/x-java': { category: 'code', ext: 'java' },
    'application/zip': { category: 'archive', ext: 'zip' },
    'application/x-rar-compressed': { category: 'archive', ext: 'rar' },
    'application/x-7z-compressed': { category: 'archive', ext: '7z' },
    'application/gzip': { category: 'archive', ext: 'gz' },
};

const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 536870912; // 500MB
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

const FILE_CATEGORIES = {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'document',
    JSON: 'json',
    CODE: 'code',
    ARCHIVE: 'archive',
};

const STORAGE_UNITS = {
    BYTE: 'Bytes',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
};

module.exports = {
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE,
    UPLOAD_PATH,
    FILE_CATEGORIES,
    STORAGE_UNITS,
};
