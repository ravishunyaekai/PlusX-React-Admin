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
  
const ResidentsInvoiceList = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const [invoiceList, setInvoiceList] = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(0);
    const [filters, setFilters]           = useState({start_date: null,end_date: null});
    const [loading, setLoading]           = useState(false);
 
    const searchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }]
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
        postRequestWithToken('scan-charge-invoice-list', obj, async(response) => {
            if (response.code === 200) {
                setInvoiceList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 1);
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
            <SubHeader heading      = "Invoice List"
                addButtonProps      = {addButtonProps}
                filterValues        = {filters}
                fetchFilteredData   = {fetchFilteredData} 
                searchTerm          = {searchTerm}
                count               = {totalCount}
            />
            {loading ? <Loader /> :
                invoiceList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Resident Name", "Community", "Area", "kWh Allocated", "kWh Used", "Per kW Charge", "Price (AED)", "Over Time (AED)", "Total (AED)", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List 
                        tableHeaders={["Resident Name", "Community", "Area", "kWh Allocated", "kWh Used", "Per kW Charge", "Price (AED)", "Over Time (AED)", "Total (AED)", "Status", "Action"]}
                        pageHeading = "Scan Charge Invoice List"
                        listData = {invoiceList}
                        keyMapping = {[
                            { key: 'resident_name',       label: 'Resident Name' },
                            { key: 'community_name',      label: 'Community' },
                            { key: 'area_name',           label: 'Area' },
                            { key: 'kwh_allocated',       label: 'Session Allocated' },
                            { key: 'total_consumption',   label: 'Session Used' },
                            { key: 'per_kwh_charge',      label: 'kWh Allocated' },
                            { key: 'energy_price_total',  label: 'kWh Used' },   
                            { key: 'extra_charge_total',  label: 'Session Used' }, 
                            { key: 'total_amount',        label: 'kWh Allocated', format: (price) => price.toFixed(2) }, 
                            { key: 'invoice_status',      label: 'kWh Used' },                    
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default ResidentsInvoiceList;
