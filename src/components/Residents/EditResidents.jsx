import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { AiOutlineClose } from 'react-icons/ai';
import styles from './EditResidents.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Add from '../../assets/images/Add.svg';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { applyBackendFieldErrors, getBackendErrorMessage } from '../../utils/mapBackendErrorsToFields';
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

const createEmptyVehicle = () => ({
    vehicleId              : null,
    vehicleType            : null,
    vehicleMake            : null,
    vehicleModel           : null,
    vehicleSpecification   : null,
    plateEmirates          : null,
    plateCode              : '',
    plateNumber            : '',
    vehicleMakeOption      : [],
    vehicleModelOption     : [],
});

const isVehicleRowPartial = (vehicle) => (
    vehicle.vehicleType
    || vehicle.vehicleMake
    || vehicle.vehicleModel
    || vehicle.vehicleSpecification
    || vehicle.plateEmirates
    || String(vehicle.plateCode || '').trim()
    || String(vehicle.plateNumber || '').trim()
);

const isVehicleRowComplete = (vehicle) => (
    vehicle.vehicleType
    && vehicle.vehicleMake
    && vehicle.vehicleModel
    && vehicle.vehicleSpecification
    && vehicle.plateEmirates
    && String(vehicle.plateCode || '').trim()
    && String(vehicle.plateNumber || '').trim()
);

const matchSelectOption = (options, candidate) => {
    if (candidate == null || candidate === '' || !Array.isArray(options)) return null;
    const normalized = String(candidate).trim().toLowerCase();
    return options.find((option) => (
        option.value === candidate
        || option.label === candidate
        || String(option.value ?? '').trim().toLowerCase() === normalized
        || String(option.label ?? '').trim().toLowerCase() === normalized
    )) || null;
};

const normalizeVehicleRecord = (vehicle = {}) => ({
    vehicle_id            : vehicle.vehicle_id ?? vehicle.resident_vehicle_id ?? vehicle.id ?? null,
    vehicle_type          : vehicle.vehicle_type,
    vehicle_make          : vehicle.vehicle_make,
    vehicle_model         : vehicle.vehicle_model,
    vehicle_specification : vehicle.vehicle_specification,
    vehicle_code          : vehicle.vehicle_code,
    vehicle_number        : vehicle.vehicle_number,
    vehicle_emirates      : vehicle.vehicle_emirates || vehicle.emirates,
});

const getVehiclesListFromResidentData = (data = {}) => {
    let list = data?.residentVehicles || data?.vehicles || data?.vehicle_list || [];
    if (typeof list === 'string') {
        try {
            list = JSON.parse(list);
        } catch {
            list = [];
        }
    }
    if (Array.isArray(list) && list.length > 0) {
        return list.map(normalizeVehicleRecord);
    }

    const legacy = normalizeVehicleRecord({
        vehicle_id            : data.vehicle_id,
        vehicle_type          : data.vehicle_type,
        vehicle_make          : data.vehicle_make,
        vehicle_model         : data.vehicle_model,
        vehicle_specification : data.vehicle_specification,
        vehicle_code          : data.vehicle_code,
        vehicle_number        : data.vehicle_number,
        vehicle_emirates      : data.vehicle_emirates || data.emirates,
    });

    if (
        legacy.vehicle_type
        || legacy.vehicle_make
        || legacy.vehicle_model
        || legacy.vehicle_code
        || legacy.vehicle_number
    ) {
        return [legacy];
    }

    return [];
};

/** Payload item for resident-edit: existing rows include vehicle_id; new rows omit it. */
const buildEditVehiclePayloadItem = (vehicle) => {
    const entry = {
        vehicle_type          : vehicle.vehicleType?.value,
        vehicle_make          : vehicle.vehicleMake?.value,
        vehicle_model         : vehicle.vehicleModel?.value,
        vehicle_specification : vehicle.vehicleSpecification?.value,
        vehicle_emirates      : vehicle.plateEmirates?.value,
        vehicle_code          : String(vehicle.plateCode || '').trim(),
        vehicle_number        : String(vehicle.plateNumber || '').trim(),
    };
    const id = vehicle.vehicleId;
    if (id != null && String(id).trim() !== '') {
        entry.vehicle_id = id;
    }
    return entry;
};

