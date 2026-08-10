import React, { useEffect, useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import styles from './accordion.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from "../Calendar/Calendar";
import { format } from 'date-fns';
import Select from 'react-select';


const AccordionFilter = ({ type, isOpen, fetchFilteredData, dynamicFilters, filterValues, scheduleDateChange, scheduleFilters, areaOptions, areaSelected, handleArea, rowOptions, rowSelected, handleRowperPagePage, searchTerm }) => {
 
    const [showContent, setShowContent] = useState(isOpen);
    const [openDropdowns, setOpenDropdowns] = useState({}); // Separate state for each dropdown

    useEffect(() => {
        if (isOpen) {
            fetchFilteredData({ }); 
            setShowContent(true);
        } else {
            const timer = setTimeout(() => setShowContent(false), 300); 
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        fetchFilteredData({ ...filterValues, [name]: value });
    };

    const handleBlur = (name) => {
        fetchFilteredData(filterValues);
        setOpenDropdowns((prev) => ({ ...prev, [name]: false }));
    };

    const handleDateChange = (range) => {
         
        fetchFilteredData({
            ...filterValues,
            start_date: null,
            end_date: null,
        });
        if (!range || range.length < 2) {
            fetchFilteredData({
                ...filterValues,
                start_date: null,
                end_date: null
            });
            return;
        }

        const [start, end]   = range;
        const formattedStart = format(start, 'yyyy-MM-dd');
        const formattedEnd   = format(end, 'yyyy-MM-dd');
        fetchFilteredData({
            ...filterValues,
            start_date: formattedStart,
            end_date: formattedEnd
        });
    };
    const handleScheduleDateChange = (range) => {
        scheduleDateChange({
            ...scheduleFilters,
            start_date : null,
            end_date   : null,
        });
        if (!range || range.length < 2) {
            scheduleDateChange({
                ...scheduleFilters,
                start_date : null,
                end_date   : null
            });
            return;
        }
        const [start, end]   = range;
        const formattedStart = format(start, 'yyyy-MM-dd');
        const formattedEnd   = format(end, 'yyyy-MM-dd');
        scheduleDateChange({
            ...scheduleFilters,
            start_date: formattedStart,
            end_date: formattedEnd
        });
    };
    const toggleDropdown = (name) => {
        setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
    };
    const handleAreaa = (val) => {
        // console.log('val', val)
        handleArea(val);
    };
    const pageLimit = (e) => {
        const { name, value } = e.target;
        handleRowperPagePage(value);
    };
    
    return (
        <div data-aos="fade-left">
            <Accordion defaultActiveKey="0" className={`${styles.accordionContainer} ${isOpen ? styles.open : ''}`}>
                <Card className={styles.accordionCard}>
                    <Accordion.Collapse eventKey="0">
                        <AnimatePresence>
                            {showContent && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ height: { duration: 0.3 }, opacity: { duration: 0.3 } }}
                                >
                                    <Card.Body>
                                        {/* || type == 'Failed Pick & Drop Booking List'  */}
                                        <form className={styles.filterForm}>
                                            { (type == 'Portable Charger Booking List' || type == 'Driver Details' || type == 'Failed POD Booking List' || type == 'Customer POD Booking List') && (
                                                <div className={`col-xl-4 col-lg-6 col-12 ${styles.filterItem}`}>
                                                    <label className={styles.filterLabel} htmlFor="date_filter">Schedule Date</label>
                                                    <Calendar handleDateChange={handleScheduleDateChange}/>
                                                </div>  
                                            )}
                                            { (type != 'Roadside Assistance Slot List' ) && (
                                                <div className={`col-xl-4 col-lg-6 col-12 ${styles.filterItem}`}>
                                                    <label className={styles.filterLabel} htmlFor="date_filter">{type.includes('Booking') || type == 'Driver Details' ? 'Booking Date' : 'Select  Date'}</label>
                                                    <Calendar handleDateChange={handleDateChange}/>
                                                </div>
                                            )}
                                            {dynamicFilters?.map((filter) => (
                                                <div key={filter.name} className={`col-xl-4 col-lg-6 col-12 ${styles.filterItem}`}>
                                                    <label className={styles.filterLabel} htmlFor={filter.name}>{filter.label}</label>
                                                    {filter.type === 'select' ? (
                                                        <div
                                                            className={`${styles.customSelectWrapper} ${openDropdowns[filter.name] ? styles.open : ''}`}
                                                            onClick={() => toggleDropdown(filter.name)}
                                                        >
                                                            <select
                                                                className={`${styles.filterSelect} ${styles.customSelect}`}
                                                                id={filter.name}
                                                                name={filter.name}
                                                                value={filterValues[filter.name] || ''}
                                                                onChange={handleInputChange}
                                                                onBlur={() => handleBlur(filter.name)}
                                                            >
                                                                {filter.options.map((option) => (
                                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                                ))}
                                                            </select>
                                                            <span className={styles.customSelectIcon}>▼</span>
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            className={styles.filterInput} 
                                                            type={filter.type} 
                                                            id={filter.name} 
                                                            name={filter.name} 
                                                            value={filterValues[filter.name] || ''}
                                                            onChange={handleInputChange}
                                                            onBlur={() => handleBlur(filter.name)}
                                                            autoComplete='off'
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                            { (type == 'Portable Charger Booking List' ) && (
                                                <div className={`col-xl-4 col-lg-6 col-12 ${styles.selectItem}`} >
                                                    <label className={styles.filterLabel} htmlFor="date_filter">Search Area</label>
                                                    <div className={styles.selectSearch}>
                                                        <Select
                                                            options={(areaOptions || []).map((option) => ({
                                                                value : option.value,
                                                                label : option.name
                                                            }))}
                                                            value={(areaOptions || [])
                                                                .map((option) => ({ value : option.value, label : option.name }))
                                                                .find((option) => String(option.value) === String(areaSelected)) || null}
                                                            onChange={(selectedOption) => handleAreaa(selectedOption?.value || '')}
                                                            placeholder="Search"
                                                            isClearable
                                                            isSearchable
                                                            name="areaSearch"
                                                        />
                                                    </div>
                                                </div>  
                                            )}
                                            { (type == 'Portable Charger Booking List' || type == "Pick & Drop Booking List" || type == "Ev Road Assitance Booking List") && (
                                                <div className={`col-xl-4 col-lg-6 col-12 ${styles.selectItem}`}  style={{ position: 'relative', }}>
                                                    <label className={styles.filterLabel} htmlFor="date_filter">No. of Records</label>
                                                    <select
                                                        className={`${styles.filterSelect} ${styles.customSelect}`}
                                                        id="no_of_records"
                                                        name="no_of_records"
                                                        value={rowSelected}
                                                        onChange={pageLimit}
                                                        onBlur={() => handleBlur('no_of_records')}
                                                    >
                                                        {rowOptions.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>  
                                            )}

                                            {/* { ( type == 'Charger Installation List' ) && (
                                                <div key={searchTerm[0].name} className={`col-xl-4 col-lg-6 col-12 ${styles.filterItem}`}>
                                                    <label className={styles.filterLabel} htmlFor={searchTerm[0].name}>{searchTerm[0].label} </label>
                                                    <input 
                                                        className={styles.filterInput} 
                                                        type={searchTerm[0].type} 
                                                        id={searchTerm[0].name} 
                                                        name={searchTerm[0].name} 
                                                        placeholder={searchTerm[0].label} 
                                                        value={filterValues[searchTerm[0].name] || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={() => handleBlur(searchTerm[0].name)}
                                                        autoComplete='off'
                                                    /> 
                                                </div>
                                            )} */}
                                        </form>
                                    </Card.Body>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    );
};

export default AccordionFilter;
