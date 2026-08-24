export const yesNoOption = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No',  label: 'No'  },
];

export const leadSourceOption = [
    { value: 'WhatsApp', label: 'WhatsApp' },
    { value: 'Call',     label: 'Call'     },
    { value: 'Email',    label: 'Email'    },
    { value: 'Website',  label: 'Website'  },
    { value: 'Other',    label: 'Other'    },
];

export const siteVisitStatusOption = [
    { value: 'Planned',   label: 'Planned'   },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

export const chargerAvailabilityOption = [
    { value: 'already_has', label: 'Customer Already Has Charger' },
    { value: 'buy_from_us', label: 'Customer Will Buy Charger From Us' },
];

export const enquiryStatusOption = [
    { value: 'Assigned',                 label: 'Assigned' },
    { value: 'Contacted',                label: 'Contacted' },
    { value: 'Follow-up Required',       label: 'Follow-up Required' },
    { value: 'Site Visit Planned',       label: 'Site Visit Planned' },
    { value: 'Site Visit Completed',     label: 'Site Visit Completed' },
    { value: 'Quotation Shared',         label: 'Quotation Shared' },
    { value: 'Installation Scheduled',   label: 'Installation Scheduled' },
    { value: 'Installation Completed',   label: 'Installation Completed' },
    { value: 'Lost / Cancelled',         label: 'Lost / Cancelled' },
];

export const findOption = (options, value) =>
    options.find((option) => String(option.value) === String(value || '')) || null;

export const toApiDate = (date) => {
    if (!date || date.includes('_') || date.length !== 10) return date || '';
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`;
};

export const toFormDate = (date) => {
    if (!date) return '';
    const parsed = date.includes('T') ? date.slice(0, 10) : date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
        const [year, month, day] = parsed.split('-');
        return `${day}-${month}-${year}`;
    }
    return date;
};
