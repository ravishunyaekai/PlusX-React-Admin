import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postRequestWithToken } from "../api/Requests";
import { getBackendErrorMessage } from "../utils/mapBackendErrorsToFields";

const normalizePartnerChargersDashboard = (data = {}) => {
    const countCards = data.count_cards || [];
    const count_arr = countCards.map((card) => ({
        module : card.label,
        count  : card.count,
        key    : card.key,
    }));
    const stations = (data.stations || []).map((station) => ({
        ...station,
        key      : station.station_id,
        location : station.location ?? {
            lat : station.latitude,
            lng : station.longitude,
        },
    }));

    return {
        ...data,
        counts     : data.counts ?? {},
        count_arr,
        count_cards : countCards,
        stations,
        location   : stations,
    };
};

export const fetchDashboardDetails = createAsyncThunk(
    "partnerDashboard/fetchDashboardDetails",
    async (_, { rejectWithValue }) => {
        const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
        const requestData = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };
        try {
            const response = await new Promise((resolve) => {
                postRequestWithToken("partner-chargers-dashboard", requestData, resolve);
            });

            if (response.code === 200) {
                return normalizePartnerChargersDashboard(response.data);
            }
            return rejectWithValue(getBackendErrorMessage(response));
        } catch {
            return rejectWithValue("Connection failed, please start node server");
        }
    }
);

const partnerDashboardSlice = createSlice({
    name         : "partnerDashboard",
    initialState : {
        details         : null,
        activeCardIndex : null,
        timeRange       : "Weekly",
        status          : "idle",
        error           : null,
    },
    reducers : {
        setActiveCardIndex(state, action) {
            state.activeCardIndex = action.payload;
        },
        setTimeRange(state, action) {
            state.timeRange = action.payload;
        },
    },
    extraReducers : (builder) => {
        builder
            .addCase(fetchDashboardDetails.pending, (state) => {
                state.status = "loading";
                state.error  = null;
            })
            .addCase(fetchDashboardDetails.fulfilled, (state, action) => {
                state.status  = "succeeded";
                state.details = action.payload;
            })
            .addCase(fetchDashboardDetails.rejected, (state, action) => {
                state.status = "failed";
                state.error  = action.payload;
            });
    },
});

export const { setActiveCardIndex, setTimeRange } = partnerDashboardSlice.actions;
export default partnerDashboardSlice.reducer;