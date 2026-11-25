import styles from './details.module.css';
import Eye from '../../../assets/images/ViewEye.svg';
import { useNavigate } from 'react-router-dom';

const PartnerChargingSession = ({ title, headers, bookingData, count, chargerId }) => {
    const navigate = useNavigate();

    const handleViewClick = (booking) => {
        const cId = booking.charger_id ?? chargerId;
        const sId = booking.session_row_id ?? booking.session_id;
        if (!cId || !sId) return;
        navigate(`/partners/sessions-details/${cId}/${sId}`);
    };

    return (
        <div className={styles.addressListContainer}>
            <div className={styles.bookingHeadCard}>
                {count != null && (
                    <div className={styles.bookingHeadCardNumber}>{count}</div>
                )}
                <div className={styles.bookingHeadCardText}>{title}</div>
            </div>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bookingData.length > 0 ? (
                        bookingData.map((booking, index) => (
                            <tr key={`${booking.session_row_id ?? booking.session_id}-${index}`}>
                                <td>{booking.session_id}</td>
                                <td>{booking.start_date}</td>
                                <td>{booking.end_date}</td>
                                <td>{booking.duration}</td>
                                <td>{booking.energy ?? booking.energy_kwh ?? '—'}</td>
                                <td>{booking.status}</td>
                                <td>
                                    <div className={styles.editContent}>
                                        <img
                                            src={Eye}
                                            alt="View session"
                                            onClick={() => handleViewClick(booking)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className={styles.noData}>
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PartnerChargingSession;