import React from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header/Header";
import SideNavbar from "./SideNavBar/SideNavbar";

function Layout() {
  return (
    <>
      <div className="d-flex">
        <div>
          <SideNavbar />
        </div>
        <div className="d-flex flex-column w-100">
          <div>
            <Header />
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default Layout;
