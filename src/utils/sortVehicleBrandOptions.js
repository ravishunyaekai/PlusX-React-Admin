const isOtherOption = (option) => {
    const label = String(option?.label ?? '').trim().toLowerCase();
    const value = String(option?.value ?? '').trim().toLowerCase();
    return label === 'other' || value === 'other';
};

export const sortSelectOptionsOtherLast = (options = []) => {
    return [...options].sort((a, b) => {
        const aOther = isOtherOption(a);
        const bOther = isOtherOption(b);
        if (aOther && !bOther) return 1;
        if (!aOther && bOther) return -1;
        return String(a?.label ?? '').localeCompare(String(b?.label ?? ''), undefined, {
            sensitivity : 'base',
        });
    });
};

/** Sort make/brand list and each make's model list (Other always last). */
export const sortVehicleBrandList = (brands = []) =>
    sortSelectOptionsOtherLast(brands).map((brand) => ({
        ...brand,
        models : brand?.models ? sortSelectOptionsOtherLast(brand.models) : brand.models,
    }));
