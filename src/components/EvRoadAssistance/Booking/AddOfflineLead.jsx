import React, { useState, useEffect, useRef } from "react";
import styles from './addOfflineLead.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithToken, postRequestWithTokenAndFile } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { AiOutlineClose } from 'react-icons/ai';
import UploadIcon from '../../../assets/images/uploadicon.svg';
import PdfIcon from '../../../assets/images/PdfIcon.svg';

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
const modeOfPaymentOption = [
    { value : 'Cash',   label : 'Cash' },
    { value : 'Online', label : 'Online' },
];
const ALLOWED_PROOF_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const AddOfflineLead = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();

    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [customerName, setCustomerName]       = useState('');
    const [phoneValue, setPhoneValue]           = useState('');
    const [phoneCountry, setPhoneCountry]       = useState({ dialCode: '971', countryCode: 'ae' });
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

    const [modeOfPayment, setModeOfPayment]             = useState(null);
    const [proofOfTransaction, setProofOfTransaction] = useState(null);

    const [rsaDriverOption, setRsaDriverOption]       = useState([]);
    const [bookingStatus, setBookingStatus]           = useState(null);
    const [bookingCompletedBy, setBookingCompletedBy] = useState(null);

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

    const fetchRsaDriverList = () => {
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            service_type : 'Roadside Assistance',
        };
        postRequestWithToken('all-rsa-list', obj, (response) => {
            if (response.code === 200) {
                const options = (response?.data || []).map((driver) => ({
                    value : driver.rsa_name,
                    label : driver.rsa_name,
                    rsa_id: driver.rsa_id,
                }));
                setRsaDriverOption(options);
            } else {
                console.log('error in all-rsa-list api', response);
            }
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchVehicleList();
        fetchRsaDriverList();
    }, []);

    const handleVehicleMakeChange = (selectedOption) => {
        setVehicleMake(selectedOption);
        setVehicleModel(null);
        setVehicleModelOption(selectedOption?.models || []);
    };

    const handleCancel = () => {
        navigate('/ev-road-assistance/offline-leads');
    };

    const getLocalMobile = () => {
        if (!phoneValue || !phoneCountry?.dialCode) return '';
        return phoneValue.startsWith(phoneCountry.dialCode)
            ? phoneValue.slice(phoneCountry.dialCode.length)
            : phoneValue;
    };

    const handlePhoneChange = (phone, country) => {
        setPhoneValue(phone);
        setPhoneCountry(country);
        const localMobile = phone.startsWith(country.dialCode)
            ? phone.slice(country.dialCode.length)
            : phone;
        if (localMobile) {
            setErrors((prev) => ({ ...prev, customerMobile: '' }));
        }
    };

    const handleProofChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        if (!ALLOWED_PROOF_TYPES.includes(selectedFile.type)) {
            toast.error('Please upload a PDF, JPG, or PNG file.');
            event.target.value = '';
            return;
        }
        setProofOfTransaction(selectedFile);
        setErrors((prev) => ({ ...prev, proofOfTransaction: '' }));
    };

    const handleRemoveProof = () => {
        setProofOfTransaction(null);
    };

    const validateForm = () => {
        const localMobile = getLocalMobile();
        const fields = [
            { name : "customerName",       value : customerName,       errorMessage : "Customer Name is required." },
            { name : "customerMobile",     value : localMobile,        errorMessage : "Phone Number is required." },
            { name : "customerEmail",      value : customerEmail,      errorMessage : "Email ID is required." },
            { name : "customerAddress",    value : customerAddress,    errorMessage : "Address is required." },
            { name : "locationLink",       value : locationLink,       errorMessage : "Location Link is required." },
            { name : "price",              value : price,              errorMessage : "Price is required." },

            { name : "vehicleMake",        value : vehicleMake,        errorMessage : "Vehicle Make is required." },
            { name : "vehicleModel",       value : vehicleModel,       errorMessage : "Vehicle Model is required." },
            { name : "batteryLevel",       value : batteryLevel,       errorMessage : "Battery Level is required." },
            { name : "jumpStart",          value : jumpStart,          errorMessage : "Jump Start Required is required." },

            { name : "modeOfPayment",      value : modeOfPayment,      errorMessage : "Mode of Payment is required." },

            { name : "bookingStatus",      value : bookingStatus,      errorMessage : "Booking Status is required." },
            { name : "bookingCompletedBy", value : bookingCompletedBy, errorMessage : "Booking Completed By is required." },
        ];

        if (modeOfPayment?.value === 'Online') {
            fields.push({
                name         : "proofOfTransaction",
                value        : proofOfTransaction,
                errorMessage : "Payment Proof is required for Online payment.",
            });
        }

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
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);

            formData.append("customer_name", customerName);
            formData.append("mobile_no", getLocalMobile());
            formData.append("email_id", customerEmail);
            formData.append("country_code", phoneCountry?.dialCode ? `+${phoneCountry.dialCode}` : '+971');
            formData.append("location_link", locationLink);
            formData.append("address", customerAddress);
            formData.append("price", price);

            formData.append("vehicle_make", vehicleMake?.value);
            formData.append("vehicle_model", vehicleModel?.value);
            formData.append("battery_level", batteryLevel?.value);
            formData.append("jump_start_required", jumpStart?.value);

            formData.append("mode_of_payment", modeOfPayment?.value);
            formData.append("payment_status", 'Paid');

            formData.append("booking_status", bookingStatus?.value);
            formData.append("booking_completed_by", bookingCompletedBy?.value);
            formData.append("driver_name", bookingCompletedBy?.value);
            formData.append("rsa_id", bookingCompletedBy?.rsa_id);

            if (proofOfTransaction) {
                formData.append("proof_of_transaction", proofOfTransaction);
            }

            postRequestWithTokenAndFile('ev-road-assistance-add-offline-booking', formData, async (response) => {
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
                            <PhoneInput
                                country="ae"
                                value={phoneValue}
                                onChange={handlePhoneChange}
                                enableSearch={true}
                                countryCodeEditable={false}
                                containerClass={styles.phoneInputContainer}
                                inputClass={styles.phoneInputField}
                                buttonClass={styles.phoneInputButton}
                                dropdownClass={styles.phoneInputDropdown}
                                placeholder="Phone Number"
                            />
                            {errors.customerMobile && !getLocalMobile() && (
                                <p className={styles.error}>{errors.customerMobile}</p>
                            )}
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
                            <label className={styles.addShopLabel}>Price including VAT</label>
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
                    <div className={styles.row} style={{ alignItems: 'flex-start' }}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Mode of Payment</label>
                            <Select
                                className={styles.addShopSelect}
                                options={modeOfPaymentOption}
                                value={modeOfPayment}
                                onChange={(selectedOption) => {
                                    setModeOfPayment(selectedOption);
                                    if (selectedOption?.value !== 'Online') {
                                        setProofOfTransaction(null);
                                        setErrors((prev) => ({ ...prev, proofOfTransaction: '' }));
                                    }
                                }}
                                placeholder="Select Mode of Payment"
                                isClearable={true}
                            />
                            {errors.modeOfPayment && !modeOfPayment && <p className={styles.error}>{errors.modeOfPayment}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            {modeOfPayment?.value === 'Online' ? (
                                <div className={styles.fileUploadColumn}>
                                    <label className={styles.fileLabel}>Payment Proof</label>
                                    <div className={styles.fileDropZone}>
                                        <input
                                            type="file"
                                            id="proofOfTransaction"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleProofChange}
                                            style={{ display: 'none' }}
                                        />
                                        {!proofOfTransaction ? (
                                            <label htmlFor="proofOfTransaction" className={styles.fileUploadLabel}>
                                                <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                                <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                            </label>
                                        ) : (
                                            <div className={styles.imageContainer}>
                                                {proofOfTransaction.type === 'application/pdf' ? (
                                                    <img src={PdfIcon} alt="PDF Preview" className={styles.previewImage} style={{ height: '80px' }} />
                                                ) : (
                                                    <img
                                                        src={URL.createObjectURL(proofOfTransaction)}
                                                        alt="Preview"
                                                        className={styles.previewImage}
                                                    />
                                                )}
                                                <button type="button" className={styles.removeButton} onClick={handleRemoveProof}>
                                                    <AiOutlineClose size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {errors.proofOfTransaction && !proofOfTransaction && (
                                        <p className={styles.error}>{errors.proofOfTransaction}</p>
                                    )}
                                </div>
                            ) : null}
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
                            <Select
                                className={styles.addShopSelect}
                                options={rsaDriverOption}
                                value={bookingCompletedBy}
                                onChange={(selectedOption) => setBookingCompletedBy(selectedOption)}
                                placeholder="Select RSA Driver"
                                isClearable={true}
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
