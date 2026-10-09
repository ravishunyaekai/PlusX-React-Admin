import { useEffect, useMemo, useState } from 'react';
import List from '../SharedComponent/List/List'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
import { useNavigate } from 'react-router-dom';
import Loader from "../SharedComponent/Loader/Loader";
import EmptyList from '../SharedComponent/EmptyList/EmptyList';
import moment from 'moment';

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
    const [communityFilterOptions, setCommunityFilterOptions] = useState([
        { value: '', label: 'All Communities' },
    ]);

    const searchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }];
    // const dynamicFilters = useMemo(() => ([
    //     {
    //         label   : 'Showroom',
    //         name    : 'customer_id',
    //         type    : 'select',
    //         options : communityFilterOptions,
    //     },
    // ]), [communityFilterOptions]);

    const addButtonProps = {
        heading : "Add Customer",
        link    : "/vendors/add-customer"
    };

    const fetchCommunityFilterOptions = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };

        postRequestWithToken('all-community-list', obj, (response) => {
            if (response.code === 200) {
                setCommunityFilterOptions([
                    { value: '', label: 'All Communities' },
                    ...(response.data || []).map((option) => ({
                        value : option.value,
                        label : option.label,
                    })),
                ]);
            } else {
                console.log('error in all-community-list API', response);
            }
        });
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
        // fetchCommunityFilterOptions();
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
                            { key: '',              label: 'Service Package' },                  
                        ]}
                        // 
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default ResidentsList;
