import React, { useEffect, useState } from 'react';
import styles from './addcharger.module.css';
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import UploadIcon from '../../../assets/images/uploadicon.svg';
import { postRequestWithTokenAndFile, getRequestWithToken } from '../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import InputMask from 'react-input-mask';

const AddPodBrand = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { deviceId }                        = useParams()
    const [file, setFile]                     = useState();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [brandName, setBrandName]     = useState("");
    // const [deviceId, setDeviceId]       = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate]     = useState("");
    const [endDate, setEndDate]         = useState("");
    const [errors, setErrors]           = useState({});

    const [deviceOptions, setDeviceOptions] = useState([]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast('Please upload a valid image file.', {type:'error'})
        }
    };
    const backButtonClick = () => {
        navigate('/portable-charger/brand-list')
    };
    const handleRemoveImage = () => {
        setFile(null);
    };
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const validateForm = () => {
        const fields = [
            { 
                name    : "brandName", 
                value   : brandName, errorMessage: "Brand Name is required.", 
                isValid : val => val.trim() !== "" 
            },
            { 
                name         : "deviceId", 
                value        : deviceId, 
                errorMessage : "Please Select Device", 
                isValid      :  val => val.trim() !== "" 
            },
            { 
                name         : "description", 
                value        : description, 
                errorMessage : "Description Type is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "startDate", 
                value        : startDate, 
                errorMessage : "Start Date is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "endDate", 
                value        : endDate, 
                errorMessage : "End Date is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "file", 
                value        : file, 
                errorMessage : "Image is required.", 
                isValid      : val => !!val 
            }
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
            formData.append("brand_name", brandName);
            formData.append("device_id", deviceId);
            formData.append("description", description);
            formData.append("start_date", startDate);
            formData.append("end_date", endDate);

            if (file) {
                formData.append("brand_image", file);
            }

            postRequestWithTokenAndFile('add-pod-brand', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/portable-charger/brand-list')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-brand api', response);
                }
            })

        } else {
            console.log("Form validation failed.");
        }
    };
    useEffect(() => {
        // const obj = {
        //     userId  : userDetails?.user_id,
        //     email   : userDetails?.email,
        // };
        // getRequestWithToken('all-pod-device', obj, (response) => {
        //     if (response.code === 200) {
        //         setDeviceOptions(response?.data || []);  
        //         console.log(response.data);
        //     } else {
        //         console.log('error in brand-list API', response);
        //     }
        // });

        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);

    return (
        <div className={styles.containerCharger}>
            <h2 className={styles.title}>Add POD Brand</h2>
            <div className={styles.chargerSection}>
                <form className={styles.form} onSubmit={handleSubmit}>
                <ToastContainer />
                    <div className={styles.row}>
                        
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Brand Name</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Super Charger"
                                value={brandName}
                                onChange={(e) =>
                                    setBrandName(e.target.value.slice(0, 50))
                                }
                            />
                            {errors.brandName && <p className="error">{errors.brandName}</p>}
                        </div>
                        {/* <div className={styles.inputGroup}>
                            <label className={styles.label}>Device Id</label>
                            <div className={styles.selectContainer}>
                                <Select
                                    value={deviceOptions.find(option => option.value === deviceId)}
                                    onChange={(selectedOption) => setDeviceId(selectedOption.value)}
                                    onMenuOpen={toggleDropdown}
                                    onMenuClose={toggleDropdown}
                                    options={deviceOptions}
                                    placeholder="Select"
                                />
                            </div>
                            { errors.deviceId && ( <p className="error"> {errors.deviceId} </p> ) }
                        </div> */}
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Start Date</label>
                            <InputMask
                                mask="99-99-9999"
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Start Date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    if (errors.startDate && e.target.value.length === 10) {
                                        setErrors((prevErrors) => ({ ...prevErrors, startDate: "" }));
                                    }
                                }}
                                onBlur={() => {
                                    if (startDate.length === 10) {
                                        const [day, month, year] = startDate.split('-');
                                        const isValidDate =
                                        !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                        day <= 31 && month <= 12; 
                                        if (!isValidDate) {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                startDate: "Invalid date in DD-MM-YYYY format",
                                            }));
                                        }
                                    }
                                }}
                            />
                            {errors.startDate && <p className="error">{errors.startDate}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>End Date</label>
                            <InputMask
                                mask="99-99-9999"
                                className={styles.inputCharger}
                                type="text"
                                placeholder="DD-MM-YYYY"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    if (errors.endDate && e.target.value.length === 10) {
                                        setErrors((prevErrors) => ({ ...prevErrors, endDate: "" }));
                                    }
                                }}
                                onBlur={() => {
                                    if (endDate.length === 10) {
                                        const [day, month, year] = endDate.split('-');
                                        const isValidDate =
                                        !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                        day <= 31 && month <= 12; 
                                        if (!isValidDate) {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                endDate: "Invalid date in DD-MM-YYYY format",
                                            }));
                                        }
                                    }
                                }}
                            />
                            {errors.endDate && endDate=='' && <p className="error">{errors.endDate}</p>}
                        </div>
                        
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Description</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.description && <p className="error">{errors.description}</p>}
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
                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="error mt-2">{errors.file}</p>}
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


export default AddPodBrand;
