import { useEffect, useMemo, useState } from 'react';
import List from '../../SharedComponent/List/List'
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../api/Requests';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

// export const chargingStatusOptions = [
//     { value: 'charging',    label: 'Charging' },
//     { value: 'completed',   label: 'Completed'     },
//     { value: 'error',       label: 'Error'    },
// ];
  
const StationList = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const [stationList, setStationList]   = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(0);
    const [filters, setFilters]           = useState({
        start_date   : null,
        end_date     : null,
        station_id : '',
        search_text  : '',
    });
    const [loading, setLoading]           = useState(false);
    // const [stationFilterOptions, setStationFilterOptions] = useState([
    //     { value: '', label: 'Station' },
    // ]);

    // Stations SEARCH (new): search_text sent to resident-list API via filterValues
    const searchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }];

    // Stations FILTER (new): community dropdown filter — sent as community_id to Stations-list API
    // const dynamicFilters = useMemo(() => ([
    //     {
    //         label   : 'Session Status',
    //         name    : 'status',
    //         type    : 'select',
    //         options : [{ value: '', label: 'All Status' }, ...chargingStatusOptions],
    //     },
    // ]), [stationFilterOptions]);

    const addButtonProps = {
        heading : "Add Station",
        link    : "/partners/add-station"
    };

    // const fetchstationFilterOptions = () => {
    //     const obj = {
    //         userId : userDetails?.user_id,
    //         email  : userDetails?.email,
    //     };

    //     postRequestWithToken('stations-list', obj, (response) => {
    //         if (response.code === 200) {
    //             setStationFilterOptions([
    //                 { value: '', label: 'Station' },
    //                 ...(response.data || []).map((option) => ({
    //                     value : option.value,
    //                     label : option.label,
    //                 })),
    //             ]);
    //         } else {
    //             console.log('error in stations-list API', response);
    //         }
    //     });
    // };

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
        postRequestWithToken('station-list', obj, async(response) => { //resident-list
            if (response.code === 200) {
                setStationList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 0);
            } else {
                console.log('error in station-list api', response);
            }
            setLoading(false);
        })
    }

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
        // fetchstationFilterOptions();
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
            <SubHeader heading        = "Stations"
                addButtonProps        = {addButtonProps}
                filterValues          = {filters}
                fetchFilteredData     = {fetchFilteredData} 
                searchTerm            = {searchTerm}
                // dynamicFilters        = {dynamicFilters}
                count                 = {totalCount}    
            />
            {loading ? <Loader /> :
                stationList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Station ID", "Station Name", "City", "Contact Number", "Chargers", "Status", "Action"]}
                        message="No data available"
                    />
                ) : ( 
                <>
                    <List 
                        tableHeaders={["Station ID", "Station Name", "City", "Contact Number", "Chargers", "Status", "Action"]}
                        pageHeading = "Stations"
                        listData = {stationList}
                        keyMapping = {[
                            { key: 'station_id',        label: 'Station ID' },
                            { key: 'station_name',      label: 'Station Name' },
                            { key: 'city',              label: 'City' },
                            { key: 'contact_no',        label: 'Contact Number' },
                            { key: 'chargers',          label: 'Chargers' },
                            { key: 'status',            label: 'Status' },                  
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default StationList;
