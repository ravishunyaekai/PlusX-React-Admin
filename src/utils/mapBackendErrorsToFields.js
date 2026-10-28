/**
 * Maps backend API error messages onto form field error keys.
 * Handles message as string, array, or object, including combined messages
 * like "Manager contact number and Email already exist".
 *
 * @param {object} response - API response containing `message`
 * @param {{ email?: string, contact?: string }} fieldKeys - Form error state keys
 * @param {{ email?: string, contact?: string }} [defaultMessages] - Messages used when a combined error is split
 * @param {Array<{ match: string | RegExp, key: string, label?: string }>} [extraFields] - Additional fields, checked
 *        before email/contact. A string `match` is a backend field name (e.g. "customer_name") and is replaced by
 *        `label` in the shown message; a RegExp `match` is tested against the message and shows it as-is.
 * @returns {Record<string, string>} Field errors to merge into form errors state
 */
export const mapBackendErrorsToFields = (
    response,
    fieldKeys = { email: 'email', contact: 'mobileNo' },
    defaultMessages = {
        email: 'Email already exist',
        contact: 'Contact number already exist',
    },
    extraFields = []
) => {
    const emailKey = fieldKeys.email || 'email';
    const contactKey = fieldKeys.contact || 'mobileNo';
    const fieldErrors = {};
    const messages = [];

    const assignExtraField = (text) => {
        for (const { match, key, label } of extraFields) {
            if (match instanceof RegExp) {
                if (match.test(text)) {
                    fieldErrors[key] = fieldErrors[key] || text;
                    return true;
                }
            } else if (new RegExp(`\\b${match}\\b`).test(text)) {
                fieldErrors[key] = fieldErrors[key] || (label ? text.replace(match, label) : text);
                return true;
            }
        }
        return false;
    };

    if (Array.isArray(response?.message)) {
        messages.push(...response.message.filter(Boolean));
    } else if (typeof response?.message === 'string' && response.message) {
        messages.push(response.message);
    } else if (response?.message && typeof response.message === 'object') {
        Object.entries(response.message).forEach(([key, value]) => {
            const msg = Array.isArray(value) ? value[0] : value;
            if (!msg) return;
            const extraField = extraFields.find(({ match }) => match === key);
            if (extraField) {
                fieldErrors[extraField.key] = msg;
                return;
            }
            const keyLower = key.toLowerCase();
            if (keyLower.includes('email')) {
                fieldErrors[emailKey] = msg;
            } else if (
                keyLower.includes('mobile') ||
                keyLower.includes('contact') ||
                keyLower.includes('phone')
            ) {
                fieldErrors[contactKey] = msg;
            } else {
                messages.push(msg);
            }
        });
    }

    const assignMessageToFields = (msg) => {
        const text = String(msg);
        if (assignExtraField(text)) return;

        const lower = text.toLowerCase();
        const hasEmail = lower.includes('email');
        const hasContact =
            lower.includes('mobile') ||
            lower.includes('contact') ||
            lower.includes('phone');

        if (hasEmail && hasContact) {
            fieldErrors[emailKey] = defaultMessages.email || 'Email already exist';
            fieldErrors[contactKey] =
                defaultMessages.contact || 'Contact number already exist';
            return;
        }
        if (hasEmail) {
            fieldErrors[emailKey] = text;
            return;
        }
        if (hasContact) {
            fieldErrors[contactKey] = text;
        }
    };

    messages.forEach(assignMessageToFields);
    return fieldErrors;
};

/** Extracts a single toast-friendly string from an API response message. */
export const getBackendErrorMessage = (response, fallback = 'Something went wrong') => {
    if (Array.isArray(response?.message)) {
        return response.message[0] || fallback;
    }
    if (typeof response?.message === 'string' && response.message) {
        return response.message;
    }
    return fallback;
};

/**
 * Applies mapped field errors via setErrors, or returns false so caller can toast.
 * @returns {boolean} true if field errors were applied
 */
export const applyBackendFieldErrors = (response, setErrors, fieldKeys, defaultMessages, extraFields) => {
    const fieldErrors = mapBackendErrorsToFields(response, fieldKeys, defaultMessages, extraFields);
    if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        return true;
    }
    return false;
};

/** Extra field matchers for the offline RSA booking add/edit forms. */
export const OFFLINE_RSA_ERROR_FIELDS = [
    { match: /already registered with another mobile/i, key: 'customerEmail' },
    { match: /invalid booking status/i,                 key: 'bookingStatus' },
    { match: /rsa driver/i,                             key: 'bookingCompletedBy' },
    { match: 'booking_completed_date', key: 'bookingCompletedDate', label: 'Booking Completed Date' },
    { match: 'cancellation_remarks',   key: 'cancellationRemarks',  label: 'Cancellation Remarks' },
    { match: 'customer_name',          key: 'customerName',         label: 'Customer Name' },
    { match: 'location_link',          key: 'locationLink',         label: 'Location Link' },
    { match: 'booking_status',         key: 'bookingStatus',        label: 'Booking Status' },
    { match: 'booking_date',           key: 'bookingDate',          label: 'Booking Date' },
    { match: 'mobile_no',              key: 'customerMobile',       label: 'Phone Number' },
    { match: 'email_id',               key: 'customerEmail',        label: 'Email ID' },
    { match: 'emirates',               key: 'emirates',             label: 'Emirates' },
    { match: 'address',                key: 'customerAddress',      label: 'Address' },
    { match: 'price',                  key: 'price',                label: 'Price' },
    { match: 'service_terms_condition', key: 'serviceTermsCondition', label: 'Service Terms & Condition' },
];
