import { useEffect, useMemo, useState } from 'react';
import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../api/Requests';
import { useNavigate } from 'react-router-dom';
import Loader from '../../SharedComponent/Loader/Loader';
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';
import {
    buildPartnerAlertListRequest,
    normalizePartnerAlertListRow,
} from '../../../utils/partnerChargerFormHelpers';

const severityOptions = [
    { value: 'low',      label: 'Low' },
    { value: 'medium',   label: 'Medium' },
    { value: 'high',     label: 'High' },
    { value: 'critical', label: 'Critical' },
];

const alertStatusOptions = [
    { value: 'Open',      label: 'Open' },
    { value: 'Active',    label: 'Active' },
    { value: 'Resolved',  label: 'Resolved' },
    { value: 'Closed',    label: 'Closed' },
];

const TABLE_HEADERS = ['Time', 'Message', 'Station Name', 'Charger ID', 'Severity', 'Status'];

const AlertList = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const [alertList, setAlertList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        search_text  : '',
        admin_status : '',
        severity     : '',
    });
    const [loading, setLoading] = useState(true);

    const searchTerm = [{
        label : 'Search',
        name  : 'search_text',
        type  : 'text',
    }];

    const dynamicFilters = useMemo(() => ([
        {
            label   : 'Status',
            name    : 'admin_status',
            type    : 'select',
            options : [{ value: '', label: 'All Status' }, ...alertStatusOptions],
        },
        {
            label   : 'Severity',
            name    : 'severity',
            type    : 'select',
            options : [{ value: '', label: 'All Severity' }, ...severityOptions],
        },
    ]), []);

    const fetchList = (page, appliedFilters = {}) => {
        setLoading(true);
        const obj = buildPartnerAlertListRequest(userDetails, page, appliedFilters);
        postRequestWithToken('partner-alert-list', obj, (response) => {
            const isSuccess = response.code === 200 || Number(response.status) === 1;
            if (isSuccess) {
                const rows = Array.isArray(response?.data) ? response.data : [];
                setAlertList(rows.map(normalizePartnerAlertListRow));
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total ?? rows.length);
            } else {
                console.log('error in partner-alert-list api', response);
                setAlertList([]);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
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
                heading="Alerts & Notifications"
                filterValues={filters}
                fetchFilteredData={fetchFilteredData}
                searchTerm={searchTerm}
                dynamicFilters={dynamicFilters}
                count={totalCount}
            />
            {loading ? (
                <Loader />
            ) : alertList.length === 0 ? (
                <EmptyList tableHeaders={TABLE_HEADERS} message="No data available" />
            ) : (
                <>
                    <List
                        tableHeaders={TABLE_HEADERS}
                        pageHeading="Alerts & Notifications"
                        listData={alertList}
                        keyMapping={[
                            { key: 'time',         label: 'Time' },
                            { key: 'message',      label: 'Message' },
                            { key: 'station_name', label: 'Station Name' },
                            { key: 'charger_id',   label: 'Charger ID' },
                            { key: 'severity',     label: 'Severity' },
                            { key: 'admin_status', label: 'Status' },
                        ]}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default AlertList;