import { useState, useRef, useEffect } from "react";

import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './addPurchase.module.css';

import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import PdfIcon from "../../../assets/images/PdfIcon.svg";
import { MultiSelect } from "react-multi-select-component";
import InputMask from 'react-input-mask';
import moment from 'moment';
import Select from "react-select";

const EditEVCharger = () => {
    const { purchaseId }        = useParams()
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [file, setFile]       = useState(null);
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);
     
    const [customerName, setCustomerName]       = useState(null);
    const [customerEmail, setCustomerEmail]     = useState(null);
    const [customerMobile, setCustomerMobile]   = useState(null);
    const [customerAddress, setCustomerAddress] = useState(null);

    const [productName, setProductName]         = useState(null);
    const [outputPower, setoutputPower]         = useState([]);
    const [price, setPrice]                     = useState('');
    const [typeOfService, setTypeOfService]     = useState([]);
    const [purchaseDate, setPurchaseDate]       = useState(null);
    const [warrantyExpires, setWarrantyExpires] = useState(null);
    const [installationDate, setInstallationDate] = useState(null);
    
    const [purchaseInvoice, setPurchaseInvoice]             = useState(null);
    const [installationInvoice, setInstallationInvoice]     = useState(null);
    const [completionCertificate, setCompletionCertificate] = useState(null);

    const [purchaseInfo, setPurchaseInfo]         = useState(false);
    const [installationInfo, setInstallationInfo] = useState(false);

    const powerOption = [
        { value : '7KW',   label: '7KW'  },
        { value : '11KW',  label: '11KW' },
        { value : '20KW',  label: '20KW' },
        { value : '22KW',  label: '22KW' },
    ];
    const serviceOption = [
        { value : 'Charger & Installation', label: 'Charger & Installation'  },
        { value : 'Charger Only',           label: 'Charger Only' },
        { value : 'Installation Only',      label: 'Installation Only' },
    ];
    const brandDropdownRef = useRef(null);
    
    const fetchDetails = () => {
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            purchase_id : purchaseId,
        };
        postRequestWithToken('purchase-history-details', obj, (response) => {
            
            if (response.code === 200) {
                const data = response?.data || {};
                
                setCustomerName(data?.customer_name);
                setCustomerEmail(data?.customer_email);
                setCustomerMobile(data?.customer_mobile);
                setCustomerAddress(data?.customer_address);

                setProductName(data?.product_name);
                setoutputPower(data?.output_Power);
                setPrice(data?.price);
                setTypeOfService(data?.type_of_service);
                setPurchaseDate(moment(data?.purchase_date, "YYYY-MM-DD").format("DD-MM-YYYY")); 
                setWarrantyExpires(moment(data?.warranty_expiry_date, "YYYY-MM-DD").format("DD-MM-YYYY")); 
                setInstallationDate(moment(data?.installation_date, "YYYY-MM-DD").format("DD-MM-YYYY")); 

                setPurchaseInvoice(data?.purchase_invoice_pdf);
                setInstallationInvoice(data?.installation_invoice_pdf);
                setCompletionCertificate(data?.completion_certificate_pdf);
                
                setDatesShowHide(data?.type_of_service);
        
            } else {
                console.error('Error in ev-charger-details API', response);
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
        navigate('/charger-installation/purchase-list');
    }
    const validateForm = () => {
        const fields = [
            { name: "customerName",    value: customerName,     errorMessage: "Customer Name is required." },
            { name: "customerEmail",   value: customerEmail,    errorMessage: "Email is required.", },
            { name: "customerMobile",  value: customerMobile,   errorMessage: "Contact No. is required."},
            // { name: "customerAddress", value: customerAddress,  errorMessage: "Address is required."},
            
            { name: "productName",  value: productName, errorMessage: "Product Name is required." },
            // { name: "outputPower",  value: outputPower,   errorMessage: "Output Power is required.", isArray: true },
            // { name: "price",  value: price,   errorMessage: "Price is required." },
            { name: "typeOfService", value: typeOfService, errorMessage: "Type Of Service is required.", isArray: true  },
            { name: "purchaseDate",     value: purchaseDate,  errorMessage: "purchaseDate is required.", },
            { name: "warrantyExpires",  value: warrantyExpires, errorMessage: "Warranty Expiry is required."},
            { name: "installationDate", value: installationDate, errorMessage: "Date of Installation is required."},
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            
            if ( (!isArray && !value) || ( isArray && (!value || value.length === 0) )) {
                errors[name] = errorMessage;
            }
            if( (name == "purchaseDate" && purchaseInfo == false ) || (name == "warrantyExpires" && purchaseInfo == false) || (name == "installationDate" && installationInfo == false)){
                delete errors[name];
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
            formData.append("purchase_id", purchaseId);

            formData.append("customer_name", customerName);
            formData.append("customer_email", customerEmail);
            formData.append("customer_mobile", customerMobile);
            formData.append("customer_address", customerAddress);

            formData.append("product_name", productName);
            formData.append("output_Power", JSON.stringify(outputPower) );
            formData.append("price", price);
            formData.append("type_of_service", JSON.stringify(typeOfService) );
            formData.append("purchase_date", purchaseDate);
            formData.append("warranty_expiry_date", warrantyExpires);
            formData.append("installation_date", installationDate);
            
            if (purchaseInvoice) {
                formData.append("purchase_invoice_pdf", purchaseInvoice);
            }
            if (installationInvoice) {
                formData.append("installation_invoice_pdf", installationInvoice);
            }
            if (completionCertificate) {
                formData.append("completion_certificate_pdf", completionCertificate);
            }
            postRequestWithTokenAndFile('purchase-history-edit', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/charger-installation/purchase-list');
                    }, 1000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('Error in  API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };    
    const handlePUChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) { 
            setPurchaseInvoice(selectedFile);
            setErrors((prev) => ({ ...prev, purchaseInvoice: "" }));
        } else {
            toast('Please upload a valid pdf file.', {type:'error'})
        }
    };
    const handleInstallationChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) { 
            setInstallationInvoice(selectedFile);
            setErrors((prev) => ({ ...prev, installationInvoice: "" })); //purchaseInvoice
        } else {
            toast('Please upload a valid pdf file.', {type:'error'})
        }
    };
    const handleCompletionChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) { 
            setCompletionCertificate(selectedFile);
            setErrors((prev) => ({ ...prev, completionCertificate: "" }));
        } else {
            toast('Please upload a valid pdf file.', {type:'error'})
        }
    };
    const handleRemovePurchaseInvoice       = () => setPurchaseInvoice(null);
    const handleRemoveInstallationInvoice   = () => setInstallationInvoice(null);
    const handleRemoveCompletionCertificate = () => setCompletionCertificate(null);
    
    const handleOutputPower = (selectedOptions) =>{
        setoutputPower(selectedOptions)
    }
    const handleServiceType = (selectedOptions) => {
        
        setDatesShowHide(selectedOptions);
        setTypeOfService(selectedOptions);
    } 
    const setDatesShowHide = (ServiceType) => {
        let labels = ServiceType.label; //map(item => item.label);
        // labels     = labels.join(",");   //

        setPurchaseInfo(labels.includes("Charger"));    
        setInstallationInfo(labels.includes("Installation"));
    }
    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.addHeading} style={{ marginBottom: "0px"}}>Customer Information</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="Customer">Customer Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="customerName"
                                placeholder="Customer Name"
                                className={styles.inputField}
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                            {errors.customerName && customerName == null && <p className={styles.error} style={{ color: 'red' }}>{errors.customerName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Contact No. (Add Number Without 0 )</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Contact No."
                                value={customerMobile}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setCustomerMobile(value.slice(0, 12)); 
                                }}
                            />
                            {errors.customerMobile && (customerMobile?.length || 0 < 9) &&   <p className="error">{errors.customerMobile}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Email ID</label>
                            <input
                                className={styles.inputField}
                                type="email"
                                autoComplete='off'
                                placeholder="Email ID"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                            />
                            {errors.customerEmail && customerEmail == null && <p className="error">{errors.customerEmail}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Address</label>
                            <input
                                className={styles.inputField}
                                type="text"
                                autoComplete='off'
                                placeholder="Address"
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                            />
                            {errors.customerAddress && customerAddress == null && <p className="error">{errors.customerAddress}</p>}
                        </div>
                    </div>  
                    <div className={styles.addHeading} style={{ marginBottom: "0px", marginTop: "10px"}}>Product Information</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="Name">Product Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="productName"
                                placeholder="Product Name"
                                className={styles.inputField}
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />
                            {errors.productName && productName == null && <p className={styles.error} style={{ color: 'red' }}>{errors.productName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="Output">Output Power</label>
                            <div ref={brandDropdownRef}>
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={powerOption}
                                    value={outputPower}
                                    onChange={handleOutputPower}
                                    labelledBy="Output Power"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.outputPower && outputPower.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.outputPower}</p>}
                        </div>
                    </div>
                
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="Price">Price</label>
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
                            <label className={styles.addShopLabel} htmlFor="Service">Type of Service</label>
                            <div ref={brandDropdownRef}>
                                {/* <MultiSelect
                                    className={styles.addShopSelect}
                                    options={serviceOption}
                                    value={typeOfService}
                                    onChange={handleServiceType}
                                    labelledBy="Type of Service"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                /> */}
                                <Select
                                    className={styles.addShopSelect}
                                    options={serviceOption}
                                    value={typeOfService}
                                    onChange={handleServiceType}
                                    placeholder="Select Type of Service"
                                    isClearable={true}
                                />
                            </div>
                            {errors.typeOfService && typeOfService.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.typeOfService}</p>}
                        </div>
                        
                    </div>
                       
                    <div className={styles.row}>
                        { purchaseInfo && (<>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="Date">Purchase Date</label>
                                <InputMask
                                    mask="99-99-9999"
                                    value={purchaseDate}
                                    onChange={(e) => {
                                        setPurchaseDate(e.target.value);
                                        if (errors.purchaseDate && e.target.value.length === 10) {
                                            setErrors((prevErrors) => ({ ...prevErrors, purchaseDate: "" }));
                                        }
                                    }}
                                    onBlur={() => {
                                        if (purchaseDate.length === 10) {
                                            const [day, month, year] = purchaseDate.split('-');
                                            const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                            day <= 31 && month <= 12; 
                                            if (!isValidDate) {
                                                setErrors((prevErrors) => ({
                                                    ...prevErrors,
                                                    purchaseDate: "Invalid date in DD-MM-YYYY format",
                                                }));
                                            }
                                        }
                                    }}
                                    placeholder="DD-MM-YYYY"
                                    className={styles.inputField}
                                />
                                {errors.purchaseDate && purchaseDate == null && <p className={styles.error} style={{ color: 'red' }}>{errors.purchaseDate}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="Warranty"> Warranty Expires on </label>
                                <InputMask
                                    mask="99-99-9999"
                                    value={warrantyExpires}
                                    onChange={(e) => {
                                        setWarrantyExpires(e.target.value);
                                        if (errors.warrantyExpires && e.target.value.length === 10) {
                                        setErrors((prevErrors) => ({ ...prevErrors, warrantyExpires: "" }));
                                    }
                                }}
                                onBlur={() => {
                                    if (warrantyExpires.length === 10) {
                                        const [day, month, year] = warrantyExpires.split('-');
                                        const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                        day <= 31 && month <= 12; 
                                        if (!isValidDate) {
                                            setErrors((prevErrors) => ({
                                                ...prevErrors,
                                                warrantyExpires: "Invalid date in DD-MM-YYYY format",
                                            }));
                                        }
                                    }
                                }}
                                placeholder="DD-MM-YYYY"
                                className={styles.inputField}
                                />
                                {errors.warrantyExpires && warrantyExpires == null && <p className={styles.error} style={{ color: 'red' }}>{errors.warrantyExpires}</p>}
                            </div>
                        </>)}
                        { installationInfo && (<>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="Date">Date of Installation</label>
                                <InputMask
                                    mask="99-99-9999"
                                    value={installationDate}
                                    onChange={(e) => {
                                        setInstallationDate(e.target.value);
                                        if (errors.installationDate && e.target.value.length === 10) {
                                            setErrors((prevErrors) => ({ ...prevErrors, installationDate: "" }));
                                        }
                                    }}
                                    onBlur={() => {
                                        if (installationDate.length === 10) {
                                            const [day, month, year] = installationDate.split('-');
                                            const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                            day <= 31 && month <= 12; 
                                            if (!isValidDate) {
                                                setErrors((prevErrors) => ({
                                                    ...prevErrors,
                                                    installationDate: "Invalid date in DD-MM-YYYY format",
                                                }));
                                            }
                                        }
                                    }}
                                    placeholder="DD-MM-YYYY"
                                    className={styles.inputField}
                                />
                                {errors.installationDate && installationDate == null && <p className={styles.error} style={{ color: 'red' }}>{errors.installationDate}</p>}
                            </div>
                        </>)}
                    </div>
                    <div className={styles.addHeading} style={{ marginBottom: "0px", marginTop: "10px"}}>Product Documents</div>
                    <div className={styles.row}>
                        { purchaseInfo && (<>
                        <div className={styles.fileUpload} style={{marginTop: "0px", width: "50%"}} >
                            <label className={styles.fileLabel} >Upload Purchase Invoice</label>
                            <div className={styles.fileDropZone}>
                                <input
                                    type="file"
                                    id="purchaseInvoice"
                                    accept=".pdf"
                                    onChange={handlePUChange}
                                    style={{ display: 'none' }}
                                />
                                {!purchaseInvoice ? (
                                    <label htmlFor="purchaseInvoice" className={styles.fileUploadLabel}>
                                        <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                        <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                    </label>
                                ) : (
                                    <div className={styles.imageContainer}>
                                        <img src={PdfIcon} alt="Preview" className={styles.previewImage} 
                                        style={{ height : '100px' }}/>
                                        <button type="button" className={styles.removeButton} onClick={handleRemovePurchaseInvoice}>
                                            <AiOutlineClose size={15} style={{ padding: '2px' }} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                        </div> 
                        </>)}
                        { installationInfo && (<>
                        <div className={styles.fileUpload} style={{marginTop: "0px", width: "50%"}}>
                            <label className={styles.fileLabel} >Upload Installation Invoice</label>
                            <div className={styles.fileDropZone} >
                                <input
                                    type="file"
                                    id="installationInvoice"
                                    accept=".pdf"
                                    onChange={handleInstallationChange}
                                    style={{ display: 'none' }}
                                />
                                {!installationInvoice ? (
                                    <label htmlFor="installationInvoice" className={styles.fileUploadLabel}>
                                        <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                        <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                    </label>
                                ) : (
                                    <div className={styles.imageContainer}>
                                        <img src={PdfIcon} alt="Preview" className={styles.previewImage} 
                                        style={{ height : '100px' }}/>
                                        {/* {URL.createObjectURL(specification)} */}
                                        <button type="button" className={styles.removeButton} onClick={handleRemoveInstallationInvoice}>
                                            <AiOutlineClose size={15} style={{ padding: '2px' }} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                        </div> 
                        <div className={styles.fileUpload} style={{marginTop: "0px", width: "50%"}}>
                            <label className={styles.fileLabel}>Upload Completion Certificate</label>
                            <div className={styles.fileDropZone}>
                                <input
                                    type="file"
                                    id="completionCertificate"
                                    accept=".pdf"
                                    onChange={handleCompletionChange}
                                    style={{ display: 'none' }}
                                />
                                {!completionCertificate ? (
                                    <label htmlFor="completionCertificate" className={styles.fileUploadLabel}>
                                        <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                        <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                    </label>
                                ) : (
                                    <div className={styles.imageContainer}>
                                        <img src={PdfIcon} alt="Preview" className={styles.previewImage} 
                                        style={{ height : '100px' }}/>
                                        <button type="button" className={styles.removeButton} onClick={handleRemoveCompletionCertificate}>
                                            <AiOutlineClose size={15} style={{ padding: '2px' }} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                        </div>  
                        </>) }   
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

export default EditEVCharger;
