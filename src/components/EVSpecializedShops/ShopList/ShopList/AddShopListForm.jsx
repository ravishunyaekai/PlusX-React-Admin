import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import styles from './addshoplist.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { AiOutlineClose } from 'react-icons/ai';
import UploadIcon from "../../../../assets/images/uploadicon.svg";
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Add from '../../../../assets/images/Plus.svg'
import Remove from '../../../../assets/images/remove.svg'
import ReactInputMask from "react-input-mask"

const AddShopListForm = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();
    // State variables
    const [isAlwaysOpen, setIsAlwaysOpen]     = useState(false);   
    const [brandOptions, setBrandOptions]     = useState([])
    const [serviceOptions, setServiceOptions] = useState([])
    
    const [services, setServices] = useState([])
    const [brands, setBrands]     = useState([])
    
    const [showMap, setShowMap]   = useState(false);
    const [center, setCenter]     = useState({ lat: 0, lng: 0 });
    const [shopName, setShopName] = useState('')
    const [contact, setContact]   = useState('')
    
    const [description, setDescription]   = useState('')
    const [offerDetails, setOfferDetails] = useState('')
    
    const [address, setAddress]     = useState('')
    const [latitude, setLatitude]   = useState('')
    const [longitude, setLongitude] = useState('')

    const [loader, setLoader] = useState(false);    
    const { isLoaded }        = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });
    const handleOnBlur = (currentAddress) => {
        
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: currentAddress }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();

                setLatitude(lat);
                setLongitude(lng);
               
                setCenter({ lat, lng });
                setShowMap(true);
            } else {
                setLatitude('');
                setLongitude('');
            }
        });
    };
    const handleCloseClick = () => {
        setShowMap(false); // This should hide the map
    };

    const [timeSlots, setTimeSlots] = useState({
        Monday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Tuesday   : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Wednesday : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Thursday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Friday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Saturday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Sunday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
    });
    const [errors, setErrors]             = useState({});
    const [file, setFile]                 = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);

    const handleBrand = (selectedOption) => {
        setBrands(selectedOption)
    }
    const handleService = (selectedOption) => {
        setServices(selectedOption)
    }
    // Event Handlers
    const handleAlwaysOpenChange = () => {
        setIsAlwaysOpen(!isAlwaysOpen);
    };
    const handleTimeChange = (day, timeType) => (event) => {
        const value = event.target.value.replace(/[^0-9:-]/g, '');
        setTimeSlots((prev) => {
            const updatedTimeSlots = {
                ...prev,
                [day]: {
                    ...prev[day],
                    [timeType]: value,
                },
            };
            if (timeType === 'open') {
                updatedTimeSlots[day].closeMandatory = (value) ? true : false ;
                
            } else if (timeType === 'close') {
                updatedTimeSlots[day].openMandatory = (value) ? true : false ;
                
            }
            return updatedTimeSlots;
        });
    };
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setErrors({ ...errors, file: null });
    };
    const handleRemoveImage = () => {
        setFile(null);
    };
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setGalleryFiles(files);
        setErrors({ ...errors, gallery: null });
    };
    const handleRemoveGalleryImage = (index) => {
        const updatedFiles = galleryFiles.filter((_, i) => i !== index);
        setGalleryFiles(updatedFiles);
    };
    const handleCancel = () => {
        navigate("/ev-specialized/shop-list");
    };
    const validateForm = () => {
        const fields = [
            { name: "shopName",  value: shopName, errorMessage: "Shop name is required." },
            { name: "contactNo", value: contact,  errorMessage: "Please enter a valid contact no.", isMobile: true },
            { name: "brands",    value: brands,   errorMessage: "Brand is required.",               isArray: true },
            { name: "services",  value: services, errorMessage: "Service is required.",             isArray: true },
            
            { name: "address",      value: address,     errorMessage: "Address is required." },
            { name: "latitude",     value: latitude,    errorMessage: "Latitude is required." },
            { name: "longitude",    value: longitude,   errorMessage: "Longitude is required." },
            { name: "description",  value: description, errorMessage: "Description is required." },
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isMobile, isArray, isEmail }) => {
            // if (!value && !isEmail) {
            //     errors[name] = errorMessage;

            // } else 
            if (isMobile && (isNaN(value) || value.length < 9 || value.length > 12)) {
                errors[name] = errorMessage;
            } 
            // else if (isEmail && value && !/^[\w.%+-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            //     errors[name] = errorMessage;

            // } 
            else  if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});

        const hasValidTimeSlot = Object.values(timeSlots).some(
            (times) => times.open && times.close
        );
        if (!isAlwaysOpen && !hasValidTimeSlot) {
            newErrors["timeSlots"] = "Either select 'Always Open' or fill at least one time slot.";
        }
            // Validate time slots only if not always open
        if (!isAlwaysOpen) {
            Object.entries(timeSlots).forEach(([day, times]) => {
                if (times.open && !times.close) {
                    newErrors[`${day}CloseTime`] = `${day} Close Time is required`;
                }
                if (times.close && !times.open) {
                    newErrors[`${day}OpenTime`] = `${day} Open Time is required`;
                }
            });
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoader(true);

        if (validateForm()) {
            const formattedData = isAlwaysOpen ? { always_open: 1, days: [] }
                : Object.entries(timeSlots).reduce((acc, [day, times]) => {
                if (times.open && times.close) {
                    acc.days.push(day.toLowerCase());
                    acc[`${day.toLowerCase()}_open_time`] = times.open;
                    acc[`${day.toLowerCase()}_close_time`] = times.close;
                }
                return acc;
            }, { days: [] });
            
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            
            formData.append("shop_name", shopName);
            formData.append("contact_no", contact);
            formData.append("description", description);
            formData.append("offerDetails", offerDetails);

            formData.append("address", address);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            
            if (brands && brands.length > 0) {
                // const selectedBrandsString = brands.map(brand => brand.value); //.join(', ');
                formData.append("brands", JSON.stringify(brands) );
            }
            if (services && services.length > 0) {
                // const selectedServices = services.map(brand => brand.value);
                formData.append("services", JSON.stringify(services));
            }
            formData.append("always_open", formattedData.always_open || 0);

            if (isAlwaysOpen) {
                formData.append("days[]", formattedData.days);
            } else {
                formattedData.days.forEach(day => formData.append("days[]", day));
            }
            if (!isAlwaysOpen) {
                Object.keys(formattedData).forEach(key => {
                    if (key !== 'days' && key !== 'always_open') {
                        formData.append(key, formattedData[key]);
                    }
                });
            }
            if (file) {
                formData.append("cover_image", file);
            }
            if (galleryFiles.length > 0) {
                galleryFiles.forEach((galleryFile) => {
                    formData.append("shop_gallery", galleryFile);
                });
            }
            postRequestWithTokenAndFile('shop-add', formData, async (response) => {
                if (response.status === 1) {
                    toast( response.message, { type: 'success' })
                    setTimeout(() => {
                        setLoader(false);
                        navigate('/ev-specialized/shop-list');
                    }, 1000);
                } else {
                    toast( response.message, { type: 'error' })
                    console.log('Error in shop-add API:', response);
                    setLoader(false);
                }
            })
        } else {
            toast.error("Some fields are missing");
            setLoader(false);
        }
    };

    const fetchDetails = () => {
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            shop_id : ''
        };
        postRequestWithToken('shop-data', obj, (response) => {
            if (response.code === 200) {
        
                const services = response.services || [];
                const formattedServices = services.map(item => ({
                    value: item,
                    label: item
                }));
                setServiceOptions(formattedServices);

                const brands = response.brands || [];
                const formattedBrands = brands.map(brand => ({
                    value: brand,
                    label: brand
                }));
                setBrandOptions(formattedBrands);

            } else {
                console.log('error in shop-data API', response);
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
    const handleDragEnd = (e) => {

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setCenter({ lat, lng });
        setLatitude( lat );
        setLongitude( lng );
               
        // const geocoder = new window.google.maps.Geocoder();
        // geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        //     if (status === "OK" && results[0]) {
        //         // setAddress(results[0].formatted_address);
        //         console.log("Address:", results[0].formatted_address);
        //     } else {
        //         console.error("Geocoder failed due to:", status);
        //     }
        // });
    };

    return ( <>
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Add Shop</div>
            <div className={styles.addShopFormSection}>
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label htmlFor="shopName" className={styles.addShopLabel}>Shop Name</label>
                            <input type="text" id="shopName"
                                autoComplete="off"
                                placeholder="Shop Name"
                                className={styles.inputField}
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                            />
                            {errors.shopName && shopName == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.shopName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label htmlFor="contactNo" className={styles.addShopLabel}>Contact No</label>
                            <input type="text" id="contactNo"
                                autoComplete="off"
                                placeholder="Contact No"
                                className={styles.inputField}
                                value={contact}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,12}$/.test(value)) {
                                        setContact(value);
                                    }
                                }}
                                onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            {errors.contactNo && contact.length < 9 && <p className={styles.error} style={{ color: 'red' }}>{errors.contactNo}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label htmlFor="availableBrands" className={styles.addShopLabel}>Available Brands</label>
                            <MultiSelect
                                options={brandOptions}
                                value={brands}
                                onChange={handleBrand}
                                labelledBy="Select Brands"
                                className={styles.addShopSelect}
                            />
                            {errors.brands && (!brands || brands.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.brands}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label htmlFor="services" className={styles.addShopLabel}>Services</label>
                            <MultiSelect
                                options={serviceOptions}
                                value={services}
                                onChange={handleService}
                                labelledBy="Select Services"
                                className={styles.addShopSelect}
                            />
                            {errors.services && (!services || services.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.services}</p>}
                        </div>
                    </div>
                    <div className={styles.textarea}>
                        <div className={styles.mapMainContainer}>
                            <div className={styles.addShopInputContainer}>
                                <label htmlFor="description" className={styles.addShopLabel}> Description </label>
                                <textarea
                                    rows="4"
                                    autoComplete="off"
                                    type="text"
                                    id="description"
                                    placeholder="Description"
                                    className={styles.inputField}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                {errors.description && description == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.description}</p>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.textarea}>
                        <div className={styles.mapMainContainer}>
                            <div className={styles.addShopInputContainer}>
                                <label htmlFor="offerDetails" className={styles.addShopLabel}> Offer Details </label>
                                <textarea
                                    rows="4"
                                    autoComplete="off"
                                    type="text"
                                    id="offerDetails"
                                    placeholder="Offer Details"
                                    className={styles.inputField}
                                    value={offerDetails}
                                    onChange={(e) => setOfferDetails(e.target.value)}
                                />
                                {errors.offerDetails && offerDetails == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.offerDetails}</p>}
                            </div>
                        </div>
                    </div>
                
                    <div className={styles.row}>
                        <div className={styles.textarea}>
                            <div className={styles.mapMainContainer}>
                                <div className={styles.addShopInputContainer}>
                                    <label htmlFor="mapLocation" className={styles.addShopLabel}>
                                        Full Address
                                    </label>
                                    <input
                                        autoComplete="off"
                                        type="text"
                                        id="mapLocation"
                                        placeholder="Enter Address"
                                        className={styles.inputField}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value) }
                                        onBlur={(e) => handleOnBlur(e.target.value)}
                                    />
                                    {errors.address && address === "" &&  <p className={styles.error}>{errors.address}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.row}>
                        
                        <div className={styles.addShopInputContainer}>
                            <label htmlFor="latitude" className={styles.addShopLabel}>Latitude</label>
                            <input type="text" id="latitude"
                                autoComplete="off"
                                placeholder="Latitide"
                                className={styles.inputField}
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                            />
                            {errors.latitude && latitude === "" && <p className={styles.error}>{errors.latitude}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label htmlFor="longitude" className={styles.addShopLabel}>Longitude</label>
                            <input type="text" id="longitude"
                                autoComplete="off"
                                placeholder="Longitude"
                                className={styles.inputField}
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                            />
                            {errors.longitude && longitude === "" && <p className={styles.error}>{errors.longitude}</p>}
                        </div>
                    </div>
                
                    <div className={styles.mapEmbedContainer}>
                        {showMap && isLoaded && (
                            <div className={styles.mapContainer}>
                                <button
                                    className={styles.closeButton}
                                    onClick={handleCloseClick}
                                    title="Close Map"
                                >
                                    ✖
                                </button>
                                <GoogleMap
                                    mapContainerStyle={{ width: "100%", height: "300px", borderRadius: "8px" }}
                                    center={center}
                                    zoom={14}
                                >
                                    <Marker position={center} draggable={true} onDragEnd={handleDragEnd} />
                                </GoogleMap>
                            </div>
                        )}
                        <div className={styles.scheduleSection}>
                            <div className={styles.alwaysOpen}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        className={styles.checkboxInput}
                                        type="checkbox"
                                        id="alwaysOpen"
                                        checked={isAlwaysOpen}
                                        onChange={handleAlwaysOpenChange}
                                    />
                                    <span className={styles.checkmark}></span>
                                    <div className={styles.checkboxText}>Always Open</div>
                                </label>
                            </div>

                            {!isAlwaysOpen && (
                                <div className={styles.timeSlotContainer}>
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day =>(
                                    <div className={styles.dayRow} key={day}>
                                        <span className={styles.dayLabel}>{day}</span>
                                        <label htmlFor={`${day}OpenTime`} className={styles.inputLabel}>
                                            <span className={styles.openSection}> Open Time</span>
                                            <ReactInputMask
                                            mask="99:99"
                                                id={`${day}OpenTime`}
                                                placeholder="Enter time"
                                                className={styles.timeField}
                                                value={timeSlots[day].open}
                                                onChange={handleTimeChange(day, 'open')}
                                            />
                                            {errors[`${day}OpenTime`] && <p className={styles.error} style={{ color: 'red' }}>{errors[`${day}OpenTime`]}</p>}
                                        </label>
                                        <label htmlFor={`${day}CloseTime`} className={styles.inputLabel}>
                                            <span className={styles.openSection}>Close Time</span>
                                            <ReactInputMask
                                                mask="99:99"
                                                id={`${day}CloseTime`}
                                                placeholder="Enter time"
                                                className={styles.timeField}
                                                value={timeSlots[day].close}
                                                onChange={handleTimeChange(day, 'close')}
                                            />
                                            {errors[`${day}CloseTime`] && <p className={styles.error} style={{ color: 'red' }}>{errors[`${day}CloseTime`]}</p>}
                                        </label>
                                    </div>
                                ))}
                                </div>
                            )}
                            {errors.timeSlots && <p className={styles.error} style={{ color: 'red' }}>{errors.timeSlots}</p>}
                        </div>
                    </div>
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Cover Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="coverFileUpload"
                                // accept="image/*"
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
                                    <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImage} />
                                    <button type="button" className={styles.removeButton} onClick={handleRemoveImage}>
                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                    </div>
                    {/* Station Gallery Multiple Image Upload */}
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Station Gallery</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="galleryFileUpload"
                                accept=".jpeg,.jpg"
                                multiple
                                onChange={handleGalleryChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="galleryFileUpload" className={styles.fileUploadLabel}>
                                <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                <p>Select Files to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                            </label>
                        </div>
                        {galleryFiles && (
                            <div className={styles.galleryContainer}>
                                {galleryFiles.map((image, index) => (
                                    <div className={styles.imageContainer} key={index}>
                                    <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} className={styles.previewImage} />
                                    <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(index)}>
                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                    </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.gallery && <p className={styles.error} style={{ color: 'red' }}>{errors.gallery}</p>}
                    </div>
                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                        <button disabled={loader} type="submit" className={styles.editSubmitBtn}>
                            {loader ? (
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
            <ToastContainer />
        </div>
    </>);
};

export default AddShopListForm;

