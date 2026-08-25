import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import UploadIcon from '../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './EditCommunity.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Add from '../../assets/images/Add.svg';
// /import ReactInputMask from "react-input-mask";
// import InputMask from 'react-input-mask';

const EditCommunity = () => {
    const { communityId }                     = useParams()
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const [errors, setErrors]                 = useState({});
    const [loading, setLoading]               = useState(false);

    const [communityName, setCommunityName]   = useState('')
    const [areaName, setAreaName]             = useState('')
    const [noofResidents, setNoofResidents]   = useState('')
    const [chargers, setChargers]             = useState([ { id : '', charger_id : '', kw : '' } ]);
    // Manager Details - commented out for live (not ready to push)
    // const [managerId, setManagerId]           = useState('');
    // const [managerName, setManagerName]       = useState('');
    // const [managerEmail, setManagerEmail]     = useState('');
    // const [managerContact, setManagerContact] = useState('');
    // const [password, setPassword]             = useState('');
    // const [confirmPassword, setConfirmPassword] = useState('');

    const serviceDropdownRef                  = useRef(null);
    const [communityDetails, setCommunityDetails] = useState();

    const handleCancel = () => {
        navigate('/community/community-list')
    }

    const validateForm = () => {
        const fields = [
            { name: "communityName", value: communityName,  errorMessage: "Community Name is required." },
            { name: "areaName",      value: areaName,       errorMessage: "Area Name is required." },
            { name: "noofResidents", value: noofResidents,  errorMessage: "Total number of Residents is required." },
            // Manager Details - commented out for live
            // { name: "managerName",   value: managerName,    errorMessage: "Manager Name is required." },
            // { name: "managerEmail",  value: managerEmail,   errorMessage: "Please enter a valid Email ID.", isEmail: true },
        ];

        // Manager Details - commented out for live
        // if (password || confirmPassword) {
        //     if (!password) {
        //         fields.push({ name: "password", value: password, errorMessage: "Password is required." });
        //     }
        //     if (!confirmPassword) {
        //         fields.push({ name: "confirmPassword", value: confirmPassword, errorMessage: "Confirm Password is required." });
        //     }
        //     if (password && confirmPassword && password !== confirmPassword) {
        //         fields.push({ name: "confirmPassword", value: confirmPassword, errorMessage: "Passwords do not match.", isPasswordMatch: true });
        //     }
        // }
    
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isPasswordMatch }) => {
            if (!value) {
                errors[name] = errorMessage;
            } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                errors[name] = errorMessage;
            // } else if (isPasswordMatch && value !== password) {
            //     errors[name] = errorMessage;
            // } else if (name === 'password' && value.length < 6) {
            //     errors[name] = "Password should be at least 6 characters long.";
            }
            return errors;
        }, {});

        let hasCompleteCharger = false;
        chargers.forEach((charger, index) => {
            const chargerId = charger.charger_id.trim();
            const kw = charger.kw.trim();
            const isFirstRow = index === 0;
            const hasPartial = chargerId || kw;

            if (isFirstRow || hasPartial) {
                if (!chargerId) {
                    newErrors[`chargerId_${index}`] = 'Charger ID is required.';
                }
                if (!kw) {
                    newErrors[`kw_${index}`] = 'kW is required.';
                }
                if (chargerId && kw) {
                    hasCompleteCharger = true;
                }
            }
        });

        if (!hasCompleteCharger) {
            newErrors.chargers = 'At least one charger with Charger ID and kW is required.';
        }

        // Manager Details - commented out for live
        // if (managerContact && (isNaN(managerContact) || managerContact.length < 9 || managerContact.length > 12)) {
        //     newErrors.managerContact = "Please enter a valid Contact No.";
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            const completeChargers = chargers.filter(f => f.charger_id.trim() !== '' && f.kw.trim() !== '');
            const chargersValues = completeChargers.map(f => f.charger_id);
            const kwValues = completeChargers.map(f => f.kw);
        
            const obj = {
                userId          : userDetails?.user_id,
                email           : userDetails?.email,
                community_id    : communityId,
                community_name  : communityName,
                area_name       : areaName,
                total_residence : noofResidents,
                chargers        : JSON.stringify(chargersValues),
                kwValues        : JSON.stringify(kwValues),
                // Manager Details - commented out for live
                // manager_id      : managerId,
                // manager_name    : managerName,
                // manager_email   : managerEmail,
                // manager_contact : managerContact,
                // password        : password,
                // confirm_password : confirmPassword,
            }
        
            postRequestWithToken('community-edit', obj, async (response) => {
                if (response.status === 1) {
                    toast(response.message , {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/community/community-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in community-edit API:', response);
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
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            community_id : communityId,
        };
        postRequestWithToken('community-details', obj, (response) => {
            if (response.code === 200) {
                setCommunityDetails(response?.data || {});
                 
                setCommunityName(response?.data?.community_name);
                setAreaName(response?.data?.area_name)
                setNoofResidents(response?.data?.total_residence)
                setChargers(response?.chargers)
                // Manager Details - commented out for live
                // setManagerId(response?.manager?.manager_id || '');
                // setManagerName(response?.manager?.manager_name || '');
                // setManagerEmail(response?.manager?.manager_email || '');
                // setManagerContact(response?.manager?.manager_contact || '');

            } else {
                console.log('error in community-details API', response);
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

    const addChargers = () =>{
        setChargers([...chargers,  { id : '', charger_id : '', kw : '' }]);
    }
    const handleChargersdata = (index, featureVal, keyName) => {
        const oldfeature = [...chargers];
        oldfeature[index][keyName] = featureVal;
        setChargers(oldfeature)
    };
    const handleRemoveCharger = (index) => {
        const updated = chargers.filter((_, i) => i !== index);
        setChargers(updated);
    };
    
    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Edit Community</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    {/* Community Details Section */}
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Community Details</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="communityName">Community Name</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="communityName"
                                    placeholder="Community Name"
                                    className={styles.inputField}
                                    value={communityName}
                                    onChange={(e) => setCommunityName(e.target.value)}
                                />
                                {errors.communityName && communityName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.communityName}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="areaName">Area name</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="areaName"
                                    placeholder="Area Name"
                                    className={styles.inputField}
                                    value={areaName}
                                    onChange={(e) => setAreaName(e.target.value)}
                                />
                                {errors.areaName && areaName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.areaName}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="noofResidents">
                                    Total Number of Residents
                                </label>
                                <input
                                    type="number"
                                    autoComplete="off"
                                    id="noofResidents"
                                    placeholder="Number of Residents"
                                    className={styles.inputField}
                                    value={noofResidents}
                                    onChange={(e) => setNoofResidents(e.target.value)}
                                />
                                {errors.noofResidents && noofResidents === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.noofResidents}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Manager Details Section - commented out for live (not ready to push)
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Manager Details</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="managerName">Manager Name</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="managerName"
                                    placeholder="Manager Name"
                                    className={styles.inputField}
                                    value={managerName}
                                    onChange={(e) => setManagerName(e.target.value)}
                                />
                                {errors.managerName && managerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.managerName}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="managerEmail">Email ID</label>
                                <input
                                    type="email"
                                    autoComplete="off"
                                    id="managerEmail"
                                    placeholder="Email ID"
                                    className={styles.inputField}
                                    value={managerEmail}
                                    onChange={(e) => setManagerEmail(e.target.value)}
                                />
                                {errors.managerEmail && <p className={styles.error} style={{ color: 'red' }}>{errors.managerEmail}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="managerContact">Contact No (Optional)</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="managerContact"
                                    placeholder="Contact No"
                                    className={styles.inputField}
                                    value={managerContact}
                                    onChange={(e) => setManagerContact(e.target.value)}
                                />
                                {errors.managerContact && <p className={styles.error} style={{ color: 'red' }}>{errors.managerContact}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    id="password"
                                    placeholder="Password"
                                    className={styles.inputField}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {errors.password && <p className={styles.error} style={{ color: 'red' }}>{errors.password}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    autoComplete="new-password"
                                    id="confirmPassword"
                                    placeholder="Confirm Password"
                                    className={styles.inputField}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                {errors.confirmPassword && <p className={styles.error} style={{ color: 'red' }}>{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    </div>
                    */}

                    {/* Charger Details Section */}
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Charger Details</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.featureLabel} htmlFor="chargers">Chargers
                                    <button type="button" onClick={addChargers} className={styles.featureButton}>
                                        <img src={Add} alt="Add" className={styles.addImg} />
                                        <span className={styles.addContent}>Add</span>
                                    </button>
                                </label>
                                {chargers.map((charger, index) => (
                                    <div key={index} className={styles.addShopInputContainerR}>
                                        <div className={styles.featureDivision}>
                                            <input
                                                type="text"
                                                autoComplete="off"
                                                id={`charger_id-${index}`}
                                                placeholder={`Charger ID`}
                                                className={styles.inputField}
                                                value={charger.charger_id}
                                                onChange={(e) => handleChargersdata(index, e.target.value, 'charger_id')}
                                            />
                                            {errors[`chargerId_${index}`] && <p className={styles.error} style={{ color: 'red' }}>{errors[`chargerId_${index}`]}</p>}
                                        </div>
                                        <div className={styles.featureDivision}>
                                            <input
                                                type="text"
                                                autoComplete="off"
                                                id={`kw-${index}`}
                                                placeholder={`kW`}
                                                className={`${styles.inputField} ${index > 0 ? styles.inputFieldWithRemove : ''}`}
                                                value={charger.kw}
                                                onChange={(e) => handleChargersdata(index, e.target.value, 'kw')}
                                            />
                                            {errors[`kw_${index}`] && <p className={styles.error} style={{ color: 'red' }}>{errors[`kw_${index}`]}</p>}
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    className={styles.removeButton}
                                                    onClick={() => handleRemoveCharger(index)}
                                                >
                                                    <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {errors.chargers && <p className={styles.error} style={{ color: 'red' }}>{errors.chargers}</p>}
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
                            "Edit Community"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditCommunity;
