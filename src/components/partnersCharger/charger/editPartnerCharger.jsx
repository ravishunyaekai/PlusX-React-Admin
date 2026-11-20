import { useState, useRef, useEffect } from "react";
import Select from "react-select";
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './addPartnerCharger.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../SharedComponent/Loader/Loader';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ReactInputMask from "react-input-mask"
import Add from '../../../assets/images/Add.svg';
import PhoneInput from 'react-phone-input-2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-phone-input-2/lib/style.css';
import { applyBackendFieldErrors, getBackendErrorMessage } from '../../../utils/mapBackendErrorsToFields';
import {
    buildPartnerChargerPayload,
    findSelectOption,
    installationDateFromApi,
    mapStationListToOptions,
    readPartnerChargerDetails,
    stationSelectOption,
} from '../../../utils/partnerChargerFormHelpers';
import InputMask from 'react-input-mask';

const chargerTypeOptions = [
    { value: 'AC',   label: 'AC' },
    { value: 'DC',   label: 'DC' },
];

const connectorTypeOptions = [
    { value: 'Type 2',          label: 'Type 2' },
    { value: 'CCS2',            label: 'CCS2' },
    { value: 'CHAdeMO',         label: 'CHAdeMO' },
    { value: 'GB/T',            label: 'GB/T' },
    { value: 'Type 1',          label: 'Type 1' },
];

const inputSupplyOption = [
    { value: 'Single Phase',    label: 'Single Phase' },
    { value: 'Three Phase',     label: 'Three Phase' },
    { value: 'Industrial',      label: 'Industrial' },
];

const initialAdministrativeStatusOption = [
    { value: 'Active',              label: 'Active' },
    { value: 'Pending Connection',  label: 'Pending Connection' },
    { value: 'Available',            label: 'Available' },
    { value: 'Charging',            label: 'Charging' },
    { value: 'Faulty',              label: 'Faulty' },
    { value: 'Inactive',            label: 'Inactive' },
];

// const MIN_MOBILE_DIGITS = 9;
// const EMAIL_REGEX = /\S+@\S+\.\S+/;

// const isValidEmailFormat = (value) => EMAIL_REGEX.test(String(value || '').trim());
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

