import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";
import partnerDashboardReducer from "./partnerdashboardSlice";

const store = configureStore({
  reducer: {
    dashboard         : dashboardReducer,
    partnerDashboard  : partnerDashboardReducer,
  },
});

export default store;
