import React from "react";
import styles from './Booking/bookinglist.module.css'
import { Outlet } from "react-router-dom";

const PickAndDrop = () => {
  return (
    <div className={styles.pdBookingListContainer}>
      <Outlet />
    </div>
  );
};

export default PickAndDrop;
