import React, { useEffect, useState } from 'react';
import styles from './adddevice.module.css';

import { postRequestWithToken } from '../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import Delete from '../../assets/images/Delete.svg'
import Add from '../../assets/images/Add.svg';

const AddTruck = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate()
    
    const [truckName, setTruckName]     = useState("");
    const [truckNumber, setTruckNumber] = useState("");
    const [errors, setErrors]           = useState({});

    const backButtonClick = () => {
        navigate('/drivers/truck-list')
    };
    const validateForm = () => {
        const fields = [
            { 
                name         : "truckName", 
                value        : truckName, 
                errorMessage : "Truck Name is required.", 
                isValid      : val => val.trim() !== "" 
            }, { 
                name         : "truckNumber", 
                value        : truckNumber, 
                errorMessage : "Truck number is required.", 
                isValid      : val => val.trim() !== "" 
            },
        ]
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

            const obj = {
                userId : userDetails?.user_id,
                email  : userDetails?.email,
                truckName,
                truckNumber,
            };
            postRequestWithToken('truck-add', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/drivers/truck-list')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-detruckvice api', response);
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
            <h2 className={styles.title}>Add Truck</h2>
            <div className={styles.chargerSection}>
                
                <form className={styles.form} onSubmit={handleSubmit}>
                    <ToastContainer />
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Truck Name</label>
                            <input className={styles.inputCharger} type="text" placeholder="Truck Name"
                                value={truckName}
                                onChange={(e) => setTruckName(e.target.value) }
                            />
                            {errors.truckName && truckName =='' && <p className="error">{errors.truckName}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Truck Number</label>
                            <input className={styles.inputCharger} type="text" placeholder="Truck Number"
                                value={truckNumber}
                                onChange={(e) => setTruckNumber(e.target.value) }
                            />
                            {errors.truckNumber && truckNumber =='' && <p className="error">{errors.truckNumber}</p>}
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
export default AddTruck;
