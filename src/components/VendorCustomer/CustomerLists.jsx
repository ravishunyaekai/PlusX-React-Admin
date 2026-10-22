import { useEffect, useMemo, useState } from 'react';
import List from '../SharedComponent/List/List'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
import { useNavigate } from 'react-router-dom';
import Loader from "../SharedComponent/Loader/Loader";
import EmptyList from '../SharedComponent/EmptyList/EmptyList';
import moment from 'moment';
import styles from './packageList.css'

const ResidentsList = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const [residentList, setResidentList] = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(0);
    const [filters, setFilters]           = useState({
        start_date   : null,
        end_date     : null,
        community_id : '',
        search_text  : '',
    });
    const [loading, setLoading] = useState(false);

    const searchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }];
    const addButtonProps = {
        heading : "Add Customer",
        link    : "/vendors/add-customer"
    };
    const fetchList = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        }
        postRequestWithToken('vendor-customer-list', obj, async(response) => {
            if (response.code === 200) {
                setResidentList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 0);
            } else {
                console.log('error in resident-list api', response);
            }
            setLoading(false);
        })
    }
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
    }, []);

    useEffect(() => {
        if (!userDetails?.access_token) return;
        fetchList(currentPage, filters);
    }, [currentPage, filters]);

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    return (
        <div className='main-container'>
            <SubHeader heading    = "Customer List"
                addButtonProps    = {addButtonProps}
                filterValues      = {filters}
                fetchFilteredData = {fetchFilteredData} 
                searchTerm        = {searchTerm}
                // dynamicFilters = {dynamicFilters}
                count             = {totalCount}
            />
            {loading ? <Loader /> :
                residentList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Customer Name", "Mobile No.", "Vendor", "Emirate", "EV Make & Model", "Purchase Date", "Service Package", "Action"]}
                        message="No data available"
                    />
                ) : ( 
                <>
                    <List 
                        tableHeaders={["Customer Name", "Mobile No.", "Vendor", "Emirate", "EV Make & Model", "Purchase Date", "Service Package", "Action"]}
                        pageHeading = "Customer List"
                        listData = {residentList}
                        keyMapping = {[
                            { key: 'customer_name', label: 'Customer Name' },
                            { key: 'mobileNumber',  label: 'Mobile No.' },
                            { key: 'vendor_name',   label: 'Vendor' },
                            { key: 'emirate',       label: 'Emirate' },
                            { key: 'makeModel',     label: 'EV Make & Model' },
                            { key: 'purchase_date', label: 'Purchase Date', format : (date) => moment(date).format('DD MMM YYYY') },
                            {
                                key         : 'action',
                                label       : 'Action',
                                relatedKeys : ['customer_id'], 
                                format      : (data ) => {
                                    
                                    const packages = []
                                    if(data?.pod_charging_session_number ?? 0) {
                                        packages.push({
                                            name: 'Mobile & Portable Charging',
                                            used: data?.pod_used_session_number ?? 0,
                                            total: data?.pod_charging_session_number ?? 0,
                                            validity: data?.pod_charging_session_validity
                                        });
                                    }
                                    if(data?.rsa_charging_session_number ?? 0) {
                                        packages.push({
                                            name: 'Roadside Assistance',
                                            used: data?.rsa_used_session_number ?? 0,
                                            total: data?.rsa_charging_session_number ?? 0,
                                            validity: data?.rsa_charging_session_validity
                                        });
                                    }
                                    return (
                                        <div className="service-packages">
                                            {packages.map((pkg) => (
                                                <div
                                                    className="service-package-row"
                                                    key={pkg.name}
                                                >
                                                    <span className="service-package-name">
                                                        {pkg.name}
                                                    </span>
                                                    <span className="service-package-count">
                                                        {pkg.used} / {pkg.total}
                                                    </span>
                                                    <span className="service-package-validity">
                                                        {pkg.validity
                                                            ? moment(pkg.validity).format('DD MMM YYYY')
                                                            : '-'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                            }             
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default ResidentsList;
