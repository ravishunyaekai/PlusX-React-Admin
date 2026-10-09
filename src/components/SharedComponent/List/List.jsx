
import React from 'react';  //, { useState }
import styles from './list.module.css';
import Edit from '../../../assets/images/Pen.svg';
// import Cancel from '../../../assets/images/Cancel.svg';
import Delete from '../../../assets/images/Delete.svg';
import View from '../../../assets/images/ViewEye.svg'
import { useNavigate } from 'react-router-dom';

const List = ({ list, tableHeaders, listData, keyMapping, pageHeading, onDeleteSlot, onEditPackage }) => {
    const userDetails  = JSON.parse(sessionStorage.getItem('userDetails')); 
    const departmentId = userDetails.departmentId; //  == 1

    const navigate         = useNavigate();
    const handleClickEvent = (hrefLink, id) => navigate(`${hrefLink}/${id}`);

    const detailsObject = {
        'Emergency Team List' : {
            edit_url : '/drivers/edit-driver', detail_url : '/drivers/drivers-details', detail_id : 'rsa_id' 
        },
        'Mobile & Portable EV Charging Service List' : {
            edit_url : '/portable-charger/edit-charger', detail_url : '', detail_id : 'charger_id' 
        },
        'Mobile & Portable EV Charging Service Invoice List' : {
            edit_url : '', detail_url : '/portable-charger/invoice', detail_id : 'invoice_id' 
        },
        'Mobile & Portable EV Charging Service Slot List' : {
            edit_url : '/portable-charger/edit-time-slot', detail_url : '', detail_id : 'slot_id' 
        },
        'App Signup List' : {
            edit_url : '', detail_url : '/app-signup/rider-details', detail_id : 'rider_id' 
        },
        'Deleted Account List' : {
            edit_url : '', detail_url : '/app-signup/rider-details', detail_id : 'rider_id' 
        },
        'Vendor List' : {
            edit_url : '/vendors/vendor-edit', detail_url : '/vendors/vendor-details', detail_id : 'vendor_id' 
        },
        'Pick & Drop Time Slot List' : {
            edit_url : '/pick-and-drop/edit-time-slot', detail_url : '', detail_id : 'slot_id' 
        },
        'Pick & Drop Invoice List' : {
            edit_url : '', detail_url : '/pick-and-drop/invoice-details', detail_id : 'invoice_id' 
        },
        'Add POD List' : {
            edit_url : '/editpod-form', detail_url : '/addpod-details', detail_id : 'slot_id' 
        },
        'Public Chargers List' : {
            edit_url : '/public-charger-station/edit-charger-station', detail_url : '/public-charger-station/public-charger-station-details', detail_id : 'station_id' 
        },
        'Shop List' : {
            edit_url : '/ev-specialized/edit-shop', detail_url : '/ev-specialized/shop-details', detail_id : 'shop_id' 
        },
        'EV Pre-Sale Testing Booking List' : {
            edit_url : '', detail_url : '/ev-pre-sales-testing/pre-sales-details', detail_id : 'booking_id' 
        },
        'Road Assistance Invoice List' : {
            edit_url : '', detail_url : '/ev-road-assistance/invoice-details', detail_id : 'invoice_id' 
        },
        'Board List' : {
            edit_url : '', detail_url : '/discussion-board/discussion-board-details', detail_id : 'board_id' 
        },
        'Insurance List' : {
            edit_url : '', detail_url : '/ev-insurance/ev-insurance-details', detail_id : 'insurance_id' 
        },
        'Buy Sell List' : {
            edit_url : '', detail_url : '/ev-buy-sell/ev-buy-sell-details', detail_id : 'sell_id' 
        },
        'Subscription List' : {
            edit_url : '', detail_url : '/subscription/subscription-details', detail_id : 'subscription_id' 
        },
        'POD Area List' : {
            edit_url : '', detail_url : '/portable-charger/edit-area', detail_id : 'area_id' 
        },
        'Fixed Charger Bookings' : {
            edit_url : '', detail_url : '/charger-installation/ev-charger-booking-detail', detail_id : 'request_id' 
        },
        'EV Accessories Bookings' : {
            edit_url : '', detail_url : '/charger-installation/ev-accessories-booking-detail', detail_id : 'request_id' 
        },
        'Charger Installation Booking List' : {
            edit_url : '', detail_url : '/charger-installation/charger-installation-details', detail_id : 'request_id' 
        },
        'Scan Charge Invoice List' : {
            edit_url : '', detail_url : '/community/invoice-details', detail_id : 'invoice_id' 
        },
        'Club List' : {
            edit_url : '/ev-rider-club/edit-club', detail_url : '/ev-rider-club/club-details', detail_id : 'club_id' 
        },
        'Electric Cars Leasing List' : {
            edit_url : '/electric-car-leasing/edit-electric-car', detail_url : '/electric-car-leasing/electric-car-details', detail_id : 'rental_id' 
        },
        'Electric Bikes Leasing List' : {
            edit_url : '/electric-bike-leasing/edit-electric-bike', detail_url : '/electric-bike-leasing/electric-bike-details', detail_id : 'rental_id' 
        },
        'EV Guide List' : {
            edit_url : '/ev-guide/edit-ev-guide', detail_url : '/ev-guide/ev-guide-details', detail_id : 'vehicle_id' 
        },
        'Coupon List' : {
            edit_url : '/coupon/edit-coupon', detail_url : '', detail_id : 'id' 
        },
        'Offer List' : {
            edit_url : '/offer/edit-offer', detail_url : '/offer/offer-details', detail_id : 'offer_id' 
        },
        'Mobile Charging Van List' : {
            edit_url : '/portable-charger/edit-device', detail_url : '/portable-charger/device-details', detail_id : 'pod_id'
        },
        'Truck List' : {
            edit_url : '/drivers/edit-truck', detail_url : '/drivers/truck-details', detail_id : 'truck_id'
        },
        'Bike List' : {
            edit_url : '/ev-battery-swipe/edit-bike', detail_url : '/ev-battery-swipe/bike-details', detail_id : 'bike_id'
        },
        'Swipe Station List' : {
            edit_url : '/ev-battery-swipe/edit-station', detail_url : '/ev-battery-swipe/station-details', detail_id : 'station_id'
        },
        'EV Charger List' : {
            edit_url : '/charger-installation/ev-charger-edit', detail_url : '/charger-installation/ev-charger-details', detail_id : 'charger_id'
        },
        'EV Accessories List' : {
            edit_url : '/charger-installation/accessories-edit', detail_url : '/charger-installation/accessories-details', detail_id : 'charger_id'
        },
        'EV Products & Installation' : {
            edit_url : '/charger-installation/purchase-edit', detail_url : '/charger-installation/purchase-detail', detail_id : 'charger_id'
        },
        'Charger Share List' : {
            edit_url : '/charger-share/request-edit', detail_url : '/charger-share/request-detail', detail_id : 'charger_id'
        },
        'Community List' : {
            edit_url : '/community/community-edit', detail_url : '/community/community-details', detail_id : 'community_id'
        },
        'Resident List' : {
            edit_url : '/community/resident-edit', detail_url : '/community/resident-details', detail_id : 'resident_id'
        },
        'Charger Installation Inquiry Tracking' : {
            edit_url : '/charger-installation/inquiry-tracking-edit', detail_url : '/charger-installation/inquiry-tracking-details', detail_id : 'inquiry_id'
        },
        'Customer List' : {
            edit_url : '/vendors/customer-edit', detail_url : '/vendors/customer-details', detail_id : 'customer_id'
        },
    }
    const pageConfig = detailsObject[pageHeading] || { edit_url : '', detail_url : '', detail_id : '' };
    return (
        <div className={styles.containerCharger}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {tableHeaders?.map((header, i) => (
                            <th key={i}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {
                        list === 'time slot' ?
                            <tr>
                                <span className={styles.listSpan}>Date:12-12-2024</span>
                            </tr> : ''
                    }
                    {listData.map((data, index) => (
                        <tr key={index}>
                            { keyMapping.map((keyObj, keyIndex) => (
                                <td key={keyIndex}>
                                    {keyObj.format
                                        ? keyObj.relatedKeys
                                            ? keyObj.format(data, keyObj.key, keyObj.relatedKeys)
                                            : keyObj.format(data[keyObj.key])
                                        : data[keyObj.key]
                                    }
                                </td>
                            ))}
                            <td>
                                <div className={styles.editContent}>
                                    
                                    { pageHeading === 'Charging Packages List' && departmentId == 1 && (
                                        <>
                                            <img
                                                src={Edit}
                                                alt='edit'
                                                onClick={() => onEditPackage?.(data)}
                                            />
                                            <img
                                                src={Delete}
                                                alt='delete'
                                                onClick={() => onDeleteSlot?.(data.package_id)}
                                            />
                                        </>
                                    )}
                                    { pageHeading !== 'Charging Packages List' && (
                                        <>
                                            { pageConfig.detail_url && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent(pageConfig.detail_url, data[pageConfig.detail_id]) } />
                                            )}
                                            { departmentId == 1 && pageConfig.edit_url && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent(pageConfig.edit_url, data[pageConfig.detail_id])} />
                                            )}
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr> 
                    ))}
                </tbody>
            </table>          
        </div>
    );
};

export default List;
