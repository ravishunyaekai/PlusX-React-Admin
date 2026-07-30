import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styles from './addBike.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import InputMask from 'react-input-mask';
import moment from 'moment';

const AddBike = () => {
    const userDetails                       = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                          = useNavigate();
    const {bikeId }                         = useParams();
    const [bikeBrandName, setBikeBrandName] = useState("");
    const [bikeNumber, setBikeNumber]       = useState("");
    const [bikeService, setBikeService]     = useState("");
    const [regsDate, setRegsDate]           = useState('');

    const [serviceOptions, setServiceOptions] = useState([])
    const [loading, setLoading]               = useState(false);
    const [errors, setErrors]                 = useState({});

    const serviceDropdownRef = useRef(null);

    const handleChargingType = (selectedOption) => {
        setBikeService(selectedOption);
    };
    const validateForm = () => {
        const fields = [
            { name: "bikeBrandName", value: bikeBrandName, errorMessage: "Bike Brand is required" },
            { name: "bikeNumber",    value: bikeNumber,    errorMessage: "Bike Number is required"},
            { name: "bikeService",   value: bikeService,   errorMessage: "Bike Service For is required." },
            // { name: "regsDate",      value: regsDate,      errorMessage: "Registration Date is required" },
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
                userId : userDetails?.user_id,
                email  : userDetails?.email,
                bikeBrandName,
                bikeNumber,
                bikeService,
                // regsDate,
                bike_id : bikeId
            };
            postRequestWithToken('bike-update', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/ev-battery-swipe/bike-list')
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

    const fetchDetails = () => {
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            bike_id : bikeId
        };
        postRequestWithToken('bike-details', obj, (response) => {
            
            if (response.status === 1) {
                const data = response?.data || {};
                
                setBikeBrandName(data?.bike_brand_name);
                setBikeNumber(data?.bike_number);
                setBikeService({ label : data?.service_for, value : data?.service_for });
                // setRegsDate( moment(data?.regs_date).format('DD-MM-YYYY') ); 
                setServiceOptions(response?.serviceFor);
                
            } else {
                console.error('Error in electric-bike-detail API', response);
            }
        });
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);
    const handleCancel = () => {
        navigate('/ev-battery-swipe/bike-list');
    }
    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Edit Bike</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="bikeBrandName">Bike Brand Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="bikeBrandName"
                                placeholder="Bike Brand Name"
                                className={styles.inputField}
                                value={bikeBrandName}
                                onChange={(e) => setBikeBrandName(e.target.value)}
                            />
                            {errors.bikeBrandName && bikeBrandName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.bikeBrandName}</p>}
                        </div>
                        
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="bikeNumber">Bike Number</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="bikeNumber"
                                placeholder="Bike Number"
                                className={styles.inputField}
                                value={bikeNumber}
                                onChange={(e) => setBikeNumber(e.target.value)}
                            />
                            {errors.bikeNumber && bikeNumber === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.bikeNumber}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="services">
                                Bike Service For
                            </label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={serviceOptions}
                                    value={bikeService}
                                    onChange={handleChargingType}
                                    placeholder="Select Service"
                                    isClearable={true}
                                />
                            </div>
                            { errors.bikeService && bikeService == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.bikeService}</p>}
                        </div>
                        {/* <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="regsDate">Expiry Date</label>
                            <InputMask
                                mask    = "99-99-9999"
                                value   = {regsDate}
                                onChange = {(e) => {
                                    setRegsDate(e.target.value);
                                    if (errors.regsDate && e.target.value.length === 10) {
                                        setErrors((prevErrors) => ({ ...prevErrors, regsDate: "" }));
                                    }
                                }}
                                onBlur = {() => {
                                    if (regsDate.length === 10) {
                                        const [day, month, year] = regsDate.split('-');
                                        const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                        day <= 31 && month <= 12; 
                                        if (!isValidDate) {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                regsDate: "Invalid date in DD-MM-YYYY format",
                                            }));
                                        }
                                    }
                                }}
                                placeholder ="DD-MM-YYYY"
                                className  = {styles.inputField}
                            />
                            {errors.regsDate && regsDate == '' && <p className="error">{errors.regsDate}</p>}
                        </div> */}
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

export default AddBike;
