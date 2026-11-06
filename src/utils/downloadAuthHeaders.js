/**
 * Headers for GET /admin/*-download endpoints (align with token requests + API key).
 */
export function getAdminDownloadHeaders(userDetails) {
  if (!userDetails?.access_token) return {};
  return {
    authorization: process.env.REACT_APP_Authorization,
    accesstoken: userDetails.access_token,
    userId: String(userDetails.user_id),
  };
}
