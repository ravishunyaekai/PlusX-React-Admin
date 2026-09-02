import React, { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';
import Loader from '../../SharedComponent/Loader/Loader';

const searchTerm = [
    {
        label: 'search',
        name: 'search_text',
        type: 'text',
    },
];

const ChargingPackageList = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const [packageList, setPackageList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({ start_date: null, end_date: null });
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);

    const addButtonProps = {
        heading: 'Add Package',
        link: '/portable-charger/add-charging-package',
    };

    const fetchList = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            page_no: page,
            ...appliedFilters,
        };

        postRequestWithToken('charging-package-list', obj, async (response) => {
            if (response.code === 200) {
                setPackageList(response?.data || []);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0);
            } else {
                toast(response.message, { type: 'error' });
                console.log('error in charging-package-list api', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchList(currentPage, filters);
    }, [currentPage, filters, refresh]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleEditPackage = (packageData) => {
        navigate(`/portable-charger/edit-charging-package/${packageData.package_id}`, {
            state: packageData,
        });
    };

    const handleDeletePackage = (packageId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this package?');
        if (!confirmDelete) return;

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            package_id: packageId,
        };

        postRequestWithToken('delete-charging-package', obj, async (response) => {
            if (response.code === 200) {
                toast(Array.isArray(response.message) ? response.message[0] : response.message, { type: 'success' });
                setRefresh((prev) => !prev);
            } else {
                toast(Array.isArray(response.message) ? response.message[0] : response.message, { type: 'error' });
                console.log('error in delete-charging-package api', response);
            }
        });
    };

    return (
        <div className="main-container">
            <ToastContainer />
            <SubHeader
                heading="Charging Packages List"
                addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                filterValues={filters}
                searchTerm={searchTerm}
                count={totalCount}
            />

            {loading ? (
                <Loader />
            ) : packageList.length === 0 ? (
                <EmptyList
                    tableHeaders={[
                        'Package ID',
                        'Package Name',
                        'Charging Capacity (kW)',
                        'Price',
                        'Status',
                        'Action',
                    ]}
                    message="No data available"
                />
            ) : (
                <>
                    <List
                        tableHeaders={[
                            'Package ID',
                            'Package Name',
                            'Charging Capacity (kW)',
                            'Price',
                            'Status',
                            'Action',
                        ]}
                        listData={packageList}
                        keyMapping={[
                            { key: 'package_id', label: 'Package ID' },
                            { key: 'package_name', label: 'Package Name' },
                            { key: 'charging_capacity', label: 'Charging Capacity (kW)' },
                            {
                                key: 'price',
                                label: 'Price',
                                format: (value) => (value !== null && value !== undefined && value !== '' ? value : '-'),
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                format: (status) => (status == 1 ? 'Active' : 'Inactive'),
                            },
                        ]}
                        pageHeading="Charging Packages List"
                        onEditPackage={handleEditPackage}
                        onDeleteSlot={handleDeletePackage}
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

export default ChargingPackageList;
