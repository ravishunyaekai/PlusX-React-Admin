import { useState, useRef } from "react";
import Select from "react-select";
import styles from './EditVendor.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AddCommunity = () => {
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [vendorName, setVendorName]     = useState('')
    const [areaName, setAreaName]         = useState('')
    const [showroomName, setShowroomName] = useState('')
    const [emirates,   setEmirates]       = useState("");
    const [address, setAddress]           = useState("");
    const [packagePrice, setPackagePrice] = useState("");

    const [rsaSession, setRsaSession] = useState(0);
    const [podSession, setPodSession] = useState(0);
 
    const serviceDropdownRef = useRef(null);

    const emiratesOptions = [
        { label : 'Abu Dhabi',      value : 'Abu Dhabi'},
        { label : 'Ajman',          value : 'Ajman'},
        { label : 'Dubai',          value : 'Dubai'},
        { label : 'Fujairah',       value : 'Fujairah'},
        { label : 'Ras Al Khaimah', value : 'Ras Al Khaimah'},
        { label : 'Sharjah',        value : 'Sharjah'},
        { label : 'Umm Al Quwain',  value : 'Umm Al Quwain'},
    ];
    const handleCancel = () => {
        navigate('/vendors/vendor-list')
    }
    const validateForm = () => {
        const fields = [
            { name: "vendorName",   value: vendorName,    errorMessage: "Vendor Name is required." },
            { name: "areaName",     value: areaName,      errorMessage: "Area is required." },
            { name: "showroomName", value: showroomName,  errorMessage: "Showroom Name is required." },
            { name: "emirates",     value: emirates,      errorMessage: "Emirate is required." },
            { name: "address",      value: address,       errorMessage: "Address is required." },
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage }) => {
            if (!value) {
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
                userId        : userDetails?.user_id,
                email         : userDetails?.email,
                vendor_name   : vendorName,
                area_name     : areaName,
                showroom_name : showroomName,
                emirate       : emirates?.value || "",
                address       : address,
                package_price : parseFloat(packagePrice ?? 0),
                rsa_session   : parseInt(rsaSession ?? 0),  
                pod_session   : parseInt(podSession ?? 0),
            }
            postRequestWithToken('vendor-add', obj, async (response) => {
                if (response.status === 1) {
                    toast(response.message , {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/vendors/vendor-list');
                    }, 1000);
                } else {
                    console.log('Error in vendor-add API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };
    const handleEmirates = (selectedOption) => {
        setEmirates(selectedOption);
    }

    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Add Vendor</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    {/* Community Details Section */}
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>Vendor Information</div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="vendorName">Vendor Name</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="vendorName"
                                    placeholder="Vendor Name"
                                    className={styles.inputField}
                                    value={vendorName}
                                    onChange={(e) => setVendorName(e.target.value)}
                                />
                                {errors.vendorName && vendorName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.vendorName}</p>}
                            </div>

                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Emirates</label>
                                <div ref={serviceDropdownRef}>
                                    <Select
                                        className={styles.addShopSelect}
                                        options={emiratesOptions}
                                        value={emirates}
                                        onChange={handleEmirates}
                                        placeholder="Select Emirates"
                                        isClearable={true}
                                    />
                                </div>
                                {errors.emirates && emirates == "" && <p className="error">{errors.emirates}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
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
                                <label className={styles.addShopLabel} htmlFor="showroomName">Showroom name</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="showroomName"
                                    placeholder="Showroom Name"
                                    className={styles.inputField}
                                    value={showroomName}
                                    onChange={(e) => setShowroomName(e.target.value)}
                                />
                                {errors.showroomName && showroomName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.showroomName}</p>}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="fullAddress">Address</label>
                                <textarea
                                    id="fullAddress"
                                    placeholder="Enter full address"
                                    className={styles.inputField}
                                    rows="2"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {errors.address && address == '' && <p className="error">{errors.address}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="packagePrice">
                                    Package Price to Vendor
                                </label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="packagePrice"
                                    placeholder="Package Price"
                                    className={styles.inputField}
                                    value={packagePrice}
                                    // onChange={(e) => setPackagePrice(e.target.value)}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*\.?\d*$/.test(value)) {
                                            setPackagePrice(value);
                                        }
                                    }}
                                />
                                {errors.packagePrice && packagePrice === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.packagePrice}</p>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.formSectionBlock}>
                        <div className={styles.formSectionHeading}>
                            Service Package ( Include For This Vendor )
                        </div>
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="podSession">
                                    Mobile & Portable Charging Session
                                </label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id={`podSession`}
                                    placeholder={`No. Of Charging Session`}
                                    className={styles.inputField}
                                    value={podSession}
                                    min="0"
                                    maxLength="3"
                                    step="1"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            setPodSession(value);
                                        }
                                    }}
                                />
                                { errors.podSession && podSession == "" && <p className="error">{ errors.podSession } </p> }
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="rsaSession">
                                    Roadside Assistance Session
                                </label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id={`rsaSession`}
                                    placeholder={`No. Of Charging Session`}
                                    className={styles.inputField}
                                    value={rsaSession}
                                    min="0"
                                    step="1"
                                    maxLength="3"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {
                                            setRsaSession(value);
                                        }
                                    }}
                                />
                                { errors.rsaSession && rsaSession == "" && <p className="error">{ errors.rsaSession } </p> }
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
                            "Add Vendor"
                        )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );

};

export default AddCommunity;
