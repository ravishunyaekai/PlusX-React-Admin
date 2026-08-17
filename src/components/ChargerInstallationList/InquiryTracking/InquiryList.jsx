import React, { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../api/Requests';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from "../../SharedComponent/EmptyList/EmptyList";
import { leadSourceOption, enquiryStatusOption, siteVisitStatusOption } from './inquiryOptions';

const getInstallationStatus = (item) => {
    if (item.installation_status) return item.installation_status;
    if (item.installation_completion_date) return 'Completed';
    if (item.installation_date) return 'Scheduled';
    return '-';
};

const InquiryList = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();
    const [inquiryList, setInquiryList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount]   = useState(0);
    const [totalPages, setTotalPages]   = useState(1);
    const [filters, setFilters]         = useState({ start_date: null, end_date: null });
    const [loading, setLoading]         = useState(false);
    const [rowOptions]                  = useState([10, 25, 50, 100]);
    const [rowSelected, setARowSelected] = useState(10);

    const dynamicFilters = [
        {
            label   : 'Lead Source',
            name    : 'lead_source',
            type    : 'select',
            options : [{ value: '', label: 'All Sources' }, ...leadSourceOption],
        },
        {
            label   : 'Enquiry Status',
            name    : 'enquiry_status',
            type    : 'select',
            options : [{ value: '', label: 'All Statuses' }, ...enquiryStatusOption],
        },
        {
            label   : 'Site Visit Status',
            name    : 'site_visit_status',
            type    : 'select',
            options : [{ value: '', label: 'All Statuses' }, ...siteVisitStatusOption],
        },
    ];
    const searchTerm = [
        { label: 'search', name: 'search_text', type: 'text' },
    ];

    const fetchList = (page, appliedFilters = {}, rowSelected) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            rowSelected,
            ...appliedFilters,
        };
        postRequestWithToken('charger-installation-inquiry-list', obj, async (response) => {
            if (response.code === 200 || response.status === 1) {
                setInquiryList(response?.data || []);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0);
            } else {
                setInquiryList([]);
                console.log('error in charger-installation-inquiry-list', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchList(currentPage, filters, rowSelected);
    }, [currentPage, filters, rowSelected]);

    const addButtonProps = {
        heading : "Add Inquiry",
        link    : "/charger-installation/inquiry-tracking-add",
    };

    const tableHeaders = [
        "Customer Name",
        "Phone Number",
        "Lead Source",
        "Assigned Person",
        "Enquiry Status",
        "Site Visit Status",
        "Installation Date",
        "Installation Status",
        "Action",
    ];

    return (
        <div className='main-container'>
            <SubHeader
                heading="Charger Installation Inquiry Tracking"
                addButtonProps={addButtonProps}
                fetchFilteredData={(newFilters = {}) => {
                    setFilters(newFilters);
                    setCurrentPage(1);
                }}
                dynamicFilters={dynamicFilters}
                filterValues={filters}
                searchTerm={searchTerm}
                rowOptions={rowOptions}
                rowSelected={rowSelected}
                handleRowperPagePage={setARowSelected}
                count={totalCount}
            />

            {loading ? <Loader /> :
                inquiryList.length === 0 ? (
                    <EmptyList tableHeaders={tableHeaders} message="No data available" />
                ) : (
                <>
                    <List
                        tableHeaders={tableHeaders}
                        listData={inquiryList}
                        keyMapping={[
                            { key: 'customer_name', label: 'Customer Name' },
                            {
                                key: 'mobile_no',
                                label: 'Phone Number',
                                relatedKeys: ['country_code', 'phone_number'],
                                format: (data) => `${data.country_code || ''} ${data.mobile_no || data.phone_number || ''}`.trim() || '-',
                            },
                            { key: 'lead_source', label: 'Lead Source' },
                            { key: 'assigned_person_name', label: 'Assigned Person' },
                            { key: 'enquiry_status', label: 'Enquiry Status' },
                            { key: 'site_visit_status', label: 'Site Visit Status', format: (status) => status || '-' },
                            {
                                key: 'installation_date',
                                label: 'Installation Date',
                                format: (date) => date ? moment(date).format('DD MMM YYYY') : '-',
                            },
                            {
                                key: 'installation_status',
                                label: 'Installation Status',
                                relatedKeys: ['installation_date', 'installation_completion_date'],
                                format: (data) => getInstallationStatus(data),
                            },
                        ]}
                        pageHeading="Charger Installation Inquiry Tracking"
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
};

export default InquiryList;
