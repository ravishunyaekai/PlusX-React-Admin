import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import UploadIcon from '../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './EditResidents.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ReactInputMask from "react-input-mask"
import Add from '../../assets/images/Add.svg';

const AddResidents = () => {
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [residentName, setResidentName]           = useState('')
    const [mobileNo, setMobileNo]                   = useState("");
    const [email, setEmail]                         = useState("");
    const [community, setCommunity]                 = useState("");
    const [address, setAddress]                     = useState('');
    const [sessionAllocation, setSessionAllocation] = useState('');
    const [allocatedTime, setAllocatedTime]         = useState('');
    const [kwhAllocated, setkwhAllocated]           = useState('');
    const [perKwhCharge, setPerKwhCharge]           = useState('');
    const [extraCharge, setExtraCharge]             = useState('');

    const serviceDropdownRef                      = useRef(null);
    const [communityOptions, setCommunityOptions] = useState('');

    const handleCommunity = (selectedOption) => {
        setCommunity(selectedOption);
    }
    const handleCancel = () => {
        navigate('/community/resident-list')
    }
    const validateForm = (chargersValues) => {
        const fields = [
            { name: "residentName",        value: residentName,         errorMessage: "Residant Name is required." },
            { name: "mobileNo",            value: mobileNo,             errorMessage: "Please enter a valid Mobile No.", isMobile: true },
            { name: "email",               value: email,                errorMessage: "Please enter a valid Email ID.", isEmail: true },
            { name: "community",           value: community,            errorMessage: "Community is required." },
            { name: "address",             value: address,              errorMessage: "Address is required." },
            { name: "sessionAllocation",   value: sessionAllocation,    errorMessage: "Session Allocation is required." },
            { name: "allocatedTime",       value: allocatedTime,        errorMessage: "Allocated Time is required." },
            { name: "kwhAllocated",        value: kwhAllocated,         errorMessage: "kWh Allocated is required." },
            { name: "perKwhCharge",        value: perKwhCharge,         errorMessage: "kWh Charge is required." },
            { name: "extraCharge",         value: extraCharge,          errorMessage: "Extra Charge is required." },
        ];
    
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isPasswordMatch }) => {
            if (!value) {
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
                resident_name              : residentName, 
                mobile_number              : mobileNo, 
                resident_email             : email,
                community_id               : community.value,
                address                    : address,
                monthly_session_allocation : sessionAllocation,
                alloted_time               : allocatedTime, 
                kwh_allocated              : kwhAllocated, 
                per_kwh_charge             : perKwhCharge, 
                extra_charge               : extraCharge
            }
            postRequestWithToken('resident-add', obj, async (response) => {
                if (response.status === 1) {
                    toast(response.message , {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/community/resident-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in resident-add API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
        postRequestWithToken('all-community-list', obj, (response) => {
            if (response.code === 200) {

                setCommunityOptions(response.data)
            } else {
                console.log('error in rider-details API', response);
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
    
    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Add Resident</div>
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
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Mobile Number"
                                value={mobileNo}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setMobileNo(value.slice(0, 12)); 
                                }}
                            />
                            {errors.mobileNo && mobileNo.length < 9 &&   <p className="error" style={{ color: 'red' }}>{errors.mobileNo}</p>}
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
                                onChange={(e) => setEmail(e.target.value.slice(0, 50))}
                            />
                            {errors.email && email == '' && <p className="error" style={{ color: 'red' }}>{errors.email}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Community</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={communityOptions}
                                    value={community}
                                    onChange={handleCommunity}
                                    placeholder="Select Community"
                                    isClearable={true}
                                />
                            </div>
                            {errors.community && community == null && <p className="error">{errors.community}</p>}
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
                                type="number"
                                autoComplete="off"
                                id="sessionAllocation"
                                placeholder="Monthly Session Allocation"
                                className={styles.inputField}
                                value={sessionAllocation}
                                onChange={(e) => setSessionAllocation(e.target.value)}
                            />
                            {errors.sessionAllocation && sessionAllocation === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.sessionAllocation}</p>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="allocatedTime">Allocated Time In Minute</label>
                            <input
                                className={styles.inputField}
                                type="number"
                                autoComplete='off'
                                placeholder="Allocated Time"
                                value={allocatedTime}
                                onChange={(e) => setAllocatedTime(e.target.value)}
                            />
                            {errors.allocatedTime && allocatedTime === "" &&   <p className="error" style={{ color: 'red' }}>{errors.allocatedTime}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="kwhAllcation">kWh Allocation/Month</label>
                            <input
                                type="number"
                                autoComplete="off"
                                id="kwhAllcation"
                                placeholder="kWh Allocation/Month"
                                className={styles.inputField}
                                value={kwhAllocated}
                                onChange={(e) => setkwhAllocated(e.target.value)}
                            />
                            {errors.kwhAllocated && kwhAllocated === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.kwhAllocated}</p>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="perkwhCharge">Per kWh charge (AED)</label>
                            <input
                                className={styles.inputField}
                                type="number"
                                autoComplete='off'
                                placeholder="Per kWh charge (AED)"
                                value={perKwhCharge}
                                onChange={(e) => setPerKwhCharge(e.target.value)}
                            />
                            {errors.perKwhCharge && perKwhCharge === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.perKwhCharge}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="extraCharge">Extra Charge/Min Over Allocated Time (AED)</label>
                            <input
                                type="number"
                                autoComplete="off"
                                id="extraCharge"
                                placeholder="Extra Charge/Min Over Allocated Time (AED)"
                                className={styles.inputField}
                                value={extraCharge}
                                onChange={(e) => setExtraCharge(e.target.value)}
                            />
                            {errors.extraCharge && extraCharge === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.extraCharge}</p>}
                        </div>
                    </div>

                    <div className={styles.row}>
                        
                        {/* <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="mobileNo">per kWh charge (AED)</label>
                            <input
                                className={styles.inputField}
                                type="number"
                                autoComplete='off'
                                placeholder="Mobile Number"
                                value={mobileNo}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setMobileNo(value.slice(0, 12)); 
                                }}
                            />
                            {errors.mobileNo && mobileNo.length < 9 &&   <p className="error" style={{ color: 'red' }}>{errors.mobileNo}</p>}
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
                            "Add Resident"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );

};

export default AddResidents;
