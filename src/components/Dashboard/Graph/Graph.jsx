import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSelector, useDispatch } from "react-redux";
import { setTimeRange } from "../../../store/dashboardSlice";

import style from "./Graph.module.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdAccessTimeFilled } from "react-icons/md";
import { FaBusinessTime } from "react-icons/fa";
import { MdOutlineTimeline } from "react-icons/md";

const data = [
  { name: "2024-11-1", value: 0.3 },
  { name: "2024-11-2", value: 1 },
  { name: "2024-11-3", value: 0.125 },
  { name: "2024-11-4", value: 2 },
  { name: "2024-11-5", value: 0.1 },
  { name: "2024-11-6", value: 0.45 },
  { name: "2024-11-7", value: 0.75 },
];

const Graph = () => {
  const [isDialogMenuOpen, setIsDialogMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const timeRange = useSelector((state) => state.dashboard.timeRange);

  const toggleMenu = () => {
    setIsDialogMenuOpen((prevState) => !prevState);
  };

  const handleTimeRangeChange = (range) => {
    dispatch(setTimeRange(range));
    setTimeout(() => {
      setIsDialogMenuOpen(false);
    }, 100);
  };

  return (
    <div className={style.graph}>
      <div className={`${style.graphContainer}`}>
        <div className={style.graphHeadingGroup}>
          {/* Heading Section*/}
          <div className={style.graphHeading}>Total Request</div>
          <div className={style.menu} onClick={toggleMenu}>
            <BsThreeDotsVertical />

            {/* Menu Dialog Section*/}
            {isDialogMenuOpen && (
              <div className={style.menuDialog}>
                <div
                  className={`${style.menuOption} ${
                    timeRange === "Weekly" ? style.menuOptionActive : ""
                  }`}
                  onClick={() => {
                    handleTimeRangeChange("Weekly");
                  }}
                >
                  <MdAccessTimeFilled />
                  <p>Weekly</p>
                </div>
                <div
                  className={`${style.menuOption} ${
                    timeRange === "Monthly" ? style.menuOptionActive : ""
                  }`}
                  onClick={() => {
                    handleTimeRangeChange("Monthly");
                  }}
                >
                  <FaBusinessTime />
                  <p>Monthly</p>
                </div>
                <div
                  className={`${style.menuOption} ${
                    timeRange === "Yearly" ? style.menuOptionActive : ""
                  }`}
                  onClick={() => {
                    handleTimeRangeChange("Yearly");
                  }}
                >
                  <MdOutlineTimeline />
                  <p>Yearly</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time Range Section*/}
        <div className={style.chartTimeRange}>{timeRange} Count</div>

        {/* Line Chart Section*/}
        <div className={style.chart}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#FFFFFF", fontSize: 12 }}
                axisLine={{ stroke: "#FFFFFF" }}
                tickMargin={15}
              />
              <YAxis
                domain={[0, 2]}
                tick={{ fill: "#FFFFFF", fontSize: 12 }}
                axisLine={{ stroke: "#FFFFFF" }}
                tickMargin={15}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  border: "1px solid #00FFC3",
                  color: "#fff",
                  fontSize: "15px",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#00FFc3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Graph;
