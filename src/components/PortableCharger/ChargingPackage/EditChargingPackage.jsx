import React, { useEffect, useState } from 'react';
import styles from '../../PodDevice/Area/adddevice.module.css';
import { postRequestWithToken } from '../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const EditChargingPackage = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const location = useLocation();
    const { packageId } = useParams();

    const [packageName, setPackageName] = useState('');
    const [chargingCapacity, setChargingCapacity] = useState('');
    const [price, setPrice] = useState('');
    const [pricePerUnit, setPricePerUnit] = useState('');
    const [serviceFee, setServiceFee] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const backButtonClick = () => {
        navigate('/portable-charger/charging-package-list');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!packageName.trim()) {
            newErrors.packageName = 'Package name is required.';
        }

        if (!chargingCapacity.trim()) {
            newErrors.chargingCapacity = 'Charging capacity is required.';
        } else if (isNaN(chargingCapacity) || Number(chargingCapacity) <= 0) {
            newErrors.chargingCapacity = 'Charging capacity must be a positive number.';
        }

        if (!price.trim()) {
            newErrors.price = 'Price is required.';
        } else if (isNaN(price) || Number(price) <= 0) {
            newErrors.price = 'Price must be a positive number.';
        }

        if (pricePerUnit && (isNaN(pricePerUnit) || Number(pricePerUnit) < 0)) {
            newErrors.pricePerUnit = 'Price per unit must be a valid number.';
        }

        if (serviceFee && (isNaN(serviceFee) || Number(serviceFee) < 0)) {
            newErrors.serviceFee = 'Service fee must be a valid number.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const populateForm = (data) => {
        setPackageName(data.package_name || '');
        setChargingCapacity(data.charging_capacity?.toString() || '');
        setPrice(data.price?.toString() || '');
        setPricePerUnit(data.price_per_unit?.toString() || '');
        setServiceFee(data.service_fee?.toString() || '');
        setIsActive(data.status == 1);
    };

    const fetchDetails = () => {
        if (location.state) {
            populateForm(location.state);
            return;
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            page_no: 1,
            package_id: packageId,
        };

        postRequestWithToken('charging-package-list', obj, (response) => {
            if (response.code === 200) {
                const packageData = (response?.data || []).find(
                    (item) => String(item.package_id) === String(packageId)
                );

                if (packageData) {
                    populateForm(packageData);
                } else {
                    toast('Package not found', { type: 'error' });
                }
            } else {
                toast(response.message, { type: 'error' });
                console.error('Error in charging-package-list API', response);
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            package_id: packageId,
            package_name: packageName.trim(),
            charging_capacity: chargingCapacity,
            price: price,
            price_per_unit: pricePerUnit || '',
            service_fee: serviceFee || '',
            status: isActive ? 1 : 0,
        };

        postRequestWithToken('update-charging-package', obj, async (response) => {
            if (response.code === 200) {
                toast(Array.isArray(response.message) ? response.message[0] : response.message, { type: 'success' });
                setTimeout(() => {
                    setLoading(false);
                    navigate('/portable-charger/charging-package-list');
                }, 2000);
            } else {
                toast(Array.isArray(response.message) ? response.message[0] : response.message, { type: 'error' });
                console.log('error in update-charging-package api', response);
                setLoading(false);
            }
        });
    };

    const handleToggle = () => {
        setIsActive(!isActive);
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);

    return (
        <div className={styles.containerCharger}>
            <h2 className={styles.title}>Edit Package</h2>
            <div className={styles.chargerSection}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <ToastContainer />
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Package Name</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Package Name"
                                value={packageName}
                                onChange={(e) => setPackageName(e.target.value)}
                            />
                            {errors.packageName && <p className="error">{errors.packageName}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Charging Capacity (kW)</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Charging Capacity (kW)"
                                value={chargingCapacity}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                        setChargingCapacity(value);
                                    }
                                }}
                            />
                            {errors.chargingCapacity && <p className="error">{errors.chargingCapacity}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Price</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Price"
                                value={price}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                        setPrice(value);
                                    }
                                }}
                            />
                            {errors.price && <p className="error">{errors.price}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Price Per Unit (Optional)</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Price Per Unit"
                                value={pricePerUnit}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                        setPricePerUnit(value);
                                    }
                                }}
                            />
                            {errors.pricePerUnit && <p className="error">{errors.pricePerUnit}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Service Fee (Optional)</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Service Fee"
                                value={serviceFee}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                        setServiceFee(value);
                                    }
                                }}
                            />
                            {errors.serviceFee && <p className="error">{errors.serviceFee}</p>}
                        </div>
                        <div className={styles.inputGroup}></div>
                    </div>
                    <div className={styles.toggleContainer}>
                        <label className={styles.statusLabel}>Status</label>
                        <div className={styles.toggleSwitch} onClick={handleToggle}>
                            <span className={`${styles.toggleLabel} ${!isActive ? styles.inactive : ''}`}>
                                In-Active
                            </span>
                            <div className={`${styles.toggleButton} ${isActive ? styles.active : ''}`}>
                                <div className={styles.slider}></div>
                            </div>
                            <span className={`${styles.toggleLabel} ${isActive ? styles.active : ''}`}>
                                Active
                            </span>
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button onClick={backButtonClick} className={styles.cancelBtn} type="button">
                            Cancel
                        </button>
                        <button disabled={loading} className={styles.submitBtn} type="submit">
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Submit...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditChargingPackage;
