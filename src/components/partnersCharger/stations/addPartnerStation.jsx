import { useState } from "react";
import Select from "react-select";
import styles from './addPartnerStation.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-phone-input-2/lib/style.css';
import { applyBackendFieldErrors, getBackendErrorMessage } from '../../../utils/mapBackendErrorsToFields';

const emiratesOptions = [
    { value: 'Abu Dhabi',      label: 'Abu Dhabi' },
    { value: 'Ajman',          label: 'Ajman' },
    { value: 'Dubai',          label: 'Dubai' },
    { value: 'Fujairah',       label: 'Fujairah' },
    { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
    { value: 'Sharjah',        label: 'Sharjah' },
    { value: 'Umm Al Quwain',  label: 'Umm Al Quwain' },
];

const stationTypeOptions = [
    { value: 'Public Station',            label: 'Public Station' },
    { value: 'Private Station',           label: 'Private Station' },
    { value: 'Commercial Hub',            label: 'Commercial Hub' },
    { value: 'Residential Community',     label: 'Residential Community' },
];

const operatingHoursOptions = [
    { value: '24 x 7',              label: '24 x 7' },
    { value: '6 AM - 10 PM',        label: '6 AM - 10 PM' },
    { value: '9 AM - 9 PM',         label: '9 AM - 9 PM' },
    { value: 'custom schedule',     label: 'Custom Schedule' },
];

const AdministrativeStatusOption = [
    { value: 'Active',              label: 'Active' },
    { value: 'Inactive',            label: 'Inactive' },
    { value: 'Pending approval',    label: 'Pending approval' },
    { value: 'Under maintenance',   label: 'Under maintenance' },
];

const MIN_MOBILE_DIGITS = 9;

const selectMenuStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#242424',
        border: '1px solid #3a3a3a',
        zIndex: 9999,
    }),
    menuList: (base) => ({
        ...base,
        backgroundColor: '#242424',
        padding: 0,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#00ffc3'
            : state.isFocused
                ? '#333333'
                : '#242424',
        color: state.isSelected ? '#000000' : '#ffffff',
        cursor: 'pointer',
    }),
};

