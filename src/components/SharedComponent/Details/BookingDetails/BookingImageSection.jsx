import React from 'react';
import styles from '../details.module.css';

const BookingImageSection = ({ titles, content, type }) => {
    const baseUrl = content.baseUrl;
    return (
        <div className={styles.ImageMainSection}>
            <div className={styles.imageMainContainer}>
                <div className={styles.infoSection}>
                {/* Check if coverImages exists and render if present */}
                {Array.isArray(content.coverImages) && content.coverImages.length > 0 ? (
                    <div className="col-12">
                    <div className={styles.infoBlock}>
                        <span className={styles.infoHeading}>{titles.coverImages}</span>
                        <div className={styles.galleryImages}>
                        {content.coverImages.map((image, index) => (
                            <img
                            key={index}
                            src={`${baseUrl}${image}`}
                            alt={`Cover Img ${index + 1}`}
                            className={styles.galleryImage}
                            />
                        ))}
                        </div>
                    </div>
                    </div>
                ) : content.coverImage ? (
                    /* Render coverImage only if coverImages is not available */
                    <div className="col-12">
                    <div className={styles.infoBlock}>
                        <span className={styles.infoHeading}>{titles.coverImage}</span>
                        <div className={styles.galleryImages}>
                        <img
                            src={`${baseUrl}${content.coverImage}`}
                            alt="Cover"
                            className={styles.galleryImage}
                        />
                        </div>
                    </div>
                    </div>
                ) : (
                    /* Fallback for no data */
                    <div className="col-12">
                        <div className={styles.infoBlock}>
                            <span className={styles.infoHeading}>{titles.coverImages || titles.coverImage}</span>
                            <p className={styles.noDataMessage}>No data available</p>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};
export default BookingImageSection;
