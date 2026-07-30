import React, { useEffect, useState } from 'react';
import styles from './addDriver.module.css';
// import styles from './addPartner.module.css';
import InputMask from 'react-input-mask';
// import Calendar from '../../../assets/images/Calender.svg'
import { toast, ToastContainer } from "react-toastify";

import Select from "react-select";
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import UploadIcon from '../../assets/images/uploadicon.svg';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';

import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


import Add from '../../assets/images/Add.svg';
import Delete from '../../assets/images/Delete.svg'


const AddPortableChargerTimeSlot = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                      = useNavigate();

    const [file, setFile]               = useState();
    const [partnerName, setPartnerName] = useState("");
    const [email, setEmail]             = useState("");
    const [mobileNo, setMobileNo]       = useState("");
    const [serviceType, setServiceType] = useState("");
    const [emirates, setEmirates]       = useState("")
    const [area, setArea]               = useState("")  
    const [buildingNo, setBuildingNo]   = useState([]) 
    
    const [password, setPassword]               = useState("");
    const [confirmPassword, setConfirmPassword] = useState(null);

    const [errors, setErrors]                   = useState({});
    const [loading, setLoading]                 = useState(false);
    
    const [locationOptions, setLocationOptions] = useState([])
    const [areaOptions, setAreaOptions] = useState([])

    const typeOpetions = [
        { value: "Charger Installation", label: "Charger Installation" },
        { value: "EV Pre-Sale",          label: "EV Pre-Sale" },
        { value: "Portable Charger",     label: "Portable Charger" },
        { value: "Roadside Assistance",  label: "Roadside Assistance" },
        { value: "Valet Charging",       label: "Valet Charging" },
    ];
    const [timeSlots, setTimeSlots] = useState([
        { startTime: null, endTime: null, bookingLimit: "" }
    ]);

    const handleCancel = () => {
        navigate('/portable-charger/charger-booking-time-slot-list');
    };

    const handleTimeInput = (e) => {
        const value = e.target.value;
        const isValidTime = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        return isValidTime || value === '' ? value : null;
    };

    const handleStartTimeChange = (index, newTime) => {
        const validatedTime = handleTimeInput({ target: { value: newTime } });
        const newTimeSlots = [...timeSlots];
        newTimeSlots[index].startTime = validatedTime === '' ? null : validatedTime;
        setTimeSlots(newTimeSlots);
    };

    
    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { startTime: null, endTime: null, bookingLimit: "" }]);
    };

    const removeTimeSlot = (index) => {
        const newTimeSlots = timeSlots.filter((_, i) => i !== index);
        setTimeSlots(newTimeSlots);
    };

    const validateForm = () => {
        const errors = [];
        
        timeSlots.forEach((slot, index) => {
            const slotErrors = {};
            if (!slot.startTime) slotErrors.startTime = "Start time is required";
           
            errors[index] = slotErrors;
        });
        setErrors(errors);
        return !errors.some((error) => Object.keys(error).length > 0);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            
            const obj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                
             
            };

            postRequestWithToken('charger-add-time-slot', obj, (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/portable-charger/charger-booking-time-slot-list');
                    }, 2000)
                } else {
                    toast(response.message || response.message[0], { type: "error" });
                    console.log('error in charger-slot-list api', response);
                    setLoading(false);
                }
            });
        } else {
            console.log('Validation error');
            setLoading(false);
        }
    };
    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };

        postRequestWithToken('location-list', obj, (response) => {
            if (response.code === 200) {
                const data = response?.data || {};
                setLocationOptions(data);
            } else {
                console.log('error in rsa-details API', response);
            }
        });  //location-area-list
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
        }
        fetchDetails();
    }, []);

    const addBuilding = () => {
        // buildingNo, setBuildingNo
        // setTimeSlots([...buildingNo, { startTime: null, endTime: null, bookingLimit: "" }]);
    };
    const removeBuilding = (index) => {
        const newTimeSlots = buildingNo.filter((_, i) => i !== index);
        setBuildingNo(newTimeSlots);
    };
    const handleBuildingNo = (index, newTime) => {
        // const validatedTime = handleTimeInput({ target: { value: newTime } });
        // const newTimeSlots = [...newTimeSlots];
        // newTimeSlots[index].startTime = validatedTime === '' ? null : validatedTime;
        // setBuildingNo(newTimeSlots);
    };
    return (
        <div className={styles.containerCharger}>
            <div className={styles.slotHeaderSection}>
                <h2 className={styles.title}>Add Slot</h2>
                <button type="button" className={styles.buttonSec} onClick={addTimeSlot}>
                    <img src={Add} alt="Add" className={styles.addImg} />
                    <span className={styles.addContent}>Add</span>
                </button>
            </div>
            <ToastContainer />
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.chargerSection}>
                    {/* <div className={styles.addSection}> */}
                        {/* <div className={styles.inputGroup}> */}
                            {/* <label className={styles.label}>Select Date</label> */}
                            <label className={styles.addShopLabel} htmlFor="shopName">Partner Name</label>
                            <div className={styles.datePickerWrapper}>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Partner Name"
                                value={partnerName}
                                onChange={(e) => {setPartnerName(e.target.value.slice(0, 50)) }}
                            />
                            </div>
                            {errors.partnerName && partnerName == '' && <p className="error">{errors.partnerName}</p>}
                        {/* </div>                     */}
                    {/* </div> */}
                </div>
                {timeSlots.map((slot, index) => (
                    <div key={index} className={styles.slotMainFormSection}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Start Time</label>
                            <InputMask
                                mask="99:99"
                                className={styles.inputCharger}
                                value={slot.startTime}
                                onChange={(e) => handleStartTimeChange(index, e.target.value)}
                                placeholder="HH:MM"
                            />
                            {errors[index]?.startTime && <span className="error">{errors[index].startTime}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>End Time</label>
                            <InputMask
                                mask="99:99"
                                className={styles.inputCharger}
                                value={slot.endTime}
                                
                                placeholder="HH:MM"
                            />
                            {errors[index]?.endTime && <span className="error">{errors[index].endTime}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Booking Limit</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                autoComplete='off'
                                placeholder="Enter Booking Limit"
                                maxLength="4"
                                value={slot.bookingLimit}
                                
                            />
                            {errors[index]?.bookingLimit && <span className="error">{errors[index].bookingLimit}</span>}
                        </div>

                        {timeSlots.length > 1 && (
                            <button type="button" className={styles.buttonContainer} onClick={() => removeTimeSlot(index)}>
                                <img className={styles.removeContent} src={Delete} alt="delete" />
                            </button>
                        )}
                    </div>
                ))}

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} type="button" onClick={handleCancel}>Cancel</button>
                    <button disabled={loading} className={styles.submitBtn} type="submit">
                    {loading ? (
                      <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submit...
                      </>
                        ) : (
                            "Submit"
                    )}
                    </button>
                </div>
            </form >
        </div>
    );
};


export default AddPortableChargerTimeSlot;
