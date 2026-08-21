const NEW_SEGMENT = '/_uploads/';
const OLD_SEGMENT = '/uploads/';

/** Prefer env base (should point at _uploads/). */
export const getUploadBase = () =>
    process.env.REACT_APP_DIR_UPLOADS ||
    'https://plusx.s3.ap-south-1.amazonaws.com/_uploads/';

/**
 * Build an S3 upload URL from a relative path or return absolute URLs as-is.
 * @param {string} relativePath e.g. "charger-installation/file.jpeg"
 */
export const getUploadUrl = (relativePath = '') => {
    if (!relativePath) return '';
    if (typeof relativePath !== 'string') return '';
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('blob:')) {
        return relativePath;
    }
    const base = getUploadBase();
    return `${base}${relativePath.replace(/^\//, '')}`;
};

/** Concatenate API baseUrl + filename (or return absolute path). */
export const buildUploadSrc = (baseUrl = '', path = '') => {
    if (!path) return '';
    if (typeof path !== 'string') return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
        return path;
    }
    return `${baseUrl || ''}${path}`;
};

/** Swap uploads ↔ _uploads on an absolute URL. */
export const getAlternateUploadUrl = (url = '') => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes(NEW_SEGMENT)) {
        return url.replace(NEW_SEGMENT, OLD_SEGMENT);
    }
    if (url.includes(OLD_SEGMENT)) {
        return url.replace(OLD_SEGMENT, NEW_SEGMENT);
    }
    return url;
};

/**
 * <img onError={onUploadImageError} /> — try the other S3 prefix once.
 * Works whether the first attempt used /uploads/ or /_uploads/.
 */
export const onUploadImageError = (event) => {
    const img = event?.currentTarget;
    if (!img || img.dataset.uploadFallback === '1') return;

    const alternate = getAlternateUploadUrl(img.src);
    if (!alternate || alternate === img.src) return;

    img.dataset.uploadFallback = '1';
    img.src = alternate;
};
