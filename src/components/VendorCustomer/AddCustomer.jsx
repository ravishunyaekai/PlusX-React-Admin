import { useState, useRef, useEffect } from "react";
import styles from './EditCustomer.module.css';
import Select from "react-select";
import { useNavigate } from 'react-router-dom';
import { postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import InputMask from 'react-input-mask';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { applyBackendFieldErrors, getBackendErrorMessage } from '../../utils/mapBackendErrorsToFields';

const AddCustomer = () => {
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [vendorName, setVendorName]     = useState('')
    const [showroomName, setShowroomName] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [phoneValue, setPhoneValue]     = useState('');
    const [phoneCountry, setPhoneCountry] = useState({ dialCode: '971', countryCode: 'ae' });
    const [email, setEmail]               = useState("");
    const [emirate,   setEmirate]         = useState("");
    
    const [eVMake, setEVMake]             = useState('');
    const [eVModel, setEVModel]           = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');

    const [podChargingSessionNumber, setPodChargingSessionNumber]     = useState('');
    const [podChargingSessionValidity, setPodChargingSessionValidity] = useState('');
     
    const [rsaChargingSessionNumber, setRSAChargingSessionNumber]     = useState('');
    const [rsaChargingSessionValidity, setRSAChargingSessionValidity] = useState('');

    const serviceDropdownRef = useRef(null);
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

    const getLocalMobile = () => {
        if (!phoneValue || !phoneCountry?.dialCode) return '';
        return phoneValue.startsWith(phoneCountry.dialCode)
            ? phoneValue.slice(phoneCountry.dialCode.length) : phoneValue;
    };
    const handlePhoneChange = (phone, country) => {
        setPhoneValue(phone);
        setPhoneCountry(country);
        setErrors((prev) => ({ ...prev, mobileNo: '' }));
    };
    
    const handleCancel = () => {
        navigate('/community/resident-list')
    }
    const validateForm = () => {
        const mobileNo = getLocalMobile();
        const fields = [
            { name: "vendorName",   value: vendorName, errorMessage: "vendor Name is required." },
            { name: "showroomName", value: showroomName, errorMessage: "Showroom Name is required." },
            { name: "customerName", value: customerName, errorMessage: "Customer Name is required." },

            { name: "mobileNo", value: mobileNo, errorMessage: "Please enter a valid Mobile No.", isMobile: 1 },
            { name: "email",    value: email,    errorMessage: "Please enter a valid Email ID.",  isEmail: 1 },

            { name: "emirate",      value: emirate,      errorMessage: "Emirate is required" },
            { name: "eVMake",       value: eVMake,       errorMessage: "EV Make is required" },
            { name: "eVModel",      value: eVModel,      errorMessage: "EmirEV Model is required" },
            { name: "purchaseDate", value: purchaseDate, errorMessage: "Purchase Date is required" },

        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                errors[name] = errorMessage;
            } else if (isMobile && (isNaN(value) || value.length < 9)) {
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
                userId        : userDetails?.user_id,
                email         : userDetails?.email,
                
                vendor_id    : vendorName?.value || "",
                showroom_name  : showroomName?.value || "",
                customer_name  : customerName,
                mobile_number  : getLocalMobile(),
                country_code   : phoneCountry.dialCode, //{ dialCode: '971', countryCode: 'ae' });
                customer_email : email,
                emirate        : emirate?.value || "",
                ev_make        : eVMake,
                ev_model       : eVModel,
                purchase_date  : purchaseDate,

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
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchVendors();
    }, []);

    const handleVendors = (selectedOption) => {
        setVendorName(selectedOption);
        fetchShowrooms(selectedOption.label) 
    }
    const handleEmirates = (selectedOption) => {
        setEmirate(selectedOption);
    }
    const handleShowroom = (selectedOption) => {
        setShowroomName(selectedOption);
    }
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
                                    onChange={handleVendors}
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
                                    onChange={handleShowroom}
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
                                onChange={(e) => {
                                    setEmail(e.target.value.slice(0, 50));
                                    setErrors((prev) => ({ ...prev, email: '' }));
                                }}
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
                                    onChange={handleEmirates}
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
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Enter EV Make"
                                value={eVMake}
                                onChange={(e) => setEVMake(e.target.value)}
                            />
                            {errors.eVMake && eVMake === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.eVMake}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="eVModel">EV Model</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="eVModel"
                                placeholder="Enter EV Model"
                                className={styles.inputField}
                                value={eVModel}
                                // onChange={(e) => handleDecimalInput(e.target.value, seteVModel)}
                                onChange={(e) => setEVModel(e.target.value)}
                            />
                            {errors.eVModel && eVModel === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.eVModel}</p>}
                        </div>
                    </div>
                    
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="purchaseDate">Package Purchase Date</label>
                            <InputMask
                                mask="99-99-9999"
                                value={purchaseDate}
                                onChange={(e) => {
                                    setPurchaseDate(e.target.value);
                                    if (errors.purchaseDate && e.target.value.length === 10) {
                                        setErrors((prevErrors) => ({ ...prevErrors, purchaseDate: "" }));
                                    }
                                }}
                                onBlur={() => {
                                    if (purchaseDate.length === 10) {
                                        const [day, month, year] = purchaseDate.split('-');
                                        const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                            day <= 31 && month <= 12;
                                        if (!isValidDate) {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                purchaseDate: "Invalid date in DD-MM-YYYY format",
                                            }));
                                        }
                                    }
                                }}
                                placeholder="DD-MM-YYYY"
                                className={styles.inputField}
                            />
                            {errors.purchaseDate && purchaseDate === "" &&   <p className="error" style={{ color: 'red' }}>{errors.purchaseDate}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}></div>
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
                            <InputMask
                                mask="99-99-9999"
                                value={podChargingSessionValidity}
                                onChange={(e) => {
                                    setPodChargingSessionValidity(e.target.value);
                                    if (errors.podChargingSessionValidity && e.target.value.length === 10) {
                                        setErrors((prevErrors) => ({ ...prevErrors, podChargingSessionValidity: "" }));
                                    }
                                }}
                                onBlur={() => {
                                    if (podChargingSessionValidity.length === 10) {
                                        const [day, month, year] = podChargingSessionValidity.split('-');
                                        const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                            day <= 31 && month <= 12;
                                        if (!isValidDate) {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                podChargingSessionValidity: "Invalid date in DD-MM-YYYY format",
                                            }));
                                        }
                                    }
                                }}
                                placeholder="DD-MM-YYYY"
                                className={styles.inputField}
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
                            <InputMask
                                mask="99-99-9999"
                                value={rsaChargingSessionValidity}
                                onChange={(e) => {
                                    setRSAChargingSessionValidity(e.target.value);
                                    if (errors.rsaChargingSessionValidity && e.target.value.length === 10) {
                                        setErrors((prevErrors) => ({ ...prevErrors, rsaChargingSessionValidity: "" }));
                                    }
                                }}
                                onBlur={() => {
                                    if (rsaChargingSessionValidity.length === 10) {
                                        const [day, month, year] = rsaChargingSessionValidity.split('-');
                                        const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                            day <= 31 && month <= 12;
                                        if (!isValidDate) {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                rsaChargingSessionValidity: "Invalid date in DD-MM-YYYY format",
                                            }));
                                        }
                                    }
                                }}
                                placeholder="DD-MM-YYYY"
                                className={styles.inputField}
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
