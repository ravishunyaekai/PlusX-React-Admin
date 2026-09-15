/**
 * Maps backend API error messages onto form field error keys.
 * Handles message as string, array, or object, including combined messages
 * like "Manager contact number and Email already exist".
 *
 * @param {object} response - API response containing `message`
 * @param {{ email?: string, contact?: string }} fieldKeys - Form error state keys
 * @param {{ email?: string, contact?: string }} [defaultMessages] - Messages used when a combined error is split
 * @returns {Record<string, string>} Field errors to merge into form errors state
 */
export const mapBackendErrorsToFields = (
    response,
    fieldKeys = { email: 'email', contact: 'mobileNo' },
    defaultMessages = {
        email: 'Email already exist',
        contact: 'Contact number already exist',
    }
) => {
    const emailKey = fieldKeys.email || 'email';
    const contactKey = fieldKeys.contact || 'mobileNo';
    const fieldErrors = {};
    const messages = [];

    if (Array.isArray(response?.message)) {
        messages.push(...response.message.filter(Boolean));
    } else if (typeof response?.message === 'string' && response.message) {
        messages.push(response.message);
    } else if (response?.message && typeof response.message === 'object') {
        Object.entries(response.message).forEach(([key, value]) => {
            const msg = Array.isArray(value) ? value[0] : value;
            if (!msg) return;
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
export const applyBackendFieldErrors = (response, setErrors, fieldKeys, defaultMessages) => {
    const fieldErrors = mapBackendErrorsToFields(response, fieldKeys, defaultMessages);
    if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        return true;
    }
    return false;
};
