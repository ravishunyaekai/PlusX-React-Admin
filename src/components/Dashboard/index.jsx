import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import style from "./index.module.css";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
// import Graph from "./Graph/Graph";
import DashboardCardItem from "./DashboardCard/DashboardCard";
// import MapComponent from "./Map/Map";
import { fetchDashboardDetails } from "../../store/dashboardSlice";
import Loader from "../SharedComponent/Loader/Loader";
import NewMapComponet from './Map/NewMap'
import styles from '../AppSignUp/appsign.module.css';
import TopAreaList from '../SharedComponent/Details/TopAreaList';
import { getRequestWithToken } from '../../api/Requests';
import Pagination from '../SharedComponent/Pagination/Pagination';
import SubHeader from '../SharedComponent/SubHeader/SubHeader';
// import Pagination from '../Pagination/Pagination';

function Index() {
    const userDetails                = JSON.parse(sessionStorage.getItem("userDetails"));
    const navigate                   = useNavigate();
    const dispatch                   = useDispatch();
    const { details, status, error } = useSelector((state) => state.dashboard);
    const [filters, setFilters]         = useState({start_date: null,end_date: null});

    useEffect(() => {

        if (!userDetails || !userDetails.access_token) {
            navigate("/login");
            return;
        }
        if (status === "idle") {
            dispatch(fetchDashboardDetails());
        }
    }, [dispatch, status, userDetails, navigate]);

    useEffect(() => {
        if (error) {
            toast(error, { type: "error" });
        }
    }, [error]);

    const isLoading = status === "loading";

    // API call every 5 minute
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate("/login"); 
            return; 
        }
        // Set interval to fetch details every 5 minute
        const intervalCall = setInterval(() => {
            dispatch(fetchDashboardDetails());
        }, 300000); // 300,000 ms = 5 minutes

        return () => {
            clearInterval(intervalCall);
        };
    }, [dispatch, navigate, userDetails]);

    const fetchFilteredData = (newFilters = {}) => {
         
        setFilters(newFilters);  
        setCurrentPage(1); 
    };
   
    const [topAreaList, setTopAreaList] = useState([
        {
            area_name       : "booking.area_name",
            booking_count   : "booking.booking_count",
        }
    ]) ;
    const [currentPage, setCurrentPage]               = useState(1);
    // const [totalCount, setTotalCount]                 = useState(1);
    const [totalPages, setTotalPages]                 = useState(1);
    const topAreaHeaders = [
        'SR No.', 'Area Name', 'Booking Count'  
    ];
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
     
    const fetchAreaList = (page, appliedFilters = {}) => {
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        };
        getRequestWithToken('top-rated-area-list', obj, (response) => {
            if (response.code === 200) {
                setTopAreaList(response?.area_data);
                setTotalPages(response?.totalPage || 1);
                // setTotalCount(response?.total || 1)
            }
        });
    };
    useEffect(() => {
        fetchAreaList(currentPage, filters);
    }, [ currentPage, filters ]);

    return (
        <div className="main-container">
        {isLoading ? (
            <Loader />
        ) : (
            <>
                <div className={`row ${style.row}`}>
                    <div className={`col-xl-12 col-lg-12`}>
                        <NewMapComponet className={style.mapContainer} location = {details?.location} podLocation = {details?.podLocation}/>
                    </div>
                </div>
                <DashboardCardItem details={details?.count_arr} />
                <div style={{margin : "0px 10px 0px 15px" }}>
                    {/* <div className={styles.DetailsMainHeading}>Top Rated Area</div> */}
                    <SubHeader heading = "Top Rated Area" 
                        filterValues={filters}
                        fetchFilteredData={fetchFilteredData} 
                    />
                    <TopAreaList
                        title=""
                        headers={topAreaHeaders}
                        bookingData={topAreaList}
                        bookingType="portableCharger"
                    />
                    {topAreaList.length > 0 && 
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    }
                </div>
            </>
        )}
        </div>
    );
}
export default Index;
