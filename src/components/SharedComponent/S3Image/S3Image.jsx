import React from 'react';
import { onUploadImageError } from '../../../utils/uploadUrl';

/**
 * Drop-in <img> that retries with the alternate S3 prefix
 * (/uploads/ ↔ /_uploads/) if the first URL fails.
 */
const S3Image = ({ src, onError, ...props }) => {
    const handleError = (event) => {
        onUploadImageError(event);
        onError?.(event);
    };

    return <img src={src} onError={handleError} {...props} />;
};

export default S3Image;
