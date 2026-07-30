import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import styles from './pagination.module.css'
import { ReactComponent as PreviousIcon } from '../../../assets/images/right.svg';
import { ReactComponent as NextIcon } from '../../../assets/images/left.svg'; 

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (data) => {
    const selectedPage = data.selected + 1; 
    onPageChange(selectedPage);
  };

  return (
    <>
      <ReactPaginate
        previousLabel={<PreviousIcon className={styles.icon} />}
        nextLabel={<NextIcon className={styles.icon} />}
        breakLabel={"..."}
        pageCount={totalPages} // Use totalPages from props
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick} // Call handlePageClick on page change
        containerClassName={styles.pagination}
        activeClassName={styles.activePage}
        forcePage={currentPage - 1} // Set current page (ReactPaginate expects zero-indexed pages)
      />
    </>
  );
};

export default Pagination