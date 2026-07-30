import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import UploadIcon from '../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './addcharger.module.css';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ReactInputMask from "react-input-mask"

const AddChargerStation = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const [file, setFile]                     = useState(null);
    const [galleryFiles, setGalleryFiles]     = useState([]);
    const [errors, setErrors]                 = useState({});
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedType, setSelectedType]     = useState([])
    const [stationName, setStationName]       = useState('')
    const [chargingFor, setChargingFor]       = useState([])
    const [chargingType, setChargingType]     = useState('')
    const [chargingPoint, setChargingPoint]   = useState('')
    const [description, setDescription]       = useState('')
    const [address, setAddress]               = useState('')
    const [latitude, setLatitude]             = useState('')
    const [longitude, setLongitude]           = useState('')
    // const [open, setOpen]                     = useState(false)
    const [isAlwaysOpen, setIsAlwaysOpen]     = useState(false);
    const [loading, setLoading]               = useState(false);

    const [availableChargingPoint, setAvailableChargingPoint] = useState('')
    const [occupiedChargingPoint, setOccupiedChargingPoint]   = useState('')

    const [timeSlots, setTimeSlots] = useState({
        Monday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Tuesday   : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Wednesday : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Thursday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Friday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Saturday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Sunday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
    });

    // const { isLoaded } = useJsApiLoader({
    //     googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    // });
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
                if (value) {
                    updatedTimeSlots[day].closeMandatory = true;
                } else {
                    updatedTimeSlots[day].closeMandatory = false;
                }
            } else if (timeType === 'close') {
                if (value) {
                    updatedTimeSlots[day].openMandatory = true;
                } else if (!updatedTimeSlots[day].open) {
                    updatedTimeSlots[day].openMandatory = false;
                }
            }
            return updatedTimeSlots;
        });
    };

    const handleCancel = () => {
        navigate('/public-charger-station/public-charger-station-list')
    }
    const brandDropdownRef = useRef(null);
    const serviceDropdownRef = useRef(null);

    const handleAlwaysOpenChange = (event) => {
        setIsAlwaysOpen(event.target.checked);
    };
    // const [selectedService, setSelectedService] = useState(null);
    // const handleServiceChange = (selectedOption) => setSelectedService(selectedOption);

    const handleChargingFor = (selectedOptions) => {
        setSelectedBrands(selectedOptions);
    };
    const handleChargingType = (selectedOption) => {
        setSelectedType(selectedOption);
    };
    const [price, setPrice] = useState(null);
    const priceOptions = [
        { value: "Free", label: "Free" },
        { value: "Paid", label: "Paid" },
    ];
    const handleLocationChange = (selectedOption) => setPrice(selectedOption);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            alert('Please upload a valid image file.');
        }
    };
    const handleRemoveImage = () => setFile(null);

    const handleGalleryChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));

        if (validFiles.length !== selectedFiles.length) {
            alert('Please upload only valid image files.');
            return;
        }
        setGalleryFiles((prevFiles) => [...prevFiles, ...validFiles]);
        setErrors((prev) => ({ ...prev, gallery: "" }));
    };
    const handleRemoveGalleryImage = (index) => {
        setGalleryFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleOnBlur = (value) => {
        const currentAddress = value
        const geocoder       = new window.google.maps.Geocoder();
        geocoder.geocode({ address: currentAddress }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();
        
                setLatitude(lat)
                setLongitude(lng)
            }
        });
    };
    useEffect(() => {
        return () => {
            galleryFiles.forEach((image) => URL.revokeObjectURL(image));
        };
    }, [galleryFiles]);

    const validateForm = () => {
        const fields = [
            { name: "stationName", value: stationName, errorMessage: "Station Name is required." },
            { name: "chargerType", value: selectedType, errorMessage: "Charging Type is required.", isArray: true },
            { name: "chargingFor", value: selectedBrands, errorMessage: "Charging For is required.", isArray: true },
            { name: "chargingPoint", value: chargingPoint, errorMessage: "Charging Point is required." },
            { name: "availableChargingPoint", value: availableChargingPoint, errorMessage: "Available Charging Point is required." },
            { name: "description", value: description, errorMessage: "Description is required." },
            { name: "address", value: address, errorMessage: "Address is required." },
            { name: "latitude", value: latitude, errorMessage: "Latitude is required." },
            { name: "longitude", value: longitude, errorMessage: "Longitude is required." },
            { name: "price", value: price, errorMessage: "Price selection is required." }
        ];
    
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
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
        console.log("asdasd")
        e.preventDefault();
        setLoading(true);

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
            formData.append("station_name", stationName);
        
            if (selectedBrands && selectedBrands.length > 0) {
                const selectedBrandsString = selectedBrands.map(brand => brand.value).join(', ');
                formData.append("charging_for", selectedBrandsString);
            }
            if (selectedType) {
                formData.append("charger_type", selectedType.value);
            }
            formData.append("charging_point", chargingPoint);
            formData.append("description", description);
            formData.append("address", address);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);  //
            formData.append("availableChargingPoint", availableChargingPoint);
            formData.append("occupiedChargingPoint", occupiedChargingPoint);
        
            if (price) {
                formData.append("price", price.value);
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
            postRequestWithTokenAndFile('public-charger-add-station', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/public-charger-station/public-charger-station-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in public-charger-add-station API:', response);
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

        postRequestWithToken('public-charger-station-data', obj, (response) => {
            if (response.code === 200) {

                const transformedChargingFor = (response?.data?.chargingFor || []).map(item => ({
                    label: item,
                    value: item
                }));
                const transformedChargingType = (response?.data?.chargerType || []).map(item => ({
                    value: item,
                    label: item
                }));

                setChargingFor(transformedChargingFor);
                setChargingType(transformedChargingType)
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
            
            <div className={styles.addHeading}>Add Public Chargers</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="shopName">Station Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="shopName"
                                placeholder="Shop Name"
                                className={styles.inputField}
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                            />
                            {errors.stationName && stationName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="availableBrands">Charging For</label>
                            <div ref={brandDropdownRef}>
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={chargingFor}
                                    value={selectedBrands}
                                    onChange={handleChargingFor}
                                    labelledBy="Charging For"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.chargingFor && selectedBrands.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargingFor}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="services">
                                Charger Type
                            </label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={chargingType}
                                    value={selectedType}
                                    onChange={handleChargingType}
                                    placeholder="Select Service"
                                    isClearable={true}
                                />
                            </div>
                            {errors.chargerType && (!selectedType || selectedType.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">Charging Point</label>

                            <input
                                type="text"
                                 autoComplete="off"
                                id="chargingPoint"
                                placeholder="Charging Point"
                                className={styles.inputField}
                                value={chargingPoint}
                                // onChange={(e) => setChargingPoint(e.target.value)} 
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,4}$/.test(value)) {
                                        setChargingPoint(value);
                                    }
                                }}
                            />
                            {errors.chargingPoint && chargingPoint === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargingPoint}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="availableChargingPoint">
                                Available Charging Point
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="availableChargingPoint"
                                placeholder="Available Charging Point"
                                className={styles.inputField}
                                value={availableChargingPoint}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,4}$/.test(value)) {
                                        setAvailableChargingPoint(value);
                                    }
                                }}
                            />
                            {errors.availableChargingPoint && availableChargingPoint === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.availableChargingPoint}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="occupiedChargingPoint">
                                Occupied Charging Point
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="occupiedChargingPoint"
                                placeholder="Occupied Charging Point"
                                className={styles.inputField}
                                value={occupiedChargingPoint}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,4}$/.test(value)) {
                                        setOccupiedChargingPoint(value);
                                    }
                                }}
                            />
                            {errors.occupiedChargingPoint && occupiedChargingPoint === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.occupiedChargingPoint}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                placeholder="Enter description"
                                className={styles.inputField}
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.description && description === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.description}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="fullAddress">Full Address</label>
                            <textarea
                                id="fullAddress"
                                placeholder="Enter full address"
                                className={styles.inputField}
                                rows="4"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                onBlur={(e) => handleOnBlur(e.target.value)}
                            />
                            {errors.address && address === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.address}</p>}
                        </div>
                    </div>
                    <div className={styles.locationRow}>

                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="latitude">Latitude</label>
                            <input type="text"
                                id="latitude"
                                 autoComplete="off"
                                placeholder="Latitude"
                                className={styles.inputField}
                                value={latitude}
                                // onChange={(e) => setLatitude(e.target.value)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^-?\d*\.?\d{0,8}$/.test(value)) {
                                        setLatitude(value);
                                    }
                                }}
                                
                            />
                            {errors.latitude && latitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.latitude}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="longitude">Longitude</label>
                            <input type="text"
                                id="longitude"
                                 autoComplete="off"
                                placeholder="Longitude"
                                className={styles.inputField}
                                value={longitude}
                                // onChange={(e) => setLongitude(e.target.value)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^-?\d*\.?\d{0,8}$/.test(value)) {
                                        setLongitude(value);
                                    }
                                }}
                            />
                            {errors.longitude && longitude === '' &&  <p className={styles.error} style={{ color: 'red' }}>{errors.longitude}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="location">Price</label>
                            <Select
                                options={priceOptions}
                                value={price}
                                onChange={handleLocationChange}
                                placeholder="Select"
                                isClearable
                                className={styles.addShopSelect}
                            />
                            {errors.price && price === null &&<p className={styles.error} style={{ color: 'red' }}>{errors.price}</p>}
                        </div>
                    </div>
                    <div className={styles.scheduleSection}>
                        <div className={styles.alwaysOpen}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    className={styles.checkboxInput}
                                     autoComplete="off"
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
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
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
                                        <span className={styles.openSection}> Close Time</span>
                                           
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
                    {/* <div className={styles.row}> */}
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
                                    // accept="image/*"
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
                            { galleryFiles && (
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
                    {/* </div> */}
                    {/* <div className={styles.actions}>
                        <button className={styles.submitBtn} type="submit">Submit</button>
                    </div> */}
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

export default AddChargerStation;
