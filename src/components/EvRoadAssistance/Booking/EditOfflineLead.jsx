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
import { onUploadImageError } from '../../../utils/uploadUrl';
import { applyBackendFieldErrors, getBackendErrorMessage, OFFLINE_RSA_ERROR_FIELDS } from '../../../utils/mapBackendErrorsToFields';

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
    { value : 'C',   label : 'Cancelled' },
];
const modeOfPaymentOption = [
    { value : 'Cash',   label : 'Cash' },
    { value : 'Online', label : 'Online' },
];
const emiratesOption = [
    { value : 'Abu Dhabi',      label : 'Abu Dhabi' },
    { value : 'Ajman',          label : 'Ajman' },
    { value : 'Dubai',          label : 'Dubai' },
    { value : 'Fujairah',       label : 'Fujairah' },
    { value : 'Ras Al Khaimah', label : 'Ras Al Khaimah' },
    { value : 'Sharjah',        label : 'Sharjah' },
    { value : 'Umm Al Quwain',  label : 'Umm Al Quwain' },
];
const ALLOWED_PROOF_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const PROOF_BASE_URL = `${process.env.REACT_APP_DIR_UPLOADS}rsa-offline-proof`;
const TERMS_BASE_URL = `${process.env.REACT_APP_DIR_UPLOADS}rsa-offline-terms`;
const MIN_MOBILE_DIGITS = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmailFormat = (value) => EMAIL_REGEX.test(String(value || '').trim());

const toDateInputValue = (value) => {
    if (!value) return '';
    const dateStr = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr.slice(0, 10);
    }
    if (/^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
        const [day, month, year] = dateStr.slice(0, 10).split('-');
        return `${year}-${month}-${day}`;
    }
    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }
    return '';
};

