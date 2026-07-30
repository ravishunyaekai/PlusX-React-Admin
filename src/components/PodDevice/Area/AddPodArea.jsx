import React, { useEffect, useState } from 'react';
import styles from './adddevice.module.css';
// import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
// import UploadIcon from '../../../assets/images/uploadicon.svg';
import { postRequestWithToken } from '../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';

const AddPodArea = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate()
    
    const [areaName, setAreaName]   = useState("");
    const [latitude, setLatitude]   = useState("");
    const [longitude, setLongitude] = useState("");
    const [errors, setErrors]       = useState({});  
    
    const backButtonClick = () => {
        navigate('/portable-charger/area-list')
    };
    const validateForm = () => {
        const fields = [
            { 
                name         : "areaName", 
                value        : areaName, 
                errorMessage : "Area Name is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "latitude", 
                value        : latitude, 
                errorMessage : "Latitude is required.", 
                isValid      : val => val.trim() !== "" 
            },  
            { 
                name         : "longitude", 
                value        : longitude, 
                errorMessage : "Longitude is required.", 
                isValid      : val => val.trim() !== "" 
            },
        ];
        
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isValid }) => {
            if (!isValid(value)) {
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

            const formData = new FormData();
            formData.append("userId", "1");
            formData.append("email", "admin@shunyaekai.com");

            formData.append("areaName", areaName);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);

            postRequestWithToken('pod-area-add', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/portable-charger/area-list')
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

    return (
        <div className={styles.containerCharger}>
            <h2 className={styles.title}>Add Area</h2>
            <div className={styles.chargerSection}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <ToastContainer />
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Area Name</label>
                            <input className={styles.inputCharger} type="text" placeholder="Area Name"
                                value={areaName}
                                onChange={(e) => setAreaName(e.target.value) }
                            />
                            {errors.areaName && areaName =='' && <p className="error">{errors.areaName}</p>}
                        </div>
                         
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Latitude</label>
                            <input className={styles.inputCharger} type="text" placeholder="Latitude"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value) }
                            />
                            {errors.latitude && latitude =='' && <p className="error">{errors.latitude}</p>}
                        </div> 
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Longitude</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Longitude"
                                value={longitude}
                                onChange={(e) => {
                                    setLongitude(e.target.value);
                                }}
                            />
                            {errors.longitude && longitude =='' && <p className="error">{errors.longitude}</p>}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button onClick={backButtonClick} className={styles.cancelBtn} type="button">Cancel</button>
                        <button className={styles.submitBtn} type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default AddPodArea;
