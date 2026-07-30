import React from "react";
import { Outlet } from "react-router-dom";

const DiscussionBoard = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default DiscussionBoard;