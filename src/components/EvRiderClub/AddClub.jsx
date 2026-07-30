import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { MultiSelect } from "react-multi-select-component";
import styles from './addclub.module.css';
import UploadIcon from '../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AddClub = () => {
  const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails')); 
  const navigate                              = useNavigate()
  const [file, setFile]                       = useState(null);
  const [galleryFiles, setGalleryFiles]       = useState([]);
  const [errors, setErrors]                   = useState({});
  const [clubName, setClubName]               = useState('')
  const [noOfMembers, setNoOfMembers]         = useState('')
  const [description, setDescription]         = useState('')
  const [preference, setPreference]           = useState('')
  const [url, setUrl]                         = useState('')
  const [locationOptions, setLocationOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [ageOptions, setAgeOptions]           = useState([])
  const [location, setLocation]               = useState([])
  const [category, setCategory]               = useState([])
  const [ageGroup, setAgeGroup]               = useState([])
  const [loading, setLoading]                 = useState(false);

  const contractDropdownRef = useRef(null);
  const featureDropdownRef = useRef(null)
    
    const handleLocation = (selectedOption) => {
        setLocation(selectedOption)
    }
    
    const handleAgeGroup = (selectedOption) => {
        setAgeGroup(selectedOption)
    }
    
    const handleCategory = (selectedOption) => {
        setCategory(selectedOption)
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
        { name: "clubName", value: clubName, errorMessage: "Club Name is required." },
        { name: "location", value: location, errorMessage: "Location is required.", isArray: true},
        { name: "category", value: category, errorMessage: "Category is required.", isArray: true },
        { name: "ageGroup", value: ageGroup, errorMessage: "Age Group is required.", isArray: true },
        { name: "description", value: description, errorMessage: "Description is required." },
        { name: "url", value: url, errorMessage: "Club URL is required." },
        // { name: "file", value: file, errorMessage: "Image is required." },
        // { name: "gallery", value: galleryFiles, errorMessage: "Club Gallery is required.", isArray: true },
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
        formData.append("club_name", clubName);
        formData.append("no_of_members", noOfMembers);
        formData.append("description", description);
        formData.append("url_link", url);
        formData.append("preference", preference);
        if (location) {
            formData.append("location", location.value);
        }
        if (category && category.length > 0) {
            const selectedCategory = category.map(item => item.value).join(', ');
            formData.append("category", selectedCategory);
        }
        if (ageGroup && ageGroup.length > 0) {
            const selectedAgeGroups = ageGroup.map(item => item.value).join(', ');
            formData.append("age_group", selectedAgeGroups);
        }
        if (file) {
            formData.append("cover_image", file);
        }
        if (galleryFiles.length > 0) {
            galleryFiles.forEach((galleryFile) => {
                formData.append("club_gallery", galleryFile);
            });
        }
        postRequestWithTokenAndFile('add-club', formData, async (response) => {
            if (response.status === 1) {
                toast(response.message || response.message[0], {type:'success'})
                setTimeout(() => {
                    setLoading(false);
                    navigate('/ev-rider-club/club-list');
                }, 1000);
            } else {
                toast(response.message || response.message[0], {type:'error'})
                console.log('Error in add-club API:', response);
                setLoading(false);
            }
        } )
    } else {
        toast.error("Some fields are missing");
        setLoading(false);
    }
};

const handleCancel = () => {
    navigate('/ev-rider-club/club-list')
}

