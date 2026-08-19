import React, { useState, useEffect, useRef } from "react";
import styles from './addOfflineLead.module.css';
import { useNavigate, useParams } from 'react-router-dom';
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
const PROOF_BASE_URL = `${process.env.REACT_APP_DIR_UPLOADS}rsa-offline-proof`;

const isValidLocationUrl = (value) => {
    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

const isPdfProof = (proof) => {
    if (typeof proof === 'string') {
        return proof.toLowerCase().endsWith('.pdf');
    }
    return proof?.type === 'application/pdf';
};

const getProofPreviewSrc = (proof, existingProofUrl) => {
    if (!proof || isPdfProof(proof)) {
        return null;
    }
    if (typeof proof !== 'string') {
        return URL.createObjectURL(proof);
    }
    return existingProofUrl || `${PROOF_BASE_URL}/${proof}`;
};

const EditOfflineLead = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();
    const { requestId } = useParams();

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

    const [locationLink, setLocationLink] = useState('');
    const [price, setPrice]               = useState('');

    const [vehicleMakeOption, setVehicleMakeOption]   = useState([]);
    const [vehicleModelOption, setVehicleModelOption] = useState([]);
    const [vehicleMake, setVehicleMake]   = useState(null);
    const [vehicleModel, setVehicleModel] = useState(null);
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [jumpStart, setJumpStart]       = useState(null);

    const [modeOfPayment, setModeOfPayment]             = useState(null);
    const [proofOfTransaction, setProofOfTransaction] = useState(null);
    const [existingProofUrl, setExistingProofUrl]     = useState('');

    const [rsaDriverOption, setRsaDriverOption]       = useState([]);
    const [bookingStatus, setBookingStatus]           = useState(null);
    const [bookingCompletedBy, setBookingCompletedBy] = useState(null);
    const [driverMatch, setDriverMatch]               = useState({ rsa_id: null, name: null });

    const fetchVehicleList = (selectedMake = null, selectedModel = null) => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };
        postRequestWithToken('ev-road-assistance-offline-vehicle-list', obj, (response) => {
            if (response.code === 200) {
                const options = response?.data || [];
                setVehicleMakeOption(options);

                if (selectedMake) {
                    const makeOption = options.find((option) => option.value === selectedMake);
                    if (makeOption) {
                        setVehicleMake(makeOption);
                        setVehicleModelOption(makeOption.models || []);
                        setVehicleModel(
                            (makeOption.models || []).find((option) => option.value === selectedModel) || null
                        );
                    }
                }
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
                    value  : driver.rsa_name,
                    label  : driver.rsa_name,
                    rsa_id : driver.rsa_id,
                }));
                setRsaDriverOption(options);
            } else {
                console.log('error in all-rsa-list api', response);
            }
        });
    };

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            request_id : requestId,
        };
        postRequestWithToken('ev-road-assistance-offline-booking-details', obj, (response) => {
            if (response.code === 200) {
                const data = response?.data?.booking || response?.data || {};

                setCustomerName(data.customer_name || data.name || '');
                setCustomerEmail(data.email || data.email_id || '');
                setCustomerAddress(data.address || data.pickup_address || '');
                setLocationLink(data.location_link || '');
                setPrice(data.price != null ? String(data.price) : '');

                const dialCode = String(data.country_code || '+971').replace('+', '');
                const mobileNo = data.mobile_no || data.contact_no || '';
                setPhoneValue(`${dialCode}${mobileNo}`);
                setPhoneCountry({ dialCode, countryCode: 'ae' });

                setBatteryLevel(
                    batteryLevelOption.find((option) => String(option.value) === String(data.battery_level)) || null
                );

                const jumpStartValue = data.jump_start_required;
                setJumpStart(
                    jumpStartOption.find((option) =>
                        String(option.value) === String(jumpStartValue) ||
                        option.label.toLowerCase() === String(jumpStartValue).toLowerCase()
                    ) || null
                );

                setModeOfPayment(
                    modeOfPaymentOption.find((option) => option.value === data.mode_of_payment) || null
                );

                if (data.proof_of_transaction) {
                    setProofOfTransaction(data.proof_of_transaction);
                    setExistingProofUrl(
                        data.proof_of_transaction_url || `${PROOF_BASE_URL}/${data.proof_of_transaction}`
                    );
                } else {
                    setProofOfTransaction(null);
                    setExistingProofUrl('');
                }

                setBookingStatus(
                    bookingStatusOption.find((option) => option.value === (data.booking_status || data.order_status)) || null
                );

                setDriverMatch({
                    rsa_id : data.rsa_id,
                    name   : data.driver_name || data.booking_completed_by || data.rsa_name,
                });

                fetchVehicleList(data.vehicle_make, data.vehicle_model);
            } else {
                toast(response.message, { type : 'error' });
                console.log('error in ev-road-assistance-offline-booking-details', response);
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
        fetchDetails();
    }, []);

    useEffect(() => {
        if (!driverMatch.rsa_id && !driverMatch.name) return;
        if (!rsaDriverOption.length) return;

        const driver = rsaDriverOption.find((option) => option.rsa_id === driverMatch.rsa_id)
            || rsaDriverOption.find((option) => option.value === driverMatch.name);

        if (driver) {
            setBookingCompletedBy(driver);
        }
    }, [rsaDriverOption, driverMatch]);

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
        setExistingProofUrl('');
        setErrors((prev) => ({ ...prev, proofOfTransaction: '' }));
    };

    const handleRemoveProof = () => {
        setProofOfTransaction(null);
        setExistingProofUrl('');
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

        if (locationLink.trim() && !isValidLocationUrl(locationLink)) {
            newErrors.locationLink = 'Please enter a valid URL.';
        }

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
            formData.append("request_id", requestId);

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

            if (proofOfTransaction && typeof proofOfTransaction !== 'string') {
                formData.append("proof_of_transaction", proofOfTransaction);
            }

            postRequestWithTokenAndFile('ev-road-assistance-edit-offline-booking', formData, async (response) => {
                if (response.code === 200 || response.status === 1) {
                    toast(response.message, { type : 'success' });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/ev-road-assistance/offline-leads');
                    }, 1000);
                } else {
                    toast(response.message, { type : 'error' });
                    console.log('Error in ev-road-assistance-edit-offline-booking API:', response);
                    setLoading(false);
                }
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const proofPreviewSrc = getProofPreviewSrc(proofOfTransaction, existingProofUrl);

    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Edit Booking</div>
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
                                onChange={(e) => {
                                    setLocationLink(e.target.value);
                                    if (errors.locationLink) {
                                        setErrors((prev) => ({ ...prev, locationLink: '' }));
                                    }
                                }}
                            />
                            {errors.locationLink && <p className={styles.error}>{errors.locationLink}</p>}
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
                                        setExistingProofUrl('');
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
                                                {isPdfProof(proofOfTransaction) ? (
                                                    existingProofUrl ? (
                                                        <a href={existingProofUrl} target="_blank" rel="noopener noreferrer">
                                                            <img src={PdfIcon} alt="PDF Preview" className={styles.previewImage} style={{ height: '80px' }} />
                                                        </a>
                                                    ) : (
                                                        <img src={PdfIcon} alt="PDF Preview" className={styles.previewImage} style={{ height: '80px' }} />
                                                    )
                                                ) : (
                                                    <img
                                                        src={proofPreviewSrc}
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
                                    Update Booking...
                                </>
                            ) : (
                                "Update Booking"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditOfflineLead;
