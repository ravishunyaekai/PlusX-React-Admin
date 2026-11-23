import { useEffect, useMemo, useState } from 'react';
import List from '../../SharedComponent/List/List'
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../api/Requests';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';
import {
    buildPartnerStationListRequest,
    PARTNER_STATION_ADMIN_STATUS_OPTIONS,
} from '../../../utils/partnerChargerFormHelpers';

// export const chargingStatusOptions = [
//     { value: 'charging',    label: 'Charging' },
//     { value: 'completed',   label: 'Completed'     },
//     { value: 'error',       label: 'Error'    },
// ];

const formatStationStatus = (status) => {
    if (status === 1 || status === '1') return 'Active';
    if (status === 0 || status === '0') return 'In-active';
    return status ?? '—';
};

const normalizePartnerStationRow = (row = {}) => ({
    ...row,
    station_id   : row.station_id ?? row.id ?? '',
    station_name : row.station_name ?? '',
    city         : row.city ?? '',
    contact_no   : row.contact_no ?? row.contact_number ?? '',
    charger_count : row.charger_count ?? row.chargers ?? row.number_of_chargers ?? '',
    status       : row.admin_status ?? formatStationStatus(row.status),
});

const StationList = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const [stationList, setStationList]   = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(0);
    const [filters, setFilters]           = useState({
        start_date    : null,
        end_date      : null,
        search_text   : '',
        admin_status  : '',
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

    const dynamicFilters = useMemo(() => ([
        {
            label   : 'Status',
            name    : 'admin_status',
            type    : 'select',
            options : [{ value: '', label: 'All Status' }, ...PARTNER_STATION_ADMIN_STATUS_OPTIONS],
        },
    ]), []);

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
        const obj = buildPartnerStationListRequest(userDetails, page, appliedFilters);
        postRequestWithToken('partner-station-list', obj, async (response) => {
            const isSuccess = response.code === 200 || Number(response.status) === 1;
            if (isSuccess) {
                const rows = Array.isArray(response?.data) ? response.data : [];
                setStationList(rows.map(normalizePartnerStationRow));
                setTotalPages(response?.total_page || response?.total_pages || 1);
                setTotalCount(response?.total ?? response?.total_count ?? rows.length);
            } else {
                console.log('error in partner-station-list api', response);
                setStationList([]);
            }
            setLoading(false);
        });
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
                dynamicFilters        = {dynamicFilters}
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
                            { key: 'charger_count',     label: 'Chargers' },
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