const EditResidents = () => {
    const { residentId }        = useParams();
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [residentName, setResidentName]           = useState('');
    const [phoneValue, setPhoneValue]               = useState('');
    const [phoneCountry, setPhoneCountry]           = useState({ dialCode: '971', countryCode: 'ae' });
    const [email, setEmail]                         = useState('');
    const [emirates, setEmirates]                   = useState(null);
    const [vehicles, setVehicles]                   = useState([createEmptyVehicle()]);
    const [plateEmiratesOptions, setPlateEmiratesOptions] = useState([]);
    const [community, setCommunity]                 = useState([]);
    const [address, setAddress]                     = useState('');
    const [sessionAllocation, setSessionAllocation] = useState('');
    const [allocatedTime, setAllocatedTime]         = useState('');
    const [kwhAllocated, setkwhAllocated]           = useState('');
    const [perKwhCharge, setPerKwhCharge]           = useState('');
    const [extraCharge, setExtraCharge]             = useState('');

    const serviceDropdownRef                      = useRef(null);
    const [communityOptions, setCommunityOptions] = useState([]);
    const [residentApiData, setResidentApiData]   = useState(null);

    const updateVehicleAt = (index, updates) => {
        setVehicles((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    };

    const clearVehicleFieldErrors = (index, fields = []) => {
        setErrors((prev) => {
            const next = { ...prev };
            fields.forEach((field) => {
                delete next[`${field}_${index}`];
            });
            delete next.vehicles;
            return next;
        });
    };

    const handleVehicleMakeChange = (index, selectedOption) => {
        updateVehicleAt(index, {
            vehicleMake        : selectedOption,
            vehicleModel       : null,
            vehicleModelOption : selectedOption?.models || [],
        });
        clearVehicleFieldErrors(index, ['vehicleMake', 'vehicleModel']);
    };

    const handleVehicleTypeChange = (index, selectedOption) => {
        updateVehicleAt(index, {
            vehicleType        : selectedOption,
            vehicleMake        : null,
            vehicleModel       : null,
            vehicleMakeOption  : [],
            vehicleModelOption : [],
        });
        clearVehicleFieldErrors(index, ['vehicleType', 'vehicleMake', 'vehicleModel']);
        if (selectedOption?.value) {
            fetchVehicleList(selectedOption.value, index);
        }
    };

    const addVehicle = () => {
        setVehicles((prev) => [...prev, createEmptyVehicle()]);
    };

    const handleRemoveVehicle = (index) => {
        setVehicles((prev) => prev.filter((_, i) => i !== index));
        setErrors((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((key) => {
                if (key.endsWith(`_${index}`)) {
                    delete next[key];
                }
            });
            delete next.vehicles;
            return next;
        });
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

    const handleCommunity = (selectedOptions) => {
        setCommunity(selectedOptions);
        if (selectedOptions.length > 0) {
            setErrors((prev) => ({ ...prev, community: '' }));
        }
    };

    const handleCancel = () => {
        navigate('/community/resident-list');
    };

    const validateForm = () => {
        const mobileNo = getLocalMobile();
        const fields = [
            { name: "residentName",        value: residentName,         errorMessage: "Residant Name is required." },
            { name: "mobileNo",            value: mobileNo,             errorMessage: "Please enter a valid Mobile No.", isMobile: true },
            { name: "email",               value: email,                errorMessage: "Please enter a valid Email ID.", isEmail: true },
            { name: "emirates",            value: emirates,             errorMessage: "Emirates is required." },
            { name: "community",           value: community,            errorMessage: "At least one community is required.", isArray: true },
            { name: "address",             value: address,              errorMessage: "Address is required." },
            { name: "sessionAllocation",   value: sessionAllocation,    errorMessage: "Session Allocation is required." },
            { name: "allocatedTime",       value: allocatedTime,        errorMessage: "Allocated Time is required." },
            { name: "kwhAllocated",        value: kwhAllocated,         errorMessage: "kWh Allocated is required." },
            { name: "perKwhCharge",        value: perKwhCharge,         errorMessage: "kWh Charge is required." },
            { name: "extraCharge",         value: extraCharge,          errorMessage: "Extra Charge is required." },
        ];

        const newErrors = fields.reduce((acc, { name, value, errorMessage, isEmail, isMobile, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                acc[name] = errorMessage;
            } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                acc[name] = errorMessage;
            } else if (isMobile && (isNaN(value) || value.length < 9)) {
                acc[name] = errorMessage;
            }
            return acc;
        }, {});

        let hasCompleteVehicle = false;
        vehicles.forEach((vehicle, index) => {
            const isFirstRow = index === 0;
            const hasPartial = isVehicleRowPartial(vehicle);

            if (isFirstRow || hasPartial) {
                if (!vehicle.vehicleType) {
                    newErrors[`vehicleType_${index}`] = 'Vehicle Type is required.';
                }
                if (!vehicle.vehicleMake) {
                    newErrors[`vehicleMake_${index}`] = 'Vehicle Brand is required.';
                }
                if (!vehicle.vehicleModel) {
                    newErrors[`vehicleModel_${index}`] = 'Vehicle Model is required.';
                }
                if (!vehicle.vehicleSpecification) {
                    newErrors[`vehicleSpecification_${index}`] = 'Vehicle Specification is required.';
                }
                if (!vehicle.plateEmirates) {
                    newErrors[`plateEmirates_${index}`] = 'Emirates is required.';
                }
                if (!String(vehicle.plateCode || '').trim()) {
                    newErrors[`plateCode_${index}`] = 'Plate Code is required.';
                }
                if (!String(vehicle.plateNumber || '').trim()) {
                    newErrors[`plateNumber_${index}`] = 'Plate Number is required.';
                }
                if (isVehicleRowComplete(vehicle)) {
                    hasCompleteVehicle = true;
                }
            }
        });

        if (!hasCompleteVehicle) {
            newErrors.vehicles = 'At least one complete vehicle is required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            const completeVehicles = vehicles.filter(isVehicleRowComplete);
            const vehiclePayload = completeVehicles.map(buildEditVehiclePayloadItem);
            const primaryVehicle = completeVehicles[0] || {};

            const obj = {
                userId                     : userDetails?.user_id,
                email                      : userDetails?.email,
                resident_id                : residentId,
                resident_name              : residentName,
                mobile_number              : getLocalMobile(),
                country_code               : phoneCountry?.dialCode ? `+${phoneCountry.dialCode}` : '+971',
                resident_email             : email,
                emirates                   : emirates?.value,
                vehicle_type               : primaryVehicle.vehicleType?.value,
                vehicle_make               : primaryVehicle.vehicleMake?.value,
                vehicle_model              : primaryVehicle.vehicleModel?.value,
                vehicle_specification      : primaryVehicle.vehicleSpecification?.value,
                vehicle_emirates           : primaryVehicle.plateEmirates?.value,
                vehicle_code               : String(primaryVehicle.plateCode || '').trim(),
                vehicle_number             : String(primaryVehicle.plateNumber || '').trim(),
                vehicles                   : JSON.stringify(vehiclePayload),
                community_ids              : community.map((item) => item.value),
                address                    : address,
                monthly_session_allocation : sessionAllocation,
                alloted_time               : allocatedTime,
                kwh_allocated              : kwhAllocated,
                per_kwh_charge             : perKwhCharge,
                extra_charge               : extraCharge,
            };
            postRequestWithToken('resident-edit', obj, async (response) => {
                if (response.status === 1) {
                    toast(response.message, { type: 'success' });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/community/resident-list');
                    }, 1000);
                } else {
                    const applied = applyBackendFieldErrors(response, setErrors, {
                        email: 'email',
                        contact: 'mobileNo',
                    });
                    const errorMessage = getBackendErrorMessage(response);
                    if (!applied) {
                        toast(errorMessage, { type: 'error' });
                    }
                    if (/unable to remove vehicle/i.test(errorMessage)) {
                        setErrors((prev) => ({ ...prev, vehicles: errorMessage }));
                    }
                    console.log('Error in resident-edit API:', response);
                    setLoading(false);
                }
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const fetchVehicleList = (type, index, selectedMake = null, selectedModel = null) => {
        if (!type) return;
        const apiEndpoint = type === 'Bike' ? 'vehicle-bike-brand-list' : 'vehicle-brand-list';
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
        postRequestWithToken(apiEndpoint, obj, (response) => {
            if (response.code === 200) {
                const options = response?.data || [];
                const makeOption = selectedMake ? matchSelectOption(options, selectedMake) : null;
                const modelOptions = makeOption?.models || [];
                updateVehicleAt(index, {
                    vehicleMakeOption  : options,
                    vehicleMake        : makeOption,
                    vehicleModelOption : modelOptions,
                    vehicleModel       : selectedModel
                        ? matchSelectOption(modelOptions, selectedModel)
                        : null,
                });
            } else {
                console.log(`error in ${apiEndpoint}`, response);
            }
        });
    };

    const hydrateVehiclesFromResident = (residentData, plateOptions) => {
        const rawList = getVehiclesListFromResidentData(residentData);
        if (rawList.length === 0) {
            setVehicles([createEmptyVehicle()]);
            return;
        }

        setVehicles(rawList.map(() => createEmptyVehicle()));

        rawList.forEach((raw, index) => {
            const typeOption = matchSelectOption(vehicleTypeOptions, raw.vehicle_type);
            const specOption = matchSelectOption(vehicleSpecificationOptions, raw.vehicle_specification);
            const plateOption = matchSelectOption(plateOptions, raw.vehicle_emirates)
                || plateOptions.find((option) =>
                    option.code === raw.vehicle_emirates
                    || option.location_id === raw.vehicle_emirates
                )
                || null;

            updateVehicleAt(index, {
                vehicleId            : raw.vehicle_id ?? null,
                vehicleType          : typeOption,
                vehicleSpecification : specOption,
                plateEmirates        : plateOption,
                plateCode            : raw.vehicle_code || '',
                plateNumber          : raw.vehicle_number || '',
            });

            if (raw.vehicle_type) {
                fetchVehicleList(raw.vehicle_type, index, raw.vehicle_make, raw.vehicle_model);
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
                setCommunityOptions(response.data || []);
            } else {
                console.log('error in all-community-list API', response);
            }
        });

        postRequestWithToken('resident-details', obj, (response) => {
            if (response.code === 200) {
                const residentData = response?.data || {};

                setResidentName(residentData?.resident_name);
                const dialCode = String(residentData?.country_code || '+971').replace('+', '');
                const mobileNo = residentData?.resident_mobile || '';
                setPhoneValue(`${dialCode}${mobileNo}`);
                setPhoneCountry({ dialCode, countryCode: 'ae' });
                setEmail(residentData?.resident_email);
                setEmirates(
                    matchSelectOption(emiratesOptions, residentData?.emirates || residentData?.emirate)
                );
                setResidentApiData(residentData);
                setCommunity(mapCommunitiesFromApiResponse(residentData, communityOptions));
                setAddress(residentData?.address);
                setSessionAllocation(residentData?.monthly_session_allocation);
                setkwhAllocated(residentData?.kwh_allocated);
                setAllocatedTime(residentData?.alloted_time);
                setPerKwhCharge(residentData?.per_kwh_charge);
                setExtraCharge(residentData?.extra_charge);

                postRequestWithToken('location-list', {
                    userId: userDetails?.user_id,
                    email: userDetails?.email,
                }, (locResponse) => {
                    if (locResponse.code === 200) {
                        const plateOptions = (locResponse?.data || []).map((item) => ({
                            ...item,
                            value: item.code || item.value,
                            label: item.code || item.label,
                        }));
                        setPlateEmiratesOptions(plateOptions);
                        hydrateVehiclesFromResident(residentData, plateOptions);
                    } else {
                        hydrateVehiclesFromResident(residentData, []);
                    }
                });
            } else {
                console.log('error in resident-details API', response);
            }
        });
    };

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
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Resident Details</div>
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
                                    disabled
                                    disableDropdown
                                    containerClass={`${styles.phoneInputContainer} ${styles.phoneInputLocked}`}
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
                                    disabled
                                    readOnly
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
                                <label className={styles.addShopLabel}>Community</label>
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
                    </div>

                    <div className={styles.formSectionBlock}>
                        <div className={styles.sectionHeadingRow}>
                            <div className={styles.formSectionHeading}>Vehicle Details</div>
                            <button type="button" onClick={addVehicle} className={styles.featureButton}>
                                <img src={Add} alt="Add" className={styles.addImg} />
                                <span>Add</span>
                            </button>
                        </div>
                        {vehicles.map((vehicle, index) => (
                            <div key={index} className={styles.vehicleEntryBlock}>
                                {index > 0 && (
                                    <div className={styles.vehicleEntryHeader}>
                                        <button
                                            type="button"
                                            className={styles.removeButton}
                                            style={{ position: 'static' }}
                                            onClick={() => handleRemoveVehicle(index)}
                                        >
                                            <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                        </button>
                                    </div>
                                )}
                                <div className={styles.row}>
                                    <div className={styles.addShopInputContainer}>
                                        <label className={styles.addShopLabel} htmlFor={`vehicleType-${index}`}>Vehicle Type</label>
                                        <Select
                                            className={styles.addShopSelect}
                                            options={vehicleTypeOptions}
                                            value={vehicle.vehicleType}
                                            onChange={(selectedOption) => handleVehicleTypeChange(index, selectedOption)}
                                            placeholder="Select Vehicle Type"
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            styles={selectMenuStyles}
                                        />
                                        {errors[`vehicleType_${index}`] && (
                                            <p className={styles.error} style={{ color: 'red' }}>{errors[`vehicleType_${index}`]}</p>
                                        )}
                                    </div>
                                    <div className={styles.addShopInputContainer}>
                                        <label className={styles.addShopLabel}>Vehicle Brand</label>
                                        <Select
                                            className={styles.addShopSelect}
                                            options={vehicle.vehicleMakeOption}
                                            value={vehicle.vehicleMake}
                                            onChange={(selectedOption) => handleVehicleMakeChange(index, selectedOption)}
                                            placeholder="Select Vehicle Brand"
                                            isClearable={true}
                                            isDisabled={!vehicle.vehicleType}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            styles={selectMenuStyles}
                                        />
                                        {errors[`vehicleMake_${index}`] && (
                                            <p className={styles.error} style={{ color: 'red' }}>{errors[`vehicleMake_${index}`]}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.addShopInputContainer}>
                                        <label className={styles.addShopLabel}>Vehicle Model</label>
                                        <Select
                                            className={styles.addShopSelect}
                                            options={vehicle.vehicleModelOption}
                                            value={vehicle.vehicleModel}
                                            onChange={(selectedOption) => {
                                                updateVehicleAt(index, { vehicleModel: selectedOption });
                                                clearVehicleFieldErrors(index, ['vehicleModel']);
                                            }}
                                            placeholder="Select Vehicle Model"
                                            isClearable={true}
                                            isDisabled={!vehicle.vehicleMake}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            styles={selectMenuStyles}
                                        />
                                        {errors[`vehicleModel_${index}`] && (
                                            <p className={styles.error} style={{ color: 'red' }}>{errors[`vehicleModel_${index}`]}</p>
                                        )}
                                    </div>
                                    <div className={styles.addShopInputContainer}>
                                        <label className={styles.addShopLabel}>Vehicle Details</label>
                                        <div className={styles.vehicleSpecField}>
                                            <div className={styles.vehicleSpecEmirates}>
                                                <Select
                                                    className={styles.addShopSelect}
                                                    options={plateEmiratesOptions}
                                                    value={vehicle.plateEmirates}
                                                    onChange={(selectedOption) => {
                                                        updateVehicleAt(index, { plateEmirates: selectedOption });
                                                        clearVehicleFieldErrors(index, ['plateEmirates']);
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
                                                    id={`plateCode-${index}`}
                                                    placeholder="Plate Code"
                                                    className={styles.vehicleSpecInput}
                                                    value={vehicle.plateCode}
                                                    onChange={(e) => {
                                                        updateVehicleAt(index, { plateCode: e.target.value });
                                                        clearVehicleFieldErrors(index, ['plateCode']);
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    autoComplete="off"
                                                    id={`plateNumber-${index}`}
                                                    placeholder="Plate Number"
                                                    className={styles.vehicleSpecInput}
                                                    value={vehicle.plateNumber}
                                                    onChange={(e) => {
                                                        updateVehicleAt(index, { plateNumber: e.target.value });
                                                        clearVehicleFieldErrors(index, ['plateNumber']);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {(errors[`plateEmirates_${index}`] || errors[`plateCode_${index}`] || errors[`plateNumber_${index}`]) && (
                                            <p className={styles.error} style={{ color: 'red' }}>
                                                {errors[`plateEmirates_${index}`] || errors[`plateCode_${index}`] || errors[`plateNumber_${index}`]}
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
                                            value={vehicle.vehicleSpecification}
                                            onChange={(selectedOption) => {
                                                updateVehicleAt(index, { vehicleSpecification: selectedOption });
                                                clearVehicleFieldErrors(index, ['vehicleSpecification']);
                                            }}
                                            placeholder="Select Vehicle Specification"
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            styles={selectMenuStyles}
                                        />
                                        {errors[`vehicleSpecification_${index}`] && (
                                            <p className={styles.error} style={{ color: 'red' }}>{errors[`vehicleSpecification_${index}`]}</p>
                                        )}
                                    </div>
                                    <div className={styles.addShopInputContainer} aria-hidden="true" />
                                </div>
                            </div>
                        ))}
                        {errors.vehicles && (
                            <p className={styles.error} style={{ color: 'red' }}>{errors.vehicles}</p>
                        )}
                    </div>

                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Session Details</div>
                        <div className={styles.row}>
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
                                {errors.allocatedTime && allocatedTime === "" && <p className="error" style={{ color: 'red' }}>{errors.allocatedTime}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
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
                        </div>
                        <div className={styles.row}>
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
                            <div className={styles.addShopInputContainer} aria-hidden="true" />
                        </div>
                    </div>

                    <div className={styles.editButton}>
                        <button type="button" className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
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
