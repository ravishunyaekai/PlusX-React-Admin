import { useEffect, useState } from 'react';
import List from '../SharedComponent/List/List'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
// import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import Loader from "../SharedComponent/Loader/Loader";
import EmptyList from '../SharedComponent/EmptyList/EmptyList';
  
const VendorList = () => {
    const userDetails                       = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                          = useNavigate();
    const [vendorList, setVendorList] = useState([]);
    const [currentPage, setCurrentPage]     = useState(1);
    const [totalPages, setTotalPages]       = useState(1);
    const [totalCount, setTotalCount]       = useState(0);
    const [filters, setFilters]             = useState({start_date: null,end_date: null});
    const [loading, setLoading]             = useState(false);
    
    const searchTerm = [
        {
            label: 'Search', 
            name: 'search_text', 
            type: 'text'
        }
    ]
    const addButtonProps = {
        heading: "Add Vendor",
        link: "/vendors/add-vendor"
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
        postRequestWithToken('vendor-list', obj, async(response) => {
            if (response.code === 200) {
                setVendorList(response?.data)
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0);
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in charger-share-list api', response);
            }
            setLoading(false);
        })
    }
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
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
            <SubHeader
                heading           = "Vendor List"
                addButtonProps    = {addButtonProps}
                filterValues      = {filters}
                fetchFilteredData = {fetchFilteredData} 
                searchTerm        = {searchTerm}
                count             = {totalCount}
            />
            {loading ? <Loader /> :
                vendorList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Vendor Name", "Emirate", "Area", "Showroom Name", "Package Price", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List 
                        tableHeaders={["Vendor Name", "Emirate", "Area", "Showroom Name", "Package Price",  "Action"]}
                        pageHeading = "Vendor List"
                        listData = {vendorList}
                        keyMapping = {[
                            { key: 'vendor_name',    label: 'Vendor Name' },
                            { key: 'emirate',        label: 'Total Residents' },
                            { key: 'area_name',      label: 'Area Name' },
                            { key: 'showroom_name',  label: 'Showroom Name' },
                            {
                                key   : 'package_price',
                                label : 'Package Price',
                                format: (value) => Number(value).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })
                            },
                            // { key: 'rsa_session',    label: 'No. of Chargers' },
                            // { key: 'pod_session',    label: 'No. of Chargers' },
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default VendorList;
