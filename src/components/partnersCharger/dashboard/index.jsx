import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { isSuperAdminUser } from '../../../utils/adminAccess';
import { fetchDashboardDetails } from "../../../store/partnerdashboardSlice";
import "react-toastify/dist/ReactToastify.css";
import style from "./index.module.css";
import DashboardCardItem from "./DashboardCard/DashboardCard";
import Loader from "../../SharedComponent/Loader/Loader";
import NewMapComponet from './Map/NewMap'
// import styles from '../../AppSignUp/appsign.module.css';
// import Graph from "./Graph/Graph";
// import MapComponent from "./Map/Map";
// import TopAreaList from '../../SharedComponent/Details/TopAreaList';
// import { getRequestWithToken } from '../../../api/Requests';
// import Pagination from '../../SharedComponent/Pagination/Pagination';
// import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
// import Pagination from '../Pagination/Pagination';

function Index() {
    const userDetails                = JSON.parse(sessionStorage.getItem("userDetails"));
    // const showTopRatedArea           = isSuperAdminUser(userDetails);
    const navigate                   = useNavigate();
    const dispatch                   = useDispatch();
    const { details, status, error } = useSelector((state) => state.partnerDashboard);
    // const [filters, setFilters]         = useState({start_date: null,end_date: null});

    useEffect(() => {
        if (!userDetails?.access_token) {
            navigate("/login");
            return;
        }
        dispatch(fetchDashboardDetails());
    }, [dispatch, navigate]);

    useEffect(() => {
        if (error) {
            toast(error, { type: "error" });
        }
    }, [error]);

    const isLoading = status === "loading" && details == null;

    // API call every 5 minute
    useEffect(() => {
        if (!userDetails?.access_token) {
            return;
        }
        const intervalCall = setInterval(() => {
            dispatch(fetchDashboardDetails());
        }, 300000);

        return () => clearInterval(intervalCall);
    }, [dispatch]);

    // const fetchFilteredData = (newFilters = {}) => {
         
    //     setFilters(newFilters);  
    //     setCurrentPage(1); 
    // };
   
    // const [topAreaList, setTopAreaList] = useState([
    //     {
    //         area_name       : "booking.area_name",
    //         booking_count   : "booking.booking_count",
    //     }
    // ]) ;
    // const [currentPage, setCurrentPage]               = useState(1);
    // // const [totalCount, setTotalCount]                 = useState(0);
    // const [totalPages, setTotalPages]                 = useState(1);
    // const topAreaHeaders = [
    //     'SR No.', 'Area Name', 'Booking Count'  
    // ];
    // const handlePageChange = (pageNumber) => {
    //     setCurrentPage(pageNumber);
    // };
     
    // const fetchAreaList = (page, appliedFilters = {}) => {
    //     const obj = {
    //         userId  : userDetails?.user_id,
    //         email   : userDetails?.email,
    //         page_no : page,
    //         ...appliedFilters,
    //     };
    //     getRequestWithToken('top-rated-area-list', obj, (response) => {
    //         if (response.code === 200) {
    //             setTopAreaList(response?.area_data);
    //             setTotalPages(response?.totalPage || 1);
    //             // setTotalCount(response?.total || 0)
    //         }
    //     });
    // };
    // useEffect(() => {
    //     if (!showTopRatedArea) return;
    //     fetchAreaList(currentPage, filters);
    // }, [ currentPage, filters, showTopRatedArea ]);

    return (
        <div className="main-container">
        {isLoading ? (
            <Loader />
        ) : (
            <>
                <div className={`row ${style.row}`}>
                    <div className={`col-xl-12 col-lg-12`}>
                        <NewMapComponet stations={details?.stations ?? details?.location ?? []} />
                    </div>
                </div>
                <DashboardCardItem details={details?.count_arr} />
                {/* {showTopRatedArea && (
                <div style={{margin : "0px 10px 0px 15px" }}>
                    <div className={styles.DetailsMainHeading}>Top Rated Area</div>
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
                )} */}
            </>
        )}
        </div>
    );
}
export default Index;
