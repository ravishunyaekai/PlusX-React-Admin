import React from "react";
import styles from './Booking/booking.module.css'
import { Outlet } from "react-router-dom";

const EvPreSale = () => {
  return (
    <div className={styles.pdBookingListContainer}>
      <Outlet />
    </div>
  );
};

export default EvPreSale;