const EditPartnerCharger = () => {
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const { chargerId: routeChargerId } = useParams();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(true);

    const [chargerName, setChargerName]               = useState('');
    const [station, setStation]                       = useState(null);
    const [manufacturer, setManufacturer]             = useState('');
    const [model, setModel]                           = useState('');
    const [serialNumber, setSerialNumber]             = useState('');
    const [chargerType, setChargerType]               = useState(null);
    const [ratedPower, setRatedPower]                 = useState('');
    const [connectorType, setConnectorType]           = useState(null);
    const [noOfConnector, setNoOfConnector]           = useState('');
    const [inputSupply, setInputSupply]               = useState(null);
    const [outputVoltage, setOutputVoltage]           = useState('');
    const [installationDate, setInstallationDate]     = useState('');
    const [adminStatus, setAdminStatus]               = useState(null);
    const [sim, setSim]                               = useState('');
    const [imei, setImei]                             = useState('');
    const [note, setNote]                             = useState('');
    const [stationOptions, setStationOptions]         = useState([]);
    const [chargerDetailsCache, setChargerDetailsCache] = useState(null);

    const fetchStationOptions = () => {
        postRequestWithToken('all-partner-station-list', {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        }, (response) => {
            const ok = response.code === 200 || Number(response.status) === 1;
            if (ok) {
                setStationOptions(mapStationListToOptions(response.data));
            }
        });
    };

    const hydrateForm = (data = {}) => {
        const fields = readPartnerChargerDetails(data);
        setChargerName(fields.chargerName);
        setStation(stationSelectOption(fields.stationId, fields.stationName, stationOptions));
        setManufacturer(fields.manufacturer);
        setModel(fields.model);
        setSerialNumber(fields.serialNumber);
        setChargerType(findSelectOption(chargerTypeOptions, fields.chargerType));
        setRatedPower(fields.ratedPower !== '' && fields.ratedPower != null ? String(fields.ratedPower) : '');
        setConnectorType(findSelectOption(connectorTypeOptions, fields.connectorType));
        setNoOfConnector(fields.noOfConnector !== '' && fields.noOfConnector != null ? String(fields.noOfConnector) : '');
        setInputSupply(findSelectOption(inputSupplyOption, fields.inputSupply));
        setOutputVoltage(fields.outputVoltage !== '' && fields.outputVoltage != null ? String(fields.outputVoltage) : '');
        setInstallationDate(installationDateFromApi(fields.installationDate));
        setAdminStatus(findSelectOption(initialAdministrativeStatusOption, fields.adminStatus));
        setSim(fields.sim);
        setImei(fields.imei);
        setNote(fields.note);
    };

    const fetchChargerDetails = () => {
        if (!routeChargerId) {
            toast.error('Invalid charger.');
            navigate('/partners/charger-list');
            return;
        }
        setDetailsLoading(true);
        postRequestWithToken('partner-charger-details', {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            charger_id : routeChargerId,
        }, (response) => {
            const ok = response.code === 200 || Number(response.status) === 1;
            if (ok && response.data) {
                setChargerDetailsCache(response.data);
                hydrateForm(response.data);
            } else {
                toast(getBackendErrorMessage(response, 'Failed to load charger.'), { type: 'error' });
            }
            setDetailsLoading(false);
        });
    };

    const handleCancel = () => {
        navigate('/partners/charger-list')
    }
    
    const validateForm = () => {
        // const mobileNo = getLocalMobile();
        const fields = [
            { name: "chargerName",         value: chargerName,          errorMessage: "charger Name is required." },
            { name: "station",             value: station,              errorMessage: "Station is required." },
            { name: "manufacturer",        value: manufacturer,         errorMessage: "Manufacturer is required." },
            { name: "model",               value: model,                errorMessage: "Model is required." },
            { name: "serialNumber",        value: serialNumber,         errorMessage: "Serial Number is required." },
            { name: "chargerType",         value: chargerType,          errorMessage: "Charger Type is required." },
            { name: "ratedPower",          value: ratedPower,           errorMessage: "Rated Power is required." },
            { name: "connectorType",       value: connectorType,        errorMessage: "Connector Type is required." },
            { name: "noOfConnector",       value: noOfConnector,        errorMessage: "Number Of Connector is required." },
            { name: "inputSupply",         value: inputSupply,          errorMessage: "Input Supply is required." },
            { name: "outputVoltage",       value: outputVoltage,        errorMessage: "Output Voltage is required." },
            { name: "installationDate",    value: installationDate,     errorMessage: "Installation Date is required." },
            { name: "adminStatus",         value: adminStatus,          errorMessage: "Initial Administrative Status is required." },
            { name: "note",                value: note,                 errorMessage: "Installation Notes is required." },
        ];

        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isPasswordMatch, isArray }) => {
            if (!value) {
                errors[name] = errorMessage;
            } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                errors[name] = errorMessage;
            } else if (isMobile && (isNaN(value) || value.length < 9)) {
                errors[name] = errorMessage;
                
            } 
            // else if (isPasswordMatch && value !== password) {
            //     errors[name] = errorMessage;
               
            // } else if (name === 'password' && value.length < 6) {
            //     errors[name] = "Password should be at least 6 characters long.";
            // }
            return errors;
        }, {});

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (validateForm()) {
            const obj = buildPartnerChargerPayload({
                chargerId: routeChargerId,
                chargerName,
                station,
                manufacturer,
                model,
                serialNumber,
                chargerType,
                ratedPower,
                connectorType,
                noOfConnector,
                inputSupply,
                outputVoltage,
                installationDate,
                adminStatus,
                sim,
                imei,
                note,
            }, userDetails);

            postRequestWithToken('partner-charger-edit', obj, async (response) => {
                if (response.status === 1 || response.code === 200) {
                    toast(getBackendErrorMessage(response, 'Charger updated successfully!'), { type: 'success' });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/partners/charger-list');
                    }, 1000);
                } else {
                    const applied = applyBackendFieldErrors(
                        response,
                        setErrors,
                        {},
                        {},
                        [{ match: 'charger_id', key: 'chargerId', label: 'Charger ID' }]
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

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchStationOptions();
    }, []);

    useEffect(() => {
        if (!userDetails?.access_token) return;
        fetchChargerDetails();
    }, [routeChargerId]);

    useEffect(() => {
        if (!chargerDetailsCache) return;
        hydrateForm(chargerDetailsCache);
    }, [stationOptions]);

    if (detailsLoading) {
        return (
            <div className={styles.addShopContainer}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Edit Charger</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>General Information</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="chargerName">Charger Name</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="chargerName"
                                    placeholder="Charger Name"
                                    className={styles.inputField}
                                    value={chargerName}
                                    onChange={(e) => setChargerName(e.target.value)}
                                />
                                {errors.chargerName && chargerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Station</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={stationOptions}
                                    value={station}
                                    onChange={(selectedOption) => {
                                        setStation(selectedOption);
                                        setErrors((prev) => ({ ...prev, station: '' }));
                                    }}
                                    placeholder="Select Station"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.station && !station && <p className={styles.error} style={{ color: 'red' }}>{errors.station}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="manufacturer">Manufacturer</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="manufacturer"
                                    placeholder="Manufacturer"
                                    className={styles.inputField}
                                    value={manufacturer}
                                    onChange={(e) => setManufacturer(e.target.value)}
                                />
                                {errors.manufacturer && manufacturer === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.manufacturer}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="model">Model</label>
                                <input
                                    className={styles.inputField}
                                    type="text"
                                    autoComplete='off'
                                    placeholder="Model"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                />
                                {errors.model && model === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.model}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.addShopInputContainer} ${styles.fieldHalfWidth}`}>
                                <label className={styles.addShopLabel} htmlFor="serialNumber">Serial Number</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="serialNumber"
                                    placeholder="Serial Number"
                                    className={styles.inputField}
                                    value={serialNumber}
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                />
                                {errors.serialNumber && serialNumber === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.serialNumber}</p>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Charger Configuration</div>
                        
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Charger Type</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={chargerTypeOptions}
                                    value={chargerType}
                                    onChange={(selectedOption) => {
                                        setChargerType(selectedOption);
                                        setErrors((prev) => ({ ...prev, chargerType: '' }));
                                    }}
                                    placeholder="Select Charger Type"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.chargerType && !chargerType && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="ratedPower">Rated Power (kW)</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="ratedPower"
                                    placeholder="Rated Power (kW)"
                                    className={styles.inputField}
                                    value={ratedPower}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                        if (/^\d*\.?\d*$/.test(value)) {
                                            setRatedPower(value);
                                        }
                                    }}
                                />
                                {errors.ratedPower && ratedPower === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.ratedPower}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Connector Type</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={connectorTypeOptions}
                                    value={connectorType}
                                    onChange={(selectedOption) => {
                                        setConnectorType(selectedOption);
                                        setErrors((prev) => ({ ...prev, connectorType: '' }));
                                    }}
                                    placeholder="Select Connector Type"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.connectorType && !connectorType && <p className={styles.error} style={{ color: 'red' }}>{errors.connectorType}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="noOfConnectors">Number of Connectors</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="noOfConnector"
                                    placeholder="Number of Connectors"
                                    className={styles.inputField}
                                    value={noOfConnector}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                        if (/^\d*\.?\d*$/.test(value)) {
                                            setNoOfConnector(value);
                                        }
                                    }}
                                />
                                {errors.noOfConnector && noOfConnector === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.noOfConnector}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Input Supply</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={inputSupplyOption}
                                    value={inputSupply}
                                    onChange={(selectedOption) => {
                                        setInputSupply(selectedOption);
                                        setErrors((prev) => ({ ...prev, inputSupply: '' }));
                                    }}
                                    placeholder="Select Input Supply"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.inputSupply && !inputSupply && <p className={styles.error} style={{ color: 'red' }}>{errors.inputSupply}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="outputVoltage">Maximum Output Voltage (V)</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="outputVoltage"
                                    placeholder="Maximum Output Voltage (V)"
                                    className={styles.inputField}
                                    value={outputVoltage}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                        if (/^\d*\.?\d*$/.test(value)) {
                                            setOutputVoltage(value);
                                        }
                                    }}
                                />
                                {errors.outputVoltage && outputVoltage === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.outputVoltage}</p>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Installation & Status</div>
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Installation Date</label>
                                <InputMask
                                    mask="99-99-9999"
                                    value={installationDate}
                                    onChange={(e) => {
                                        setInstallationDate(e.target.value);
                                        if (errors.installationDate && e.target.value.length === 10) {
                                            setErrors((prevErrors) => ({ ...prevErrors, installationDate: "" }));
                                        }
                                    }}
                                    onBlur={() => {
                                        if (installationDate.length === 10) {
                                            const [day, month, year] = installationDate.split('-');
                                            const isValidDate =
                                            !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                            day <= 31 && month <= 12; 
                                            if (!isValidDate) {
                                                setErrors((prevErrors) => ({
                                                    ...prevErrors,
                                                    installationDate: "Invalid date in DD-MM-YYYY format",
                                                }));
                                            }
                                        }
                                    }}
                                    placeholder="DD-MM-YYYY"
                                    className={styles.inputCharger}
                                />
                                {errors.installationDate && installationDate ==='' && <p className="error">{errors.installationDate}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Initial Administrative Status</label>
                                <Select
                                    className={styles.addShopSelect}
                                    options={initialAdministrativeStatusOption}
                                    value={adminStatus}
                                    onChange={(selectedOption) => {
                                        setAdminStatus(selectedOption);
                                        setErrors((prev) => ({ ...prev, adminStatus: '' }));
                                    }}
                                    placeholder="Select Input Supply"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={selectMenuStyles}
                                />
                                {errors.adminStatus && !adminStatus && <p className={styles.error} style={{ color: 'red' }}>{errors.adminStatus}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="sim">SIM ICCID</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="sim"
                                    placeholder="SIM ICCID"
                                    className={styles.inputField}
                                    value={sim}
                                    onChange={(e) => setSim(e.target.value)}
                                />
                                {errors.sim && sim === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.sim}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="imei">IMEI</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="imei"
                                    placeholder="IMEI"
                                    className={styles.inputField}
                                    value={imei}
                                    onChange={(e) => setImei(e.target.value)}
                                />
                                {errors.imei && imei === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.imei}</p>}
                            </div>
                        </div>
                        
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="note">Installation Notes</label>
                                <textarea
                                    id="note"
                                    placeholder="Enter Installation Notes"
                                    className={styles.inputField}
                                    rows="4"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                                {errors.note && note === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.note}</p>}
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
                            "Edit Charger"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );

};

export default EditPartnerCharger;
