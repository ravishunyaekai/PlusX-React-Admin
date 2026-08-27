import React, { useEffect, useRef, useState } from 'react';
import Select from "react-select";
import styles from './addemergency.module.css';
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import UploadIcon from '../../assets/images/uploadicon.svg';
import { postRequestWithTokenAndFile } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AddEmergencyTeam = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                              = useNavigate();
    const [file, setFile]                       = useState();
    const [rsaName, setRsaName]                 = useState("");
    const [email, setEmail]                     = useState("");
    const [mobileNo, setMobileNo]               = useState("");
    const [serviceType, setServiceType]         = useState(null);
    const [password, setPassword]               = useState("");
    const [confirmPassword, setConfirmPassword] = useState(null);
    const [errors, setErrors]                   = useState({});
    const [loading, setLoading]                 = useState(false);

    const typeOpetions = [
        // { value: "", label: "Select Vehicle Type" },
        { value: "Charger Installation", label: "Charger Installation" },
        { value: "EV Pre-Sale",          label: "EV Pre-Sale" },
        // Display rename only — keep value as DB/API value so backend is unchanged
        // { value: "Portable Charger",     label: "Portable Charger" }, // old label
        { value: "Portable Charger",     label: "Mobile & Portable EV Charging Service" }, // new label
        { value: "Roadside Assistance",  label: "Roadside Assistance" },
        { value: "Valet Charging",       label: "Valet Charging" },
    ];

    const handleType = (selectedOption) => {
        setServiceType(selectedOption)
    }

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            alert('Please upload a valid image file.');
        }
    };
    
    

    const handleRemoveImage = () => {
        setFile(null);
    };
    const serviceDropdownRef = useRef(null);

    const validateForm = () => {
        const fields = [
            { name: "rsaName", value: rsaName, errorMessage: "Driver Name is required." },
            { name: "email", value: email, errorMessage: "Please enter a valid Email ID.", isEmail: true },
            { name: "mobileNo", value: mobileNo, errorMessage: "Please enter a valid Mobile No.", isMobile: true },
            { name: "serviceType", value: serviceType, errorMessage: "Service Type is required." },
            { name: "password", value: password, errorMessage: "Password is required." },
            { name: "confirmPassword", value: confirmPassword, errorMessage: "Passwords do not match.", isPasswordMatch: true },
            // { name: "file", value: file, errorMessage: "Image is required." }
        ];
    
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isPasswordMatch }) => {
            if (!value) {
                errors[name] = errorMessage;
            } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                errors[name] = errorMessage;
            } else if (isMobile && (isNaN(value) || value.length < 9)) {
                errors[name] = errorMessage;
                
            } else if (isPasswordMatch && value !== password) {
                errors[name] = errorMessage;
               
            } else if (name === 'password' && value.length < 6) {
                errors[name] = "Password should be at least 6 characters long.";
                
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

            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("rsa_email", email);
            formData.append("rsa_name", rsaName);
            formData.append("mobile", mobileNo);
            if (serviceType) {
                formData.append("service_type", serviceType.value);
            }
            // formData.append("service_type", serviceType);
            formData.append("password", password);
            formData.append("confirm_password", confirmPassword);

            if (file) {
                formData.append("profile_image", file);
            }

            postRequestWithTokenAndFile('rsa-add', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/drivers/driver-list')
                    }, 1000);
                } else {
                    toast(response.message[0] || response.message, {type:'error'})
                    console.log('error in rider-list api', response);
                    setLoading(false);
                }
            });

        } else {
            console.log("Form validation failed.", errors);
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);

    return (
        <div className={styles.addShopContainer}>
            <ToastContainer />
            <div className={styles.addHeading}>Add Driver</div>
            <div className={styles.addShopFormSection}>
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="shopName">Driver Name</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Driver Name"
                                value={rsaName}
                                onChange={(e) => {setRsaName(e.target.value.slice(0, 50))
                                   
                                }}
                            />
                            {errors.rsaName && rsaName == '' && <p className="error">{errors.rsaName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Email ID</label>
                            <input
                                className={styles.inputField}
                                type="email"
                                autoComplete='off'
                                placeholder="Email ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.slice(0, 50))}
                            />
                            {errors.email && email == '' && <p className="error">{errors.email}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Mobile No</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Mobile No"
                                value={mobileNo}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setMobileNo(value.slice(0, 12)); 
                                }}
                            />
                            {errors.mobileNo && mobileNo.length < 9 &&   <p className="error">{errors.mobileNo}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Service Type</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={typeOpetions}
                                    value={serviceType}
                                    onChange={handleType}
                                    placeholder="Select Service"
                                    isClearable={true}
                                />

                            </div>
                            {errors.serviceType && serviceType == null && <p className="error">{errors.serviceType}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Password</label>
                            <input
                                className={styles.inputField}
                                type="password"
                                autoComplete='off'
                                placeholder="Password"
                                value={password}
                                maxlength="12"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && password.length < 6 &&  <p className="error">{errors.password}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Confirm Password</label>
                            <input
                                className={styles.inputField}
                                type="password"
                                autoComplete='off'
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                maxlength="12"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {errors.confirmPassword && confirmPassword != password && <p className="error">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="fileUpload"
                                accept=".jpeg,.jpg"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {!file ? (
                                <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                                    <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                    <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                </label>
                            ) : (
                                <div className={styles.imageContainer}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Preview"
                                        className={styles.previewImage}
                                    />
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={handleRemoveImage}
                                    >
                                        <AiOutlineClose size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="error">{errors.file}</p>}
                    </div>
                    <div className={styles.editButton}>
                        <button disabled={loading} className={styles.editSubmitBtn} type="submit">
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Add...
                            </>
                        ) : (
                            "Add"
                        )}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};



export default AddEmergencyTeam;
