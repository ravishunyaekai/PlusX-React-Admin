
import axios from 'axios';
import { toast } from 'react-toastify';
import { getDefaultLandingPath } from '../utils/adminAccess';

axios.defaults.baseURL                       = process.env.REACT_APP_API_URL;
axios.defaults.headers.post['Content-Type']  = 'application/json';
axios.defaults.headers.post['authorization'] = process.env.REACT_APP_Authorization;
// axios.defaults.withCredentials               = true

function readUserDetailsSafe() {
    try {
        const raw = sessionStorage.getItem('userDetails');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function getApiStatus(body) {
    if (body == null || typeof body !== 'object') return null;
    const s = body.status ?? body.code;
    return s !== undefined && s !== null ? Number(s) : null;
}

let moduleDenyThrottleTs = 0;
function handleModuleForbidden() {
    const u = readUserDetailsSafe();
    const def = getDefaultLandingPath(u) || '/';
    const now = Date.now();
    if (now - moduleDenyThrottleTs > 2500) {
        moduleDenyThrottleTs = now;
        toast('No access to this module.', { type: 'error' });
    }
    if (window.location.pathname !== def) {
        window.location.replace(def);
    }
}

function handleHttpOrBodyAuth(body, httpStatus) {
    const status = httpStatus ?? getApiStatus(body);
    if (status === 401) {
        sessionStorage.clear();
        window.location.href = '/login';
        return true;
    }
    if (status === 403) {
        handleModuleForbidden();
        return true;
    }
    if (status === 503) {
        const msg =
            typeof body?.message === 'string'
                ? body.message
                : Array.isArray(body?.message)
                  ? body.message[0]
                  : '';
        if (msg && String(msg).toLowerCase().includes('admin access')) {
            toast('Contact your administrator — deployment or configuration issue.', { type: 'error' });
        }
        return false;
    }
    return false;
}

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        if (status === 401) {
            sessionStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
        }
        if (status === 403) {
            const url = String(error.config?.url || '');
            if (url.includes('-download') || url.includes('/download')) {
                toast('No access to this module.', { type: 'error' });
                return Promise.reject(error);
            }
            handleModuleForbidden();
            return Promise.reject(error);
        }
        if (status === 503 && data) {
            let msg = '';
            if (typeof data === 'string') msg = data;
            else if (data?.message) msg = Array.isArray(data.message) ? data.message[0] : data.message;
            if (msg && String(msg).toLowerCase().includes('admin access')) {
                toast('Contact your administrator — deployment or configuration issue.', { type: 'error' });
            }
        }
        return Promise.reject(error);
    }
);

function applyTokenResponse(response, callback) {
    const body = response.data;
    const bodyStatus = getApiStatus(body);
    const effectiveStatus =
        response.status && response.status >= 400
            ? response.status
            : bodyStatus != null && [401, 403, 503].includes(bodyStatus)
              ? bodyStatus
              : response.status;
    if (handleHttpOrBodyAuth(body, effectiveStatus)) {
        return;
    }
    return callback(body);
}

export const postRequest = async (URL, requestData, callback) => {
    try {
        const response  = await axios.post(URL, requestData);
        // return response.data;
        return callback(response.data);

    } catch (err) {
        return callback({code : 500, message : 'Connection faild, please start node server'});
    }
}

export const postRequestWithFile = async (URL, requestData, callback) => {
    try {
        const response = await axios({
            method  : "POST",
            url     : URL,
            data    : requestData,
            headers : {
                // "access_token" : sessionStorage.getItem('buyer_token') || localStorage.getItem('buyer_token'),
                "Content-Type" : "multipart/form-data"
            }
        });
        // return response.data;
        return callback(response.data);

    } catch (err) {
        
        return callback({code : 500, message : 'Connection faild, please start node server'});
        // throw err;
    }
}

export const getRequestWithToken = async (URL, requestData, callback) => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails')); 
    try {
        const response = await axios({
            method  : "POST",
            url     : URL,    
            data    : requestData,
            // withCredentials : true,
            headers : {
                "accesstoken"  : userDetails.access_token,
                "userId"       :  userDetails.user_id,
                "Content-Type" : "application/json"
            } 
        });
        return applyTokenResponse(response, callback);
    } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
            return;
        }
        return callback({code : 500, message : 'Connection failed, please start node server '});
    }
}

export const postRequestWithToken = async (URL, requestData, callback) => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails')); 
    try {
        const response = await axios({
            method  : "POST",
            url     : URL,    
            data    : requestData,
            withCredentials : true,
            headers : {
                "accesstoken"  : userDetails.access_token,
                "userId"       : userDetails.user_id,
                "Content-Type" : "application/json"
            } 
        });
        return applyTokenResponse(response, callback);
    } catch (err) { 
        if (err.response?.status === 403 || err.response?.status === 401) {
            return;
        }
        return callback({code : 500, message : 'Connection failed, please start node server '});
    }
}

export const postRequestWithTokenAndFile = async (URL, requestData, callback) => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails')); 
    try {
        const response = await axios({
            method  : "POST",
            url     : URL,
            data    : requestData,
            withCredentials: true,
            headers : {
                "accesstoken": userDetails.access_token,
                "userId"     :  userDetails.user_id,
                "Content-Type" : "multipart/form-data"
            }
        });
        return applyTokenResponse(response, callback);

    } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
            return;
        }
        return callback({code : 500, message : 'Connection faild, please start node server '});

    }
}

export const getAddressFromLatLong = (latitude, longitude, callback) => {
    
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API Key
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    try {
        const response = axios.get(url);
        const results  = response.data.results;
        
        if (results.length > 0) {
            callback( results[0].formatted_address ); // Get the first result's address
        } else {
            callback(  "No address found");
        }
    } catch (error) {
        console.log(error)
        callback(  "No address found");
    }
};

