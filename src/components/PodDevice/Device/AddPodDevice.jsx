import React, { useEffect, useState } from 'react';
import styles from './adddevice.module.css';
// import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
// import UploadIcon from '../../../assets/images/uploadicon.svg';
import { postRequestWithToken } from '../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import Delete from '../../../assets/images/Delete.svg'
import Add from '../../../assets/images/Add.svg';

const AddPodDevice = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate()
    
    const [podId, setPodId]         = useState("");
    const [podName, setPodName]     = useState("");
    const [deviceId, setDeviceId]   = useState("");
    const [modalName, setModalName] = useState("");
    const [inverter, setInverter]   = useState("");
    const [charger, setCharger]     = useState("");
    const [dateOfManufacturing, setDateOfManufacturing] = useState("");
    const [errors, setErrors]                           = useState({});
    const [bateryerrors, setBateryerrors]               = useState([]);  

    const [deviceBatteryData, setDeviceBatteryData] = useState([
        { batteryId : '', capacity : '' }
    ]);

    const backButtonClick = () => {
        navigate('/portable-charger/device-list')
    };
    const validateForm = () => {
        const fields = [
            { 
                name         : "podId", 
                value        : podId, 
                errorMessage : "POd Id is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "podName", 
                value        : podName, 
                errorMessage : "Pod Name is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "deviceId", 
                value        : deviceId, 
                errorMessage : "Device Id is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "modalName", 
                value        : modalName, 
                errorMessage : "Modal Name is required.", 
                isValid      : val => val.trim() !== "" 
            },
            // { 
            //     name         : "capacity", 
            //     value        : capacity, 
            //     errorMessage : "Capacity is required.", 
            //     isValid      : val => val.trim() !== "" 
            // },
            { 
                name         : "inverter", 
                value        : inverter, 
                errorMessage : "Inverter is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "charger", 
                value        : charger, 
                errorMessage : "Charger is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "dateOfManufacturing", 
                value        : dateOfManufacturing, 
                errorMessage : "Date Of Manufacturing is required.", 
                isValid      : val => val.trim() !== "" 
            }
        ]
        deviceBatteryData.forEach((slot, index) => { // batteryId : null,  
            const slotErrors = {};
            if (!slot.batteryId) slotErrors.batteryId = "Battery Id is required";
            if (!slot.capacity) slotErrors.capacity   = "Capacity is required";
            
            bateryerrors[index] = slotErrors;
        });
        setBateryerrors(bateryerrors);
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isValid }) => {
            if (!isValid(value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 || Object.keys(bateryerrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        console.log(errors); 
        // return;
        e.preventDefault();
        if (validateForm()) {

            const battery_ids = deviceBatteryData.map(slot => slot.batteryId);
            const capacities  = deviceBatteryData.map(slot => slot.capacity);

            const obj = {
                userId : userDetails?.user_id,
                email  : userDetails?.email,
                podId,
                podName,
                deviceId,
                device_model : modalName,
                charger,
                inverter,
                date_of_manufacturing : dateOfManufacturing,
                battery_ids,
                capacities
            };
            postRequestWithToken('pod-device-add', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/portable-charger/device-list')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-device api', response);
                }
            })

        } else {
            console.log("Form validation failed.");
        }
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []); 

    const handleBatteryChange = (index, e) => {
        const value = e.target.value;
        
        const newBattery = [...deviceBatteryData];
        newBattery[index].batteryId = value;
        setDeviceBatteryData(newBattery);
    };
    const handleBatteryCapacityChange = (index, e) => {
        const value = e.target.value;
        
        const newCapacity = [...deviceBatteryData];
        newCapacity[index].capacity = value;
        setDeviceBatteryData(newCapacity);
    };
    const addTimeSlot = () => {
        setDeviceBatteryData([...deviceBatteryData, { batteryId: '', capacity: '' }]);
    };
    const removeTimeSlot = (index) => {
        const newBatteryData = deviceBatteryData.filter((_, i) => i !== index);
        setDeviceBatteryData(newBatteryData);
    };

    return (
        <div className={styles.containerCharger}>
            <h2 className={styles.title}>Add Device</h2>
            <div className={styles.chargerSection}>
                
                <form className={styles.form} onSubmit={handleSubmit}>
                    <ToastContainer />
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>POD ID</label>
                            <input className={styles.inputCharger} type="text" placeholder="Device ID"
                                value={podId}
                                onChange={(e) => setPodId(e.target.value) }
                            />
                            {errors.podId && podId =='' && <p className="error">{errors.podId}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>POD Name</label>
                            <input className={styles.inputCharger} type="text" placeholder="POD Name"
                                value={podName}
                                onChange={(e) => setPodName(e.target.value) }
                            />
                            {errors.podName && podName =='' && <p className="error">{errors.podName}</p>}
                        </div>  
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Device ID</label>
                            <input className={styles.inputCharger} type="text" placeholder="Device ID"
                                value={deviceId}
                                onChange={(e) =>
                                    setDeviceId(e.target.value)
                                }
                            />
                            {errors.deviceId && deviceId =='' && <p className="error">{errors.deviceId}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Modal Name</label>
                            <input className={styles.inputCharger} type="text" placeholder="Modal Name V1, V2"
                                value={modalName}
                                onChange={(e) =>
                                    setModalName(e.target.value)
                                }
                            />
                            {errors.modalName && modalName =='' && <p className="error">{errors.modalName}</p>}
                        </div>  
                    </div>
                    <div className={styles.row}>
                        {/* <div className={styles.inputGroup}>
                            <label className={styles.label}>Capacity (KW)</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Capacity"
                                value={capacity}
                                onChange={(e) => {
                                    setcapacity(e.target.value);
                                }}
                            />
                            {errors.capacity && capacity =='' && <p className="error">{errors.capacity}</p>}
                        </div> */}
                        <div className={styles.inputGroup}>
                            <label className={styles.label}> Inverter </label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Pahse 1, Phase 2"
                                value={inverter}
                                onChange={(e) => setInverter(e.target.value)}
                            />
                            {errors.inverter && inverter =='' && <p className="error">{errors.inverter}</p>}
                        </div>
                        
                    </div>
                   
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}> Charger </label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Charger"
                                value={charger}
                                onChange={(e) => setCharger(e.target.value)}
                            />
                            {errors.charger && charger =='' && <p className="error">{errors.charger}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}> Date Of Manufacturing  </label>
                            <InputMask
                                mask="99-99-9999"
                                value={dateOfManufacturing}
                                onChange={(e) => {
                                    setDateOfManufacturing(e.target.value);
                                    if (errors.dateOfManufacturing && e.target.value.length === 10) {
                                        setErrors((prevErrors) => ({ ...prevErrors, dateOfManufacturing: "" }));
                                    }
                                }}
                                onBlur={() => {
                                    if (dateOfManufacturing.length === 10) {
                                        const [day, month, year] = dateOfManufacturing.split('-');
                                        const isValidDate =
                                        !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                        day <= 31 && month <= 12; 
                                        if (!isValidDate) {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                dateOfManufacturing: "Invalid date in DD-MM-YYYY format",
                                            }));
                                        }
                                    }
                                }}
                                placeholder="DD-MM-YYYY"
                                className={styles.inputCharger}
                            />
                            {errors.dateOfManufacturing && dateOfManufacturing =='' && <p className="error">{errors.dateOfManufacturing}</p>}
                        </div>
                    </div>
                    <div className={styles.mainAddSection}>
                        <span className={styles.batteryBattle}>Add Battery Detail</span>
                        <button type="button"  className={styles.addButton} onClick={addTimeSlot}>
                            <img className={styles.imageShopList} src={Add} alt="add" />
                            <span className={styles.addSpan}>Add</span> 
                        </button>
                    </div>
                    { deviceBatteryData.map((slot, index) => (
                        <div key={index} className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Battery ID </label>
                                <input
                                    className={styles.inputCharger}
                                    value={slot.batteryId}
                                    onChange={(e) => handleBatteryChange(index, e)}
                                    placeholder="Battery ID"
                                />
                                {bateryerrors[index]?.batteryId && slot.batteryId == '' && <span className="error">{bateryerrors[index].batteryId}</span>}
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Capacity </label>
                                <input
                                    className={styles.inputCharger}
                                    value={slot.capacity}
                                    onChange={(e) => handleBatteryCapacityChange(index, e)}
                                    placeholder="Capacity"
                                />
                                {bateryerrors[index]?.capacity && slot.capacity == '' && <span className="error">{bateryerrors[index].capacity}</span>}
                            </div>

                            {deviceBatteryData.length > 1 && (
                                <button type="button" className={styles.buttonContainer} onClick={() => removeTimeSlot(index)}>
                                    <img className={styles.removeContent} src={Delete} alt="delete" />
                                </button>
                            )}
                        </div>
                    ))}
                    <div className={styles.actions}>
                        <button onClick={backButtonClick} className={styles.cancelBtn} type="button">Cancel</button>
                        <button className={styles.submitBtn} type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default AddPodDevice;