const fetchDetails = () => {
    const obj = {
        userId: userDetails?.user_id,
        email: userDetails?.email,
        club_id : ''
    };

    postRequestWithToken('club-data', obj, (response) => {
        if (response.code === 200) {
            const locations = response.location[0];
            const formattedLocations = locations.map(loc => ({
                value: loc.location_name,
                label: loc.location_name
            }));
            setLocationOptions(formattedLocations);

            const ageGroups = response.ageGroup || [];
            const formattedAgeGroups = ageGroups.map(age => ({
                value: age,
                label: age
            }));
            setAgeOptions(formattedAgeGroups);
            
            const clubCategories = response.clubCategory || []; 
            const formattedClubCategories = clubCategories.map(category => ({
                value: category,
                label: category
            }));
            setCategoryOptions(formattedClubCategories);
            
        } else {
            console.log('error in club-data API', response);
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
      <div className={styles.addHeading}>Add Ev Rider Club</div>
      <div className={styles.addShopFormSection}>
        <form className={styles.formSection} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="modelName">Club Name</label>
              <input type="text" id="clubName" 
              autoComplete="off"
                placeholder="Club Name" 
                className={styles.inputField} 
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                />
                {errors.clubName && clubName == '' &&  <p className="error">{errors.clubName}</p>}
            </div>
            
            <div className={styles.addShopInputContainer}>
                <label className={styles.addShopLabel} htmlFor="location">Location</label>
                <Select
                    options={locationOptions}
                    value={location}
                    onChange={handleLocation}
                    placeholder="Select"
                    isClearable
                    className={styles.addShopSelect}
                />
                {errors.location && (!location || location.length === 0) &&  <p className="error">{errors.location}</p>}
            </div>

            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="noOfMembers">No of Members</label>
              <input type="text" 
              autoComplete="off"
              id="noOfMembers" 
              placeholder="No of Members" 
              className={styles.inputField} 
              value={noOfMembers}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,5}$/.test(value)) {
                  setNoOfMembers(value);
                }
              }}
          
              />
              {errors.noOfMembers && noOfMembers == '' && <p className="error">{errors.noOfMembers}</p>}
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.addShopInputContainer}>
              <label className={styles.addShopLabel} htmlFor="modelName">Description</label>
              <textarea
              autoComplete="off"
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
              <label className={styles.addShopLabel} htmlFor="url">Club URL</label>
              <input type="text"
              autoComplete="off"
               id="url" 
               placeholder="Club URL" 
               className={styles.inputField} 
               value={url}
                onChange={(e) => setUrl(e.target.value)}
               />
               {errors.url && url == '' && <p className="error">{errors.url}</p>}
            </div>
            <div className={styles.addShopInputContainer}>
                <label className={styles.addShopLabel} htmlFor="vehicleType">Category</label>
               
                <div ref={contractDropdownRef}>
                        <MultiSelect
                            className={styles.addShopSelect}
                            options={categoryOptions}
                            value={category}
                            onChange={handleCategory}
                            labelledBy="Category"
                            closeOnChangedValue={false}
                            closeOnSelect={false}
                        />
                    </div>
                    {errors.category && (!category || category.length === 0) && <p className="error">{errors.category}</p>}
            </div>
           
          </div>
          <div className={styles.locationRow}>
               <div className={styles.addShopInputContainer}>
                    <label className={styles.addShopLabel} htmlFor="availableBrands">Age Group</label>
                    <div ref={contractDropdownRef}>
                        <MultiSelect
                            className={styles.addShopSelect}
                            options={ageOptions}
                            value={ageGroup}
                            onChange={handleAgeGroup}
                            labelledBy="Age Group"
                            closeOnChangedValue={false}
                            closeOnSelect={false}
                        />
                    </div>
                    {errors.ageGroup && (!ageGroup || ageGroup.length === 0) &&  <p className="error">{errors.ageGroup}</p>}
                </div>
                
                <div className={styles.addShopInputContainer}>
                        <label className={styles.addShopLabel} htmlFor="preference">Preference</label>
                        <input 
                        autoComplete="off"
                        type="text" 
                        id="preference" 
                        placeholder="Preference" 
                        className={styles.inputField} 
                        value={preference}
                        onChange={(e) => setPreference(e.target.value)}
                        />
                        {errors.preference && preference == '' && <p className="error">{errors.preference}</p>}
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
                <label className={styles.fileLabel}>Club Gallery</label>
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

export default AddClub;
