import { useState, useRef, useEffect } from "react";
import Select from "react-select";
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './addPartnerStation.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ReactInputMask from "react-input-mask"
import Add from '../../../assets/images/Add.svg';
import PhoneInput from 'react-phone-input-2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-phone-input-2/lib/style.css';
import { applyBackendFieldErrors, getBackendErrorMessage } from '../../../utils/mapBackendErrorsToFields';
import { sortSelectOptionsOtherLast, sortVehicleBrandList } from '../../../utils/sortVehicleBrandOptions';

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
    { value: 'Active',                label: 'Active' },
    { value: 'In-active',             label: 'In-active' },
    { value: 'Pending Approval',      label: 'Pending Approval' },
    { value: 'Under Maintenance',     label: 'Under Maintenance' },
];

const MIN_MOBILE_DIGITS = 9;
const EMAIL_REGEX = /\S+@\S+\.\S+/;

const isValidEmailFormat = (value) => EMAIL_REGEX.test(String(value || '').trim());

// const createEmptyVehicle = () => ({
//     vehicleType            : null,
//     vehicleMake            : null,
//     vehicleModel           : null,
//     vehicleSpecification   : null,
//     plateEmirates          : null,
//     plateCode              : '',
//     plateNumber            : '',
//     vehicleMakeOption      : [],
//     vehicleModelOption     : [],
// });

// const isVehicleRowPartial = (vehicle) => (
//     vehicle.vehicleType
//     || vehicle.vehicleMake
//     || vehicle.vehicleModel
//     || vehicle.vehicleSpecification
//     || vehicle.plateEmirates
//     || String(vehicle.plateCode || '').trim()
//     || String(vehicle.plateNumber || '').trim()
// );

// const isVehicleRowComplete = (vehicle) => (
//     vehicle.vehicleType
//     && vehicle.vehicleMake
//     && vehicle.vehicleModel
//     && vehicle.vehicleSpecification
//     && vehicle.plateEmirates
//     && String(vehicle.plateCode || '').trim()
//     && String(vehicle.plateNumber || '').trim()
// );

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

