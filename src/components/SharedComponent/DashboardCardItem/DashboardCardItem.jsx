import React from "react";
import { NavLink } from "react-router-dom";
import style from "./DashboardCardItem.module.css";

const DashboardCardItem = (props) => {
  const { title, icon, count, route, isActive, onClick } = props;

  const className = `${style.card} ${isActive ? style.cardActive : ""}`;

  const content = (
    <>
      <div className={style.cardWrapper}>
        <img className={style.cardIcon} src={icon} alt={title} />
        <div className={style.cardCount}>{count}</div>
      </div>
      <div className={style.cardTitle}>{title}</div>
    </>
  );

  if (!route) {
    return (
      <div className={className} onClick={onClick} role="presentation">
        {content}
      </div>
    );
  }

  return (
    <NavLink to={route} className={className} onClick={onClick}>
      {content}
    </NavLink>
  );
};

export default DashboardCardItem;
