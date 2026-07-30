import { useEffect, useState } from 'react';
import List from '../SharedComponent/List/List'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
// import styles from './chargerShare.module.css';
import Loader from "../SharedComponent/Loader/Loader";
import EmptyList from '../SharedComponent/EmptyList/EmptyList';
  
const ChargeShareList = () => {
    const userDetails                             = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                                = useNavigate();
    const [chargerShareList, setChargerShareList] = useState([]);
    const [currentPage, setCurrentPage]           = useState(1);
    const [totalPages, setTotalPages]             = useState(1);
    const [filters, setFilters]                   = useState({start_date: null,end_date: null});
    const [loading, setLoading]                   = useState(false);
    
    const searchTerm = [
        {
            label: 'Search', 
            name: 'search_text', 
            type: 'text'
        }
    ]

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
        postRequestWithToken('charge-share-list', obj, async(response) => {
            if (response.code === 200) {
                setChargerShareList(response?.data)
                setTotalPages(response?.total_page || 1); 
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
            <SubHeader heading = "Charger Share List"
                filterValues={filters}
                fetchFilteredData={fetchFilteredData} 
                searchTerm     = {searchTerm}
                // dynamicFilters = {dynamicFilters}
            />
            {loading ? <Loader /> :
                chargerShareList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Customer Name", "Phone Number", "Charger Name", "Output Power", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List 
                        tableHeaders={["Customer Name", "Phone Number", "Charger Name", "Output Power", "Status", "Action"]}
                        listData = {chargerShareList}
                        keyMapping = {[
                             
                            { key: 'rider_name',     label: 'Customer Name' },
                            { key: 'mobile',         label: 'Phone Number' },
                            { key: 'charger_name',   label: 'Charger Name' },
                            // { key: 'charger_type',   label: 'Charger Type' },
                            { key: 'output',         label: 'Output Power' },
                            { key: 'charger_status', label: 'Status' },                  
                        ]}
                        pageHeading = "Charger Share List"  //charger_status
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default ChargeShareList;
