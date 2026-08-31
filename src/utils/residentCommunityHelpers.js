/**
 * MULTI-SELECT COMMUNITY helpers — shared across Add/Edit/List/Details resident screens.
 * Search "MULTI-SELECT COMMUNITY" in the project to find all related UI/API changes.
 * Update these helpers if the backend payload or response shape changes.
 */

/**
 * Builds MultiSelect options from resident-details (or similar) API data.
 * Supports new multi-community shapes and legacy single community_id + community_name.
 */
export const mapCommunitiesFromApiResponse = (data = {}, options = []) => {
    if (Array.isArray(data.community_list) && data.community_list.length > 0) {
        return data.community_list.map((item) => ({
            label: item.community_name || item.label,
            value: item.community_id || item.value,
        }));
    }

    if (Array.isArray(data.communities) && data.communities.length > 0) {
        return data.communities.map((item) => ({
            label: item.community_name || item.label,
            value: item.community_id || item.value,
        }));
    }

    if (Array.isArray(data.community_ids) && data.community_ids.length > 0) {
        const names = Array.isArray(data.community_names) ? data.community_names : [];

        return data.community_ids.map((id, index) => {
            const matchedOption = options.find(
                (option) => String(option.value) === String(id)
            );

            return matchedOption || {
                label: names[index] || `Community ${id}`,
                value: id,
            };
        });
    }

    // Legacy single-community response (pre multi-select)
    if (data.community_id) {
        return [{
            label: data.community_name,
            value: data.community_id,
        }];
    }

    return [];
};

/**
 * Formats assigned communities for read-only display (list row, details page, etc.).
 * Returns a comma-separated string of community names.
 */
export const formatCommunityNamesForDisplay = (data = {}) => {
    if (Array.isArray(data.community_list) && data.community_list.length > 0) {
        return data.community_list
            .map((item) => item.community_name || item.label)
            .filter(Boolean)
            .join(', ');
    }

    if (Array.isArray(data.communities) && data.communities.length > 0) {
        return data.communities
            .map((item) => item.community_name || item.label)
            .filter(Boolean)
            .join(', ');
    }

    if (Array.isArray(data.community_names) && data.community_names.length > 0) {
        return data.community_names.filter(Boolean).join(', ');
    }

    // Legacy single-community field (pre multi-select)
    return data.community_name || '';
};
