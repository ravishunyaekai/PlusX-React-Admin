import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ensureSessionUserDetails, getDefaultLandingPath } from '../../utils/adminAccess';
import { isPathAllowedForUser } from '../../utils/moduleRouteAccess';

function readSessionUser() {
  return ensureSessionUserDetails();
}

/**
 * Enforces client-side module access for layout routes. API may still return 403 (handled in Requests.js).
 */
export default function ModuleRouteGuard() {
  const location = useLocation();
  const [userDetails, setUserDetails] = useState(() => readSessionUser());

  useEffect(() => {
    setUserDetails(readSessionUser());
  }, [location.pathname]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'userDetails') setUserDetails(readSessionUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!userDetails?.access_token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isPathAllowedForUser(location.pathname, userDetails)) {
    const fallback = getDefaultLandingPath(userDetails) || '/';
    if (location.pathname !== fallback) {
      return <Navigate to={fallback} replace />;
    }
    return (
      <div style={{ padding: 24, color: '#fff' }}>
        <h3 style={{ marginBottom: 8 }}>No access to this module</h3>
        <p style={{ margin: 0, opacity: 0.85 }}>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
}
