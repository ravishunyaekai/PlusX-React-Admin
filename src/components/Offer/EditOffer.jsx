import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { MultiSelect } from "react-multi-select-component";
import styles from './addoffer.module.css';
import UploadIcon from '../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import InputMask from 'react-input-mask';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const EditOffer = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const {offerId}                      = useParams();
    const [details, setDetails]           = useState();
    const [file, setFile]                 = useState(null);
    const [errors, setErrors]             = useState({});
    const [couponName, setCouponName]     = useState('');
    const [expiryDate, setExpiry]         = useState('');
    const [url, setUrl]                   = useState('');
    const [loading, setLoading]           = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            console.log(selectedFile)
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            alert('Please upload a valid image file.');
        }
    };
    const handleRemoveImage = () => setFile(null);
    const validateForm = () => {
    const fields = [
        { name: "couponName", value: couponName, errorMessage: "Offer Name is required." },
        { name: "url", value: url, errorMessage: "URL is required." },
        { name: "expiryDate", value: expiryDate, errorMessage: "Expiry Date is required."},
        { name: "file", value: file, errorMessage: "Image is required." },
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

        if (validateForm()) {
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("offer_id", offerId);
            formData.append("offer_name", couponName);
            formData.append("offer_url", url);
            formData.append("status", isActive === true ? 1 : 0);
            const convertToDateFormat = (date) => {
                const [day, month, year] = date.split('-');
                return `${year}-${month}-${day}`;
            };
            const formattedExpiryDate = convertToDateFormat(expiryDate);
            
            formData.append("expiry_date", formattedExpiryDate);
            if (file) {
            formData.append("offer_image", file);
        }
        
            
        postRequestWithTokenAndFile('edit-offer', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/offer/offer-list');
                    }, 1500);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in electric-bike-edit API:', response);
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
        userId     : userDetails?.user_id,
        email      : userDetails?.email,
        offer_id  : offerId
    };
    postRequestWithToken('offer-detail', obj, (response) => {
        
        if (response.status === 1) {
            const data = response?.data || {};
            setDetails(data);
            setCouponName(data?.offer_name || "");
            setUrl(data?.offer_url || "")
            setFile(data?.offer_image || "");
            const formattedDate = moment(data?.offer_exp_date).format('DD-MM-YYYY');
            setExpiry(formattedDate);
            setIsActive(data?.status === '1' ? true : false)
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
    navigate('/offer/offer-list')
}

const [isActive, setIsActive] = useState(false);

const handleToggle = () => {
    setIsActive(!isActive);
};
console.log(process.env.REACT_APP_DIR_UPLOADS)
  return (
    <div className={styles.addShopContainer}>
        <ToastContainer />
        <div className={styles.addHeading}>Edit Offer</div>
        <div className={styles.addShopFormSection}>
            <form className={styles.formSection} onSubmit={handleSubmit}>
                <div className={styles.row}>
                    <div className={styles.addShopInputContainer}>
                    <label className={styles.addShopLabel} htmlFor="modelName">Offer Name</label>
                    <input type="text" id="couponName"
                    autoComplete="off" 
                        placeholder="Offer Name" 
                        className={styles.inputField} 
                        value={couponName}
                        onChange={(e) => setCouponName(e.target.value)}
                        />
                        {errors.couponName && couponName == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.couponName}</p>}
                    </div>
                    <div className={styles.addShopInputContainer}>
                        <label className={styles.addShopLabel} htmlFor="expiryDate">Expiry Date</label>
                        <InputMask
                            mask="99-99-9999"
                            value={expiryDate}
                            onChange={(e) => {
                            setExpiry(e.target.value);
                            if (errors.expiryDate && e.target.value.length === 10) {
                                setErrors((prevErrors) => ({ ...prevErrors, expiryDate: "" }));
                            }
                            }}
                            onBlur={() => {
                            if (expiryDate.length === 10) {
                                const [day, month, year] = expiryDate.split('-');
                                const isValidDate =
                                !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                day <= 31 && month <= 12; 
                                if (!isValidDate) {
                                setErrors((prevErrors) => ({
                                    ...prevErrors,
                                    expiryDate: "Invalid date in DD-MM-YYYY format",
                                }));
                                }
                            }
                            }}
                            placeholder="DD-MM-YYYY"
                            className={styles.inputField}
                        />
                        {errors.expiryDate && expiryDate == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.expiryDate}</p>}
                        </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.addShopInputContainer}>
                    <label className={styles.addShopLabel} htmlFor="url">Offer URL</label>
                    <input type="text"
                    autoComplete="off"
                    id="url" 
                    placeholder="Offer URL" 
                    className={styles.inputField} 
                    value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    {errors.url && url == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.url}</p>}
                    </div>
                </div>
                <div className={styles.fileUpload}>
                    <label className={styles.fileLabel}>Cover Image</label>
                    <div className={styles.fileDropZone}>
                        <input
                            type="file"
                            id="coverFileUpload"
                            accept=".jpeg,.jpg"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        {!file ? (
                            <label htmlFor="coverFileUpload" className={styles.fileUploadLabel}>
                                <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                            </label>
                        ) : (
                            <div className={styles.imageContainer}>
                                {/* <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImage} /> */}
                                <img
                                    src={
                                        typeof file === 'string'
                                            ? `${process.env.REACT_APP_DIR_UPLOADS}offer/${file}`
                                            : URL.createObjectURL(file)
                                    }
                                    alt="Preview"
                                    className={styles.previewImage}
                                />
                                <button type="button" className={styles.removeButton} onClick={handleRemoveImage}>
                                    <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                </button>
                            </div>
                        )}
                    </div>
                    {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
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

export default EditOffer;
