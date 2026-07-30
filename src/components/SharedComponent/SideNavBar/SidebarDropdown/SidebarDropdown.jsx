import React from "react";
import style from "../sidenavbar.module.css";

import SidebarDropdownItem from "./SidebarDropdownItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

function SidebarDropdown({
  menuName,
  menuItems,
  openDropdown,
  handleItemClick,
  toggleDropdown,
  checkedItems,
}) {
  return (
    <div className={style.menuItemDiv}>
      <li
        className={style.menuItemdropdown}
        onClick={() => toggleDropdown(menuName)}
      >
        {menuName}
        <FontAwesomeIcon icon={faChevronRight} className={style.arrow} />
      </li>

      {openDropdown === menuName && (
        <ul className={style.subMenu}>
          {menuItems.map((item) => (
            <SidebarDropdownItem
              key={item.id}
              item={item}
              checkedItems={checkedItems}
              handleItemClick={handleItemClick}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default SidebarDropdown;
