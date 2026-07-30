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

    const serviceDropdownRef                  = useRef(null);
    const [communityDetails, setCommunityDetails] = useState();

    const handleCancel = () => {
        navigate('/community/community-list')
    }

    const validateForm = (chargersValues, kwValues) => {
        const fields = [
            { name: "communityName", value: communityName,  errorMessage: "Community Name is required." },
            { name: "areaName",      value: areaName,       errorMessage: "Area Name is required." },
            { name: "noofResidents", value: noofResidents,  errorMessage: "Total number of Residents is required." },
            { name: "chargers",      value: chargersValues, errorMessage: "Chargers is required.", isArray: true },
            { name: "chargers",      value: kwValues,       errorMessage: "kw is required.", isArray: true },
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
        setLoading(true);

        const chargersValues = chargers.filter(f => f.charger_id.trim() !== '').map(f => f.charger_id);
        const kwValues = chargers.filter(f => f.kw.trim() !== '').map(f => f.kw);
        if (validateForm(chargersValues, kwValues)) {
        
            const obj = {
                userId          : userDetails?.user_id,
                email           : userDetails?.email,
                community_id : communityId,
                community_name  : communityName,
                area_name       : areaName,
                total_residence : noofResidents,
                chargers        : JSON.stringify(chargersValues),
                kwValues        : JSON.stringify(kwValues),
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
                     
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.featureLabel} htmlFor="chargers"> Chargers 
                                <button type="button" onClick={addChargers} className={styles.featureButton}>
                                    <img src={Add} alt="Add" className={styles.addImg} />
                                    <span className={styles.addContent}>Add</span>
                                </button>
                            </label>
                            {chargers.map((chargers, index) => (<>
                                {/* <div ref={serviceDropdownRef} className={styles.featureDivision}> */}
                                    <div className={styles.addShopInputContainerR}>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            id={`charger_id`}
                                            placeholder={`Charger ID`}
                                            className={styles.inputField}
                                            value={chargers.charger_id}
                                            onChange={(e) => handleChargersdata(index, e.target.value, 'charger_id')}
                                        />
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            id={`kw`}
                                            placeholder={`kW`}
                                            className={styles.inputField}
                                            value={chargers.kw}
                                            onChange={(e) => handleChargersdata(index, e.target.value, 'kw')}
                                        />
                                         
                                    </div>
                                    {index > 0 && (
                                        <button type="button" className={styles.removeButton} 
                                        onClick={() => handleRemoveCharger(index )}
                                        >
                                            <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                        </button>
                                    )}
                                {/* </div> */}
                            </>))}
                            {errors.chargers && chargers[0].chargers == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargers}</p>}
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
