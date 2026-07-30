import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import UploadIcon from '../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './editShare.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// /import ReactInputMask from "react-input-mask";
// import InputMask from 'react-input-mask';

const EditChargeShare = () => {
    const { chargeId }  = useParams()
    const userDetails  = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate     = useNavigate();
    
    const [file, setFile]     = useState(null);
    const [errors, setErrors] = useState({}); 

    const [customerName, setCustomerName] = useState("");
    const [email, setEmail]               = useState("");
    const [mobile, setmobile]             = useState("");

    const [chargerName, setChargerName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress]         = useState("")
    const [latitude, setLatitude]       = useState("")
    const [longitude, setLongitude]     = useState("")

    const [chargerType, setChargerType]     = useState("");
    const [outputPower, setOutputPower]     = useState("");
    const [connectorType, setConnectorType] = useState("");
    const [compatible, setCompatible]       = useState([]);
    const [parkingNo, setParkingNo]         = useState("");
    const [parkingFloor, setParkingFloor]   = useState("");
    const [openDays, setOpenDays]           = useState([]);
    const [startTime, setStartTime]         = useState("");
    const [endTime, setEndTime]             = useState("");
     
    const [loading, setLoading] = useState(false);
    const [baseUrl, setBaseUrl] = useState();

    const chargerTypeOption = [ { value: "AC", label: "AC" }, { value: "DC", label: "DC" } ];    
    const [outputPowerOption, setoutputPowerOption]     = useState([]);
    const [outputACOption, setOutputACOption]           = useState([]);
    const [outputDCOption, setOutputDCOption]           = useState([]);
    const [connectorTypeOption, setConnectorTypeOption] = useState([]);
    const [compatibleOption, setCompatibleOption]       = useState([]);
    const [daysOption, setDaysOption]                   = useState([]);
     
    const brandDropdownRef   = useRef(null);
    const obj = {
        userId     : userDetails?.user_id,
        email      : userDetails?.email,
        charger_id : chargeId
    };
    const fetchDetails = () => {
        
        postRequestWithToken('charge-share-master', obj, (response) => {
            if (response.code === 200) {

                setCompatibleOption(response?.make_list);
                setOutputACOption(response?.AC_output);
                setOutputDCOption(response?.DC_output);
                setConnectorTypeOption(response?.connector);
            
                const daysL = (response?.weeks || []).map(item => ({ label: item, value: item }));
                setDaysOption(daysL);
            } else {
                console.log('error in rider-details API', response);
            }
        });
        postRequestWithToken('charge-share-details', obj, (response) => {
            
            if (response.code === 200) {
                const data = response?.data || {};
                
                setCustomerName(data?.rider_name || "");
                setEmail(data?.email || "");
                setmobile(data?.mobile || "");
                setChargerName(data?.charger_name || "");
                setDescription(data?.description || "");
                setAddress(data?.address || "")
                setLatitude(data?.latitude || "");
                setLongitude(data?.longitude || "");
                setChargerType({ label: data?.charger_type, value: data?.charger_type });
                setOutputPower({ label: data?.output, value: data?.output } );
                setConnectorType({ label: data?.connector_type, value: data?.connector_type });
                
                const compatibleD = (data?.compatible || []).map(item => ({
                    label: item,
                    value: item
                }));
                setCompatible(compatibleD);

                setParkingNo(data?.park_no || "");
                setParkingFloor(data?.park_floor || "");

                const daysS = (data?.open_days || []).map(item => ({
                    label: item,
                    value: item
                }));
                setOpenDays(daysS);
                
                const timingArr = data?.open_timing[0].split("-") || [];
                if (Array.isArray(timingArr) && timingArr.length >= 2) {
                    setStartTime(timingArr[0]);
                    setEndTime(timingArr[1]);
                }
                setFile(data?.charger_image || "");             
                setBaseUrl(response?.base_url);
                
            } else {
                console.error('Error in charger-share-details API', response);
            }
        });
    };
    
    const setOutputPowerOptions = (typeObj) => {
        if (!typeObj?.value) return;

        if (typeObj.value === 'AC') {
            setoutputPowerOption(outputACOption || []);
        } else if (typeObj.value === 'DC') {
            setoutputPowerOption(outputDCOption || []);
        }
    };
    useEffect(() => {
        if (chargerType?.value) {
            setOutputPowerOptions(chargerType);
        }
    }, [chargerType, outputACOption, outputDCOption]);

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);
     
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            alert('Please upload a valid image file.');
        }
    };
    const handleRemoveImage = () => setFile(null);

    const handleOnBlur = (value) => {
        const currentAddress = value
    
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: currentAddress }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();
        
                setLatitude(lat)
                setLongitude(lng)
            } 
        });
    };

    const validateForm = () => {
        const fields = [
            { name: "customerName",  value: customerName,  errorMessage: "Customer Name is required."},
            { name: "email",         value: email,         errorMessage: "Email is required.", },
            { name: "mobile",        value: mobile,        errorMessage: "Contact No. is required."},
            { name: "chargerName",   value: chargerName,   errorMessage: "Charger Name is required." },
            { name: "description",   value: description,   errorMessage: "description is required."},
            { name: "address",       value: address,       errorMessage: "Address is required."},
            { name: "latitude",      value: latitude,      errorMessage: "latitude is required."},
            { name: "longitude",     value: longitude,     errorMessage: "longitude is required."},
            { name: "chargerType",   value: chargerType,   errorMessage: "Type Of Service is required."},
            { name: "outputPower",   value: outputPower,   errorMessage: "Output Power is required."},
            { name: "connectorType", value: connectorType, errorMessage: "Type Of Service is required."},
            { name: "compatible",    value: compatible,   errorMessage: "compatible is required.", isArray: true},
            { name: "openDays",    value: openDays,  errorMessage: "Warranty Expiry is required.", isArray: true},
            { name: "startTime",   value: startTime, errorMessage: "Date of Installation is required."},
            { name: "endTime",     value: endTime,   errorMessage: "Date of Installation is required."},
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            
            if ( (!isArray && !value) || ( isArray && (!value || value.length === 0) )) {
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

        if ( validateForm() ) {
            
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);

            formData.append("charger_id", chargeId);
            formData.append("customer_name", customerName);
            formData.append("customer_email", email);
            formData.append("customer_mobile", mobile);

            formData.append("charger_name", chargerName);
            formData.append("description", description);
            formData.append("address", address);
            formData.append("latitude", latitude)
            formData.append("longitude", longitude);

            formData.append("charger_type", chargerType.value); 
            formData.append("output_power", outputPower.value); 
            formData.append("connector_type", connectorType.value); 
            formData.append("compatible", JSON.stringify(compatible.map(cmp => cmp.value) ) );
            formData.append("parking_no", parkingNo);
            formData.append("parking_floor", parkingFloor);
            formData.append("open_days",  JSON.stringify(openDays.map(dt => dt.value) )); 
            formData.append("open_timing", JSON.stringify( [`${startTime}-${endTime}`] ) );
             
            if (file) {
                formData.append("charger_image", file);
            }
            
            postRequestWithTokenAndFile('charge-share-accept', formData, async (response) => {
                if (response.status === 1) {
            
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/charger-share/request-list');
                    }, 2000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in public-charger-add-station API:', response);
                    setLoading(false);
                }
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const handleCancel = () => { 
        const confirmDelete = window.confirm("Are you sure you want to reject this?");
        if (confirmDelete) {
            postRequestWithToken('charge-share-reject', obj, (response) => {
                if (response.status === 1) {
                
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/charger-share/request-list');
                    }, 2000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in chargeShare API:', response);
                    setLoading(false);
                }
            });
        }
    }
    const [isActive, setIsActive] = useState(false);

    const handleChargerType = (selectedOptions) => {

        setChargerType(selectedOptions);
        if(selectedOptions.value == 'AC') {
            setoutputPowerOption(outputACOption);

        } else {
            setoutputPowerOption(outputDCOption);
        }
    }    
    const handleOutputPower = (selectedOptions) => {
        setOutputPower(selectedOptions)
    }
    const hanldeConnectorType = (selectedOptions) => {
        setConnectorType(selectedOptions)
    }
    const handleCompatibility = (selectedOptions) => {
        setCompatible(selectedOptions)
    }
    const handleDay = (selectedOptions) => {
        setOpenDays(selectedOptions);
    }
    console.log(chargerName == null,  chargerName == "");
    console.log(errors);
    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Edit Charge Share</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="custName">Customer Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="custName"
                                placeholder="Shop Name"
                                className={styles.inputField}
                                value={customerName}
                                readonly
                            />
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Contact No.</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Contact No."
                                value={mobile}
                                readonly
                            />
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
                                readonly
                            />
                        </div>
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
                            {errors.chargerName && chargerName == "" && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                placeholder="Enter description"
                                className={styles.inputField}
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.description && description == '' && <p className="error">{errors.description}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="fullAddress">Address</label>
                            <textarea
                                id="fullAddress"
                                placeholder="Enter full address"
                                className={styles.inputField}
                                rows="4"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                // onBlur={(e) => handleOnBlur(e.target.value)}
                            />
                            {errors.address && address == '' && <p className="error">{errors.address}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="chargerName">Charger Type</label>
                            <Select
                                className={styles.addShopSelect}
                                options={chargerTypeOption}
                                value={chargerType}
                                onChange={handleChargerType}
                                placeholder="Select Charger Type"
                                isClearable={true}
                            />
                            {errors.chargerName && chargerName == "" && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="Output">Output Power</label>
                            <div ref={brandDropdownRef}>
                                
                                <Select
                                    className={styles.addShopSelect}
                                    options={outputPowerOption}
                                    value={outputPower}
                                    onChange={handleOutputPower}
                                    placeholder="Select Output Power"
                                    isClearable={true}
                                />
                            </div>
                            {errors.outputPower && outputPower.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.outputPower}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="chargerName">Type Of Connector</label>
                            <Select
                                className={styles.addShopSelect}
                                options={connectorTypeOption}
                                value={connectorType}
                                onChange={hanldeConnectorType}
                                placeholder="Select Service"
                                isClearable={true}
                            />
                            {errors.chargerName && chargerName == "" && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="Output">Compatible With</label>
                            <div ref={brandDropdownRef}>
                                
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={compatibleOption}
                                    value={compatible}
                                    onChange={handleCompatibility}
                                    labelledBy="Compatible"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.compatible && compatible.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.compatible}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="custName">Parking Number</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="custName"
                                placeholder="Parking Number"
                                className={styles.inputField}
                                value={parkingNo}
                                onChange={(e) => setParkingNo(e.target.value)}
                            />
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Parking Floor</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Parking Floor"
                                value={parkingFloor}
                                onChange={(e) => setParkingFloor(e.target.value)}
                            />
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
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^-?\d*\.?\d{0,21}$/.test(value)) {
                                        setLatitude(value);
                                    }
                                }}
                            />
                            {errors.latitude && latitude == '' && <p className="error">{errors.latitude}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="longitude">Longitude</label>
                            <input type="text"
                                autoComplete="off"
                                id="longitude"
                                placeholder="Longitude"
                                className={styles.inputField}
                                value={longitude}
                                // onChange={(e) => setLongitude(e.target.value)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^-?\d*\.?\d{0,21}$/.test(value)) {
                                        setLongitude(value);
                                    }
                                }}
                            />
                            {errors.longitude && longitude == '' &&  <p className="error">{errors.longitude}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer} style={{width: "52%"}}>
                            <label className={styles.addShopLabel} htmlFor="Output">Days & Time</label>
                            <div ref={brandDropdownRef}>
                                
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={daysOption}
                                    value={openDays}
                                    onChange={handleDay}
                                    labelledBy="Days"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.openDays && openDays.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.openDays}</p>}
                        </div>
                        <div className={styles.addShopInputContainer} style={{width: "25%"}}>
                            <label className={styles.addShopLabel} htmlFor="Output">Start Time</label>
                            <div ref={brandDropdownRef}>
                                <input type="text"
                                    autoComplete="off"
                                    id="longitude"
                                    placeholder="Start Time"
                                    className={styles.inputField}
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            {errors.startTime && startTime == "" && <p className={styles.error} style={{ color: 'red' }}>{errors.startTime}</p>}
                        </div>
                        <div className={styles.addShopInputContainer} style={{width: "25%"}}>
                            <label className={styles.addShopLabel} htmlFor="Output">End Time</label>
                            <div ref={brandDropdownRef}>
                                <input type="text"
                                    autoComplete="off"
                                    id="longitude"
                                    placeholder="End"
                                    className={styles.inputField}
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                            {errors.endTime && endTime == "" && <p className={styles.error} style={{ color: 'red' }}>{errors.endTime}</p>}
                        </div>
                    </div>
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Cover Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="coverFileUpload"
                                accept=".jpeg,.jpg"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {!file ? (
                                <label htmlFor="coverFileUpload" className={styles.fileUploadLabel}>
                                    <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                    <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                </label>
                            ) : (
                                <div className={styles.imageContainer}>
                                    <img
                                        src={
                                            typeof file === 'string'
                                                ? `${baseUrl}${file}`
                                                : URL.createObjectURL(file)
                                        }
                                        alt="Preview"
                                        className={styles.previewImage}
                                    />
                                    <button type="button" className={styles.removeButton} onClick={handleRemoveImage}>
                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="error">{errors.file}</p>}
                    </div>
                    <div className={styles.editButton}>
                        <button type="button" className={styles.editCancelBtn} onClick={() => handleCancel()} style={{backgroundColor: "red"}}>Reject</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Submit...
                                </>
                            ) : (
                                "Accept"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditChargeShare;
