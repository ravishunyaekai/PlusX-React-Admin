export const reasonForNonConversionOptions = [
    { value : 'price_concern',           label : 'Price Concern' },
    { value : 'service_not_available',   label : 'Service Not Available' },
    { value : 'customer_not_interested', label : 'Customer Not Interested' },
    { value : 'customer_unreachable',    label : 'Customer Unreachable' },
    { value : 'customer_will_book_later', label : 'Customer Will Book Later' },
    { value : 'b2b_leads',               label : 'B2B Leads' },
    { value : 'other',                   label : 'Other' },
];

export const reasonForNonConversionFilterOptions = [
    { value : '', label : 'Select Reason' },
    ...reasonForNonConversionOptions,
];

export const findReasonForNonConversionOption = (value) =>
    reasonForNonConversionOptions.find((option) => option.value === value) || null;

export const getReasonForNonConversionLabel = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const option = findReasonForNonConversionOption(value);
    return option?.label || String(value);
};
