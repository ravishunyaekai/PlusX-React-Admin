import { useEffect, useMemo, useState } from 'react';
import List from '../../SharedComponent/List/List'
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../api/Requests';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';
import DashboardCardItem from "./DashboardCard/DashboardCard";

export const chargingStatusOptions = [
    { value: 'charging',    label: 'Charging' },
    { value: 'completed',   label: 'Completed'     },
    { value: 'error',       label: 'Error'    },
];
  
const SessionsList = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const [sessionList, setSessionList] = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(0);
    const [filters, setFilters]           = useState({
        // start_date   : null,
        // end_date     : null,
        station_id : '',
        search_text  : '',
    });
    const [loading, setLoading]           = useState(false);
    const [stationFilterOptions, setStationFilterOptions] = useState([
        { value: '', label: 'Station' },
    ]);

    // Live Sessions SEARCH (new): search_text sent to resident-list API via filterValues
    const searchTerm = [{
        label : 'Search', 
        name  : 'search_text', 
        type  : 'text'
    }];

    // Live Sessions FILTER (new): community dropdown filter — sent as community_id to resident-list API
    const dynamicFilters = useMemo(() => ([
        {
            label   : 'Station',
            name    : 'station_id',
            type    : 'select',
            options : stationFilterOptions,
        },
        {
            label   : 'Session Status',
            name    : 'status',
            type    : 'select',
            options : [{ value: '', label: 'All Status' }, ...chargingStatusOptions],
        },
    ]), [stationFilterOptions]);

    // const addButtonProps = {
    //     heading : "Add Resident",
    //     link    : "/community/add-resident"
    // };

    const fetchstationFilterOptions = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };

        postRequestWithToken('stations-list', obj, (response) => {
            if (response.code === 200) {
                setStationFilterOptions([
                    { value: '', label: 'Station' },
                    ...(response.data || []).map((option) => ({
                        value : option.value,
                        label : option.label,
                    })),
                ]);
            } else {
                console.log('error in stations-list API', response);
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
        postRequestWithToken('partner-session-list', obj, async(response) => { //resident-list
            if (response.code === 200) {
                setSessionList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 0);
            } else {
                console.log('error in partner-session-list api', response);
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

    const cardData = [
        {
            "module": "Active Sessions",
            "count": 12
        },
        {
            "module": "Avg Duration",
            "count": "2h 14m"
        },
        {
            "module": "Energy Delivered",
            "count": "248 kWh"
        },
    ]

    return (
        <div className='main-container'>
            <SubHeader heading        = "Live Sessions"
                // addButtonProps        = {addButtonProps}
                filterValues          = {filters}
                fetchFilteredData     = {fetchFilteredData} 
                searchTerm            = {searchTerm}
                dynamicFilters        = {dynamicFilters}
                // count                 = {totalCount}
            />
            {loading ? <Loader /> :
                sessionList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Session ID", "Charger ID", "Station Name", "Start Time", "Duration", "Status", "Action"]}
                        message="No data available"
                    />
                ) : ( 
                <>
                    <DashboardCardItem details={cardData} />
                    <List 
                        tableHeaders={["Session ID", "Charger ID", "Station Name", "Start Time", "Duration", "Status", "Action"]}
                        pageHeading = "Live Sessions"
                        listData = {sessionList}
                        keyMapping = {[
                            { key: 'session_id',        label: 'Session ID' },
                            { key: 'charger_id',        label: 'Charger ID' },
                            { key: 'station_name',      label: 'Station Name' },
                            { key: 'start_time',        label: 'Start Time' },
                            { key: 'duration',          label: 'Duration' },
                            { key: 'status',            label: 'Status' },                  
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default SessionsList;
