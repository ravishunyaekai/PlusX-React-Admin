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
    const handleClickEvent = (hrefLink, id) => navigate(`${hrefLink}/${id}`)

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
                            {keyMapping.map((keyObj, keyIndex) => (
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

                                    {pageHeading === 'Emergency Team List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/drivers/drivers-details', data.rsa_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/drivers/edit-driver', data.rsa_id)} />
                                                    {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.rsa_id)} /> */}
                                               </> )
                                            }
                                        </>
                                    )}
                                    {/* pageHeading === 'Portable Charger List' */}
                                    {pageHeading === 'Mobile & Portable EV Charging Service List' && (
                                        <>
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/portable-charger/edit-charger', data.charger_id)} />
                                                    {/* <img src={Cancel} alt='cancel' onClick={() => onDeleteSlot(data.charger_id)} /> */}
                                               </> )
                                            }
                                        </>
                                    )}
                                    {/* pageHeading === 'Portable Charger Invoice List' */}
                                    {pageHeading === 'Mobile & Portable EV Charging Service Invoice List' && (
                                        <img src={View} alt="view" onClick={() => handleClickEvent('/portable-charger/invoice', data.invoice_id)} />
                                    )}
                                    {/* pageHeading === 'Portable Charger Slot List' */}
                                    {pageHeading === 'Mobile & Portable EV Charging Service Slot List' && departmentId == 1 && (
                                        <>
                                            <img src={Edit} alt='edit'
                                                onClick={() => handleClickEvent('/portable-charger/edit-time-slot', data.slot_id)}
                                            />
                                        </>
                                    )}
                                    { (pageHeading === 'App Signup List' || pageHeading === 'Deleted Account List') && (
                                        <>
                                            <img src={View} alt="view"
                                                onClick={() => handleClickEvent('/app-signup/rider-details', data.rider_id)}
                                            />
                                        </>
                                    )}
                                    {pageHeading === 'Pick & Drop Time Slot List' && departmentId == 1 && (
                                        <>
                                            <img src={Edit} alt='edit' onClick={() => handleClickEvent('/pick-and-drop/edit-time-slot', data.slot_id)} />
                                        </>
                                    )}
                                    {pageHeading === 'Pick & Drop Invoice List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/pick-and-drop/invoice-details', data.invoice_id)} />
                                        </>
                                    )}
                                    {pageHeading === 'Add POD List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/addpod-details', data.slot_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/editpod-form', data.slot_id)} />
                                               </> )
                                            }
                                        </>
                                    )}
                                    {pageHeading === 'Public Chargers List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/public-charger-station/public-charger-station-details', data.station_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/public-charger-station/edit-charger-station', data.station_id)} />
                                                    {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.station_id)} /> */}
                                               </> )
                                            }
                                        </>
                                    )}
                                    

                                    {pageHeading === 'Shop List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-specialized/shop-details', data.shop_id)}/>
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/ev-specialized/edit-shop', data.shop_id)}/>
                                                    {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.shop_id)} /> */}
                                                </> )
                                            }
                                        </>
                                    )}

                                    {pageHeading === 'EV Pre-Sale Testing Booking List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-pre-sales-testing/pre-sales-details', data.booking_id)} />
                                        </>
                                    )}
                                    {pageHeading === 'Club List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-rider-club/club-details', data.club_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/ev-rider-club/edit-club', data.club_id)} />
                                                    {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.club_id)} /> */}
                                                </> )
                                            }
                                        </>
                                    )}
                                    {pageHeading === 'Electric Cars Leasing List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/electric-car-leasing/electric-car-details', data.rental_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric-car-leasing/edit-electric-car', data.rental_id)} />
                                                </> )
                                            }
                                        </>
                                    )}
                                    {pageHeading === 'Electric Bikes Leasing List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/electric-bike-leasing/electric-bike-details', data.rental_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric-bike-leasing/edit-electric-bike', data.rental_id)} />
                                                </> )
                                            }
                                        </>
                                    )}

                                    {/* EV Guide */}
                                    {pageHeading === 'EV Guide List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-guide/ev-guide-details', data.vehicle_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/ev-guide/edit-ev-guide', data.vehicle_id)} />
                                                    {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.vehicle_id)} /> */}
                                                </> )
                                            }
                                        </>
                                    )}

                                    {/* Ev Road Assitance */}
                                    {pageHeading === 'Road Assistance Invoice List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-road-assistance/invoice-details', data.invoice_id)} />
                                        </>
                                    )}

                                    {pageHeading === 'Board List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/discussion-board/discussion-board-details', data.board_id)} />
                                        </>
                                    )}

                                    {pageHeading === 'Insurance List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-insurance/ev-insurance-details', data.insurance_id)} />
                                            {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.board_id)} /> */}
                                        </>
                                    )}

                                    {pageHeading === 'Buy Sell List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-buy-sell/ev-buy-sell-details', data.sell_id)} />
                                            {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.board_id)} /> */}
                                        </>
                                    )}

                                    {pageHeading === 'Subscription List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/subscription/subscription-details', data.subscription_id)} />
                                            {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.board_id)} /> */}
                                        </>
                                    )}
                                    {pageHeading === 'Coupon List' && (
                                        <>
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/coupon/edit-coupon', data.id)} />
                                                    {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.coupan_code)} /> */}
                                                </> )
                                            }
                                        </>
                                    )}

                                    {pageHeading === 'Offer List' && (
                                        <>
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit}   alt='edit'   onClick={() => handleClickEvent('/offer/edit-offer', data.offer_id)} />
                                                    {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.offer_id)} />  */}
                                                </> )
                                            }
                                            <img src={View}   alt="view" onClick={() => handleClickEvent('/offer/offer-details', data.offer_id)} />
                                        </>
                                    )}
                                    {/* POD Device  */}
                                    {pageHeading === 'POD Device List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/portable-charger/device-details', data.pod_id)} />
                                            
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/portable-charger/edit-device', data.pod_id)} />
                                                </> )
                                            }
                                        </>
                                    )}
                                    {/* POD Area  */}
                                    {pageHeading === 'POD Area List' && (
                                        <>
                                            <img src={Edit} alt='edit' onClick={() => handleClickEvent('/portable-charger/edit-area', data.area_id)} />
                                        </>
                                    )}
                                    {pageHeading === 'Charging Packages List' && departmentId == 1 && (
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
                                    {/* Truck  */}
                                    {pageHeading === 'Truck List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/drivers/truck-details', data.truck_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/drivers/edit-truck', data.truck_id)} />
                                                </> )
                                            }
                                        </>
                                    )}
                                    {pageHeading === 'Bike List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-battery-swipe/bike-details', data.bike_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/ev-battery-swipe/edit-bike', data.bike_id)} />
                                                </> )
                                            }
                                        </>
                                    )}
                                    {pageHeading === 'Swipe Station List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/ev-battery-swipe/station-details', data.station_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/ev-battery-swipe/edit-station', data.station_id)} />
                                                </> )
                                            }
                                        </>
                                    )}
                                    { pageHeading === 'EV Charger List'  && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/charger-installation/ev-charger-details', data.charger_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/charger-installation/ev-charger-edit', data.charger_id)} />
                                                </> )
                                            } 
                                        </>
                                    )}
                                    { pageHeading === 'EV Accessories List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/charger-installation/accessories-details', data.charger_id)} />
                                            { departmentId == 1 && ( 
                                                <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/charger-installation/accessories-edit', data.charger_id)} />
                                                </> )
                                            } 
                                        </>
                                    )}
                                    { pageHeading === 'Fixed Charger Bookings' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/charger-installation/ev-charger-booking-detail', data.request_id)} />
                                        </>
                                    )}
                                    { pageHeading === 'EV Accessories Bookings' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/charger-installation/ev-accessories-booking-detail', data.request_id)} />
                                        </>
                                    )}
                                    { pageHeading === 'Charger Installation Booking List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/charger-installation/charger-installation-details', data.request_id)} />
                                        </>
                                    )}
                                    { pageHeading === 'EV Products & Installation' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/charger-installation/purchase-detail', data.purchase_id)} />
                                            { departmentId == 1 && ( <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/charger-installation/purchase-edit', data.purchase_id)} />
                                                </> )
                                            } 
                                        </>
                                    )}

                                    { pageHeading === 'Charger Share List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/charger-share/request-detail', data.charger_id)} />
                                            { departmentId == 1 && ( <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/charger-share/request-edit', data.charger_id)} />
                                                </> )
                                            } 
                                        </>
                                    )}
                                    
                                    { pageHeading === 'Community List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/community/community-details', data.community_id)} />
                                            { departmentId == 1 && ( <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/community/community-edit', data.community_id)} />
                                                </> )
                                            }
                                        </>
                                    )}
                                    
                                    { pageHeading === 'Resident List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/community/resident-details', data.resident_id)} />
                                            { departmentId == 1 && ( <>
                                                    <img src={Edit} alt='edit' onClick={() => handleClickEvent('/community/resident-edit', data.resident_id)} />
                                                </> )
                                            } 
                                        </>
                                    )}
                                    { pageHeading === 'Scan Charge Invoice List' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/community/invoice-details', data.invoice_id)} />
                                        </>
                                    )}
                                    { pageHeading === 'Charger Installation Inquiry Tracking' && (
                                        <>
                                            <img src={View} alt="view" onClick={() => handleClickEvent('/charger-installation/inquiry-tracking-details', data.inquiry_id)} />
                                            { departmentId == 1 && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/charger-installation/inquiry-tracking-edit', data.inquiry_id)} />
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
