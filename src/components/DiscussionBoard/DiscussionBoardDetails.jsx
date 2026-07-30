import React, { useEffect, useState } from 'react';
import styles from './discussion.module.css'
import BookingDetailsHeader from '../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingDetailsSection from '../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingImageSection from '../SharedComponent/Details/BookingDetails/BookingImageSection'
import { postRequestWithToken } from '../../api/Requests';
import BookingLeftDetails from '../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import CommentAccordion from '../SharedComponent/Details/CommentAccordion.jsx';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';


const DiscussionBoardDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate()
  const { boardId }                         = useParams()
  const [bookingDetails, setBookingDetails] = useState()
  const [imageGallery, setImageGallery]     = useState()
  const [baseUrl, setBaseUrl]               = useState()
  const [comments, setComments]             = useState([])


  const fetchDetails = () => {
    const obj = {
      userId   : userDetails?.user_id,
      email    : userDetails?.email,
      board_id : boardId
    };

    postRequestWithToken('discussion-board-detail', obj, (response) => {
      if (response.code === 200) {
        const boardData = response?.board || {};
        const [rider_name, rider_mobile, country_code] = boardData.rider_data?.split(",") || [];
        // setBookingDetails(response?.board || {});
        setBookingDetails({
          ...boardData,
          rider_name,
          rider_mobile,
          country_code,
        });
        setImageGallery(response.galleryData)
        setBaseUrl(response.base_url)
        setComments(response.comments)
      } else {
        console.log('error in discussion-board-detail API', response);
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

  const headerTitles = {
    bookingIdTitle       : "Board ID",
    customerDetailsTitle : "Customer Details",
  };
  const content = {
    bookingId       : bookingDetails?.board_id,
    createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
    customerName    : bookingDetails?.rider_name,
    customerContact : `${bookingDetails?.country_code} ${bookingDetails?.rider_mobile}`,
  };

  const sectionTitles1 = {
    title    : "Title",
    views    : "Views",
    comments : "Comments",
  }
  const sectionContent1 = {
    title    : bookingDetails?.blog_title,
    views    : bookingDetails?.view_count,
    comments : bookingDetails?.comment_count,
  }

  const sectionTitles4 = {
    description: "Description"
  }
  const sectionContent4 = {
    description: bookingDetails?.description,
  }

  const imageTitles = {
    coverImage    : "Cover Gallery",
    // galleryImages : "Club Gallery",
  }

  const imageContent = {
    coverImage    : bookingDetails?.image,
    // galleryImages : imageGallery,
    baseUrl       : baseUrl,
  }

  return (
    <div className='main-container'>
      <BookingDetailsHeader
        content={content} titles={headerTitles}
        type='discussionBoard'
      />
      <div className={styles.ChargerDetailsSection}>
        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
          sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
          type='evGuide' />
         <CommentAccordion history={comments} title='Comments' />
      </div>
    </div>
  )
}

export default DiscussionBoardDetails