const isValidLocationUrl = (value) => {
    try {
        const url = new URL(value.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

const isPdfFile = (file) => {
    if (typeof file === 'string') {
        return file.toLowerCase().endsWith('.pdf');
    }
    return file?.type === 'application/pdf';
};

const getFilePreviewSrc = (file, existingUrl, baseUrl) => {
    if (!file || isPdfFile(file)) {
        return null;
    }
    if (typeof file !== 'string') {
        return URL.createObjectURL(file);
    }
    return existingUrl || `${baseUrl}/${file}`;
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
    const [emirates, setEmirates]               = useState(null);
    const [bookingDate, setBookingDate]         = useState('');
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
    const [serviceTermsCondition, setServiceTermsCondition] = useState(null);
    const [existingTermsUrl, setExistingTermsUrl]           = useState('');

    const [rsaDriverOption, setRsaDriverOption]               = useState([]);
    const [bookingStatus, setBookingStatus]                   = useState(null);
    const [bookingCompletedDate, setBookingCompletedDate]     = useState('');
    const [bookingCompletedBy, setBookingCompletedBy]         = useState(null);
    const [cancellationRemarks, setCancellationRemarks]       = useState('');
    const [driverMatch, setDriverMatch]                       = useState({ rsa_id: null, name: null });
    const [isBookingNotCompleted, setIsBookingNotCompleted]   = useState(false);
    const [lockedContact, setLockedContact]                   = useState({ mobile: false, email: false });

    const formValuesRef              = useRef({});
    const lastLookupKeyRef           = useRef('');
    const lookupTimerRef             = useRef(null);
    const isBookingNotCompletedRef   = useRef(false);

    useEffect(() => {
        formValuesRef.current = {
            customerName,
            customerEmail,
            emirates,
            phoneValue,
            phoneCountry,
        };
    }, [customerName, customerEmail, emirates, phoneValue, phoneCountry]);

    useEffect(() => {
        isBookingNotCompletedRef.current = isBookingNotCompleted;
    }, [isBookingNotCompleted]);

    useEffect(() => () => {
        if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    }, []);

    const fetchVehicleList = (selectedMake = null, selectedModel = null) => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };
        postRequestWithToken('vehicle-brand-list', obj, (response) => {
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
                console.log('error in vehicle-brand-list', response);
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

                setIsBookingNotCompleted(
                    String(data.is_booking_completed || 'Yes').trim().toLowerCase() === 'no'
                );
                const savedEmail = String(data.email || data.email_id || '').trim();
                const savedMobile = String(data.mobile_no || data.contact_no || '').trim();
                setCustomerName(data.customer_name || data.name || '');
                setCustomerEmail(savedEmail);
                setLockedContact({ mobile: Boolean(savedMobile), email: Boolean(savedEmail) });
                setEmirates(
                    emiratesOption.find((option) => option.value === (data.emirates || data.emirate)) || null
                );
                setBookingDate(toDateInputValue(data.booking_date));
                setCustomerAddress(data.address || data.pickup_address || '');
                setLocationLink(data.location_link || '');
                setPrice(data.price != null ? String(data.price) : '');

                const dialCode = String(data.country_code || '+971').replace('+', '');
                const mobileNo = savedMobile;
                setPhoneValue(mobileNo ? `${dialCode}${mobileNo}` : '');
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

                if (data.service_terms_condition) {
                    setServiceTermsCondition(data.service_terms_condition);
                    setExistingTermsUrl(
                        data.service_terms_condition_url || `${TERMS_BASE_URL}/${data.service_terms_condition}`
                    );
                } else {
                    setServiceTermsCondition(null);
                    setExistingTermsUrl('');
                }

                setBookingStatus(
                    bookingStatusOption.find((option) => option.value === (data.booking_status || data.order_status)) || null
                );
                setBookingCompletedDate(toDateInputValue(data.booking_completed_date));
                setCancellationRemarks(data.cancellation_remarks || '');

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

    const getLocalMobile = (phone = phoneValue, country = phoneCountry) => {
        if (!phone || !country?.dialCode) return '';
        return phone.startsWith(country.dialCode)
            ? phone.slice(country.dialCode.length)
            : phone;
    };

    const applyRiderLookupData = (rider) => {
        if (!rider) return;
        const current = formValuesRef.current;

        if (!String(current.customerName || '').trim() && rider.customer_name) {
            setCustomerName(rider.customer_name);
        }
        if (!current.emirates && rider.emirates) {
            const match = emiratesOption.find((option) => option.value === rider.emirates);
            if (match) setEmirates(match);
        }
        if (!String(current.customerEmail || '').trim() && rider.email_id) {
            setCustomerEmail(rider.email_id);
        }

        const localMobile = getLocalMobile(current.phoneValue, current.phoneCountry);
        if (!localMobile && rider.mobile_no) {
            const riderDial = String(rider.country_code || '+971').replace('+', '');
            setPhoneValue(`${riderDial}${rider.mobile_no}`);
            setPhoneCountry((prev) => ({ ...prev, dialCode: riderDial }));
        }

        setErrors((prev) => ({
            ...prev,
            customerName   : '',
            customerMobile : '',
            customerEmail  : '',
            emirates       : '',
        }));
    };

    const lookupRider = ({ mobile, email }) => {
        if (!isBookingNotCompletedRef.current) return;

        const mobileNo = String(mobile || '').trim();
        const emailId  = String(email || '').trim();
        if (!mobileNo && !emailId) return;
        if (emailId && !isValidEmailFormat(emailId) && !mobileNo) return;

        const key = `${mobileNo}|${emailId.toLowerCase()}`;
        if (key === lastLookupKeyRef.current) return;
        lastLookupKeyRef.current = key;

        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            country_code : phoneCountry?.dialCode ? `+${phoneCountry.dialCode}` : '+971',
        };
        if (mobileNo) obj.mobile_no = mobileNo;
        if (emailId && isValidEmailFormat(emailId)) obj.email_id = emailId;

        postRequestWithToken('ev-road-assistance-offline-rider-lookup', obj, (response) => {
            if (response.code === 200 && Number(response.found) === 1 && response.data) {
                applyRiderLookupData(response.data);
            }
        });
    };

    const scheduleRiderLookup = (payload) => {
        if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
        lookupTimerRef.current = setTimeout(() => lookupRider(payload), 400);
    };

    const handlePhoneChange = (phone, country) => {
        setPhoneValue(phone);
        setPhoneCountry(country);
        const localMobile = phone.startsWith(country.dialCode)
            ? phone.slice(country.dialCode.length)
            : phone;
        if (localMobile || (isBookingNotCompleted && customerEmail?.trim())) {
            setErrors((prev) => ({ ...prev, customerMobile: '', customerEmail: '' }));
        }
        if (isBookingNotCompleted && localMobile.length >= MIN_MOBILE_DIGITS) {
            scheduleRiderLookup({ mobile: localMobile, email: customerEmail });
        } else if (isBookingNotCompleted) {
            lastLookupKeyRef.current = '';
        }
    };

    const handlePhoneBlur = () => {
        const localMobile = getLocalMobile();
        if (localMobile.length >= MIN_MOBILE_DIGITS) {
            lookupRider({ mobile: localMobile, email: customerEmail });
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setCustomerEmail(value);
        if (value.trim() || getLocalMobile()) {
            setErrors((prev) => ({ ...prev, customerEmail: '', customerMobile: '' }));
        }
        if (isBookingNotCompleted && isValidEmailFormat(value)) {
            scheduleRiderLookup({ mobile: getLocalMobile(), email: value.trim() });
        } else if (isBookingNotCompleted) {
            lastLookupKeyRef.current = '';
        }
    };

    const handleEmailBlur = () => {
        const emailId = customerEmail.trim();
        if (isValidEmailFormat(emailId)) {
            lookupRider({ mobile: getLocalMobile(), email: emailId });
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

    const handleServiceTermsChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        if (!ALLOWED_PROOF_TYPES.includes(selectedFile.type)) {
            toast.error('Please upload a PDF, JPG, or PNG file.');
            event.target.value = '';
            return;
        }
        setServiceTermsCondition(selectedFile);
        setExistingTermsUrl('');
        setErrors((prev) => ({ ...prev, serviceTermsCondition: '' }));
    };

    const handleRemoveServiceTerms = () => {
        setServiceTermsCondition(null);
        setExistingTermsUrl('');
    };

    const shouldSaveAsCompleted = () => !isBookingNotCompleted || bookingStatus?.value === 'PU';

    const validateForm = () => {
        const localMobile = getLocalMobile();

        if (isBookingNotCompleted && bookingStatus?.value !== 'PU' && bookingStatus?.value !== 'C') {
            const newErrors = {};
            const hasMobile = Boolean(localMobile);
            const hasEmail  = Boolean(customerEmail?.trim());
            if (!hasMobile && !hasEmail) {
                newErrors.customerMobile = "Please enter Phone Number or Email ID.";
                newErrors.customerEmail  = "Please enter Phone Number or Email ID.";
            }
            if (locationLink.trim() && !isValidLocationUrl(locationLink)) {
                newErrors.locationLink = 'Please enter a valid URL.';
            }
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }

        const fields = [
            { name : "customerName",       value : customerName,       errorMessage : "Customer Name is required." },
            { name : "customerMobile",     value : localMobile,        errorMessage : "Phone Number is required." },
            { name : "customerEmail",         value : customerEmail,         errorMessage : "Email ID is required." },
            { name : "emirates",              value : emirates,              errorMessage : "Emirates is required." },
            { name : "bookingDate",           value : bookingDate,           errorMessage : "Booking Date is required." },
            { name : "customerAddress",       value : customerAddress,       errorMessage : "Address is required." },
            { name : "locationLink",          value : locationLink,          errorMessage : "Location Link is required." },
            { name : "price",                 value : price,                 errorMessage : "Price is required." },

            { name : "vehicleMake",           value : vehicleMake,           errorMessage : "Vehicle Make is required." },
            { name : "vehicleModel",          value : vehicleModel,          errorMessage : "Vehicle Model is required." },
            { name : "batteryLevel",          value : batteryLevel,          errorMessage : "Battery Level is required." },
            { name : "jumpStart",             value : jumpStart,             errorMessage : "Jump Start Required is required." },

            { name : "bookingStatus",         value : bookingStatus,         errorMessage : "Booking Status is required." },
        ];

        if (bookingStatus?.value === 'C') {
            fields.push({
                name         : "cancellationRemarks",
                value        : cancellationRemarks,
                errorMessage : "Cancellation Remarks is required.",
            });
        }

        if (bookingStatus?.value !== 'C') {
            fields.push(
                { name : "modeOfPayment",      value : modeOfPayment,      errorMessage : "Mode of Payment is required." },
                { name : "bookingCompletedBy", value : bookingCompletedBy, errorMessage : "Booking Completed By is required." },
            );
        }

        if (bookingStatus?.value === 'PU') {
            fields.push({
                name         : "bookingCompletedDate",
                value        : bookingCompletedDate,
                errorMessage : "Booking Completed Date is required.",
            });
        }

        if (bookingStatus?.value !== 'C' && modeOfPayment?.value === 'Online') {
            fields.push({
                name         : "proofOfTransaction",
                value        : proofOfTransaction,
                errorMessage : "Payment Proof is required for Online payment.",
            });
        }

        if (!isBookingNotCompleted && bookingStatus?.value !== 'C') {
            fields.push({
                name         : "serviceTermsCondition",
                value        : serviceTermsCondition,
                errorMessage : "Service Terms & Condition is required.",
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
            const appendIfSet = (key, value) => {
                if (value !== undefined && value !== null && value !== '') {
                    formData.append(key, value);
                }
            };
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("request_id", requestId);
            formData.append("is_booking_completed", shouldSaveAsCompleted() ? 'Yes' : 'No');

            if (!shouldSaveAsCompleted()) {
                appendIfSet("customer_name", customerName);
                appendIfSet("mobile_no", getLocalMobile());
                appendIfSet("email_id", customerEmail);
                appendIfSet("emirates", emirates?.value);
                appendIfSet("booking_date", bookingDate);
                formData.append("country_code", phoneCountry?.dialCode ? `+${phoneCountry.dialCode}` : '+971');
                appendIfSet("location_link", locationLink);
                appendIfSet("address", customerAddress);
                appendIfSet("price", price);

                appendIfSet("vehicle_make", vehicleMake?.value);
                appendIfSet("vehicle_model", vehicleModel?.value);
                appendIfSet("battery_level", batteryLevel?.value);
                appendIfSet("jump_start_required", jumpStart?.value);
                appendIfSet("booking_status", bookingStatus?.value);

                if (bookingStatus?.value === 'C') {
                    appendIfSet("cancellation_remarks", cancellationRemarks);
                } else {
                    appendIfSet("mode_of_payment", modeOfPayment?.value);
                    if (modeOfPayment) {
                        formData.append("payment_status", 'Paid');
                    }
                    appendIfSet("booking_completed_by", bookingCompletedBy?.value);
                    appendIfSet("driver_name", bookingCompletedBy?.value);
                    appendIfSet("rsa_id", bookingCompletedBy?.rsa_id);

                    if (bookingStatus?.value === 'PU' && bookingCompletedDate) {
                        formData.append("booking_completed_date", bookingCompletedDate);
                    }

                    if (proofOfTransaction && typeof proofOfTransaction !== 'string') {
                        formData.append("proof_of_transaction", proofOfTransaction);
                    }
                }

            } else {
                formData.append("customer_name", customerName);
                formData.append("mobile_no", getLocalMobile());
                formData.append("email_id", customerEmail);
                formData.append("emirates", emirates?.value);
                formData.append("booking_date", bookingDate);
                formData.append("country_code", phoneCountry?.dialCode ? `+${phoneCountry.dialCode}` : '+971');
                formData.append("location_link", locationLink);
                formData.append("address", customerAddress);
                formData.append("price", price);

                formData.append("vehicle_make", vehicleMake?.value);
                formData.append("vehicle_model", vehicleModel?.value);
                formData.append("battery_level", batteryLevel?.value);
                formData.append("jump_start_required", jumpStart?.value);

                formData.append("booking_status", bookingStatus?.value);

                if (bookingStatus?.value === 'C') {
                    formData.append("cancellation_remarks", cancellationRemarks);
                } else {
                    formData.append("mode_of_payment", modeOfPayment?.value);
                    formData.append("payment_status", 'Paid');
                    formData.append("booking_completed_by", bookingCompletedBy?.value);
                    formData.append("driver_name", bookingCompletedBy?.value);
                    formData.append("rsa_id", bookingCompletedBy?.rsa_id);

                    if (bookingStatus?.value === 'PU' && bookingCompletedDate) {
                        formData.append("booking_completed_date", bookingCompletedDate);
                    }

                    if (proofOfTransaction && typeof proofOfTransaction !== 'string') {
                        formData.append("proof_of_transaction", proofOfTransaction);
                    }

                    if (!isBookingNotCompleted && serviceTermsCondition && typeof serviceTermsCondition !== 'string') {
                        formData.append("service_terms_condition", serviceTermsCondition);
                    }
                }
            }

            postRequestWithTokenAndFile('ev-road-assistance-edit-offline-booking', formData, async (response) => {
                if (response.code === 200 || response.status === 1) {
                    toast(response.message, { type : 'success' });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/ev-road-assistance/offline-leads');
                    }, 1000);
                } else {
                    const applied = applyBackendFieldErrors(
                        response,
                        setErrors,
                        { email : 'customerEmail', contact : 'customerMobile' },
                        undefined,
                        OFFLINE_RSA_ERROR_FIELDS
                    );
                    if (!applied) {
                        toast(getBackendErrorMessage(response), { type : 'error' });
                    }
                    console.log('Error in ev-road-assistance-edit-offline-booking API:', response);
                    setLoading(false);
                }
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const proofPreviewSrc = getFilePreviewSrc(proofOfTransaction, existingProofUrl, PROOF_BASE_URL);
    const termsPreviewSrc = getFilePreviewSrc(serviceTermsCondition, existingTermsUrl, TERMS_BASE_URL);

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
                                onBlur={handlePhoneBlur}
                                enableSearch={true}
                                countryCodeEditable={false}
                                disabled={lockedContact.mobile}
                                disableDropdown={lockedContact.mobile}
                                containerClass={`${styles.phoneInputContainer} ${lockedContact.mobile ? styles.phoneInputLocked : ''}`}
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
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                                disabled={lockedContact.email}
                                readOnly={lockedContact.email}
                            />
                            {errors.customerEmail && <p className={styles.error}>{errors.customerEmail}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Emirates</label>
                            <Select
                                className={styles.addShopSelect}
                                options={emiratesOption}
                                value={emirates}
                                onChange={(selectedOption) => setEmirates(selectedOption)}
                                placeholder="Select Emirates"
                                isClearable={true}
                            />
                            {errors.emirates && !emirates && <p className={styles.error}>{errors.emirates}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Booking Date</label>
                            <input
                                type="date"
                                className={styles.inputField}
                                value={bookingDate}
                                onChange={(e) => {
                                    setBookingDate(e.target.value);
                                    setErrors((prev) => ({ ...prev, bookingDate: '' }));
                                }}
                            />
                            {errors.bookingDate && <p className={styles.error}>{errors.bookingDate}</p>}
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

                    {bookingStatus?.value !== 'C' && (
                    <>
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
                                                {isPdfFile(proofOfTransaction) ? (
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
                                                        onError={onUploadImageError}
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
                    {!isBookingNotCompleted && (
                    <div className={styles.row} style={{ alignItems: 'flex-start' }}>
                        <div className={styles.addShopInputContainer}>
                            <div className={styles.fileUploadColumn}>
                                <label className={styles.fileLabel}>Service Terms & Condition</label>
                                <div className={styles.fileDropZone}>
                                    <input
                                        type="file"
                                        id="serviceTermsCondition"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleServiceTermsChange}
                                        style={{ display: 'none' }}
                                    />
                                    {!serviceTermsCondition ? (
                                        <label htmlFor="serviceTermsCondition" className={styles.fileUploadLabel}>
                                            <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                            <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                        </label>
                                    ) : (
                                        <div className={styles.imageContainer}>
                                            {isPdfFile(serviceTermsCondition) ? (
                                                existingTermsUrl ? (
                                                    <a href={existingTermsUrl} target="_blank" rel="noopener noreferrer">
                                                        <img src={PdfIcon} alt="PDF Preview" className={styles.previewImage} style={{ height: '80px' }} />
                                                    </a>
                                                ) : (
                                                    <img src={PdfIcon} alt="PDF Preview" className={styles.previewImage} style={{ height: '80px' }} />
                                                )
                                            ) : (
                                                <img
                                                    src={termsPreviewSrc}
                                                    alt="Preview"
                                                    className={styles.previewImage}
                                                    onError={onUploadImageError}
                                                />
                                            )}
                                            <button type="button" className={styles.removeButton} onClick={handleRemoveServiceTerms}>
                                                <AiOutlineClose size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {errors.serviceTermsCondition && !serviceTermsCondition && (
                                    <p className={styles.error}>{errors.serviceTermsCondition}</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.addShopInputContainer}></div>
                    </div>
                    )}
                    </>
                    )}

                    <div className={styles.addHeading} style={{ marginBottom: "0px", marginTop: "10px" }}>Booking Details</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Booking Status</label>
                            <Select
                                className={styles.addShopSelect}
                                options={bookingStatusOption}
                                value={bookingStatus}
                                onChange={(selectedOption) => {
                                    setBookingStatus(selectedOption);
                                    setErrors((prev) => ({ ...prev, bookingStatus: '' }));
                                    if (selectedOption?.value !== 'PU') {
                                        setBookingCompletedDate('');
                                        setErrors((prev) => ({ ...prev, bookingCompletedDate: '' }));
                                    }
                                    if (selectedOption?.value === 'C') {
                                        setBookingCompletedBy(null);
                                        setModeOfPayment(null);
                                        setProofOfTransaction(null);
                                        setExistingProofUrl('');
                                        setServiceTermsCondition(null);
                                        setExistingTermsUrl('');
                                        setErrors((prev) => ({
                                            ...prev,
                                            bookingCompletedBy: '',
                                            modeOfPayment: '',
                                            proofOfTransaction: '',
                                            serviceTermsCondition: '',
                                            bookingCompletedDate: '',
                                        }));
                                    } else {
                                        setCancellationRemarks('');
                                        setErrors((prev) => ({ ...prev, cancellationRemarks: '' }));
                                    }
                                }}
                                placeholder="Select Booking Status"
                                isClearable={true}
                            />
                            {errors.bookingStatus && <p className={styles.error}>{errors.bookingStatus}</p>}
                        </div>
                        {bookingStatus?.value === 'C' ? (
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Cancellation Remarks</label>
                            <textarea
                                rows="2"
                                placeholder="Enter Cancellation Remarks"
                                className={styles.textAreaField}
                                value={cancellationRemarks}
                                onChange={(e) => {
                                    setCancellationRemarks(e.target.value);
                                    if (e.target.value.trim()) {
                                        setErrors((prev) => ({ ...prev, cancellationRemarks: '' }));
                                    }
                                }}
                            />
                            {errors.cancellationRemarks && !cancellationRemarks.trim() && (
                                <p className={styles.error}>{errors.cancellationRemarks}</p>
                            )}
                        </div>
                        ) : (
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Booking Completed Date</label>
                            <input
                                type="date"
                                className={styles.inputField}
                                value={bookingCompletedDate}
                                onChange={(e) => {
                                    setBookingCompletedDate(e.target.value);
                                    setErrors((prev) => ({ ...prev, bookingCompletedDate: '' }));
                                }}
                                disabled={bookingStatus?.value !== 'PU'}
                            />
                            {errors.bookingCompletedDate && (
                                <p className={styles.error}>{errors.bookingCompletedDate}</p>
                            )}
                        </div>
                        )}
                    </div>
                    {bookingStatus?.value !== 'C' && (
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Booking Completed By</label>
                            <Select
                                className={styles.addShopSelect}
                                options={rsaDriverOption}
                                value={bookingCompletedBy}
                                onChange={(selectedOption) => {
                                    setBookingCompletedBy(selectedOption);
                                    setErrors((prev) => ({ ...prev, bookingCompletedBy: '' }));
                                }}
                                placeholder="Select RSA Driver"
                                isClearable={true}
                            />
                            {errors.bookingCompletedBy && <p className={styles.error}>{errors.bookingCompletedBy}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}></div>
                    </div>
                    )}

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
