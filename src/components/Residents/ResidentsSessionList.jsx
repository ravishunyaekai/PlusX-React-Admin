import { useEffect, useState } from 'react';
import List from '../SharedComponent/List/List'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
// import styles from './Community.module.css';
import Loader from "../SharedComponent/Loader/Loader";
import EmptyList from '../SharedComponent/EmptyList/EmptyList';
  
const ResidentsSessionList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                      = useNavigate();
    const [invoiceList, setInvoiceList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalCount, setTotalCount]   = useState(0);
    const [filters, setFilters]         = useState({start_date: null,end_date: null});
    const [loading, setLoading]         = useState(false);
 
    const searchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }];
    
    const addButtonProps = {
        heading : "Create Invoice",
        link    : "/community/create-invoice" 
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
        postRequestWithToken('session-list', obj, async(response) => {
            if (response.code === 200) {
                setInvoiceList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 0);
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in invoice-list api', response);
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
            <SubHeader heading    = "Session List"
                filterValues      = {filters}
                fetchFilteredData = {fetchFilteredData} 
                searchTerm        = {searchTerm}
                count             = {totalCount}
            />
            {loading ? <Loader /> :
                invoiceList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Date", "Session ID", "Resident Name", "Area", "Charger ID", "kWh Used", "Duration (In Min.)", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List 
                        tableHeaders={["Date", "Session ID", "Resident Name", "Area", "Charger ID", "kWh Used", "Duration (In Min.)", "Status", "Action"]}
                        pageHeading = "Session List"
                        listData = {invoiceList}
                        keyMapping = {[
                            { key: 'created_at', label: 'Date & Time', format: (date) => moment(date).format('DD MMM YYYY') },
                            { key: 'booking_id',        label: 'Session ID' },
                            { key: 'resident_name',     label: 'Resident Name' },
                            // { key: 'community_name',    label: 'Community' },
                            { key: 'area_name',         label: 'Area Name' },
                            { key: 'charger_id',        label: 'Charger ID' },
                            { key: 'total_consumption', label: 'kWh Used' },
                            { key: 'total_duration',    label: 'Duration' },
                            { key: 'status',            label: 'Status' },  
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default ResidentsSessionList;
