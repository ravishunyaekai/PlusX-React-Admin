import { useState, useRef, useEffect } from "react";
import styles from './EditCustomer.module.css';
import Select from "react-select";
import { useNavigate } from 'react-router-dom';
import { postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { applyBackendFieldErrors, getBackendErrorMessage } from '../../utils/mapBackendErrorsToFields';

const AddCustomer = () => {
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [vendorName, setVendorName]     = useState('');
    const [showroomName, setShowroomName] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [phoneValue, setPhoneValue]     = useState('');
    const [phoneCountry, setPhoneCountry] = useState({ dialCode: '971', countryCode: 'ae' });
    const [email, setEmail]               = useState("");
    const [emirate,   setEmirate]         = useState('');
    
    const [eVMake, setEVMake]             = useState(null);
    const [eVModel, setEVModel]           = useState(null);
    const [purchaseDate, setPurchaseDate] = useState('');
    const [packageId, setPackageId]       = useState('');

    const [podChargingSessionNumber, setPodChargingSessionNumber]     = useState('');
    const [podChargingSessionValidity, setPodChargingSessionValidity] = useState('');
     
    const [rsaChargingSessionNumber, setRSAChargingSessionNumber]     = useState('');
    const [rsaChargingSessionValidity, setRSAChargingSessionValidity] = useState('');

    const serviceDropdownRef = useRef(null);
    const formValuesRef      = useRef({});
    const lastLookupKeyRef   = useRef('');
    const lookupTimerRef     = useRef(null);

    const [vehicleMakeOption, setVehicleMakeOption]   = useState([]);
    const [vehicleModelOption, setVehicleModelOption] = useState([]);

    useEffect(() => {
        formValuesRef.current = {
            customerName,
            email,
            emirate,
            phoneValue,
            phoneCountry,
        };
    }, [customerName, email, emirate, phoneValue, phoneCountry]);

    const emiratesOptions = [
        { label : 'Abu Dhabi',      value : 'Abu Dhabi'},
        { label : 'Ajman',          value : 'Ajman'},
        { label : 'Dubai',          value : 'Dubai'},
        { label : 'Fujairah',       value : 'Fujairah'},
        { label : 'Ras Al Khaimah', value : 'Ras Al Khaimah'},
        { label : 'Sharjah',        value : 'Sharjah'},
        { label : 'Umm Al Quwain',  value : 'Umm Al Quwain'},
    ];
    const [vendorOptions, setVendorOptions]     = useState([]);
    const [showroomOptions, setShowroomOptions] = useState([]);
    const [packageOptions, setPackageOptions]   = useState([]);

    const getLocalMobile = () => {
        if (!phoneValue || !phoneCountry?.dialCode) return '';
        return phoneValue.startsWith(phoneCountry.dialCode)
            ? phoneValue.slice(phoneCountry.dialCode.length) : phoneValue;
    };
    const MIN_MOBILE_DIGITS = 8;
    const EMAIL_REGEX       = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const isValidEmailFormat = (value) => EMAIL_REGEX.test(String(value || '').trim());

    const handleCancel = () => {
        navigate('/vendors/customer-list')
    }
    
    const validateForm = () => {
        const mobileNo = getLocalMobile();

        const fields = [
            { name: "vendorName", value: vendorName, errorMessage: "Vendor Name is required." },
            { name: "showroomName", value: showroomName, errorMessage: "Showroom Name is required." },
            { name: "customerName", value: customerName, errorMessage: "Customer Name is required." },

            { name: "mobileNo", value: mobileNo, errorMessage: "Please enter a valid Mobile No.", isMobile: true },
            { name: "email", value: email, errorMessage: "Please enter a valid Email ID.", isEmail: true },

            { name: "emirate", value: emirate, errorMessage: "Emirate is required." },
            { name: "eVMake", value: eVMake, errorMessage: "EV Make is required." },
            { name: "eVModel", value: eVModel, errorMessage: "EV Model is required." },
            { name: "purchaseDate", value: purchaseDate, errorMessage: "Purchase Date is required." },
        ];

        const isEmpty = (value) => value == null || value === undefined ||
            (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0);

        const newErrors = fields.reduce(
            (errors, { name, value, errorMessage, isEmail, isMobile, isArray }) => {
                
                if (isEmpty(value) || (isArray && !Array.isArray(value))) {
                    errors[name] = errorMessage;
                } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                    errors[name] = errorMessage;
                } else if ( isMobile &&
                    (!/^\d+$/.test(String(value).trim()) || String(value).trim().length < 9)
                ) {
                    errors[name] = errorMessage;
                }
                return errors;
            },
            {}
        );
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (validateForm()) {
        
            const obj = {
                userId        : userDetails?.user_id,
                email         : userDetails?.email,
                
                vendor_id    : vendorName?.value || "",
                showroom_name  : showroomName?.value || "",
                customer_name  : customerName,
                mobile_number  : getLocalMobile(),
                country_code   : phoneCountry.dialCode, //{ dialCode: '971', countryCode: 'ae' });
                customer_email : email,
                emirate        : emirate?.value || "",
                ev_make        : eVMake?.label || "",
                ev_model       : eVModel?.label || "",
                purchase_date  : purchaseDate,
                package_id     : packageId?.value || "",

                pod_charging_session_number   : podChargingSessionNumber,
                pod_charging_session_validity : podChargingSessionValidity,    
                rsa_charging_session_number   : rsaChargingSessionNumber,
                rsa_charging_session_validity : rsaChargingSessionValidity,
            }
            
            postRequestWithToken('vendor-customer-add', obj, async (response) => {
                if (response.status === 1) {
                    toast(response.message , {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/vendors/customer-list');
                    }, 1000);
                } else {
                    const applied = applyBackendFieldErrors(response, setErrors, {
                        email: 'email',
                        contact: 'mobileNo',
                    });
                    if (!applied) {
                        toast(getBackendErrorMessage(response), { type: 'error' });
                    }
                    console.log('Error in customer-add API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const fetchVendors = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
        postRequestWithToken('all-vendor-list', obj, (response) => {
            if (response.code === 200) { 
                setVendorOptions(response.data || []);
                setPackageOptions(response.packageList || [])
            }
        });
    };
    const fetchShowrooms = (vendor_name) => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            vendor_name
        };
        postRequestWithToken('all-vendor-list', obj, (response) => {
            if (response.code === 200) { 
                setShowroomOptions(response.data || []);
            }
        });
    };
    const fetchVehicleList = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };
        postRequestWithToken('vehicle-brand-list', obj, (response) => {
            if (response.code === 200) {
                setVehicleMakeOption(response?.data || []);
            } else {
                console.log('error in vehicle-brand-list', response);
            }
        });
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchVendors();
        fetchVehicleList();
    }, []);

    const handleSelectChange = (field, selectedOption) => {
        switch (field) {
            case "vendor":
                setVendorName(selectedOption);
                setShowroomName(null);
                setShowroomOptions([]);
                if (selectedOption) {
                    fetchShowrooms(selectedOption.label);
                }
                break;

            case "showroom":
                setShowroomName(selectedOption);
                break;

            case "emirate":
                setEmirate(selectedOption);
                break;

            case "package":
                setPackageId(selectedOption);
                break;

            default:
                break;
        }
    };

    // Get Data From Mob no
    const applyRiderLookupData = (rider) => {
        if (!rider) return;
        const current = formValuesRef.current;

        if (!String(current.customerName || '').trim() && rider.customer_name) {
            setCustomerName(rider.customer_name);
        }
        if (!current.emirates && rider.emirates) {
            const match = emiratesOptions.find((option) => option.value === rider.emirates);
            if (match) setEmirate(match);
        }
        if (!String(current.email || '').trim() && rider.email_id) {
            setEmail(rider.email_id);
        }
        const localMobile = getLocalMobile(current.phoneValue, current.phoneCountry);
        if (!localMobile && rider.mobile_no) {
            const riderDial = String(rider.country_code || '+971').replace('+', '');
            setPhoneValue(`${riderDial}${rider.mobile_no}`);
            setPhoneCountry((prev) => ({ ...prev, dialCode: riderDial }));
        }
        setErrors((prev) => ({
            ...prev,
            customerName : '',
            phoneValue   : '',
            email        : '',
            emirates     : '',
        }));
    };

    const lookupRider = ({ mobile, email }) => {
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
        if (localMobile || email?.trim()) {
            setErrors((prev) => ({ ...prev, phoneValue: '', email: '' }));
        }
        if (localMobile.length >= MIN_MOBILE_DIGITS) {
            scheduleRiderLookup({ mobile: localMobile, email: email });
        } else {
            lastLookupKeyRef.current = '';
        }
    };
    const handlePhoneBlur = () => {
        const localMobile = getLocalMobile();
        if (localMobile.length >= MIN_MOBILE_DIGITS) {
            lookupRider({ mobile: localMobile, email: email });
        }
    };
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (value.trim() || getLocalMobile()) {
            setErrors((prev) => ({ ...prev, email: '', phoneValue: '' }));
        }
        if (isValidEmailFormat(value)) {
            scheduleRiderLookup({ mobile: getLocalMobile(), email: value.trim() });
        } else {
            lastLookupKeyRef.current = '';
        }
    };

    const handleEmailBlur = () => {
        const emailId = email.trim();
        if (isValidEmailFormat(emailId)) {
            lookupRider({ mobile: getLocalMobile(), email : emailId });
        }
    };

    const handleVehicleMakeChange = (selectedOption) => {
        setEVMake(selectedOption);
        setEVModel(null);
        setVehicleModelOption(selectedOption?.models || []);
    };
    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Add Customer</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.formSectionHeading}> 1. Vendor & Showroom </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Vendor</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={vendorOptions}
                                    value={vendorName}
                                    onChange={(option) => handleSelectChange("vendor", option)}
                                    placeholder="Select Vendor"
                                    isClearable={true}
                                />
                            </div>
                            {errors.vendorName && vendorName == "" && <p className="error">{errors.vendorName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Showroom</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={showroomOptions}
                                    value={showroomName}
                                    onChange={(option) => handleSelectChange("showroom", option)}
                                    placeholder="Select Showroom"
                                    isClearable={true}
                                />
                            </div>
                            {errors.showroomName && showroomName == "" && <p className="error">{errors.showroomName}</p>}
                        </div>
                    </div>

                    <div className={styles.formSectionHeading}> 2. Customer Details </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="customerName">Customer Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="customerName"
                                placeholder="Customer Name"
                                className={styles.inputField}
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                            {errors.customerName && customerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.customerName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="mobileNo">Mobile Number</label>
                            <PhoneInput
                                country="ae"
                                value={phoneValue}
                                onChange={handlePhoneChange}
                                onBlur={handlePhoneBlur}
                                enableSearch={true}
                                countryCodeEditable={false}
                                containerClass={styles.phoneInputContainer}
                                inputClass={styles.phoneInputField}
                                buttonClass={styles.phoneInputButton}
                                dropdownClass={styles.phoneInputDropdown}
                                placeholder="Mobile Number"
                            />
                            {errors.mobileNo && <p className="error" style={{ color: 'red' }}>{errors.mobileNo}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="noofResidents">Email Address</label>
                            <input
                                className={styles.inputField}
                                type="email"
                                autoComplete='off'
                                placeholder="Email ID"
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                            />
                            {errors.email && <p className="error" style={{ color: 'red' }}>{errors.email}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Emirate</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={emiratesOptions}
                                    value={emirate}
                                    onChange={(option) => handleSelectChange("emirate", option)}
                                    placeholder="Select Emirate"
                                    isClearable={true}
                                />
                            </div>
                            {errors.emirate && emirate == "" && <p className="error">{errors.emirate}</p>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="eVMake">EV Make</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={vehicleMakeOption}
                                    value={eVMake}
                                    onChange={handleVehicleMakeChange}
                                    placeholder="Select EV Make"
                                    isClearable={true}
                                />
                            </div>
                            {errors.eVMake && eVMake === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.eVMake}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="eVModel">EV Model</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={vehicleModelOption}
                                    value={eVModel}
                                    onChange={(selectedOption) => setEVModel(selectedOption)}
                                    placeholder="Select EV Model"
                                    isClearable={true}
                                    // isDisabled={!eVMake}
                                />
                            </div>
                            {errors.eVModel && eVModel === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.eVModel}</p>}
                        </div>
                    </div>
                    
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Mobile & Portable Charging Package</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={packageOptions}
                                    value={packageId}
                                    onChange={(option) => handleSelectChange("package", option)}
                                    placeholder="Select Package"
                                    isClearable={true}
                                />
                            </div>
                            {errors.packageId && packageId == "" && <p className="error">{errors.packageId}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="purchaseDate">Package Purchase Date</label>
                            <input
                                type="date"
                                className={styles.inputField}
                                value={purchaseDate}
                                onChange={(e) => {
                                    setPurchaseDate(e.target.value);
                                    setErrors((prev) => ({ ...prev, purchaseDate: '' }));
                                }}
                            />
                            
                            {errors.purchaseDate && purchaseDate === "" &&   <p className="error" style={{ color: 'red' }}>{errors.purchaseDate}</p>}
                        </div>
                        
                    </div>

                    <div className={styles.formSectionHeading}> 3. Service Packages</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="podChargingSessionNumber">
                                Mobile & Portable Charging Session
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id={`podChargingSessionNumber`}
                                placeholder={`No. Of Charging Session`}
                                className={styles.inputField}
                                value={podChargingSessionNumber}
                                min="0"
                                maxLength="3"
                                step="1"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setPodChargingSessionNumber(value);
                                    }
                                }}
                            />
                            { errors.podChargingSessionNumber && podChargingSessionNumber == "" && <p className="error">{ errors.podChargingSessionNumber } </p> }
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="podChargingSessionValidity"> Session Validity</label>
                            <input
                                type="date"
                                className={styles.inputField}
                                value={podChargingSessionValidity}
                                onChange={(e) => {
                                    setPodChargingSessionValidity(e.target.value);
                                    setErrors((prev) => ({ ...prev, podChargingSessionValidity: '' }));
                                }}
                            />
                            {errors.podChargingSessionValidity && podChargingSessionValidity === "" &&   <p className="error" style={{ color: 'red' }}>{errors.podChargingSessionValidity}</p>}
                        </div>
                        
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="rsaChargingSessionNumber">
                                Roadside Service Session
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id={`rsaChargingSessionNumber`}
                                placeholder={`No. Of Charging Session`}
                                className={styles.inputField}
                                value={rsaChargingSessionNumber}
                                min="0"
                                maxLength="3"
                                step="1"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setRSAChargingSessionNumber(value);
                                    }
                                }}
                            />
                            { errors.rsaChargingSessionNumber && rsaChargingSessionNumber == "" && <p className="error">{ errors.rsaChargingSessionNumber } </p> }
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="rsaChargingSessionValidity">Session Validity</label>
                            <input
                                type="date"
                                className={styles.inputField}
                                value={rsaChargingSessionValidity}
                                onChange={(e) => {
                                    setRSAChargingSessionValidity(e.target.value);
                                    setErrors((prev) => ({ ...prev, rsaChargingSessionValidity: '' }));
                                }}
                            />
                            {errors.rsaChargingSessionValidity && rsaChargingSessionValidity === "" &&   <p className="error" style={{ color: 'red' }}>{errors.rsaChargingSessionValidity}</p>}
                        </div>
                        
                    </div>

                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                          {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Submit...
                            </>
                        ) : (
                            "Add Customer"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );

};

export default AddCustomer;