const EditPartnerStation = () => {
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [stationId, setStationId]                         = useState('');
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
    const [confirmPassword, setConfirmPassword]             = useState(null);
    const [showPassword, setShowPassword]                   = useState(false);
    const [showConfirmPassword, setShowConfirmPassword]     = useState(false);
    const [operatingHour, setOperatingHour]                 = useState(null);
    const [adminStatus, setAdminStatus]                     = useState(null);
    const [chargers, setChargers]                           = useState("");
    const [description, setDescription]                     = useState('')

    // const [phoneValue, setPhoneValue]               = useState('');
    // const [phoneCountry, setPhoneCountry]           = useState({ dialCode: '971', countryCode: 'ae' });

    

    // const [vehicles, setVehicles]                   = useState([createEmptyVehicle()]);
    // const [plateEmiratesOptions, setPlateEmiratesOptions] = useState([]);
    // SINGLE-SELECT COMMUNITY (old):
    // const [community, setCommunity]                 = useState("");
    // MULTI-SELECT COMMUNITY (new): selected options as [{ label, value }, ...]
    // const [community, setCommunity]                 = useState([]);
    
    // const [sessionAllocation, setSessionAllocation] = useState('');
    // const [allocatedTime, setAllocatedTime]         = useState('');
    // const [kwhAllocated, setkwhAllocated]           = useState('');
    // const [perKwhCharge, setPerKwhCharge]           = useState('');
    // const [extraCharge, setExtraCharge]             = useState('');

    // const serviceDropdownRef                      = useRef(null);
    // const formValuesRef                           = useRef({});
    // const lastLookupKeyRef                        = useRef('');
    // const lookupTimerRef                          = useRef(null);
    // const lookupSeqRef                            = useRef(0);

    
    
    // SINGLE-SELECT COMMUNITY (old):
    // const [communityOptions, setCommunityOptions] = useState('');
    // MULTI-SELECT COMMUNITY (new): dropdown options from all-community-list API
    // const [communityOptions, setCommunityOptions] = useState([]);

    // const updateVehicleAt = (index, updates) => {
    //     setVehicles((prev) => {
    //         const next = [...prev];
    //         next[index] = { ...next[index], ...updates };
    //         return next;
    //     });
    // };

    // const clearVehicleFieldErrors = (index, fields = []) => {
    //     setErrors((prev) => {
    //         const next = { ...prev };
    //         fields.forEach((field) => {
    //             delete next[`${field}_${index}`];
    //         });
    //         delete next.vehicles;
    //         return next;
    //     });
    // };

    // const handleVehicleMakeChange = (index, selectedOption) => {
    //     updateVehicleAt(index, {
    //         vehicleMake        : selectedOption,
    //         vehicleModel       : null,
    //         vehicleModelOption : sortSelectOptionsOtherLast(selectedOption?.models || []),
    //     });
    //     clearVehicleFieldErrors(index, ['vehicleMake', 'vehicleModel']);
    // };

    // const handleVehicleTypeChange = (index, selectedOption) => {
    //     updateVehicleAt(index, {
    //         vehicleType        : selectedOption,
    //         vehicleMake        : null,
    //         vehicleModel       : null,
    //         vehicleMakeOption  : [],
    //         vehicleModelOption : [],
    //     });
    //     clearVehicleFieldErrors(index, ['vehicleType', 'vehicleMake', 'vehicleModel']);
    //     if (selectedOption?.value) {
    //         fetchVehicleList(selectedOption.value, index);
    //     }
    // };

    // const addVehicle = () => {
    //     setVehicles((prev) => [...prev, createEmptyVehicle()]);
    // };

    // const handleRemoveVehicle = (index) => {
    //     setVehicles((prev) => prev.filter((_, i) => i !== index));
    //     setErrors((prev) => {
    //         const next = { ...prev };
    //         Object.keys(next).forEach((key) => {
    //             if (key.endsWith(`_${index}`)) {
    //                 delete next[key];
    //             }
    //         });
    //         delete next.vehicles;
    //         return next;
    //     });
    // };

    // useEffect(() => {
    //     formValuesRef.current = { stationId, email, emirates, phoneValue, phoneCountry };
    // }, [stationId, email, emirates, phoneValue, phoneCountry]);

    // useEffect(() => () => {
    //     if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    // }, []);

    const getLocalMobile = (phone = contactNumber, country = phoneCountry) => {
        if (!phone || !country?.dialCode) return '';
        return phone.startsWith(country.dialCode)
            ? phone.slice(country.dialCode.length)
            : phone;
    };

    // const applyRiderLookupData = (rider) => {
    //     if (!rider) return;
    //     const current = formValuesRef.current;
    //     const cleared = {};

    //     const name = rider.resident_name || '';
    //     if (!String(current.stationId || '').trim() && name) {
    //         setStationId(name);
    //         cleared.stationId = '';
    //     }

    //     const emailValue = rider.resident_email || '';
    //     if (!String(current.email || '').trim() && emailValue) {
    //         setEmail(emailValue);
    //         cleared.email = '';
    //     }

    //     const emirateValue = String(rider.emirates || '').trim();
    //     if (!current.emirates && emirateValue) {
    //         const match = emiratesOptions.find((option) => (
    //             option.value.toLowerCase() === emirateValue.toLowerCase()
    //             || option.label.toLowerCase() === emirateValue.toLowerCase()
    //         ));
    //         if (match) {
    //             setEmirates(match);
    //             cleared.emirates = '';
    //         }
    //     }

    //     const localMobile = getLocalMobile(current.phoneValue, current.phoneCountry);
    //     if (!localMobile && rider.mobile_number) {
    //         const riderDial = String(rider.country_code || '+971').replace(/\D/g, '') || '971';
    //         setPhoneValue(`${riderDial}${rider.mobile_number}`);
    //         setPhoneCountry((prev) => ({ ...prev, dialCode: riderDial }));
    //         cleared.mobileNo = '';
    //     }

    //     if (Object.keys(cleared).length > 0) {
    //         setErrors((prev) => ({ ...prev, ...cleared }));
    //     }
    // };

    // const lookupResident = ({ mobile, residentEmail }) => {
    //     const mobileNo = String(mobile || '').trim();
    //     const emailId  = String(residentEmail || '').trim();
    //     const hasMobile = mobileNo.length >= MIN_MOBILE_DIGITS;
    //     const hasEmail  = isValidEmailFormat(emailId);
    //     if (!hasMobile && !hasEmail) return;

    //     const key = `${hasMobile ? mobileNo : ''}|${hasEmail ? emailId.toLowerCase() : ''}`;
    //     if (key === lastLookupKeyRef.current) return;
    //     lastLookupKeyRef.current = key;

    //     const seq = ++lookupSeqRef.current;
    //     const payload = {
    //         userId : userDetails?.user_id,
    //         email  : userDetails?.email,
    //     };
    //     if (hasMobile) payload.mobile_number = mobileNo;
    //     if (hasEmail) payload.resident_email = emailId;

    //     postRequestWithToken('resident-rider-lookup', payload, (response) => {
    //         if (seq !== lookupSeqRef.current) return;
    //         if (response.code === 200 && Number(response.found) === 1 && response.data) {
    //             applyRiderLookupData(response.data);
    //         }
    //     });
    // };

    // const scheduleResidentLookup = (payload) => {
    //     if (lookupTimerRef.current) clearTimeout(lookupTimerRef.current);
    //     lookupTimerRef.current = setTimeout(() => lookupResident(payload), 400);
    // };

    const handlePhoneChange = (phone, country) => {
        setContactNumber(phone);
        setPhoneCountry(country);
        setErrors((prev) => ({ ...prev, contactNumber: '' }));

        // const localMobile = getLocalMobile(phone, country);
        // if (localMobile.length >= MIN_MOBILE_DIGITS || isValidEmailFormat(email)) {
        //     scheduleResidentLookup({ mobile: localMobile, email: email });
        // } else {
        //     lastLookupKeyRef.current = '';
        //     lookupSeqRef.current += 1;
        // }
    };

    // const handlePhoneBlur = () => {
    //     lookupResident({ mobile: getLocalMobile(), residentEmail: email });
    // };

    // const handleEmailChange = (e) => {
    //     const value = e.target.value.slice(0, 50);
    //     setEmail(value);
    //     setErrors((prev) => ({ ...prev, email: '' }));

    //     if (isValidEmailFormat(value) || getLocalMobile().length >= MIN_MOBILE_DIGITS) {
    //         scheduleResidentLookup({ mobile: getLocalMobile(), residentEmail: value });
    //     } else {
    //         lastLookupKeyRef.current = '';
    //     }
    // };

    // const handleEmailBlur = () => {
    //     lookupResident({ mobile: getLocalMobile(), residentEmail: email });
    // };

    // const handleDecimalInput = (value, setter) => {
    //     const sanitized = value
    //         .replace(/[^0-9.]/g, '')
    //         .replace(/(\..*)\./g, '$1');
    //     setter(sanitized);
    // };

    // SINGLE-SELECT COMMUNITY (old):
    // const handleCommunity = (selectedOption) => {
    //     setCommunity(selectedOption);
    // }
    // MULTI-SELECT COMMUNITY (new): MultiSelect passes the full selected array
    // const handleCommunity = (selectedOptions) => {
    //     setCommunity(selectedOptions);
    //     if (selectedOptions.length > 0) {
    //         setErrors((prev) => ({ ...prev, community: '' }));
    //     }
    // }
    const handleCancel = () => {
        navigate('/partners/stations-list')
    }
    const validateForm = () => {
        // const mobileNo = getLocalMobile();
        const fields = [
            { name: "stationId",           value: stationId,            errorMessage: "Station ID is required." },
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
            { name: "contactNumber",       value: contactNumber,        errorMessage: "Contact Number is required.", isMobile: true  },
            { name: "email",               value: email,                errorMessage: "Please enter a valid Email ID.", isEmail: true },
            { name: "password",            value: password,             errorMessage: "Password is required." },
            { name: "confirmPassword",     value: confirmPassword,      errorMessage: "Passwords do not match.", isPasswordMatch: true },
            { name: "operatingHour",       value: operatingHour,        errorMessage: "Operating Hour is required." },
            { name: "adminStatus",         value: adminStatus,          errorMessage: "Administrative Status is required." },
            { name: "chargers",            value: chargers,             errorMessage: "No. of Chargers is required." },
            { name: "description",         value: description,          errorMessage: "Station Description is required." },

            // { name: "community",           value: community,            errorMessage: "At least one community is required.", isArray: true },
            // { name: "sessionAllocation",   value: sessionAllocation,    errorMessage: "Session Allocation is required." },
            // { name: "allocatedTime",       value: allocatedTime,        errorMessage: "Allocated Time is required." },
            // { name: "kwhAllocated",        value: kwhAllocated,         errorMessage: "kWh Allocated is required." },
            // { name: "perKwhCharge",        value: perKwhCharge,         errorMessage: "kWh Charge is required." },
            // { name: "extraCharge",         value: extraCharge,          errorMessage: "Extra Charge is required." },
            // { name: "stationName",         value: stationName,          errorMessage: "Please enter a valid Mobile No.", isMobile: true },
        ];

        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isPasswordMatch, isArray }) => {
            // if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
            //     errors[name] = errorMessage;
            // } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
            //     errors[name] = errorMessage;
            // } else if (isMobile && (isNaN(value) || value.length < 9)) {
            //     errors[name] = errorMessage;
            // }
            // return errors;
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

        // let hasCompleteVehicle = false;
        // vehicles.forEach((vehicle, index) => {
        //     const isFirstRow = index === 0;
        //     const hasPartial = isVehicleRowPartial(vehicle);

        //     if (isFirstRow || hasPartial) {
        //         if (!vehicle.vehicleType) {
        //             newErrors[`vehicleType_${index}`] = 'Vehicle Type is required.';
        //         }
        //         if (!vehicle.vehicleMake) {
        //             newErrors[`vehicleMake_${index}`] = 'Vehicle Brand is required.';
        //         }
        //         if (!vehicle.vehicleModel) {
        //             newErrors[`vehicleModel_${index}`] = 'Vehicle Model is required.';
        //         }
        //         if (!vehicle.vehicleSpecification) {
        //             newErrors[`vehicleSpecification_${index}`] = 'Vehicle Specification is required.';
        //         }
        //         if (!vehicle.plateEmirates) {
        //             newErrors[`plateEmirates_${index}`] = 'Emirates is required.';
        //         }
        //         if (!String(vehicle.plateCode || '').trim()) {
        //             newErrors[`plateCode_${index}`] = 'Plate Code is required.';
        //         }
        //         if (!String(vehicle.plateNumber || '').trim()) {
        //             newErrors[`plateNumber_${index}`] = 'Plate Number is required.';
        //         }
        //         if (isVehicleRowComplete(vehicle)) {
        //             hasCompleteVehicle = true;
        //         }
        //     }
        // });

        // if (!hasCompleteVehicle) {
        //     newErrors.vehicles = 'At least one complete vehicle is required.';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (validateForm()) {
            // const completeVehicles = vehicles.filter(isVehicleRowComplete);
            // const vehiclePayload = completeVehicles.map((vehicle) => ({
            //     vehicle_type          : vehicle.vehicleType?.value,
            //     vehicle_make          : vehicle.vehicleMake?.value,
            //     vehicle_model         : vehicle.vehicleModel?.value,
            //     vehicle_specification : vehicle.vehicleSpecification?.value,
            //     vehicle_emirates      : vehicle.plateEmirates?.value,
            //     vehicle_code          : String(vehicle.plateCode || '').trim(),
            //     vehicle_number        : String(vehicle.plateNumber || '').trim(),
            // }));
            // const primaryVehicle = completeVehicles[0] || {};

            const obj = {
                userId                     : userDetails?.user_id,
                email                      : userDetails?.email,

                station_id                 : stationId,
                station_name               : stationName,
                station_type               : stationType,
                operator_name              : operatorName,
                address                    : address,
                city                       : city,
                emirates                   : emirates,
                country_code               : phoneCountry?.dialCode ? `+${phoneCountry.dialCode}` : '+971',
                lat                        : latitude,
                long                       : longitude,
                contact_person             : contactPerson,
                contact_number             : getLocalMobile(),
                contact_email              : email,
                password                   : confirmPassword,
                operating_hour             : operatingHour,
                administrative_status      : adminStatus,
                no_of_chargers             : chargers,
                description                : description,
                

                // resident_email             : email,
                // emirates                   : emirates?.value,
                // vehicle_type               : primaryVehicle.vehicleType?.value,
                // vehicle_make               : primaryVehicle.vehicleMake?.value,
                // vehicle_model              : primaryVehicle.vehicleModel?.value,
                // vehicle_specification      : primaryVehicle.vehicleSpecification?.value,
                // vehicle_emirates           : primaryVehicle.plateEmirates?.value,
                // vehicle_code               : String(primaryVehicle.plateCode || '').trim(),
                // vehicle_number             : String(primaryVehicle.plateNumber || '').trim(),
                // vehicles                   : JSON.stringify(vehiclePayload),
                // SINGLE-SELECT COMMUNITY (old):
                // community_id               : community.value,
                // MULTI-SELECT COMMUNITY (new): send array of IDs to resident-add API
                // community_ids              : community.map((item) => item.value),
                // address                    : address,
                // monthly_session_allocation : sessionAllocation,
                // alloted_time               : allocatedTime, 
                // kwh_allocated              : kwhAllocated, 
                // per_kwh_charge             : perKwhCharge, 
                // extra_charge               : extraCharge
            }
            postRequestWithToken('add-station', obj, async (response) => {
                if (response.status === 1) {
                    toast(response.message , {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/partners/stations-list');
                    }, 1000);
                } else {
                    const applied = applyBackendFieldErrors(response, setErrors, {
                        email: 'email',
                        contact: 'mobileNo',
                    });
                    if (!applied) {
                        toast(getBackendErrorMessage(response), { type: 'error' });
                    }
                    console.log('Error in add-station API:', response);
                    setLoading(false);
                }
            } )
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

    // const fetchDetails = () => {
    //     const obj = {
    //         userId: userDetails?.user_id,
    //         email: userDetails?.email,
    //     };
    //     postRequestWithToken('all-community-list', obj, (response) => {
    //         if (response.code === 200) {
    //             // SINGLE-SELECT COMMUNITY (old):
    //             // setCommunityOptions(response.data)
    //             // MULTI-SELECT COMMUNITY (new):
    //             // setCommunityOptions(response.data || []);
    //         } else {
    //             // SINGLE-SELECT COMMUNITY (old):
    //             // console.log('error in rider-details API', response);
    //             // MULTI-SELECT COMMUNITY (new):
    //             console.log('error in all-community-list API', response);
    //         }
    //     });
    // };

    // const fetchVehicleList = (type, index) => {
    //     const apiEndpoint = type === 'Bike' ? 'vehicle-bike-brand-list' : 'vehicle-brand-list';
    //     const obj = {
    //         userId: userDetails?.user_id,
    //         email: userDetails?.email,
    //     };
    //     postRequestWithToken(apiEndpoint, obj, (response) => {
    //         if (response.code === 200) {
    //             updateVehicleAt(index, { vehicleMakeOption: sortVehicleBrandList(response?.data || []) });
    //         } else {
    //             console.log(`error in ${apiEndpoint}`, response);
    //         }
    //     });
    // };

    // const fetchLocationList = () => {
    //     const obj = {
    //         userId: userDetails?.user_id,
    //         email: userDetails?.email,
    //     };
    //     postRequestWithToken('location-list', obj, (response) => {
    //         if (response.code === 200) {
    //             const options = (response?.data || []).map((item) => ({
    //                 ...item,
    //                 value: item.code || item.value,
    //                 label: item.code || item.label,
    //             }));
    //             setPlateEmiratesOptions(options);
    //         } else {
    //             console.log('error in location-list API', response);
    //         }
    //     });
    // };

    // useEffect(() => {
    //     if (!userDetails || !userDetails.access_token) {
    //         navigate('/login');
    //         return;
    //     }
    //     fetchDetails();
    //     fetchLocationList();
    // }, []);
    
    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Edit Station</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Station Information</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="stationId">Station ID</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="stationId"
                                    placeholder="Station ID"
                                    className={styles.inputField}
                                    value={stationId}
                                    onChange={(e) => setStationId(e.target.value)}
                                />
                                {errors.stationId && stationId === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationId}</p>}
                            </div>
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
                        </div>
                        <div className={styles.row}>
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
                            <div className={styles.addShopInputContainer}>
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
                                    // onChange={(e) => setLatitude(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^-?\d*\.?\d{0,8}$/.test(value)) {
                                            setLatitude(value);
                                        }
                                    }}
                                    
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
                                    // onChange={(e) => setLongitude(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^-?\d*\.?\d{0,8}$/.test(value)) {
                                            setLongitude(value);
                                        }
                                    }}
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
                                <label className={styles.addShopLabel} htmlFor="contactNumber">Contact Number</label>
                                <PhoneInput
                                    country="ae"
                                    value={contactNumber}
                                    // onChange={handlePhoneChange}
                                    // onBlur={handlePhoneBlur}
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
                            "Edit Station"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );

};

export default EditPartnerStation;
