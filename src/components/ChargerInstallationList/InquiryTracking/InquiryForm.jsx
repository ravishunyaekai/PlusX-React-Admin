import React, { useEffect, useState, useRef } from "react";
import styles from './inquiryForm.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import InputMask from 'react-input-mask';
import { AiOutlineClose } from 'react-icons/ai';
import UploadIcon from '../../../assets/images/uploadicon.svg';
import PdfIcon from '../../../assets/images/PdfIcon.svg';
import {
    yesNoOption,
    leadSourceOption,
    siteVisitStatusOption,
    chargerAvailabilityOption,
    enquiryStatusOption,
    findOption,
    toApiDate,
    toFormDate,
} from './inquiryOptions';

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const LIST_PATH = '/charger-installation/inquiry-tracking';

const AutoResizeTextarea = ({ value, onChange, placeholder, className }) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            className={className}
            value={value}
            onChange={(e) => {
                onChange(e);
                const el = textareaRef.current;
                if (el) {
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                }
            }}
        />
    );
};

const isPdfFile = (file) => {
    if (!file) return false;
    if (typeof file === 'string') return file.toLowerCase().endsWith('.pdf');
    return file.type === 'application/pdf';
};

const FileUploadField = ({ id, label, file, onChange, onRemove, existingUrl }) => {
    const previewSrc = !file
        ? null
        : typeof file === 'string'
            ? (existingUrl || file)
            : (isPdfFile(file) ? PdfIcon : URL.createObjectURL(file));

    return (
        <div className={styles.fileUploadColumn}>
            <label className={styles.fileLabel}>{label}</label>
            <div className={styles.fileDropZone}>
                <input
                    type="file"
                    id={id}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={onChange}
                    style={{ display: 'none' }}
                />
                {!file ? (
                    <label htmlFor={id} className={styles.fileUploadLabel}>
                        <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                        <p>Select File to Upload <br /> PDF, JPG, PNG</p>
                    </label>
                ) : (
                    <div className={styles.imageContainer}>
                        {isPdfFile(file) ? (
                            existingUrl ? (
                                <a href={existingUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={PdfIcon} alt="PDF Preview" className={styles.previewImage} />
                                </a>
                            ) : (
                                <img src={PdfIcon} alt="PDF Preview" className={styles.previewImage} />
                            )
                        ) : (
                            <img src={previewSrc} alt="Preview" className={styles.previewImage} />
                        )}
                        <button type="button" className={styles.removeButton} onClick={onRemove}>
                            <AiOutlineClose size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const InquiryForm = ({ mode = 'add', inquiryId, initialData }) => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();
    const isEdit      = mode === 'edit';

    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [customerName, setCustomerName] = useState('');
    const [phoneValue, setPhoneValue]     = useState('');
    const [phoneCountry, setPhoneCountry] = useState({ dialCode: '971', countryCode: 'ae' });
    const [customerEmail, setCustomerEmail] = useState('');
    const [leadSource, setLeadSource]     = useState(null);

    const [assignedPersonName, setAssignedPersonName] = useState('');
    const [customerFeedback, setCustomerFeedback]     = useState('');
    const [followUpRequired, setFollowUpRequired]     = useState(null);
    const [nextFollowUpDate, setNextFollowUpDate]     = useState('');
    const [followUpRemarks, setFollowUpRemarks]       = useState('');

    const [siteVisitRequired, setSiteVisitRequired]         = useState(null);
    const [siteVisitDate, setSiteVisitDate]                 = useState('');
    const [siteVisitTime, setSiteVisitTime]                 = useState('');
    const [siteVisitLocation, setSiteVisitLocation]         = useState('');
    const [siteVisitPerson, setSiteVisitPerson]             = useState('');
    const [siteVisitStatus, setSiteVisitStatus]             = useState(null);
    const [siteVisitRemarks, setSiteVisitRemarks]           = useState('');

    const [cablingRequired, setCablingRequired]             = useState(null);
    const [civilWorkRequired, setCivilWorkRequired]         = useState(null);
    const [siteRemarks, setSiteRemarks]                     = useState('');
    const [chargerAvailability, setChargerAvailability]     = useState(null);
    const [chargerCapacity, setChargerCapacity]             = useState('');
    const [chargerCost, setChargerCost]                     = useState('');

    const [materialDetails, setMaterialDetails]             = useState('');
    const [materialCostToUs, setMaterialCostToUs]           = useState('');
    const [materialCostQuoted, setMaterialCostQuoted]       = useState('');

    const [installationDate, setInstallationDate]           = useState('');
    const [installationPerson, setInstallationPerson]       = useState('');

    const [installationCompletionDate, setInstallationCompletionDate] = useState('');
    const [installationCompletedBy, setInstallationCompletedBy]       = useState('');
    const [finalAmount, setFinalAmount]                     = useState('');

    const [completionCertificate, setCompletionCertificate] = useState(null);
    const [purchaseInvoice, setPurchaseInvoice]             = useState(null);
    const [completionCertificateUrl, setCompletionCertificateUrl] = useState('');
    const [purchaseInvoiceUrl, setPurchaseInvoiceUrl]       = useState('');

    const [enquiryStatus, setEnquiryStatus]                 = useState(null);
    const [lostCancelledRemark, setLostCancelledRemark]     = useState('');

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        if (!initialData) return;
        const data = initialData;

        setCustomerName(data.customer_name || data.name || '');
        setCustomerEmail(data.email || data.email_id || '');
        setLeadSource(findOption(leadSourceOption, data.lead_source));

        const dialCode = String(data.country_code || '+971').replace('+', '');
        const mobileNo = data.mobile_no || data.phone_number || data.contact_no || '';
        setPhoneValue(mobileNo ? `${dialCode}${mobileNo}` : '');
        setPhoneCountry({ dialCode, countryCode: 'ae' });

        setAssignedPersonName(data.assigned_person_name || data.assigned_salesperson || '');
        setCustomerFeedback(data.customer_feedback || '');
        setFollowUpRequired(findOption(yesNoOption, data.follow_up_required));
        setNextFollowUpDate(toFormDate(data.next_follow_up_date));
        setFollowUpRemarks(data.follow_up_remarks || '');

        setSiteVisitRequired(findOption(yesNoOption, data.site_visit_required));
        setSiteVisitDate(toFormDate(data.site_visit_date));
        setSiteVisitTime(data.site_visit_time || '');
        setSiteVisitLocation(data.site_visit_location || '');
        setSiteVisitPerson(data.site_visit_person || '');
        setSiteVisitStatus(findOption(siteVisitStatusOption, data.site_visit_status));
        setSiteVisitRemarks(data.site_visit_remarks || '');

        setCablingRequired(findOption(yesNoOption, data.cabling_required));
        setCivilWorkRequired(findOption(yesNoOption, data.civil_work_required));
        setSiteRemarks(data.existing_electrical_setup || data.site_remarks || '');
        setChargerAvailability(findOption(chargerAvailabilityOption, data.charger_availability));
        setChargerCapacity(data.charger_capacity || '');
        setChargerCost(data.charger_cost != null ? String(data.charger_cost) : '');

        setMaterialDetails(data.material_requirement_details || '');
        setMaterialCostToUs(data.material_cost_to_us != null ? String(data.material_cost_to_us) : '');
        setMaterialCostQuoted(data.material_cost_quoted != null ? String(data.material_cost_quoted) : '');

        setInstallationDate(toFormDate(data.installation_date));
        setInstallationPerson(data.installation_person || '');
        setInstallationCompletionDate(toFormDate(data.installation_completion_date));
        setInstallationCompletedBy(data.installation_completed_by || '');
        setFinalAmount(data.final_amount != null ? String(data.final_amount) : '');

        setCompletionCertificate(data.completion_certificate || null);
        setPurchaseInvoice(data.charger_purchase_invoice || null);
        setCompletionCertificateUrl(data.completion_certificate_url || '');
        setPurchaseInvoiceUrl(data.charger_purchase_invoice_url || '');

        setEnquiryStatus(findOption(enquiryStatusOption, data.enquiry_status));
        setLostCancelledRemark(data.lost_cancelled_remark || '');
    }, [initialData]);

    const getLocalMobile = () => {
        if (!phoneValue || !phoneCountry?.dialCode) return '';
        return phoneValue.startsWith(phoneCountry.dialCode)
            ? phoneValue.slice(phoneCountry.dialCode.length)
            : phoneValue;
    };

    const handlePhoneChange = (phone, country) => {
        setPhoneValue(phone);
        setPhoneCountry(country);
        const localMobile = phone.startsWith(country.dialCode)
            ? phone.slice(country.dialCode.length)
            : phone;
        if (localMobile) {
            setErrors((prev) => ({ ...prev, customerMobile: '' }));
        }
    };

    const handleFileChange = (setter) => (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;
        if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
            toast.error('Please upload a PDF, JPG, or PNG file.');
            event.target.value = '';
            return;
        }
        setter(selectedFile);
    };

    const validateForm = () => {
        const localMobile = getLocalMobile();
        const fields = [
            { name: 'customerName',       value: customerName,       errorMessage: 'Customer Name is required.' },
            { name: 'customerMobile',     value: localMobile,        errorMessage: 'Phone Number is required.' },
            { name: 'customerEmail',      value: customerEmail,      errorMessage: 'Email Address is required.' },
            { name: 'leadSource',         value: leadSource,         errorMessage: 'Lead Source is required.' },
            { name: 'assignedPersonName', value: assignedPersonName, errorMessage: 'Assigned Person Name is required.' },
            { name: 'enquiryStatus',      value: enquiryStatus,      errorMessage: 'Enquiry Status is required.' },
        ];

        if (followUpRequired?.value === 'Yes') {
            fields.push({ name: 'nextFollowUpDate', value: nextFollowUpDate, errorMessage: 'Next Follow-up Date is required.' });
            fields.push({ name: 'followUpRemarks',  value: followUpRemarks,  errorMessage: 'Follow-up Remarks is required.' });
        }
        if (siteVisitRequired?.value === 'Yes') {
            fields.push({ name: 'siteVisitDate',     value: siteVisitDate,     errorMessage: 'Site Visit Date is required.' });
            fields.push({ name: 'siteVisitLocation', value: siteVisitLocation, errorMessage: 'Site Visit Location is required.' });
            fields.push({ name: 'siteVisitPerson',   value: siteVisitPerson,   errorMessage: 'Person Assigned for Site Visit is required.' });
        }
        if (enquiryStatus?.value === 'Lost / Cancelled') {
            fields.push({ name: 'lostCancelledRemark', value: lostCancelledRemark, errorMessage: 'Lost / Cancelled remark is required.' });
        }

        const newErrors = fields.reduce((acc, { name, value, errorMessage }) => {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                acc[name] = errorMessage;
            }
            return acc;
        }, {});
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validateForm()) {
            toast.error('Some fields are missing');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('userId', userDetails?.user_id);
        formData.append('email', userDetails?.email);
        if (isEdit) {
            formData.append('inquiry_id', inquiryId);
        }

        formData.append('customer_name', customerName);
        formData.append('mobile_no', getLocalMobile());
        formData.append('country_code', phoneCountry?.dialCode ? `+${phoneCountry.dialCode}` : '+971');
        formData.append('email_id', customerEmail);
        formData.append('lead_source', leadSource?.value || '');

        formData.append('assigned_person_name', assignedPersonName);
        formData.append('customer_feedback', customerFeedback);
        formData.append('follow_up_required', followUpRequired?.value || '');
        formData.append('next_follow_up_date', followUpRequired?.value === 'Yes' ? toApiDate(nextFollowUpDate) : '');
        formData.append('follow_up_remarks', followUpRequired?.value === 'Yes' ? followUpRemarks : '');

        formData.append('site_visit_required', siteVisitRequired?.value || '');
        formData.append('site_visit_date', siteVisitRequired?.value === 'Yes' ? toApiDate(siteVisitDate) : '');
        formData.append('site_visit_time', siteVisitRequired?.value === 'Yes' ? siteVisitTime : '');
        formData.append('site_visit_location', siteVisitRequired?.value === 'Yes' ? siteVisitLocation : '');
        formData.append('site_visit_person', siteVisitRequired?.value === 'Yes' ? siteVisitPerson : '');
        formData.append('site_visit_status', siteVisitRequired?.value === 'Yes' ? (siteVisitStatus?.value || '') : '');
        formData.append('site_visit_remarks', siteVisitRequired?.value === 'Yes' ? siteVisitRemarks : '');

        formData.append('cabling_required', cablingRequired?.value || '');
        formData.append('civil_work_required', civilWorkRequired?.value || '');
        formData.append('existing_electrical_setup', siteRemarks);
        formData.append('charger_availability', chargerAvailability?.value || '');
        formData.append('charger_capacity', chargerCapacity);
        formData.append('charger_cost', chargerAvailability?.value === 'buy_from_us' ? chargerCost : '');

        formData.append('material_requirement_details', materialDetails);
        formData.append('material_cost_to_us', materialCostToUs);
        formData.append('material_cost_quoted', materialCostQuoted);

        formData.append('installation_date', toApiDate(installationDate));
        formData.append('installation_person', installationPerson);
        formData.append('installation_completion_date', toApiDate(installationCompletionDate));
        formData.append('installation_completed_by', installationCompletedBy);
        formData.append('final_amount', finalAmount);

        formData.append('enquiry_status', enquiryStatus?.value || '');
        formData.append('lost_cancelled_remark', enquiryStatus?.value === 'Lost / Cancelled' ? lostCancelledRemark : '');

        if (completionCertificate && typeof completionCertificate !== 'string') {
            formData.append('completion_certificate', completionCertificate);
        }
        if (purchaseInvoice && typeof purchaseInvoice !== 'string') {
            formData.append('charger_purchase_invoice', purchaseInvoice);
        }

        const endpoint = isEdit
            ? 'charger-installation-inquiry-edit'
            : 'charger-installation-inquiry-add';

        postRequestWithTokenAndFile(endpoint, formData, async (response) => {
            if (response.code === 200 || response.status === 1) {
                toast(response.message, { type: 'success' });
                setTimeout(() => {
                    setLoading(false);
                    navigate(LIST_PATH);
                }, 1000);
            } else {
                toast(response.message || 'Failed to save inquiry', { type: 'error' });
                setLoading(false);
            }
        });
    };

    const handleCancel = () => navigate(LIST_PATH);

    const showFollowUpFields = followUpRequired?.value === 'Yes';
    const showSiteVisitFields = siteVisitRequired?.value === 'Yes';
    const showExistingCharger = chargerAvailability?.value === 'already_has';
    const showBuyFromUs = chargerAvailability?.value === 'buy_from_us';
    const showLostRemark = enquiryStatus?.value === 'Lost / Cancelled';

    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>{isEdit ? 'Edit Inquiry' : 'Add Inquiry'}</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>

                    <div className={styles.addHeading} style={{ marginBottom: '0px' }}>Charger Installation Inquiry</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Customer Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Customer Name"
                                className={styles.inputField}
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                            {errors.customerName && !customerName && <p className={styles.error}>{errors.customerName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Phone Number</label>
                            <PhoneInput
                                country="ae"
                                value={phoneValue}
                                onChange={handlePhoneChange}
                                enableSearch={true}
                                countryCodeEditable={false}
                                containerClass={styles.phoneInputContainer}
                                inputClass={styles.phoneInputField}
                                buttonClass={styles.phoneInputButton}
                                dropdownClass={styles.phoneInputDropdown}
                                placeholder="Phone Number"
                            />
                            {errors.customerMobile && !getLocalMobile() && <p className={styles.error}>{errors.customerMobile}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Email Address</label>
                            <input
                                type="email"
                                autoComplete="off"
                                placeholder="Email Address"
                                className={styles.inputField}
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                            />
                            {errors.customerEmail && !customerEmail && <p className={styles.error}>{errors.customerEmail}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Lead Source</label>
                            <Select
                                className={styles.addShopSelect}
                                options={leadSourceOption}
                                value={leadSource}
                                onChange={setLeadSource}
                                placeholder="Select Lead Source"
                                isClearable={true}
                            />
                            {errors.leadSource && !leadSource && <p className={styles.error}>{errors.leadSource}</p>}
                        </div>
                    </div>

                    <div className={styles.addHeading} style={{ marginBottom: '0px', marginTop: '10px' }}>Inquiry Assignment</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Assigned Person Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Assigned Person Name"
                                className={styles.inputField}
                                value={assignedPersonName}
                                onChange={(e) => setAssignedPersonName(e.target.value)}
                            />
                            {errors.assignedPersonName && !assignedPersonName && <p className={styles.error}>{errors.assignedPersonName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Follow-up Required</label>
                            <Select
                                className={styles.addShopSelect}
                                options={yesNoOption}
                                value={followUpRequired}
                                onChange={(option) => {
                                    setFollowUpRequired(option);
                                    if (option?.value !== 'Yes') {
                                        setNextFollowUpDate('');
                                        setFollowUpRemarks('');
                                    }
                                }}
                                placeholder="Select Follow-up Required"
                                isClearable={true}
                            />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={`${styles.addShopInputContainer} ${styles.halfWidth}`}>
                            <label className={styles.addShopLabel}>Customer Feedback</label>
                            <textarea
                                rows="3"
                                placeholder="Customer Feedback"
                                className={styles.textAreaField}
                                style={{ overflowY: 'auto' }}
                                value={customerFeedback}
                                onChange={(e) => setCustomerFeedback(e.target.value)}
                            />
                        </div>
                        <div className={styles.halfWidth} />
                    </div>
                    {showFollowUpFields && (
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Next Follow-up Date</label>
                                <InputMask
                                    mask="99-99-9999"
                                    value={nextFollowUpDate}
                                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                                    placeholder="DD-MM-YYYY"
                                    className={styles.inputField}
                                />
                                {errors.nextFollowUpDate && !nextFollowUpDate && <p className={styles.error}>{errors.nextFollowUpDate}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Follow-up Remarks</label>
                                <textarea
                                    rows="3"
                                    placeholder="Follow-up Remarks"
                                    className={styles.textAreaField}
                                    style={{ overflowY: 'auto' }}
                                    value={followUpRemarks}
                                    onChange={(e) => setFollowUpRemarks(e.target.value)}
                                />
                                {errors.followUpRemarks && !followUpRemarks && <p className={styles.error}>{errors.followUpRemarks}</p>}
                            </div>
                        </div>
                    )}

                    <div className={styles.addHeading} style={{ marginBottom: '0px', marginTop: '10px' }}>Site Visit</div>
                    <div className={styles.row}>
                        <div className={`${styles.addShopInputContainer} ${styles.halfWidth}`}>
                            <label className={styles.addShopLabel}>Site Visit Required</label>
                            <Select
                                className={styles.addShopSelect}
                                options={yesNoOption}
                                value={siteVisitRequired}
                                onChange={(option) => {
                                    setSiteVisitRequired(option);
                                    if (option?.value !== 'Yes') {
                                        setSiteVisitDate('');
                                        setSiteVisitTime('');
                                        setSiteVisitLocation('');
                                        setSiteVisitPerson('');
                                        setSiteVisitStatus(null);
                                        setSiteVisitRemarks('');
                                    }
                                }}
                                placeholder="Select Site Visit Required"
                                isClearable={true}
                            />
                        </div>
                        {showSiteVisitFields ? (
                            <div className={`${styles.addShopInputContainer} ${styles.halfWidth}`}>
                                <label className={styles.addShopLabel}>Site Visit Date</label>
                                <InputMask
                                    mask="99-99-9999"
                                    value={siteVisitDate}
                                    onChange={(e) => setSiteVisitDate(e.target.value)}
                                    placeholder="DD-MM-YYYY"
                                    className={styles.inputField}
                                />
                                {errors.siteVisitDate && !siteVisitDate && <p className={styles.error}>{errors.siteVisitDate}</p>}
                            </div>
                        ) : (
                            <div className={styles.halfWidth} />
                        )}
                    </div>
                    {showSiteVisitFields && (
                        <>
                            <div className={styles.row}>
                                <div className={`${styles.addShopInputContainer} ${styles.halfWidth}`}>
                                    <label className={styles.addShopLabel}>Site Visit Time</label>
                                    <input
                                        type="time"
                                        className={styles.inputField}
                                        value={siteVisitTime}
                                        onChange={(e) => setSiteVisitTime(e.target.value)}
                                    />
                                </div>
                                <div className={`${styles.addShopInputContainer} ${styles.halfWidth}`}>
                                    <label className={styles.addShopLabel}>Person Assigned for Site Visit</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Person Assigned for Site Visit"
                                        className={styles.inputField}
                                        value={siteVisitPerson}
                                        onChange={(e) => setSiteVisitPerson(e.target.value)}
                                    />
                                    {errors.siteVisitPerson && !siteVisitPerson && <p className={styles.error}>{errors.siteVisitPerson}</p>}
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={`${styles.addShopInputContainer} ${styles.halfWidth}`}>
                                    <label className={styles.addShopLabel}>Site Visit Location</label>
                                    <AutoResizeTextarea
                                        placeholder="Full address or location link"
                                        className={styles.textAreaField}
                                        value={siteVisitLocation}
                                        onChange={(e) => setSiteVisitLocation(e.target.value)}
                                    />
                                    {errors.siteVisitLocation && !siteVisitLocation && <p className={styles.error}>{errors.siteVisitLocation}</p>}
                                </div>
                                <div className={`${styles.addShopInputContainer} ${styles.halfWidth}`}>
                                    <label className={styles.addShopLabel}>Site Visit Status</label>
                                    <Select
                                        className={styles.addShopSelect}
                                        options={siteVisitStatusOption}
                                        value={siteVisitStatus}
                                        onChange={setSiteVisitStatus}
                                        placeholder="Select Site Visit Status"
                                        isClearable={true}
                                    />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={`${styles.addShopInputContainer} ${styles.halfWidth}`}>
                                    <label className={styles.addShopLabel}>Site Visit Remarks</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Site Visit Remarks"
                                        className={styles.textAreaField}
                                        style={{ overflowY: 'auto' }}
                                        value={siteVisitRemarks}
                                        onChange={(e) => setSiteVisitRemarks(e.target.value)}
                                    />
                                </div>
                                <div className={styles.halfWidth} />
                            </div>
                        </>
                    )}

                    <div className={styles.addHeading} style={{ marginBottom: '0px', marginTop: '10px' }}>Site Visit Assessment</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Cabling Required</label>
                            <Select
                                className={styles.addShopSelect}
                                options={yesNoOption}
                                value={cablingRequired}
                                onChange={setCablingRequired}
                                placeholder="Select Cabling Required"
                                isClearable={true}
                            />
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Civil Work Required</label>
                            <Select
                                className={styles.addShopSelect}
                                options={yesNoOption}
                                value={civilWorkRequired}
                                onChange={setCivilWorkRequired}
                                placeholder="Select Civil Work Required"
                                isClearable={true}
                            />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Existing Electrical Setup / Site Remarks</label>
                            <textarea
                                rows="3"
                                placeholder="Existing Electrical Setup / Site Remarks"
                                className={styles.textAreaField}
                                style={{ overflowY: 'auto' }}
                                value={siteRemarks}
                                onChange={(e) => setSiteRemarks(e.target.value)}
                            />
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Charger Availability</label>
                            <Select
                                className={styles.addShopSelect}
                                options={chargerAvailabilityOption}
                                value={chargerAvailability}
                                onChange={(option) => {
                                    setChargerAvailability(option);
                                    if (option?.value !== 'buy_from_us') {
                                        setChargerCost('');
                                    }
                                }}
                                placeholder="Select Charger Availability"
                                isClearable={true}
                            />
                        </div>
                    </div>
                    {(showExistingCharger || showBuyFromUs) && (
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Charger Capacity</label>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Charger Capacity"
                                    className={styles.inputField}
                                    value={chargerCapacity}
                                    onChange={(e) => setChargerCapacity(e.target.value)}
                                />
                            </div>
                            {showBuyFromUs ? (
                                <div className={styles.addShopInputContainer}>
                                    <label className={styles.addShopLabel}>Charger Cost (AED)</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Charger Cost (AED)"
                                        className={styles.inputField}
                                        value={chargerCost}
                                        onChange={(e) => setChargerCost(e.target.value.replace(/[^0-9.]/g, ''))}
                                    />
                                </div>
                            ) : (
                                <div className={styles.addShopInputContainer} />
                            )}
                        </div>
                    )}

                    <div className={styles.addHeading} style={{ marginBottom: '0px', marginTop: '10px' }}>Material Requirement</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Material Requirement Details</label>
                            <textarea
                                rows="3"
                                placeholder="Material Requirement Details"
                                className={styles.textAreaField}
                                style={{ overflowY: 'auto' }}
                                value={materialDetails}
                                onChange={(e) => setMaterialDetails(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Material Cost to Us (AED)</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Material Cost to Us (AED)"
                                className={styles.inputField}
                                value={materialCostToUs}
                                onChange={(e) => setMaterialCostToUs(e.target.value.replace(/[^0-9.]/g, ''))}
                            />
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Material Cost Quoted to Customer (AED)</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Material Cost Quoted to Customer (AED)"
                                className={styles.inputField}
                                value={materialCostQuoted}
                                onChange={(e) => setMaterialCostQuoted(e.target.value.replace(/[^0-9.]/g, ''))}
                            />
                        </div>
                    </div>

                    <div className={styles.addHeading} style={{ marginBottom: '0px', marginTop: '10px' }}>Installation Planning</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Installation Date</label>
                            <InputMask
                                mask="99-99-9999"
                                value={installationDate}
                                onChange={(e) => setInstallationDate(e.target.value)}
                                placeholder="DD-MM-YYYY"
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Person Assigned for Installation</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Person Assigned for Installation"
                                className={styles.inputField}
                                value={installationPerson}
                                onChange={(e) => setInstallationPerson(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.addHeading} style={{ marginBottom: '0px', marginTop: '10px' }}>Installation Completion</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Installation Completion Date</label>
                            <InputMask
                                mask="99-99-9999"
                                value={installationCompletionDate}
                                onChange={(e) => setInstallationCompletionDate(e.target.value)}
                                placeholder="DD-MM-YYYY"
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Installation Completed By</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Installation Completed By"
                                className={styles.inputField}
                                value={installationCompletedBy}
                                onChange={(e) => setInstallationCompletedBy(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Final Amount (AED)</label>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Final Amount (AED)"
                                className={styles.inputField}
                                value={finalAmount}
                                onChange={(e) => setFinalAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                            />
                        </div>
                        <div className={styles.addShopInputContainer} />
                    </div>

                    <div className={styles.addHeading} style={{ marginBottom: '0px', marginTop: '10px' }}>Document Upload</div>
                    <div className={styles.row} style={{ alignItems: 'flex-start' }}>
                        <FileUploadField
                            id="completionCertificate"
                            label="Completion Certificate"
                            file={completionCertificate}
                            existingUrl={completionCertificateUrl}
                            onChange={handleFileChange(setCompletionCertificate)}
                            onRemove={() => {
                                setCompletionCertificate(null);
                                setCompletionCertificateUrl('');
                            }}
                        />
                        <FileUploadField
                            id="purchaseInvoice"
                            label="Charger Purchase Invoice"
                            file={purchaseInvoice}
                            existingUrl={purchaseInvoiceUrl}
                            onChange={handleFileChange(setPurchaseInvoice)}
                            onRemove={() => {
                                setPurchaseInvoice(null);
                                setPurchaseInvoiceUrl('');
                            }}
                        />
                    </div>

                    <div className={styles.addHeading} style={{ marginBottom: '0px', marginTop: '10px' }}>Enquiry Status</div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Enquiry Status</label>
                            <Select
                                className={styles.addShopSelect}
                                options={enquiryStatusOption}
                                value={enquiryStatus}
                                onChange={(option) => {
                                    setEnquiryStatus(option);
                                    if (option?.value !== 'Lost / Cancelled') {
                                        setLostCancelledRemark('');
                                    }
                                }}
                                placeholder="Select Enquiry Status"
                                isClearable={true}
                            />
                            {errors.enquiryStatus && !enquiryStatus && <p className={styles.error}>{errors.enquiryStatus}</p>}
                        </div>
                        {showLostRemark ? (
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel}>Lost / Cancelled Remark</label>
                                <textarea
                                    rows="3"
                                    placeholder="Reason for lost or cancelled"
                                    className={styles.textAreaField}
                                    style={{ overflowY: 'auto' }}
                                    value={lostCancelledRemark}
                                    onChange={(e) => setLostCancelledRemark(e.target.value)}
                                />
                                {errors.lostCancelledRemark && !lostCancelledRemark && <p className={styles.error}>{errors.lostCancelledRemark}</p>}
                            </div>
                        ) : (
                            <div className={styles.addShopInputContainer} />
                        )}
                    </div>

                    <div className={styles.editButton}>
                        <button type="button" className={styles.editCancelBtn} onClick={handleCancel}>Cancel</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    {isEdit ? 'Update Inquiry...' : 'Save Inquiry...'}
                                </>
                            ) : (
                                isEdit ? 'Update Inquiry' : 'Save Inquiry'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InquiryForm;
