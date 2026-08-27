import React, { useEffect, useState } from 'react';
import styles from './Community.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
// import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../api/Requests.js';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection.jsx'

import ChargerList from '../SharedComponent/Details/ChargerList'
import ResidentList from '../SharedComponent/Details/ResidentList'
import Pagination from '../SharedComponent/Pagination/Pagination'
 
const CommunityDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const { communityId }                     = useParams(); 
    const navigate                            = useNavigate();
    const [communityDetails, setCommunityDetails] = useState();
    // Manager Details - commented out for live (not ready to push)
    // const [managerDetails, setManagerDetails]     = useState();
    const staturArr                           = { 0 : 'In-active', 1: 'Active' }
    const [chargers, setChargers]             = useState([ { id : '', charger_id : '', kw : '' } ]);
    // Resident list with pagination (from resident-list API)
    const [residents, setResidents]           = useState([]);
    const [currentPage, setCurrentPage]       = useState(1);
    const [totalPages, setTotalPages]         = useState(1);
    
    const fetchDetails = () => {
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            community_id : communityId,
        };
        postRequestWithToken('community-details', obj, (response) => {
            if (response.code === 200) {
                setCommunityDetails(response?.data || {});
                // Manager Details - commented out for live
                // setManagerDetails(response?.manager || {});
                setChargers(response?.chargers || []);
                // setResidents(response?.residents || []);
            } else {
                console.log('error in community-details API', response);
            }
        });
    };

    const fetchResidentList = (page) => {
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            community_id : communityId,
            page_no      : page,
        };
        postRequestWithToken('resident-list', obj, (response) => {
            if (response.code === 200) {
                setResidents(response?.data || []);
                setTotalPages(response?.total_page || 1);
            } else {
                console.log('error in resident-list API', response);
            }
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) return;
        fetchResidentList(currentPage);
    }, [currentPage]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const headerTitles = {
        bookingIdTitle       : "Community ID",
        customerDetailsTitle : "Community Name",
    };
    const content = {
        bookingId       : communityDetails?.community_id,
        createdAt       : moment(communityDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : communityDetails?.community_name,
        customerContact : ``, //+971 ${communityDetails?.mobile}
    };
    // Manager Details - commented out for live
    // const managerTitles = {
    //     managerId      : "Manager ID",
    //     managerName    : "Manager Name",
    //     managerEmail   : "Email ID",
    //     managerContact : "Contact No",
    // };
    // const managerContent = {
    //     managerId      : managerDetails?.manager_id || '',
    //     managerName    : managerDetails?.manager_name || '',
    //     managerEmail   : managerDetails?.manager_email || '',
    //     managerContact : managerDetails?.manager_contact || '',
    // };
    const sectionTitles1 = {
        customerEmail  : "Area Name",
        charger_name   : "Total Residence",
        status         : "Status",
    }
    const sectionContent1 = {
        customerEmail  : communityDetails?.area_name,
        charger_name   :  communityDetails?.total_residence,
        status         : staturArr[communityDetails?.status],
    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' />
            <div className={styles.bookingLeftContainer}>
                {/* Manager Details - commented out for live */}
                {/* <BookingLeftDetails titles={managerTitles} content={managerContent} /> */}
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} 
                type='chargerInstallation' />
            </div>
            <div className='Details-container-section'>
                {chargers.length > 0 && (
                    <ChargerList currentItems={chargers} />
                )}
                <ResidentList currentItems={residents} />
                {residents.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    )
}
export default CommunityDetails
