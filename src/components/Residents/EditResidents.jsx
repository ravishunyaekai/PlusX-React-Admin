import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import UploadIcon from '../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './EditResidents.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ReactInputMask from "react-input-mask"
import Add from '../../assets/images/Add.svg';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { applyBackendFieldErrors, getBackendErrorMessage } from '../../utils/mapBackendErrorsToFields';
// MULTI-SELECT COMMUNITY (new): shared helper to map API response → MultiSelect options
import { mapCommunitiesFromApiResponse } from '../../utils/residentCommunityHelpers';

const vehicleTypeOptions = [
    { value: 'Car',  label: 'Car' },
    { value: 'Bike', label: 'Bike' },
];

const vehicleSpecificationOptions = [
    { value: 'GCC',     label: 'GCC' },
    { value: 'Non-GCC', label: 'Non-GCC' },
];

const emiratesOptions = [
    { value: 'Abu Dhabi',      label: 'Abu Dhabi' },
    { value: 'Ajman',          label: 'Ajman' },
    { value: 'Dubai',          label: 'Dubai' },
    { value: 'Fujairah',       label: 'Fujairah' },
    { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
    { value: 'Sharjah',        label: 'Sharjah' },
    { value: 'Umm Al Quwain',  label: 'Umm Al Quwain' },
];

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

const EditResidents = () => {
    const { residentId }        = useParams()
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [residentName, setResidentName]           = useState('')
    // const [mobileNo, setMobileNo]                   = useState("");
    const [phoneValue, setPhoneValue]               = useState('');
    const [phoneCountry, setPhoneCountry]           = useState({ dialCode: '971', countryCode: 'ae' });
    const [email, setEmail]                         = useState("");
    const [emirates, setEmirates]                   = useState(null);
    const [vehicleType, setVehicleType]             = useState(null);
    const [vehicleMakeOption, setVehicleMakeOption] = useState([]);
    const [vehicleModelOption, setVehicleModelOption] = useState([]);
    const [vehicleMake, setVehicleMake]             = useState(null);
    const [vehicleModel, setVehicleModel]           = useState(null);
    const [vehicleSpecification, setVehicleSpecification] = useState(null);
    const [plateEmiratesOptions, setPlateEmiratesOptions] = useState([]);
    const [plateEmirates, setPlateEmirates]         = useState(null);
    const [plateCode, setPlateCode]                 = useState('');
    const [plateNumber, setPlateNumber]             = useState('');
    // SINGLE-SELECT COMMUNITY (old):
    // const [community, setCommunity]                 = useState("");
    // MULTI-SELECT COMMUNITY (new): selected options as [{ label, value }, ...]
    const [community, setCommunity]                 = useState([]);
    const [address, setAddress]                     = useState('');
    const [sessionAllocation, setSessionAllocation] = useState('');
    const [allocatedTime, setAllocatedTime]         = useState('');
    const [kwhAllocated, setkwhAllocated]           = useState('');
    const [perKwhCharge, setPerKwhCharge]           = useState('');
    const [extraCharge, setExtraCharge]             = useState('');

    const serviceDropdownRef                      = useRef(null);
    // SINGLE-SELECT COMMUNITY (old):
    // const [communityOptions, setCommunityOptions] = useState('');
    // MULTI-SELECT COMMUNITY (new): dropdown options from all-community-list API
    const [communityOptions, setCommunityOptions] = useState([]);
    // MULTI-SELECT COMMUNITY (new): raw resident-details payload — re-map labels when options load
    const [residentApiData, setResidentApiData]   = useState(null);

    const handleVehicleMakeChange = (selectedOption) => {
        setVehicleMake(selectedOption);
        setVehicleModel(null);
        setVehicleModelOption(selectedOption?.models || []);
        setErrors((prev) => ({ ...prev, vehicleMake: '', vehicleModel: '' }));
    };

    const handleVehicleTypeChange = (selectedOption) => {
        setVehicleType(selectedOption);
        setVehicleMake(null);
        setVehicleModel(null);
        setVehicleMakeOption([]);
        setVehicleModelOption([]);
        setErrors((prev) => ({ ...prev, vehicleType: '', vehicleMake: '', vehicleModel: '' }));
        if (selectedOption?.value) {
            fetchVehicleList(selectedOption.value);
        }
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
        setErrors((prev) => ({ ...prev, mobileNo: '' }));
    };

    const handleDecimalInput = (value, setter) => {
        const sanitized = value
            .replace(/[^0-9.]/g, '')
            .replace(/(\..*)\./g, '$1');
        setter(sanitized);
    };

    // SINGLE-SELECT COMMUNITY (old):
    // const handleCommunity = (selectedOption) => {
    //     setCommunity(selectedOption);
    // }
    // MULTI-SELECT COMMUNITY (new): MultiSelect passes the full selected array
    const handleCommunity = (selectedOptions) => {
        setCommunity(selectedOptions);
        if (selectedOptions.length > 0) {
            setErrors((prev) => ({ ...prev, community: '' }));
        }
    }
    const handleCancel = () => {
        navigate('/community/resident-list')
    }

    const validateForm = (chargersValues) => {
        const mobileNo = getLocalMobile();
        const fields = [
            { name: "residentName",        value: residentName,         errorMessage: "Residant Name is required." },
            { name: "mobileNo",            value: mobileNo,             errorMessage: "Please enter a valid Mobile No.", isMobile: true },
            { name: "email",               value: email,                errorMessage: "Please enter a valid Email ID.", isEmail: true },
            { name: "emirates",            value: emirates,             errorMessage: "Emirates is required." },
            { name: "vehicleType",         value: vehicleType,          errorMessage: "Vehicle Type is required." },
            { name: "vehicleMake",         value: vehicleMake,          errorMessage: "Vehicle Brand is required." },
            { name: "vehicleModel",        value: vehicleModel,         errorMessage: "Vehicle Model is required." },
            { name: "vehicleSpecification", value: vehicleSpecification, errorMessage: "Vehicle Specification is required." },
            { name: "plateEmirates",       value: plateEmirates,        errorMessage: "Emirates is required." },
            { name: "plateCode",           value: plateCode,            errorMessage: "Plate Code is required." },
            { name: "plateNumber",         value: plateNumber,          errorMessage: "Plate Number is required." },
            // SINGLE-SELECT COMMUNITY (old):
            // { name: "community",           value: community,            errorMessage: "Community is required." },
            // MULTI-SELECT COMMUNITY (new): at least one community must be selected
            { name: "community",           value: community,            errorMessage: "At least one community is required.", isArray: true },
            { name: "address",             value: address,              errorMessage: "Address is required." },
            { name: "sessionAllocation",   value: sessionAllocation,    errorMessage: "Session Allocation is required." },
            { name: "allocatedTime",       value: allocatedTime,        errorMessage: "Allocated Time is required." },
            { name: "kwhAllocated",        value: kwhAllocated,         errorMessage: "kWh Allocated is required." },
            { name: "perKwhCharge",        value: perKwhCharge,         errorMessage: "kWh Charge is required." },
            { name: "extraCharge",         value: extraCharge,          errorMessage: "Extra Charge is required." },
        ];
    
        // SINGLE-SELECT COMMUNITY (old):
        // const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isPasswordMatch }) => {
        //     if (!value) {
        //         errors[name] = errorMessage;
        //     } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
        //         errors[name] = errorMessage;
        //     } else if (isMobile && (isNaN(value) || value.length < 9)) {
        //         errors[name] = errorMessage;
        //     }
        //     return errors;
        // }, {});
        // MULTI-SELECT COMMUNITY (new): supports array validation for community field
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
                userId                     : userDetails?.user_id,
                email                      : userDetails?.email,
                resident_id                : residentId,
                resident_name              : residentName, 
                mobile_number              : getLocalMobile(),
                country_code               : phoneCountry?.dialCode ? `+${phoneCountry.dialCode}` : '+971',
                resident_email             : email,
                emirates                   : emirates?.value,
                vehicle_type               : vehicleType?.value,
                vehicle_make               : vehicleMake?.value,
                vehicle_model              : vehicleModel?.value,
                vehicle_specification      : vehicleSpecification?.value,
                vehicle_emirates           : plateEmirates?.value,
                vehicle_code               : plateCode,
                vehicle_number             : plateNumber,
                // SINGLE-SELECT COMMUNITY (old):
                // community_id               : community.value,
                // MULTI-SELECT COMMUNITY (new): send array of IDs to resident-edit API
                community_ids              : community.map((item) => item.value),
                address                    : address,
                monthly_session_allocation : sessionAllocation,
                alloted_time               : allocatedTime, 
                kwh_allocated              : kwhAllocated, 
                per_kwh_charge             : perKwhCharge, 
                extra_charge               : extraCharge
            }
            postRequestWithToken('resident-edit', obj, async (response) => {
                if (response.status === 1) {
                    toast(response.message , {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/community/resident-list');
                    }, 1000);
                } else {
                    const applied = applyBackendFieldErrors(response, setErrors, {
                        email: 'email',
                        contact: 'mobileNo',
                    });
                    if (!applied) {
                        toast(getBackendErrorMessage(response), { type: 'error' });
                    }
                    console.log('Error in resident-edit API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const fetchVehicleList = (type, selectedMake = null, selectedModel = null) => {
        if (!type) return;
        const apiEndpoint = type === 'Bike' ? 'vehicle-bike-brand-list' : 'vehicle-brand-list';
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
        postRequestWithToken(apiEndpoint, obj, (response) => {
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
                console.log(`error in ${apiEndpoint}`, response);
            }
        });
    };

    const fetchLocationList = (selectedEmirates = null) => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
        postRequestWithToken('location-list', obj, (response) => {
            if (response.code === 200) {
                const options = (response?.data || []).map((item) => ({
                    ...item,
                    location_id: item.value,
                    value: item.code || item.value,
                    label: item.code || item.label,
                }));
                setPlateEmiratesOptions(options);
                if (selectedEmirates) {
                    setPlateEmirates(
                        options.find((option) =>
                            option.value === selectedEmirates ||
                            option.code === selectedEmirates ||
                            option.location_id === selectedEmirates
                        ) || null
                    );
                }
            } else {
                console.log('error in location-list API', response);
            }
        });
    };

    const fetchDetails = () => {
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            resident_id : residentId,
        };

        postRequestWithToken('all-community-list', obj, (response) => {
            if (response.code === 200) {
                // SINGLE-SELECT COMMUNITY (old):
                // setCommunityOptions(response.data)
                // MULTI-SELECT COMMUNITY (new):
                setCommunityOptions(response.data || []);
            } else {
                // SINGLE-SELECT COMMUNITY (old):
                // console.log('error in rider-details API', response);
                // MULTI-SELECT COMMUNITY (new):
                console.log('error in all-community-list API', response);
            }
        });

        postRequestWithToken('resident-details', obj, (response) => {
            if (response.code === 200) {
                // MULTI-SELECT COMMUNITY (new): pre-select all communities assigned to this resident
                const residentData = response?.data || {};

                setResidentName(residentData?.resident_name);
                const dialCode = String(residentData?.country_code || '+971').replace('+', '');
                const mobileNo = residentData?.resident_mobile || '';
                setPhoneValue(`${dialCode}${mobileNo}`);
                setPhoneCountry({ dialCode, countryCode: 'ae' });
                setEmail(residentData?.resident_email);
                setEmirates(
                    emiratesOptions.find((option) => option.value === (residentData?.emirates || residentData?.emirate)) || null
                );
                setVehicleType(
                    vehicleTypeOptions.find((option) => option.value === residentData?.vehicle_type) || null
                );
                setVehicleSpecification(
                    vehicleSpecificationOptions.find(
                        (option) => option.value === residentData?.vehicle_specification
                    ) || null
                );
                setPlateCode(residentData?.vehicle_code || '');
                setPlateNumber(residentData?.vehicle_number || '');
                setResidentApiData(residentData);
                setCommunity(mapCommunitiesFromApiResponse(residentData, communityOptions));
                setAddress(residentData?.address);
                setSessionAllocation(residentData?.monthly_session_allocation);
                setkwhAllocated(residentData?.kwh_allocated);
                setAllocatedTime(residentData?.alloted_time);
                setPerKwhCharge(residentData?.per_kwh_charge);
                setExtraCharge(residentData?.extra_charge);

                fetchVehicleList(
                    residentData?.vehicle_type,
                    residentData?.vehicle_make,
                    residentData?.vehicle_model
                );
                fetchLocationList(residentData?.vehicle_emirates);
            } else {
                // SINGLE-SELECT COMMUNITY (old):
                // console.log('error in charger-installation-details API', response);
                // MULTI-SELECT COMMUNITY (new):
                console.log('error in resident-details API', response);
            }
        });
    };

    // MULTI-SELECT COMMUNITY (new): re-map selected values when dropdown options arrive after resident-details
    useEffect(() => {
        if (!residentApiData || communityOptions.length === 0) {
            return;
        }

        setCommunity(mapCommunitiesFromApiResponse(residentApiData, communityOptions));
    }, [residentApiData, communityOptions]);

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);
    
    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Edit Resident</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="residentName">Resident Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="residentName"
                                placeholder="Resident Name"
                                className={styles.inputField}
                                value={residentName}
                                onChange={(e) => setResidentName(e.target.value)}
                            />
                            {errors.residentName && residentName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.residentName}</p>}
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
                    </div>

                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="vehicleType">Vehicle Type</label>
                            <Select
                                className={styles.addShopSelect}
                                options={vehicleTypeOptions}
                                value={vehicleType}
                                onChange={handleVehicleTypeChange}
                                placeholder="Select Vehicle Type"
                                isClearable={true}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={selectMenuStyles}
                            />
                            {errors.vehicleType && !vehicleType && <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleType}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Vehicle Brand</label>
                            <Select
                                className={styles.addShopSelect}
                                options={vehicleMakeOption}
                                value={vehicleMake}
                                onChange={handleVehicleMakeChange}
                                placeholder="Select Vehicle Brand"
                                isClearable={true}
                                isDisabled={!vehicleType}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={selectMenuStyles}
                            />
                            {errors.vehicleMake && !vehicleMake && <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleMake}</p>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Vehicle Model</label>
                            <Select
                                className={styles.addShopSelect}
                                options={vehicleModelOption}
                                value={vehicleModel}
                                onChange={(selectedOption) => {
                                    setVehicleModel(selectedOption);
                                    setErrors((prev) => ({ ...prev, vehicleModel: '' }));
                                }}
                                placeholder="Select Vehicle Model"
                                isClearable={true}
                                isDisabled={!vehicleMake}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={selectMenuStyles}
                            />
                            {errors.vehicleModel && !vehicleModel && <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleModel}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Vehicle Details</label>
                            <div className={styles.vehicleSpecField}>
                                <div className={styles.vehicleSpecEmirates}>
                                    <Select
                                        className={styles.addShopSelect}
                                        options={plateEmiratesOptions}
                                        value={plateEmirates}
                                        onChange={(selectedOption) => {
                                            setPlateEmirates(selectedOption);
                                            setErrors((prev) => ({ ...prev, plateEmirates: '' }));
                                        }}
                                        placeholder="Emirates"
                                        isClearable={true}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        styles={{
                                            ...selectMenuStyles,
                                            menu: (base) => ({
                                                ...selectMenuStyles.menu(base),
                                                minWidth: 160,
                                            }),
                                        }}
                                    />
                                </div>
                                <div className={styles.vehicleSpecPlate}>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="plateCode"
                                        placeholder="Plate Code"
                                        className={styles.vehicleSpecInput}
                                        value={plateCode}
                                        onChange={(e) => {
                                            setPlateCode(e.target.value);
                                            setErrors((prev) => ({ ...prev, plateCode: '' }));
                                        }}
                                    />
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="plateNumber"
                                        placeholder="Plate Number"
                                        className={styles.vehicleSpecInput}
                                        value={plateNumber}
                                        onChange={(e) => {
                                            setPlateNumber(e.target.value);
                                            setErrors((prev) => ({ ...prev, plateNumber: '' }));
                                        }}
                                    />
                                </div>
                            </div>
                            {(errors.plateEmirates || errors.plateCode || errors.plateNumber) && (
                                <p className={styles.error} style={{ color: 'red' }}>
                                    {errors.plateEmirates || errors.plateCode || errors.plateNumber}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Vehicle Specification</label>
                            <Select
                                className={styles.addShopSelect}
                                options={vehicleSpecificationOptions}
                                value={vehicleSpecification}
                                onChange={(selectedOption) => {
                                    setVehicleSpecification(selectedOption);
                                    setErrors((prev) => ({ ...prev, vehicleSpecification: '' }));
                                }}
                                placeholder="Select Vehicle Specification"
                                isClearable={true}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={selectMenuStyles}
                            />
                            {errors.vehicleSpecification && !vehicleSpecification && (
                                <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleSpecification}</p>
                            )}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Community</label>
                            {/* MULTI-SELECT COMMUNITY (new): allows assigning resident to multiple communities */}
                            <div ref={serviceDropdownRef}>
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={communityOptions}
                                    value={community}
                                    onChange={handleCommunity}
                                    labelledBy="Select Communities"
                                    hasSelectAll={true}
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.community && community.length === 0 && (
                                <p className="error" style={{ color: 'red' }}>{errors.community}</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="fullAddress">Full Address</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Enter full address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            {errors.address && address === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.address}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="sessionAllocation">Monthly Session Allocation</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="sessionAllocation"
                                placeholder="Monthly Session Allocation"
                                className={styles.inputField}
                                value={sessionAllocation}
                                onChange={(e) => handleDecimalInput(e.target.value, setSessionAllocation)}
                            />
                            {errors.sessionAllocation && sessionAllocation === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.sessionAllocation}</p>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="allocatedTime">Allocated Time In Minute</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Allocated Time"
                                value={allocatedTime}
                                onChange={(e) => handleDecimalInput(e.target.value, setAllocatedTime)}
                            />
                            {errors.allocatedTime && allocatedTime === "" &&   <p className="error" style={{ color: 'red' }}>{errors.allocatedTime}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="kwhAllcation">kWh Allocation/Month</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="kwhAllcation"
                                placeholder="kWh Allocation/Month"
                                className={styles.inputField}
                                value={kwhAllocated}
                                onChange={(e) => handleDecimalInput(e.target.value, setkwhAllocated)}
                            />
                            {errors.kwhAllocated && kwhAllocated === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.kwhAllocated}</p>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="perkwhCharge">Per kWh charge (AED)</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Per kWh charge (AED)"
                                value={perKwhCharge}
                                onChange={(e) => handleDecimalInput(e.target.value, setPerKwhCharge)}
                            />
                            {errors.perKwhCharge && perKwhCharge === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.perKwhCharge}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="extraCharge">Extra Charge/Min Over Allocated Time (AED)</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="extraCharge"
                                placeholder="Extra Charge/Min Over Allocated Time (AED)"
                                className={styles.inputField}
                                value={extraCharge}
                                onChange={(e) => handleDecimalInput(e.target.value, setExtraCharge)}
                            />
                            {errors.extraCharge && extraCharge === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.extraCharge}</p>}
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
                            "Update Resident"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditResidents;
