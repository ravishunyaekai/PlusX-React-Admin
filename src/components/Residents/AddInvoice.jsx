import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styles from './EditResidents.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithToken } from '../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ScanChargeInvoice from '../../components/SharedComponent/Invoice/ScanChargeInvoice';
 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

const AddInvoice = () => {
    const userDetails           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate              = useNavigate();
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [residentName, setResidentName]     = useState('');
    const [residentMobile, setResidentMobile] = useState('');
    const [residentId, setResidentId]     = useState('');
    const [community, setCommunity]       = useState(null);
    const [area, setArea]                 = useState(null);
    const [billingMonth, setBillingMonth] = useState(new Date());

    const serviceDropdownRef = useRef(null);

    const [communityOptions, setCommunityOptions] = useState([]);
    const [areaOptions, setAreaOptions]           = useState([]);

    /* ── Autocomplete state ── */
    const [suggestions, setSuggestions]         = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading]     = useState(false);
    const autocompleteRef                       = useRef(null);
    const debounceTimer                         = useRef(null);

    /* ── Close dropdown on outside click ── */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if ( autocompleteRef.current && !autocompleteRef.current.contains(e.target) ) {
                setTimeout(() => {
                    setShowSuggestions(false);
                }, 100);
            }
        };
    }, []);
    
    /* ── Fetch resident suggestions from API ── */
    const fetchResidentSuggestions = (query) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setSearchLoading(true);
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            search       : query,
            community_id : community?.value || '',
        };
        postRequestWithToken('resident-search', obj, (response) => {
            setSearchLoading(false);
            if (response.code === 200 && response.data?.length) {
                setSuggestions(response.data);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        });
    };

    /* ── Debounced input — fires API 400ms after user stops typing ── */
    const handleResidentNameChange = (e) => {
        const value = e.target.value;
        setResidentId(value);
        // setResidentId(''); // clear selected id when user types manually

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchResidentSuggestions(value);
        }, 400);
    };

    /* ── Select a suggestion from dropdown ── */
    const handleSelectSuggestion = (item) => {

        setResidentName(item.resident_name || "");
        setResidentMobile(item.resident_mobile || "")
        setResidentId(item.resident_id || "");

        setSuggestions([]);
        setShowSuggestions(false);
    };

    /* ── Community / Area handlers ── */
    const fetchAreaList = (selectedCommunity) => {
        const obj = {
            userId    : userDetails?.user_id,
            email     : userDetails?.email,
            community : selectedCommunity.label,
        };
        postRequestWithToken('community-area-list', obj, (response) => {
            if (response.code === 200) {
                setAreaOptions(response.data);
            } else {
                console.log('error in community-area-list API', response);
            }
        });
    };

    const handleCommunity = (selectedOption) => {
        setCommunity(selectedOption);
        setArea(null);
        if (selectedOption) fetchAreaList(selectedOption);
    };

    const handleArea = (selectedOption) => {
        setArea(selectedOption);
    };

    const handleCancel = () => {
        navigate('/community/resident-invoice');
    };

    /* ── Validation ── */
    const validateForm = () => {
        const fields = [
            { name: 'residentName', value: residentName, errorMessage: 'Resident Name is required.' },
            { name: 'community',    value: community,    errorMessage: 'Community is required.'     },
            { name: 'billingMonth', value: billingMonth, errorMessage: 'Billing Month is required.' },
        ];
        const newErrors = fields.reduce((acc, { name, value, errorMessage }) => {
            if (!value) acc[name] = errorMessage;
            return acc;
        }, {});
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ── Submit ── */
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (validateForm()) {
            const obj = {
                userId          : userDetails?.user_id,
                email           : userDetails?.email,
                resident_mobile : residentMobile,
                resident_id     : residentId, 
                invoice_month   : billingMonth,
                resident_name   : residentName,                 
                community_name  : community?.label,
                area_name       : area?.label,
                billing_month   : moment(billingMonth).format('YYYY-MM-DD'),
            };
            postRequestWithToken('create-scan-charge-invoice', obj, (response) => {
                if (response.status === 1) {
                    toast(response.message , {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/community/resident-invoice');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in resident-add API:', response);
                    setLoading(false);
                }
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    /* ── Fetch community list on mount ── */
    const fetchDetails = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };
        postRequestWithToken('all-community-list', obj, (response) => {
            if (response.code === 200) {
                setCommunityOptions(response.data);
            } else {
                console.log('error in all-community-list API', response);
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

    const [invoiceDetails, setInvoiceDetails] = useState({});
    const today                 = new Date();
    // First day of 2 months ago
    const minDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    // Last day of current month
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const getInvoiceData = () => {
   
        if(!residentMobile || !residentId || !billingMonth) return false;
        const obj = {
            userId          : userDetails?.user_id,
            email           : userDetails?.email,
            resident_mobile : residentMobile,
            invoice_month   : moment(billingMonth).format('YYYY-MM-DD'),
        };
        postRequestWithToken('get-invoice-data', obj, (response) => {
            if (response.code === 200) {
                setInvoiceDetails(response?.data)
            }
        });
    }
    useEffect(() => {
        getInvoiceData();
    }, [billingMonth, community, residentId]);

    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Create Invoice</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>

                    {/* Row 1 — Community & Area */}
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Community</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={communityOptions}
                                    value={community}
                                    onChange={handleCommunity}
                                    placeholder="Select Community"
                                    isClearable={true}
                                />
                            </div>
                            {errors.community && !community && (
                                <p className="error" style={{ color: 'red' }}>{errors.community}</p>
                            )}
                        </div>

                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel}>Area</label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={areaOptions}
                                    value={area}
                                    onChange={handleArea}
                                    placeholder="Select Area"
                                    isClearable={true}
                                />
                            </div>
                            {errors.area && !area && (
                                <p className="error" style={{ color: 'red' }}>{errors.area}</p>
                            )}
                        </div>
                    </div>

                    {/* Row 2 — Resident Name (autocomplete) & Billing Month */}
                    <div className={styles.row}>

                        {/* ── AUTOCOMPLETE RESIDENT NAME ── */}
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="residentName">Resident ID</label>

                            <div ref={autocompleteRef} style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="residentName"
                                    placeholder="Search resident ID..."
                                    className={styles.inputField}
                                    value={residentId}
                                    onChange={handleResidentNameChange}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                />

                                {/* Searching indicator */}
                                {searchLoading && (
                                    <span style={{
                                        position  : 'absolute',
                                        right     : 10,
                                        top       : '50%',
                                        transform : 'translateY(-50%)',
                                        fontSize  : 12,
                                        color     : '#888',
                                    }}>
                                        Searching...
                                    </span>
                                )}

                                {/* Suggestions dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            zIndex: 999,
                                            background: "#fff",
                                            border: "1px solid #ddd",
                                            borderRadius: 4,
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            listStyle: "none",
                                            margin: 0,
                                            padding: 0,
                                            maxHeight: 220,
                                            overflowY: "auto",
                                        }}
                                    >
                                        {suggestions.map((item, i) => (
                                            <li
                                                key={item.resident_id ?? i}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleSelectSuggestion(item);
                                                }}
                                                style={{
                                                    padding: "10px 14px",
                                                    cursor: "pointer",
                                                    borderBottom:
                                                        i < suggestions.length - 1
                                                            ? "1px solid #f0f0f0"
                                                            : "none",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "#f5f5f5";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "#fff";
                                                }}
                                            >
                                                <div style={{ color: "#555" }}>
                                                    {item.resident_id}
                                                </div>
                                                <div style={{ color: "#555", marginTop: 4 }}>
                                                    {item.resident_name}
                                                </div>
                                                <div style={{ fontSize: 12, color: "#888", marginTop: 4, }} >
                                                    📞 {item.resident_mobile}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {errors.residentId && residentId === '' && (
                                <p className={styles.error} style={{ color: 'red' }}>{errors.residentId}</p>
                            )}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="residentName">Resident Name</label>

                            <div ref={autocompleteRef} style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="residentName"
                                    placeholder="Search resident name..."
                                    className={styles.inputField}
                                    value={residentName}
                                    onChange={(e) => setResidentName(e.target.value)}
                                />
                            </div>
                            {errors.residentName && residentName === '' && (
                                <p className={styles.error} style={{ color: 'red' }}>{errors.residentName}</p>
                            )}
                        </div>

                        {/* Billing Month */}
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="billingMonth"> Billing Month </label>
                            <div className={styles.datePickerWrapper}>
                                <DatePicker
                                    className={styles.inputCharger}
                                    selected={billingMonth} 
                                    onChange={(date) => setBillingMonth(date)} 
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    dateFormat="MMMM yyyy" 
                                    placeholderText="Select Start Date" 
                                    showMonthYearPicker
                                />
                            </div>
                            {errors.startDate && <p className={styles.error} style={{ color: 'red' }}>{errors.startDate}</p>}
                        </div>
                    </div>
                    {/* Invoice details card */}
                    <ScanChargeInvoice invoiceDetails = {invoiceDetails} />
                    {/* End Invoice details card */}
                    {/* Buttons */}
                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} type="button" onClick={() => handleCancel()}>
                            Cancel
                        </button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Submit...
                                </>
                            ) : (
                                "Create Invoice"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddInvoice;