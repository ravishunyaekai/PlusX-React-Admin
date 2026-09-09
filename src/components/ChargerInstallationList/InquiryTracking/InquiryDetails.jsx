import React, { useEffect, useState } from 'react';
import styles from '../chargerinstallation.module.css';
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx';
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection';
import BookingMultipleImages from '../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../../api/Requests';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { chargerAvailabilityOption } from './inquiryOptions';

const formatDate = (date) => (date ? moment(date).format('DD MMM YYYY') : '');
const formatDateTime = (date) => (date ? moment(date).format('DD MMM YYYY h:mm A') : '');
const isPdf = (fileName = '') => String(fileName).toLowerCase().endsWith('.pdf');
const locationValue = (value) => {
    if (!value) return '';
    if (value.startsWith('http')) {
        return (
            <a href={value} target="_blank" rel="noopener noreferrer" className="linkSection">
                {value}
            </a>
        );
    }
    return value;
};

const hasDisplayValue = (value) => {
    if (value === null || value === undefined || value === '') return false;
    if (value === '-') return false;
    if (React.isValidElement(value)) return true;
    return true;
};

const filterSection = (titles = {}, content = {}) => {
    const filteredContent = {};
    const filteredTitles = {};
    Object.keys(content).forEach((key) => {
        if (hasDisplayValue(content[key])) {
            filteredContent[key] = content[key];
            filteredTitles[key] = titles[key];
        }
    });
    return { titles: filteredTitles, content: filteredContent };
};

const InquiryDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();
    const { inquiryId } = useParams();
    const [details, setDetails] = useState();

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            inquiry_id : inquiryId,
        };
        postRequestWithToken('charger-installation-inquiry-details', obj, (response) => {
            if (response.code === 200 || response.status === 1) {
                setDetails(response?.data?.inquiry || response?.data || {});
            } else {
                console.log('error in charger-installation-inquiry-details', response);
            }
        });
    }, []);

    const chargerAvailabilityLabel = chargerAvailabilityOption.find(
        (option) => option.value === details?.charger_availability
    )?.label || details?.charger_availability || '';

    const headerTitles = {
        bookingIdTitle       : "Inquiry ID",
        customerDetailsTitle : "Customer Details",
    };
    const content = {
        bookingId       : details?.inquiry_id,
        createdAt       : formatDateTime(details?.created_at),
        customerName    : details?.customer_name || details?.name,
        customerContact : `${details?.country_code || ''} ${details?.mobile_no || details?.phone_number || ''}`.trim(),
        customerEmail   : details?.email || details?.email_id || '',
    };

    const section1 = filterSection(
        {
            leadSource       : "Lead Source",
            assignedPerson   : "Assigned Person Name",
            followUpRequired : "Follow-up Required",
            nextFollowUpDate : "Next Follow-up Date",
            enquiryStatus    : "Enquiry Status",
            lostRemark       : "Lost / Cancelled Remark",
        },
        {
            leadSource       : details?.lead_source || '',
            assignedPerson   : details?.assigned_person_name || '',
            followUpRequired : details?.follow_up_required || '',
            nextFollowUpDate : formatDate(details?.next_follow_up_date),
            enquiryStatus    : details?.enquiry_status || '',
            lostRemark       : details?.enquiry_status === 'Lost / Cancelled' ? (details?.lost_cancelled_remark || '') : '',
        }
    );

    const section2 = filterSection(
        {
            customerFeedback : "Customer Feedback",
            followUpRemarks  : "Follow-up Remarks",
        },
        {
            customerFeedback : details?.customer_feedback || '',
            followUpRemarks  : details?.follow_up_remarks || '',
        }
    );

    const section3 = filterSection(
        {
            siteVisitRequired : "Site Visit Required",
            siteVisitDate     : "Site Visit Date",
            siteVisitTime     : "Site Visit Time",
            siteVisitLocation : "Site Visit Location",
            siteVisitPerson   : "Person Assigned for Site Visit",
            siteVisitStatus   : "Site Visit Status",
        },
        {
            siteVisitRequired : details?.site_visit_required || '',
            siteVisitDate     : formatDate(details?.site_visit_date),
            siteVisitTime     : details?.site_visit_time || '',
            siteVisitLocation : locationValue(details?.site_visit_location),
            siteVisitPerson   : details?.site_visit_person || '',
            siteVisitStatus   : details?.site_visit_status || '',
        }
    );

    const section5 = filterSection(
        {
            siteVisitRemarks    : "Site Visit Remarks",
            cablingRequired     : "Cabling Required",
            civilWorkRequired   : "Civil Work Required",
            chargerAvailability : "Charger Availability",
            chargerCapacity     : "Charger Capacity",
            chargerCost         : "Charger Cost (AED)",
        },
        {
            siteVisitRemarks    : details?.site_visit_remarks || '',
            cablingRequired     : details?.cabling_required || '',
            civilWorkRequired   : details?.civil_work_required || '',
            chargerAvailability : chargerAvailabilityLabel,
            chargerCapacity     : details?.charger_capacity || '',
            chargerCost         : details?.charger_cost || '',
        }
    );

    const section4 = filterSection(
        {
            description : "Existing Electrical Setup / Site Remarks",
        },
        {
            description : details?.existing_electrical_setup || details?.site_remarks || '',
        }
    );

    const section6 = filterSection(
        {
            materialDetails : "Material Requirement Details",
            materialCostUs  : "Material Cost to Us (AED)",
            materialQuoted  : "Material Cost Quoted (AED)",
            installDate     : "Installation Date",
            installPerson   : "Person Assigned for Installation",
            completionDate  : "Installation Completion Date",
            completedBy     : "Installation Completed By",
            finalAmount     : "Final Amount (AED)",
        },
        {
            materialDetails : details?.material_requirement_details || '',
            materialCostUs  : details?.material_cost_to_us || '',
            materialQuoted  : details?.material_cost_quoted || '',
            installDate     : formatDate(details?.installation_date),
            installPerson   : details?.installation_person || '',
            completionDate  : formatDate(details?.installation_completion_date),
            completedBy     : details?.installation_completed_by || '',
            finalAmount     : details?.final_amount || '',
        }
    );

    const completionFile = details?.completion_certificate;
    const invoiceFile    = details?.charger_purchase_invoice;
    const completionUrl  = details?.completion_certificate_url || completionFile;
    const invoiceUrl     = details?.charger_purchase_invoice_url || invoiceFile;

    // Keep shared BookingLeftDetails unchanged: if section2 is empty after filtering,
    // move section3 into section2 so its fields still render.
    const hasSection2 = Object.keys(section2.content).length > 0;
    const leftSection2 = hasSection2 ? section2 : section3;
    const leftSection3 = hasSection2 ? section3 : { titles: {}, content: {} };

    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='inquiryTracking' />
            <div className={styles.bookingLeftContainer}>
                <BookingLeftDetails
                    titles={section1.titles}
                    content={section1.content}
                    sectionTitles2={leftSection2.titles}
                    sectionContent2={leftSection2.content}
                    sectionTitles3={leftSection3.titles}
                    sectionContent3={leftSection3.content}
                    sectionTitles4={section4.titles}
                    sectionContent4={section4.content}
                    sectionTitles5={section5.titles}
                    sectionContent5={section5.content}
                    sectionTitles6={section6.titles}
                    sectionContent6={section6.content}
                />

                {completionUrl && !isPdf(completionFile) && (
                    <BookingImageSection
                        titles={{ coverImage: 'Completion Certificate' }}
                        content={{ coverImage: completionUrl, baseUrl: '' }}
                    />
                )}
                {completionUrl && isPdf(completionFile) && (
                    <BookingMultipleImages
                        titles={{ evChargerFiles: 'Completion Certificate' }}
                        content={{ evChargerFiles: completionUrl, baseUrl: '' }}
                    />
                )}
                {invoiceUrl && !isPdf(invoiceFile) && (
                    <BookingImageSection
                        titles={{ coverImage: 'Charger Purchase Invoice' }}
                        content={{ coverImage: invoiceUrl, baseUrl: '' }}
                    />
                )}
                {invoiceUrl && isPdf(invoiceFile) && (
                    <BookingMultipleImages
                        titles={{ evChargerFiles: 'Charger Purchase Invoice' }}
                        content={{ evChargerFiles: invoiceUrl, baseUrl: '' }}
                    />
                )}
            </div>
        </div>
    );
};

export default InquiryDetails;
