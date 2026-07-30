import React, { useEffect, useRef, useState } from 'react';
import styles from './addemergency.module.css';
import Select from "react-select";
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import UploadIcon from '../../assets/images/uploadicon.svg';
import { postRequestWithToken, postRequestWithTokenAndFile } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';

const EditEmergencyTeam = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                              = useNavigate();
    const { rsaId }                             = useParams()
    const [file, setFile]                       = useState();
    const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
    const [details, setDetails]                 = useState()
    const [rsaName, setRsaName]                 = useState("");
    const [email, setEmail]                     = useState("");
    const [mobileNo, setMobileNo]               = useState("");
    const [serviceType, setServiceType]         = useState(null);
    const [password, setPassword]               = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors]                   = useState({});
    const [loading, setLoading]                 = useState(false);

    const typeOpetions = [
        // { value: "", label: "Select Vehicle Type" },
        { value: "Charger Installation", label: "Charger Installation" },
        { value: "EV Pre-Sale",          label: "EV Pre-Sale" },
        { value: "Portable Charger",     label: "Portable Charger" },
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
            // { name: "password", value: password, errorMessage: "Password is required." },
            // { name: "confirmPassword", value: confirmPassword, errorMessage: "Passwords do not match.", isPasswordMatch: true },
            // { name: "file", value: file, errorMessage: "Image is required." }
        ];

        if (password || confirmPassword) {
            if (!password) {
                fields.push({ name: "password", value: password, errorMessage: "Password is required." });
            }
            if (!confirmPassword) {
                fields.push({ name: "confirmPassword", value: confirmPassword, errorMessage: "Confirm Password is required." });
            }
            if (password && confirmPassword && password !== confirmPassword) {
                fields.push({ name: "confirmPassword", value: confirmPassword, errorMessage: "Passwords do not match." });
            }
        }
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isPasswordMatch }) => {
            if (!value) {
                errors[name] = errorMessage;
            } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                errors[name] = errorMessage;
            } else if (isMobile && (isNaN(value) || value.length < 9)) {
                errors[name] = errorMessage;
                // toast('Mobile No should be valid', {type:'error'})
            }
            else if (password && isPasswordMatch && value !== password) {
                errors[name] = errorMessage;
                // toast('Passwords do not match.', {type:'error'})
            } 
            return errors;
        }, {});
        if (password && confirmPassword && password !== confirmPassword) {
            newErrors["confirmPassword"] = "Passwords do not match.";
            // toast("Passwords do not match.", { type: 'error' });
        } else if (password && password.length < 6) {
            newErrors['password'] = "Password should be at least 6 characters long.";
            // toast('Password should be at least 6 characters long.', { type: 'error' });
        }
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
            formData.append("rsa_id", rsaId);
            formData.append("rsa_email", email);
            formData.append("rsa_name", rsaName);
            formData.append("mobile", mobileNo);
            if (serviceType) {
                formData.append("service_type", serviceType.value);
            }
            formData.append("password", password);

            if (file) {
                formData.append("profile_image", file);
            }

            postRequestWithTokenAndFile('rsa-update', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/drivers/driver-list')
                    }, 1000);
                } else {
                    toast(response.message[0] || response.message, {type:'error'})
                    console.log('error in rsa-update api', response);
                    setLoading(false);
                }
            });

        } else {
            console.log("Form validation failed.");
            // toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            rsa_id: rsaId
        };

        postRequestWithToken('rsa-data', obj, (response) => {
            if (response.code === 200) {
                const data = response?.rsaData || {};
                setDetails(data);
                setRsaName(data?.rsa_name || "");
                setEmail(data?.email || "");
                setMobileNo(data?.mobile || "");
                // setServiceType(data?.booking_type || "");
                // setPassword(data?.password || "");
                // setConfirmPassword(data?.password || "");
                setFile(data?.profile_img || "")
                const initialType = data.booking_type ? { label: data.booking_type, value: data.booking_type } : null;
                setServiceType(initialType);

            } else {
                
                console.log('error in rsa-details API', response);
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
            <ToastContainer />
            <div className={styles.addHeading}>Edit Driver</div>
            <div className={styles.addShopFormSection}>
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Driver Name</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Driver Name"
                                value={rsaName}
                                onChange={(e) => setRsaName(e.target.value.slice(0, 50))}
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
                            {errors.mobileNo && mobileNo.length < 9 && <p className="error">{errors.mobileNo}</p>}
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
                            {errors.password && password.length < 6 && <p className="error">{errors.password}</p>}
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
                            {errors.confirmPassword &&  confirmPassword != password && <p className="error">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="fileUpload"
                                autoComplete='off'
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
                                        src={
                                            typeof file === 'string'
                                                ? `${process.env.REACT_APP_DIR_UPLOADS}rsa_images/${file}`
                                                : URL.createObjectURL(file)
                                        }
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



export default EditEmergencyTeam;

