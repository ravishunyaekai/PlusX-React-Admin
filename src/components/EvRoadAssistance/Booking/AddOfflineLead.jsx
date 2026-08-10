import React, { useState, useEffect, useRef } from "react";
import styles from './addOfflineLead.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";

const batteryLevelOption = [
    { value : '0',  label : '0%' },
    { value : '1',  label : 'More than 5%' },
];
const jumpStartOption = [
    { value : '1',  label : 'Yes' },
    { value : '0',  label : 'No' },
];
const bookingStatusOption = [
    { value : 'CNF', label : 'Confirmed' },
    { value : 'PU',  label : 'Completed' },
];

const AddOfflineLead = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();

    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [customerName, setCustomerName]       = useState('');
    const [customerMobile, setCustomerMobile]   = useState('');
    const [customerEmail, setCustomerEmail]     = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const addressRef                            = useRef(null);

    useEffect(() => {
        const el = addressRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [customerAddress]);
    const [locationLink, setLocationLink]       = useState('');
    const [price, setPrice]                     = useState('');

    const [vehicleMakeOption, setVehicleMakeOption]   = useState([]);
    const [vehicleModelOption, setVehicleModelOption] = useState([]);
    const [vehicleMake, setVehicleMake]   = useState(null);
    const [vehicleModel, setVehicleModel] = useState(null);
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [jumpStart, setJumpStart]       = useState(null);

    const [transactionId, setTransactionId] = useState('');
    const paymentStatus                     = 'Paid';

    const [bookingStatus, setBookingStatus]           = useState(null);
    const [bookingCompletedBy, setBookingCompletedBy] = useState('');

    const fetchVehicleList = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };
        postRequestWithToken('ev-road-assistance-offline-vehicle-list', obj, (response) => {
            if (response.code === 200) {
                setVehicleMakeOption(response?.data || []);
            } else {
                console.log('error in ev-road-assistance-offline-vehicle-list', response);
            }
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchVehicleList();
    }, []);

    const handleVehicleMakeChange = (selectedOption) => {
        setVehicleMake(selectedOption);
        setVehicleModel(null);
        setVehicleModelOption(selectedOption?.models || []);
    };

    const handleCancel = () => {
        navigate('/ev-road-assistance/offline-leads');
    };

    const validateForm = () => {
        const fields = [
            { name : "customerName",       value : customerName,       errorMessage : "Customer Name is required." },
            { name : "customerMobile",     value : customerMobile,     errorMessage : "Phone Number is required." },
            { name : "customerEmail",      value : customerEmail,      errorMessage : "Email ID is required." },
            { name : "customerAddress",    value : customerAddress,    errorMessage : "Address is required." },
            { name : "locationLink",       value : locationLink,       errorMessage : "Location Link is required." },
            { name : "price",              value : price,              errorMessage : "Price is required." },

            { name : "vehicleMake",        value : vehicleMake,        errorMessage : "Vehicle Make is required." },
            { name : "vehicleModel",       value : vehicleModel,       errorMessage : "Vehicle Model is required." },
            { name : "batteryLevel",       value : batteryLevel,       errorMessage : "Battery Level is required." },
            { name : "jumpStart",          value : jumpStart,          errorMessage : "Jump Start Required is required." },

            { name : "transactionId",      value : transactionId,      errorMessage : "Transaction ID is required." },

            { name : "bookingStatus",      value : bookingStatus,      errorMessage : "Booking Status is required." },
            { name : "bookingCompletedBy", value : bookingCompletedBy, errorMessage : "Booking Completed By is required." },
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage }) => {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            const obj = {
                userId               : userDetails?.user_id,
                email                : userDetails?.email,

                customer_name        : customerName,
                mobile_no            : customerMobile,
                email_id             : customerEmail,
                country_code         : '+971',
                location_link        : locationLink,
                address              : customerAddress,
                price                : price,

                vehicle_make         : vehicleMake?.value,
                vehicle_model        : vehicleModel?.value,
                battery_level        : batteryLevel?.value,
                jump_start_required  : jumpStart?.value,

                payment_status       : paymentStatus,
                transaction_id       : transactionId,

                booking_status       : bookingStatus?.value,
                booking_completed_by : bookingCompletedBy,
            };
            postRequestWithToken('ev-road-assistance-add-offline-booking', obj, async (response) => {
                if (response.code === 200 || response.status === 1) {
                    toast(response.message, { type : 'success' });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/ev-road-assistance/offline-leads');
                    }, 1000);
                } else {
                    toast(response.message, { type : 'error' });
                    console.log('Error in add-rsa-offline-lead API:', response);
                    setLoading(false);
                }
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Add New Booking</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>

                    <div className={styles.addHeading} style={{ marginBottom: "0px" }}>Customer Details</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Customer Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Customer Name"
                                className={styles.inputField}
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                            {errors.customerName && !customerName && <p className={styles.error}>{errors.customerName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Phone Number</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Phone Number"
                                className={styles.inputField}
                                value={customerMobile}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setCustomerMobile(value.slice(0, 12));
                                }}
                            />
                            {errors.customerMobile && !customerMobile && <p className={styles.error}>{errors.customerMobile}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Email ID</label>
                            <input
                                type="email"
                                autoComplete="off"
                                placeholder="Email ID"
                                className={styles.inputField}
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                            />
                            {errors.customerEmail && !customerEmail && <p className={styles.error}>{errors.customerEmail}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Location Link</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Location Link"
                                className={styles.inputField}
                                value={locationLink}
                                onChange={(e) => setLocationLink(e.target.value)}
                            />
                            {errors.locationLink && !locationLink && <p className={styles.error}>{errors.locationLink}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Address</label>
                            <textarea
                                rows="1"
                                ref={addressRef}
                                placeholder="Address"
                                className={styles.textAreaField}
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                            />
                            {errors.customerAddress && !customerAddress && <p className={styles.error}>{errors.customerAddress}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Price (AED)</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Price (AED)"
                                className={styles.inputField}
                                value={price}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9.]/g, '');
                                    setPrice(value);
                                }}
                            />
                            {errors.price && !price && <p className={styles.error}>{errors.price}</p>}
                        </div>
                    </div>

                    <div className={styles.addHeading} style={{ marginBottom: "0px", marginTop: "10px" }}>Vehicle Details</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Vehicle Make</label>
                            <Select
                                className={styles.addShopSelect}
                                options={vehicleMakeOption}
                                value={vehicleMake}
                                onChange={handleVehicleMakeChange}
                                placeholder="Select Vehicle Make"
                                isClearable={true}
                            />
                            {errors.vehicleMake && !vehicleMake && <p className={styles.error}>{errors.vehicleMake}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Vehicle Model</label>
                            <Select
                                className={styles.addShopSelect}
                                options={vehicleModelOption}
                                value={vehicleModel}
                                onChange={(selectedOption) => setVehicleModel(selectedOption)}
                                placeholder="Select Vehicle Model"
                                isClearable={true}
                                isDisabled={!vehicleMake}
                            />
                            {errors.vehicleModel && !vehicleModel && <p className={styles.error}>{errors.vehicleModel}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Battery Level</label>
                            <Select
                                className={styles.addShopSelect}
                                options={batteryLevelOption}
                                value={batteryLevel}
                                onChange={(selectedOption) => setBatteryLevel(selectedOption)}
                                placeholder="Select Battery Level"
                                isClearable={true}
                            />
                            {errors.batteryLevel && !batteryLevel && <p className={styles.error}>{errors.batteryLevel}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Jump Start Required</label>
                            <Select
                                className={styles.addShopSelect}
                                options={jumpStartOption}
                                value={jumpStart}
                                onChange={(selectedOption) => setJumpStart(selectedOption)}
                                placeholder="Select Jump Start Required"
                                isClearable={true}
                            />
                            {errors.jumpStart && !jumpStart && <p className={styles.error}>{errors.jumpStart}</p>}
                        </div>
                    </div>

                    <div className={styles.addHeading} style={{ marginBottom: "0px", marginTop: "10px" }}>Payment Information</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Payment Status</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                value={paymentStatus}
                                disabled
                            />
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Transaction ID</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Transaction ID"
                                className={styles.inputField}
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                            />
                            {errors.transactionId && !transactionId && <p className={styles.error}>{errors.transactionId}</p>}
                        </div>
                    </div>

                    <div className={styles.addHeading} style={{ marginBottom: "0px", marginTop: "10px" }}>Booking Details</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Booking Status</label>
                            <Select
                                className={styles.addShopSelect}
                                options={bookingStatusOption}
                                value={bookingStatus}
                                onChange={(selectedOption) => setBookingStatus(selectedOption)}
                                placeholder="Select Booking Status"
                                isClearable={true}
                            />
                            {errors.bookingStatus && !bookingStatus && <p className={styles.error}>{errors.bookingStatus}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Booking Completed By</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Booking Completed By"
                                className={styles.inputField}
                                value={bookingCompletedBy}
                                onChange={(e) => setBookingCompletedBy(e.target.value)}
                            />
                            {errors.bookingCompletedBy && !bookingCompletedBy && <p className={styles.error}>{errors.bookingCompletedBy}</p>}
                        </div>
                    </div>

                    <div className={styles.editButton}>
                        <button type="button" className={styles.editCancelBtn} onClick={handleCancel}>Cancel</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Save Booking...
                                </>
                            ) : (
                                "Save Booking"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddOfflineLead;
