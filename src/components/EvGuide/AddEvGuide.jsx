import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styles from './addevguide.module.css';
import UploadIcon from '../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import { MultiSelect } from "react-multi-select-component";
import { useNavigate } from 'react-router-dom';
import Add from "../../assets/images/Add.svg"
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AddEvGuide = () => {
  const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
  const navigate                        = useNavigate()
  const [file, setFile]                 = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [errors, setErrors]             = useState({});
  const [modelName, setModelName]       = useState('')
  const [vehicleName, setVehicleName]   = useState('')
  const [engine, setEngine]             = useState('')
  const [horsePower, setHorsePower]     = useState('')
  const [maxSpeed, setMaxSpeed]         = useState('')
  const [price, setPrice]               = useState('')
  const [description, setDescription]   = useState('')
  const [feature, setFeature]           = useState('')
  const [vehicleType, setVehicleType]   = useState(null);
  const [loading, setLoading]           = useState(false);

    const typeOpetions = [
        // { value: "", label: "Select Vehicle Type" },
        { value: "Car", label: "Car" },
        { value: "Bike", label: "Bike" },
    ];

    const handleVehicleType = (selectedOption) => {
        setVehicleType(selectedOption)
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

const validateForm = () => {
    const fields = [
        { name: "modelName", value: modelName, errorMessage: "Model Name is required." },
        { name: "vehicleName", value: vehicleName, errorMessage: "Vehicle Name is required." },
        { name: "vehicleType", value: vehicleType, errorMessage: "Vehicle Type is required." },
        { name: "engine", value: engine, errorMessage: "Engine is required." },
        { name: "horsePower", value: horsePower, errorMessage: "Horse Power is required." },
        { name: "maxSpeed", value: maxSpeed, errorMessage: "Max Speed is required." },
        { name: "price", value: price, errorMessage: "Price is required." },
        { name: "description", value: description, errorMessage: "Description is required." },
        { name: "feature", value: feature, errorMessage: "Best Feature is required." },
        // { name: "file", value: file, errorMessage: "Image is required." },
        // { name: "gallery", value: galleryFiles, errorMessage: "Vehicle Gallery is required.", isArray: true },
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
        formData.append("vehicle_name", vehicleName);
        formData.append("vehicle_model", modelName);
        formData.append("description", description);
        formData.append("engine", engine);
        formData.append("horse_power", horsePower);
        formData.append("max_speed", maxSpeed);
        formData.append("price", price);
        formData.append("best_feature", feature);
        if (vehicleType) {
            formData.append("vehicle_type", vehicleType.value);
        }
        if (file) {
            formData.append("cover_image", file);
        }
        if (galleryFiles.length > 0) {
            galleryFiles.forEach((galleryFile) => {
                formData.append("vehicle_gallery", galleryFile);
            });
        }
        postRequestWithTokenAndFile('ev-guide-add', formData, async (response) => {
            if (response.status === 1) {
                toast(response.message || response.message[0], {type:'success'})
                setTimeout(() => {
                    setLoading(false);
                    navigate('/ev-guide/ev-guide-list');
                }, 1000);
            } else {
                toast(response.message || response.message[0], {type:'error'})
                console.log('Error in ev-guide-add API:', response);
                setLoading(false);
            }
        } )
    } else {
        toast.error("Some fields are missing");
        setLoading(false);
    }
};

const handleCancel = () => {
    navigate('/ev-guide/ev-guide-list')
}

useEffect(() => {
    if (!userDetails || !userDetails.access_token) {
        navigate('/login');
        return;
    }
}, []);

  return (
    <div className={styles.addShopContainer}>
         <ToastContainer />
      <div className={styles.addHeading}>Add EV Guide</div>
      <div className={styles.addShopFormSection}>
        <form className={styles.formSection} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="modelName">Model Name</label>
              <input type="text" id="modelName" 
               autoComplete="off"
                placeholder="Model Name" 
                className={styles.inputField} 
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                />
                {errors.modelName && modelName == '' && <p className="error">{errors.modelName}</p>}
            </div>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="contactNo">Vehicle Name</label>
              <input type="text" 
               autoComplete="off"
              id="vehicleName" 
              placeholder="Vehicle Name" 
              className={styles.inputField} 
              value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
              />
              {errors.vehicleName && vehicleName == '' && <p className="error">{errors.vehicleName}</p>}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.addShopInputContainer}>
                <label className={styles.addShopLabel} htmlFor="vehicleType">Vehicle Type</label>
                <Select
                    options={typeOpetions}
                    value={vehicleType}
                    onChange={handleVehicleType}
                    placeholder="Select"
                    isClearable
                    className={styles.addShopSelect}
                />
                {errors.vehicleType && vehicleType == null && <p className="error">{errors.vehicleType}</p>}
            </div>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="email">Engine</label>
              <input type="text"
               autoComplete="off"
               id="engine" 
               placeholder="Engine" 
               className={styles.inputField} 
               value={engine}
                onChange={(e) => setEngine(e.target.value)}
               />
               {errors.engine && engine == '' && <p className="error">{errors.engine}</p>}
            </div>
          </div>
          <div className={styles.locationRow}>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="email">Horse Power</label>
              <input 
               autoComplete="off"
              type="text"
               id="horsePower" 
               placeholder="Horse Power" 
               className={styles.inputField} 
               value={horsePower}
                onChange={(e) => setHorsePower(e.target.value)}
               />
               {errors.horsePower && horsePower == '' && <p className="error">{errors.horsePower}</p>}
            </div> 
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="email">Max Speed</label>
              <input 
               autoComplete="off"
              type="text" 
              id="maxSpeed" 
              placeholder="Max Speed" 
              className={styles.inputField}
              value={maxSpeed}
                onChange={(e) => setMaxSpeed(e.target.value)}
               />
               {errors.maxSpeed && maxSpeed == '' && <p className="error">{errors.maxSpeed}</p>}
            </div>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="email">Price</label>
              <input 
               autoComplete="off"
              type="text" 
              id="price" 
              placeholder="Price" 
              className={styles.inputField}
              value={price}
                onChange={(e) => setPrice(e.target.value)}
               />
               {errors.price && price == '' && <p className="error">{errors.price}</p>}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="modelName">Description</label>
              <textarea
              type="text" 
              id="description" 
              placeholder="Description" 
              className={styles.inputField} 
              value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && description == '' && <p className="error">{errors.description}</p>}
            </div>
            
          </div>
          <div className={styles.row}>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="modelName">Best Feature</label>
              <input 
              type="text"
              autoComplete="off" 
              id="feature" 
              placeholder="Best Feature" 
              className={styles.inputField} 
              value={feature}
                onChange={(e) => setFeature(e.target.value)}
              />
              {errors.feature && feature == '' && <p className="error">{errors.feature}</p>}
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
                            <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImage} />
                            <button type="button" className={styles.removeButton} onClick={handleRemoveImage}>
                                <AiOutlineClose size={20} style={{ padding: '2px' }} />
                            </button>
                        </div>
                    )}
                </div>
                {errors.file && <p className="error">{errors.file}</p>}
            </div>
            <div className={styles.fileUpload}>
                <label className={styles.fileLabel}>Vehicle Gallery</label>
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
                {errors.gallery && <p className="error">{errors.gallery}</p>}
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

export default AddEvGuide;
