import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import styles from './invoice.module.css';
import logo from '../../../assets/images/Logo.svg';
import html2pdf from 'html2pdf.js';
import Download from '../../../assets/images/Download.svg'

const Invoice = ({ invoiceDetails }) => {
     
    return (
        <div className={styles.invoiceMainContainer} style={{height: "auto"}}>
            <div className={styles.invoiceSection} >
                <div className={styles.container} id="invoiceToDownload">
                    <table className={styles.table} style={{ width: "100%" }}>
                        <tbody>
                            <tr>
                                <td colSpan="2">
                                    <table style={{ width: '100%', borderSpacing: 0, marginTop:"16px" }}>
                                        
                                        <tbody>
                                            <tr className={styles.serviceItem}>
                                                <td>Resident Name </td>
                                                <td className={styles.amountRightAlign}>{invoiceDetails?.resident_name} </td>
                                            </tr>
                                            <tr className={styles.serviceItem}>
                                                <td>Kwh Used/ Allocated</td>
                                                <td className={styles.amountRightAlign}>{invoiceDetails?.total_consumption} / {invoiceDetails?.kwh_allocated} kWh</td>
                                            </tr>
                                            <tr className={styles.serviceItem}>
                                                <td>Energy Charge ({invoiceDetails?.energy_charge} kWh)</td>
                                                <td className={styles.amountRightAlign}>AED {invoiceDetails?.energy_price}</td>
                                            </tr>
                                            <tr className={styles.serviceItem}>
                                                <td>Over Time ({invoiceDetails?.over_time_min} Min)</td>
                                                <td className={styles.amountRightAlign}>AED {invoiceDetails?.extra_charge}</td>
                                            </tr>
                                            {/* <tr className={styles.serviceItem}>
                                                <td>VAT 5%</td>
                                                <td className={styles.amountRightAlign}>{details?.t_vat_amt.toFixed(2)}</td>
                                            </tr> */}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr className={styles.serviceItem}>
                                <td style={{ width: '60%', textAlign: 'left' }}>
                                    <p className={styles.totalAmountLabel}> Total Amount : </p>
                                </td>
                                <td className={styles.amountRightAlign}>
                                    <p className={styles.totalAmountValue}>
                                        AED { invoiceDetails?.total_amount }
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default Invoice;