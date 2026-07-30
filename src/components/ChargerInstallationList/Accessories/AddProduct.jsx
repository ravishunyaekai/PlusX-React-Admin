import React, { useState, useRef, useEffect } from "react";

import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './addProduct.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Add from '../../../assets/images/Add.svg';
import PdfIcon from "../../../assets/images/PdfIcon.svg";
import { MultiSelect } from "react-multi-select-component";
import Select from "react-select";

const AddEVCharger = () => {
    const userDetails                       = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                          = useNavigate();
    const [file, setFile]                   = useState(null);
    const [errors, setErrors]               = useState({});
    const [loading, setLoading]             = useState(false);
    const [chargerName, setChargerName]     = useState('');
    const [compatible, setCompatible]       = useState([]);
    const [outputPower, setoutputPower]     = useState('');
    const [warrantyType, setwarrantyType]   = useState('');
    
    const [description, setDescription]     = useState('');
    const [specification, setspecification] = useState('');
    const [feature, setfeature]             = useState([ { features : '' } ]);

    const [vehicleSpecification, setvehicleSpecification] = useState([]);
    const [vehicleBrand, setvehicleBrand]                 = useState([]);
    const [vehicleModal, setvehicleModal]                 = useState([]);
    const [price, setPrice]                               = useState('');
    const [chargerType, setChargerType ]                = useState([]);
    const [connectorType, setConnectorType ]                = useState('');

    const [compatibleOption, setCompatibleOption]       = useState([]);
    const [brandOption, setBrandOption]                 = useState([]);
    const [modalOption, setModalOption]                 = useState([]);
    const [specificationOption, setSpecificationOption] = useState([
        { value : 'GCC',     label: 'GCC' },
        { value : 'Non-GCC', label: 'Non-GCC' },
    ]);
    const [chargerTypeOption, setChargerTypeOption]   = useState([
        { value : 'AC',  label: 'AC' },
        { value : 'DC',  label: 'DC' },
    ]);

    const [allBrandModaldata, setAllBrandModaldata] = useState([]);
    const brandDropdownRef                          = useRef(null);
    const serviceDropdownRef                        = useRef(null);

    const [galleryFiles, setGalleryFiles]     = useState([]);

    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
        postRequestWithToken('ev-all-charger-list', obj, (response) => {
            if (response.code === 200) {

                setCompatibleOption(response?.data);
                // setAllBrandModaldata(response?.vehicleData);
                // const uniqueBrands = [...new Set(response?.vehicleData.map(item => item.brand))];
                // const allBrand = (uniqueBrands || []).map(item => ({
                //     label: item,
                //     value: item
                // }));
                // setBrandOption(allBrand)
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
    const handleCancel = () => {
        navigate('/charger-installation/accessories-list')
    }
    const validateForm = (featureValues) => {
        
        const fields = [
            { name: "chargerName",  value: chargerName,   errorMessage: "Product Name is required." },
            { name: "compatible",   value: compatible,    errorMessage: "Compatible is required.", isArray:true },
            { name: "price",        value: price,         errorMessage: "Price is required." },
            { name: "feature",      value: featureValues, errorMessage: "Feature is required.", isArray: true },
            { name: "file",         value: file,          errorMessage: "Cover Image is required." },
            { name: "gallery", value: galleryFiles, errorMessage: "Gallery Image is required.", isArray: true  },
            // { name: "description",  value: description,   errorMessage: "Description is required." },
            // { name: "outputPower",  value: outputPower,   errorMessage: "Output Power is required."},
            // { name: "warrantyType", value: warrantyType,  errorMessage: "Warranty is required."},
            // { name: "vehicleSpecification", value: vehicleSpecification, errorMessage: "Specification is required.", isArray: true  },
            // { name: "vehicleBrand",  value: vehicleBrand,  errorMessage: "Vehicle Brand is required.", isArray: true  },
            // { name: "vehicleModal",  value: vehicleModal,  errorMessage: "Vehicle Model is required.", isArray: true  },
            // { name: "chargerType",  value: chargerType,  errorMessage: "Charger Type is required.", isArray: true  },  
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});
        console.log(newErrors)
        setErrors(newErrors);        
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const featureValues = feature.filter(f => f.features.trim() !== '').map(f => f.features);
        if (validateForm(featureValues)) {
        
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("charger_name", chargerName);
            formData.append("compatible", JSON.stringify(compatible) ); 
            formData.append("outputPower", outputPower);
            formData.append("warrantyType", warrantyType);
            formData.append("charger_feature", JSON.stringify(featureValues));
            formData.append("description", description);

            formData.append("vehicleSpecification", vehicleSpecification.value || ""); //undefined
            // formData.append("vehicleBrand", vehicleBrand.value);
            // formData.append("vehicleModal", vehicleModal.value);
            formData.append("price", price);
            formData.append("chargerType", chargerType.value || "");      //undefined
            formData.append("connectorType", connectorType);        //undefined

            if (specification) {
                formData.append("specification_pdf", specification);
            }
            if (file) {
                formData.append("charger_image", file);
            }
            if (galleryFiles.length > 0) {
                galleryFiles.forEach((galleryFile) => {
                    formData.append("charger_gallery", galleryFile);
                });
            }
            postRequestWithTokenAndFile('ev-accessories-add', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/charger-installation/accessories-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in add-accessories API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };    
    
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast('Please upload a valid image file.', {type:'error'})
        }
    };
    const handleSpecificationChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) { 
            setspecification(selectedFile);
            setErrors((prev) => ({ ...prev, specification: "" }));
        } else {
            toast('Please upload a valid pdf file.', {type:'error'})
        }
    };
    const handleRemoveImage         = () => setFile(null);
    const handleRemoveSpecification = () => setspecification(null);
    
    const addFeatures = () =>{
        setfeature([...feature, { features : '' }]);
    }
    const handlefeaturesdata = (index, featureVal) => {
        
        const oldfeature = [...feature];
        oldfeature[index].features = featureVal;
        setfeature(oldfeature)
    };
    const handleRemoveFeature = (index) => {
        const updated = feature.filter((_, i) => i !== index);
        setfeature(updated);
    };
    const handleCompatibility = (selectedOptions) =>{
        setCompatible(selectedOptions)
    }
    const handleSpecification = (selectedOptions) =>{
        setvehicleSpecification(selectedOptions)
    }
    const brandModelsMap = allBrandModaldata.reduce((acc, { brand, model }) => {
        if (!acc[brand]) acc[brand] = [];
        acc[brand].push(model);
        return acc;
    }, {});
    const handleBrand = (selectedOptions) => {
        setvehicleBrand(selectedOptions)  
        setvehicleModal([]);
        const allModels = brandModelsMap[selectedOptions.value].map(item => ({
            label: item,
            value: item
        }));
        setModalOption(allModels);
    }
    const handleModel = (selectedOptions) => {
        setvehicleModal(selectedOptions)
    }
    const handleChargerType = (selectedOptions) => {
        setChargerType(selectedOptions)
    }
    // gallary related
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
    useEffect(() => {
        return () => {
            galleryFiles.forEach((image) => URL.revokeObjectURL(image));
        };
    }, [galleryFiles]);

    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Add Accessories</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="chargerName">Product Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="chargerName"
                                placeholder="Product Name"
                                className={styles.inputField}
                                value={chargerName}
                                onChange={(e) => setChargerName(e.target.value)}
                            />
                            {errors.chargerName && chargerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="compatible">Compatible</label>
                            <div ref={brandDropdownRef}>
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={compatibleOption}
                                    value={compatible}
                                    onChange={handleCompatibility}
                                    labelledBy="Compatible"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.compatible && compatible.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.compatible}</p>}
                        </div>
                        
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">Output Power</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="outputPower"
                                placeholder="Output Power"
                                className={styles.inputField}
                                value={outputPower}
                                onChange={(e) => setoutputPower(e.target.value)}
                            />
                            {errors.outputPower && outputPower === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.outputPower}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="warrantyType"> Warranty </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="warrantyType"
                                placeholder="Warranty"
                                className={styles.inputField}
                                value={warrantyType}
                                onChange={(e) => setwarrantyType(e.target.value)}
                            />
                            {errors.warrantyType && warrantyType === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.warrantyType}</p>}
                        </div>
                    </div>
                    {/*  */}
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">Price</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="price"
                                placeholder="Price"
                                className={styles.inputField}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            {errors.price && price === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.price}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="">
                                Vehicle Specification
                            </label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={specificationOption}
                                    value={vehicleSpecification}
                                    onChange={handleSpecification}
                                    placeholder="Select Specification"
                                    isClearable={true}
                                />
                            </div>
                            {errors.vehicleSpecification && vehicleSpecification.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleSpecification}</p>}
                        </div>
                    </div>
                    {/* <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">Vehicle Brand</label>

                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={brandOption}
                                    value={vehicleBrand}
                                    onChange={handleBrand}
                                    placeholder="Select Brand"
                                    isClearable={true}
                                />
                            </div>
                            {errors.vehicleBrand && vehicleBrand.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleBrand}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="services">
                                Vehicle Model
                            </label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={modalOption}
                                    value={vehicleModal}
                                    onChange={handleModel}
                                    placeholder="Select Model"
                                    isClearable={true}
                                />
                            </div>
                            {errors.vehicleModal && vehicleModal.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleModal}</p>}
                        </div>
                    </div> */}
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor=""> Charger Type </label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={chargerTypeOption}
                                    value={chargerType}
                                    onChange={handleChargerType}
                                    placeholder="Select Charger Type"
                                    isClearable={true}
                                />
                            </div>
                            {errors.chargerType && chargerType.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="connectorType">Connector Type</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="connectorType"
                                placeholder="Connector Type"
                                className={styles.inputField}
                                value={connectorType}
                                onChange={(e) => setConnectorType(e.target.value)}
                            />
                            {errors.connectorType && connectorType === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.connectorType}</p>}
                        </div>
                    </div>
                    {/*  */}
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.featureLabel} htmlFor="Features"> Features 
                                <button type="button" onClick={addFeatures} className={styles.featureButton}>
                                    <img src={Add} alt="Add" className={styles.addImg} />
                                    <span className={styles.addContent}>Add</span>
                                </button>
                            </label>
                            {feature.map((feature, index) => (<>
                                <div ref={serviceDropdownRef} className={styles.featureDivision}>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id={`Feature`}
                                        placeholder={`Feature`}
                                        className={styles.inputField}
                                        value={feature.features}
                                        onChange={(e) => handlefeaturesdata(index, e.target.value)}
                                    />
                                    {index > 0 && (
                                        <button type="button" className={styles.removeButton} 
                                        onClick={() => handleRemoveFeature(index )}
                                        >
                                            <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                        </button>
                                    )}
                                </div>
                            </>))}
                            {errors.feature && feature[0].features == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.feature}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                placeholder="Enter Description"
                                className={styles.inputField}
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.description && description === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.description}</p>}
                        </div>
                    </div>
                    
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Specification PDF</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="specificationFileUpload"
                                accept=".pdf"
                                onChange={handleSpecificationChange}
                                style={{ display: 'none' }}
                            />
                            {!specification ? (
                                <label htmlFor="specificationFileUpload" className={styles.fileUploadLabel}>
                                    <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                    <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                </label>
                            ) : (
                                <div className={styles.imageContainer}>
                                    <img src={PdfIcon} alt="Preview" className={styles.previewImage} 
                                    style={{ height : '100px' }}/>
                                    {/* {URL.createObjectURL(specification)} */}
                                    <button type="button" className={styles.removeButton} onClick={handleRemoveSpecification}>
                                        <AiOutlineClose size={15} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>     
                    
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Cover Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="coverFileUpload"
                                accept=".jpeg,.jpeg,.png"
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
                        <p className={styles.error} style={{ color: 'red' }}>Image Dimensions: 737px X 401px</p>
                        {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                    </div>

                    {/* Station Gallery Multiple Image Upload */}
                    <div className={styles.fileUpload}>
                        
                        <label className={styles.fileLabel}>Gallery</label>
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
                        <p className={styles.error} style={{ color: 'red' }}>Image Dimensions: 737px X 401px</p>
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

export default AddEVCharger;
