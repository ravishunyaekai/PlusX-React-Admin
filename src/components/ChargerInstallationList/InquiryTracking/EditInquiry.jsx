import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import InquiryForm from './InquiryForm';

const EditInquiry = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();
    const { inquiryId } = useParams();
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            inquiry_id : inquiryId,
        };
        postRequestWithToken('charger-installation-inquiry-details', obj, (response) => {
            if (response.code === 200 || response.status === 1) {
                setInitialData(response?.data?.inquiry || response?.data || {});
            } else {
                toast(response.message || 'Failed to load inquiry', { type: 'error' });
            }
        });
    }, []);

    return (
        <>
            <ToastContainer />
            <InquiryForm mode="edit" inquiryId={inquiryId} initialData={initialData} />
        </>
    );
};

export default EditInquiry;
