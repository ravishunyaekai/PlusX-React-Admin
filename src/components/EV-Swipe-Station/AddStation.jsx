import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styles from './addBike.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import InputMask from 'react-input-mask';

const AddStation = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                      = useNavigate();
    const [stationName, setStationName] = useState("");
    const [slotNumber, setSlotNumber]   = useState("");
    const [loading, setLoading]         = useState(false);
    const [errors, setErrors]           = useState({});
    
    const validateForm = () => {
        const fields = [
            { name: "stationName", value: stationName,  errorMessage: "Station Name is required" },
            { name: "slotNumber",    value: slotNumber, errorMessage: "No. Of Slot Number is required"},
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };        
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {

            const obj = {
                userId         : userDetails?.user_id,
                email          : userDetails?.email,
                station_name   : stationName,
                number_of_slot : slotNumber,
            };
            postRequestWithToken('swipe-station-add', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/ev-battery-swipe/station-list')
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
    const handleCancel = () => {
        navigate('/ev-battery-swipe/station-list');
    }
    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Add Swipe Station</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="stationName">Station Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="stationName"
                                placeholder="Station Name"
                                className={styles.inputField}
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                            />
                            {errors.stationName && stationName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="slotNumber">No. Of Slot Number</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="slotNumber"
                                placeholder="Slot Number"
                                className={styles.inputField}
                                value={slotNumber}
                                onChange={(e) => {
                                    if (/^\d*$/.test(e.target.value)) {
                                        setSlotNumber( e.target.value );
                                    }
                                }}
                            />
                            {errors.slotNumber && slotNumber === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.slotNumber}</p>}
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
                            "Submit"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddStation;
