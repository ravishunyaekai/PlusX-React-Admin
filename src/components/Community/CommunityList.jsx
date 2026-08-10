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
  
const CommunityList = () => {
    const userDetails                             = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                                = useNavigate();
    const [communityList, setCommunityList]       = useState([]);
    const [currentPage, setCurrentPage]           = useState(1);
    const [totalPages, setTotalPages]             = useState(1);
    const [totalCount, setTotalCount]             = useState(0);
    const [filters, setFilters]                   = useState({start_date: null,end_date: null});
    const [loading, setLoading]                   = useState(false);
    
    const searchTerm = [
        {
            label: 'Search', 
            name: 'search_text', 
            type: 'text'
        }
    ]

    const addButtonProps = {
        heading: "Add Community",
        link: "/community/add-community"
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
        postRequestWithToken('community-list', obj, async(response) => {
            if (response.code === 200) {
                setCommunityList(response?.data)
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
            <SubHeader heading      = "Community List"
                addButtonProps      = {addButtonProps}
                filterValues        = {filters}
                fetchFilteredData   = {fetchFilteredData} 
                searchTerm          = {searchTerm}
                // dynamicFilters = {dynamicFilters}
                count                = {totalCount}
            />
            {loading ? <Loader /> :
                communityList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Community Name", "Area", "Total Residents", "No. of Chargers", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List 
                        tableHeaders={["Community Name", "Area", "Total Residents", "No. of Chargers", "Action"]}
                        pageHeading = "Community List"
                        listData = {communityList}
                        keyMapping = {[
                             
                            { key: 'community_name',    label: 'Community Name' },
                            { key: 'area_name',         label: 'Area Name' },
                            { key: 'total_residence',   label: 'Total Residents' },
                            { key: 'no_of_chargers',    label: 'No. of Chargers' },                  
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default CommunityList;
