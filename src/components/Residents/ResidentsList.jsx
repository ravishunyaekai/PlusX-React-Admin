import { useEffect, useMemo, useState } from 'react';
import List from '../SharedComponent/List/List'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
import { useNavigate } from 'react-router-dom';
import Loader from "../SharedComponent/Loader/Loader";
import EmptyList from '../SharedComponent/EmptyList/EmptyList';
  
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
    const [loading, setLoading]           = useState(false);
    const [communityFilterOptions, setCommunityFilterOptions] = useState([
        { value: '', label: 'All Communities' },
    ]);

    // RESIDENT LIST SEARCH (new): search_text sent to resident-list API via filterValues
    const searchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }];

    // RESIDENT LIST FILTER (new): community dropdown filter — sent as community_id to resident-list API
    const dynamicFilters = useMemo(() => ([
        {
            label   : 'Community',
            name    : 'community_id',
            type    : 'select',
            options : communityFilterOptions,
        },
    ]), [communityFilterOptions]);

    const addButtonProps = {
        heading : "Add Resident",
        link    : "/community/add-resident"
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
        postRequestWithToken('resident-list', obj, async(response) => {
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
        fetchCommunityFilterOptions();
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
            <SubHeader heading        = "Resident List"
                addButtonProps        = {addButtonProps}
                filterValues          = {filters}
                fetchFilteredData     = {fetchFilteredData} 
                searchTerm            = {searchTerm}
                dynamicFilters        = {dynamicFilters}
                count                 = {totalCount}
            />
            {loading ? <Loader /> :
                residentList.length === 0 ? (
                    <EmptyList
                        // COMMUNITY & AREA COLUMNS (old):
                        // tableHeaders={["Resident ID", "Resident Name", "Community", "Area", "Session Allocated", "Session Used", "kWh Allocated", "kWh Used", "Action"]}
                        tableHeaders={["Resident ID", "Resident Name", "Session Allocated", "Session Used", "kWh Allocated", "kWh Used", "Action"]}
                        message="No data available"
                    />
                ) : ( 
                <>
                    <List 
                        // COMMUNITY & AREA COLUMNS (old):
                        // tableHeaders={["Resident ID", "Resident Name", "Community", "Area", "Session Allocated", "Session Used", "kWh", "kWh Used", "Action"]}
                        tableHeaders={["Resident ID", "Resident Name", "Session Allocated", "Session Used", "kWh", "kWh Used", "Action"]}
                        pageHeading = "Resident List"
                        listData = {residentList}
                        keyMapping = {[
                            { key: 'resident_id',                 label: 'Resident ID' },
                            { key: 'resident_name',               label: 'Resident Name' },
                            // COMMUNITY & AREA COLUMNS (old):
                            // { key: 'community_name', label: 'Community' },
                            // { key: 'area_name',      label: 'Area' },
                            { key: 'monthly_session_allocation',  label: 'Session Allocated' },
                            { key: 'session_used',                label: 'Session Used' },
                            { key: 'kwh_allocated',               label: 'kWh Allocated' },
                            { key: 'kwh_used',                    label: 'kWh Used' },                  
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default ResidentsList;
