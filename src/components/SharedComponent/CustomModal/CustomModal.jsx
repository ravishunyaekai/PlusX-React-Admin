import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './custommodal.module.css';

const Custommodal = ({
  isOpen,
  onClose,
  driverList,
  itemList,
  onSelectDriver,
  onSelectItem,
  bookingId,
  onAssignDriver,
  onAssign,
  selectTitle = 'Select Driver',
  idKey = 'rsa_id',
  nameKey = 'rsa_name',
}) => {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const list = itemList ?? driverList ?? [];
  const handleSelect = onSelectItem ?? onSelectDriver;
  const handleAssign = onAssign ?? onAssignDriver;

  if (!isOpen) return null;

  const getStatusLabel = (status) => {
    if (status === 0) return "In-Active";
    if (status === 1) return "Un-Available";
    if (status === 2) return "Available";
    return "Unknown";
};

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          {selectTitle} <span>( {bookingId} )</span>
        </div>
        <div className={styles.driverSelect}>
          <select
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={() => setIsDropdownOpen(false)}
            // onChange={(e) => onSelectDriver(e.target.value)}
            onChange={(e) => {
              const itemId = e.target.value;
              handleSelect?.(itemId);
              setSelectedDriver(itemId);
          }}
          >
            <option value="" disabled selected>Select</option>
            {list.map((item, index) => (
              <option key={index} value={item[idKey]} disabled={item.isUnavailable}>
                {item[nameKey]}
                {item.status !== undefined && item.status !== null
                  ? ` (${getStatusLabel(item.status)})`
                  : ''}
              </option>
            ))}
          </select>
          <span className={styles.dropdownIcon}>
            {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
          <button className={styles.assignBtn} 
          onClick={handleAssign}
          disabled={!selectedDriver}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default Custommodal;
