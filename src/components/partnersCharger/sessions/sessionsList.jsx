import { useEffect, useMemo, useState } from 'react';
import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../api/Requests';
import { useNavigate } from 'react-router-dom';
import Loader from '../../SharedComponent/Loader/Loader';
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';
import SessionsDashboardCards from './DashboardCard/DashboardCard';
import {
    buildPartnerSessionListRequest,
    buildPartnerSessionSummaryCards,
    mapStationListToOptions,
    normalizePartnerSessionListRow,
    PARTNER_SESSION_STATUS_OPTIONS,
} from '../../../utils/partnerChargerFormHelpers';

const TABLE_HEADERS = ['Session ID', 'Charger ID', 'Station Name', 'Start Time', 'Duration', 'Status', 'Action'];

const SessionsList = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const [sessionList, setSessionList] = useState([]);
    const [summaryCards, setSummaryCards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        start_date  : null,
        end_date    : null,
        station_id  : '',
        search_text : '',
        status      : '',
    });
    const [loading, setLoading] = useState(true);
    const [stationFilterOptions, setStationFilterOptions] = useState([
        { value: '', label: 'All Stations' },
    ]);

    const searchTerm = [{
        label : 'Search',
        name  : 'search_text',
        type  : 'text',
    }];

    const dynamicFilters = useMemo(() => ([
        {
            label   : 'Station',
            name    : 'station_id',
            type    : 'select',
            options : stationFilterOptions,
        },
        {
            label   : 'Status',
            name    : 'status',
            type    : 'select',
            options : [{ value: '', label: 'All Status' }, ...PARTNER_SESSION_STATUS_OPTIONS],
        },
    ]), [stationFilterOptions]);

    const fetchStationFilterOptions = () => {
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };
        postRequestWithToken('all-partner-station-list', obj, (response) => {
            if (response.code === 200) {
                setStationFilterOptions([
                    { value: '', label: 'All Stations' },
                    ...mapStationListToOptions(response.data),
                ]);
            }
        });
    };

    const fetchList = (page, appliedFilters = {}) => {
        setLoading(true);
        const obj = buildPartnerSessionListRequest(userDetails, page, appliedFilters);
        postRequestWithToken('partner-session-list', obj, (response) => {
            const isSuccess = response.code === 200 || Number(response.status) === 1;
            if (isSuccess) {
                const rows = Array.isArray(response?.data) ? response.data : [];
                const normalized = rows.map(normalizePartnerSessionListRow);
                setSessionList(normalized);
                setSummaryCards(buildPartnerSessionSummaryCards(response, normalized));
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total ?? rows.length);
            } else {
                console.log('error in partner-session-list api', response);
                setSessionList([]);
                setSummaryCards(buildPartnerSessionSummaryCards({}, []));
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchStationFilterOptions();
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
        <div className="main-container">
            <SubHeader
                heading="Live Sessions"
                filterValues={filters}
                fetchFilteredData={fetchFilteredData}
                searchTerm={searchTerm}
                dynamicFilters={dynamicFilters}
                count={totalCount}
            />
            {loading ? (
                <Loader />
            ) : (
                <>
                    <SessionsDashboardCards details={summaryCards} />
                    {sessionList.length === 0 ? (
                        <EmptyList tableHeaders={TABLE_HEADERS} message="No data available" />
                    ) : (
                    <>
                    <List
                        tableHeaders={TABLE_HEADERS}
                        pageHeading="Live Sessions"
                        listData={sessionList}
                        keyMapping={[
                            { key: 'display_session_id', label: 'Session ID' },
                            { key: 'charger_id',         label: 'Charger ID' },
                            { key: 'station_name',       label: 'Station Name' },
                            { key: 'start_time',         label: 'Start Time' },
                            { key: 'duration',           label: 'Duration' },
                            { key: 'status',             label: 'Status' },
                        ]}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                    </>
                    )}
                </>
            )}
        </div>
    );
};

export default SessionsList;