const AddPartnerStation = () => {
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [stationName, setStationName]                     = useState('');
    const [stationType, setStationType]                     = useState(null);
    const [operatorName, setOperatorName]                   = useState('');
    const [address, setAddress]                             = useState('');
    const [city, setCity]                                   = useState('');
    const [emirates, setEmirates]                           = useState(null);
    const [country, setCountry]                             = useState('');
    const [latitude, setLatitude]                           = useState('')
    const [longitude, setLongitude]                         = useState('')
    const [contactPerson, setContactPerson]                 = useState('');
    const [contactNumber, setContactNumber]                 = useState("");
    const [phoneCountry, setPhoneCountry]                   = useState({ dialCode: '971', countryCode: 'ae' });
    const [email, setEmail]                                 = useState("");
    const [password, setPassword]                           = useState("");
    const [confirmPassword, setConfirmPassword]             = useState('');
    const [showPassword, setShowPassword]                   = useState(false);
    const [showConfirmPassword, setShowConfirmPassword]     = useState(false);
    const [operatingHour, setOperatingHour]                 = useState(null);
    const [adminStatus, setAdminStatus]                     = useState(null);
    const [chargers, setChargers]                           = useState("");
    const [description, setDescription]                     = useState('')

    const getLocalMobile = (phone = contactNumber, country = phoneCountry) => {
        if (!phone || !country?.dialCode) return '';
        return phone.startsWith(country.dialCode)
            ? phone.slice(country.dialCode.length)
            : phone;
    };

    const handlePhoneChange = (phone, country) => {
        setContactNumber(phone);
        setPhoneCountry(country);
        setErrors((prev) => ({ ...prev, contactNumber: '' }));
    };

    const handleCancel = () => {
        navigate('/partners/stations-list')
    }
    const validateForm = () => {
        const fields = [
            { name: "stationName",         value: stationName,          errorMessage: "Station Name is required." },
            { name: "stationType",         value: stationType,          errorMessage: "Station Type is required." },
            { name: "operatorName",        value: operatorName,         errorMessage: "Operator Name is required." },
            { name: "address",             value: address,              errorMessage: "Address is required." },
            { name: "city",                value: city,                 errorMessage: "City is required." },
            { name: "emirates",            value: emirates,             errorMessage: "Emirates is required." },
            { name: "country",             value: country,              errorMessage: "Country is required." },
            { name: "latitude",            value: latitude,             errorMessage: "Latitude is required." },
            { name: "longitude",           value: longitude,            errorMessage: "Longitude is required." },
            { name: "contactPerson",       value: contactPerson,        errorMessage: "Contact Person is required." },
            { name: "contactNumber",       value: contactNumber,        errorMessage: "Please enter a valid contact number.", isMobile: true, optional: true },
            { name: "email",               value: email,                errorMessage: "Please enter a valid Email ID.", isEmail: true },
            { name: "password",            value: password,             errorMessage: "Password is required." },
            { name: "confirmPassword",     value: confirmPassword,      errorMessage: "Passwords do not match.", isPasswordMatch: true },
            { name: "operatingHour",       value: operatingHour,        errorMessage: "Operating Hour is required." },
            { name: "adminStatus",         value: adminStatus,          errorMessage: "Administrative Status is required." },
            { name: "chargers",            value: chargers,             errorMessage: "No. of Chargers is required." },
            { name: "description",         value: description,          errorMessage: "Station Description is required." },

        ];

        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isPasswordMatch, optional }) => {
            if (isMobile && optional) {
                const local = getLocalMobile(value);
                if (local && local.length < MIN_MOBILE_DIGITS) {
                    errors[name] = errorMessage;
                }
                return errors;
            }
            if (!value) {
                errors[name] = errorMessage;
            } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                errors[name] = errorMessage;
            } else if (isMobile && (isNaN(value) || value.length < 9)) {
                errors[name] = errorMessage;
                
            } else if (isPasswordMatch && value !== password) {
                errors[name] = errorMessage;
               
            } else if (name === 'password' && value.length < 6) {
                errors[name] = "Password should be at least 6 characters long.";
                
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

            const localContact = getLocalMobile().trim();
            const obj = {
                userId            : userDetails?.user_id,
                email             : userDetails?.email,

                station_name      : String(stationName).trim(),
                station_type      : stationType?.value || '',
                operator_name     : String(operatorName).trim(),
                address           : String(address).trim(),
                city              : String(city).trim(),
                state_emirate     : emirates?.value || '',
                country           : String(country).trim(),
                latitude            : String(latitude).trim() || null,
                longitude           : String(longitude).trim() || null,
                contact_person      : String(contactPerson).trim() || null,
                contact_number      : localContact || null,
                master_email        : String(email).trim(),
                master_password     : password,
                confirm_password    : confirmPassword,
                operating_hours     : operatingHour?.value || '',
                admin_status        : adminStatus?.value || 'Active',
                description         : String(description).trim(),
                number_of_chargers  : chargers === '' ? null : Number(chargers),
            };
            postRequestWithToken('partner-station-add', obj, async (response) => {
                if (response.status === 1) {
                    toast(getBackendErrorMessage(response, 'Station added successfully!'), { type: 'success' });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/partners/stations-list');
                    }, 1000);
                } else {
                    const applied = applyBackendFieldErrors(
                        response,
                        setErrors,
                        { email: 'email', contact: 'contactNumber' },
                        {
                            email: 'Station master email already exists',
                            contact: 'Contact number already exist',
                        },
                        [
                            { match: /station id already exists/i, key: 'stationId' },
                            { match: /confirm password/i, key: 'confirmPassword' },
                            { match: 'confirm_password', key: 'confirmPassword', label: 'Confirm Password' },
                        ]
                    );
                    if (!applied) {
                        toast(getBackendErrorMessage(response), { type: 'error' });
                    }
                    setLoading(false);
                }
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const handleOnBlur = (value) => {
        const currentAddress = value
        const geocoder       = new window.google.maps.Geocoder();
        geocoder.geocode({ address: currentAddress }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();
        
                setLatitude(lat)
                setLongitude(lng)
            }
        });
    };

    
    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Add Station</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Station Information</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="stationName">Station Name</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="stationName"
                                    placeholder="station Name"
                                    className={styles.inputField}
                                    value={stationName}
                                    onChange={(e) => setStationName(e.target.value)}
                                />
                                {errors.stationName && stationName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Station Type</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={stationTypeOptions}
                                    value={stationType}
                                    onChange={(selectedOption) => {
                                        setStationType(selectedOption);
                                        setErrors((prev) => ({ ...prev, stationType: '' }));
                                    }}
                                    placeholder="Select Station Type"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.stationType && !stationType && <p className={styles.error} style={{ color: 'red' }}>{errors.stationType}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.addShopInputContainer} ${styles.fieldHalfWidth}`}>
                                <label className={styles.addShopLabel} htmlFor="operatorName">Operator Name</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="operatorName"
                                    placeholder="Operator Name"
                                    className={styles.inputField}
                                    value={operatorName}
                                    onChange={(e) => setOperatorName(e.target.value)}
                                />
                                {errors.operatorName && operatorName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.operatorName}</p>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Location Details</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="address">Address</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    autoComplete='off'
                                    placeholder="Enter Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    onBlur={(e) => handleOnBlur(e.target.value)}
                                />
                                {errors.address && address === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.address}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="city">City</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="city"
                                    placeholder="City"
                                    className={styles.inputField}
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                                {errors.city && city === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.city}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Emirates</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={emiratesOptions}
                                    value={emirates}
                                    onChange={(selectedOption) => {
                                        setEmirates(selectedOption);
                                        setErrors((prev) => ({ ...prev, emirates: '' }));
                                    }}
                                    placeholder="Select Emirates"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.emirates && !emirates && <p className={styles.error} style={{ color: 'red' }}>{errors.emirates}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="country">Country</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="country"
                                    placeholder="Country"
                                    className={styles.inputField}
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                                {errors.country && country === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.country}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="latitude">Latitude</label>
                                <input type="text"
                                    id="latitude"
                                        autoComplete="off"
                                    placeholder="Latitude"
                                    className={styles.inputField}
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value.slice(0, 80))}
                                    
                                />
                                {errors.latitude && latitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.latitude}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="longitude">Longitude</label>
                                <input type="text"
                                    id="longitude"
                                        autoComplete="off"
                                    placeholder="Longitude"
                                    className={styles.inputField}
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value.slice(0, 80))}
                                />
                                {errors.longitude && longitude === '' &&  <p className={styles.error} style={{ color: 'red' }}>{errors.longitude}</p>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Contact & Operations</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="contactPerson">Contact Person</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="contactPerson"
                                    placeholder="Contact Person"
                                    className={styles.inputField}
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                />
                                {errors.contactPerson && contactPerson === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.contactPerson}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="contactNumber">Contact Number (optional)</label>
                                <PhoneInput
                                    country="ae"
                                    value={contactNumber}
                                    onChange={handlePhoneChange}
                                    enableSearch={true}
                                    countryCodeEditable={false}
                                    containerClass={styles.phoneInputContainer}
                                    inputClass={styles.phoneInputField}
                                    buttonClass={styles.phoneInputButton}
                                    dropdownClass={styles.phoneInputDropdown}
                                    placeholder="Contact Number"
                                />
                                {errors.contactNumber && <p className="error" style={{ color: 'red' }}>{errors.contactNumber}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Email ID</label>
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
                                {errors.email && <p className="error">{errors.email}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Password</label>
                                <div className={styles.passwordContainer}>
                                    <input
                                        className={styles.inputField}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete='off'
                                        placeholder="Password"
                                        value={password}
                                        maxlength="20"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div
                                        className={styles.eyeIcon}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        style={{ color: showPassword ? '#00ffc3' : '#fff' }}
                                    >
                                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                                    </div>
                                </div>
                                {errors.password && password.length < 6 &&  <p className="error">{errors.password}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Confirm Password</label>
                                <div className={styles.passwordContainer}>
                                    <input
                                        className={styles.inputField}
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete='off'
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        maxlength="20"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <div
                                        className={styles.eyeIcon}
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        style={{ color: showConfirmPassword ? '#00ffc3' : '#fff' }}
                                    >
                                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                                    </div>
                                </div>
                                {errors.confirmPassword && confirmPassword !== password && <p className="error">{errors.confirmPassword}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Operating Hours</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={operatingHoursOptions}
                                    value={operatingHour}
                                    onChange={(selectedOption) => {
                                        setOperatingHour(selectedOption);
                                        setErrors((prev) => ({ ...prev, operatingHour: '' }));
                                    }}
                                    placeholder="Select Operating Hours"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.operatingHour && !operatingHour && <p className={styles.error} style={{ color: 'red' }}>{errors.operatingHour}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Administrative Status</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={AdministrativeStatusOption}
                                    value={adminStatus}
                                    onChange={(selectedOption) => {
                                        setAdminStatus(selectedOption);
                                        setErrors((prev) => ({ ...prev, adminStatus: '' }));
                                    }}
                                    placeholder="Select Administrative Status"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.adminStatus && !adminStatus && <p className={styles.error} style={{ color: 'red' }}>{errors.adminStatus}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="chargers">Number of Chargers</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="chargers"
                                    placeholder="No of Chargers"
                                    className={styles.inputField}
                                    value={chargers}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                        setChargers(value);
                                    }
                                }}
                                />
                                {errors.chargers && chargers === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargers}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="description">Station Description</label>
                                <textarea
                                    id="description"
                                    placeholder="Enter Station Description"
                                    className={styles.inputField}
                                    rows="4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                {errors.description && description === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.description}</p>}
                            </div>
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
                            "Add Station"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );

};

export default AddPartnerStation;
