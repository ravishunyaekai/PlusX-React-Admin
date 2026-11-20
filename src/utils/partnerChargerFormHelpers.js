export const findSelectOption = (options, value) => {
    const v = String(value ?? '').trim();
    if (!v) return null;
    return options.find(
        (o) => o.value.toLowerCase() === v.toLowerCase() || o.label.toLowerCase() === v.toLowerCase()
    ) || { value: v, label: v };
};

/** DD-MM-YYYY → YYYY-MM-DD for API */
export const installationDateToApi = (display) => {
    const s = String(display ?? '').trim();
    if (!s) return null;
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [day, month, year] = s.split('-');
        return `${year}-${month}-${day}`;
    }
    return s;
};

/** YYYY-MM-DD or ISO → DD-MM-YYYY for the form mask */
export const installationDateFromApi = (value) => {
    if (value == null || value === '') return '';
    const s = String(value).trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;
    const iso = s.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const [year, month, day] = iso.split('-');
        return `${day}-${month}-${year}`;
    }
    return s;
};

export const buildPartnerChargerPayload = (form, userDetails) => {
    const payload = {
    userId               : userDetails?.user_id,
    email                : userDetails?.email,
    charger_name         : String(form.chargerName).trim(),
    station_id           : form.station?.value || '',
    manufacturer         : String(form.manufacturer).trim(),
    model                : String(form.model).trim(),
    serial_number        : String(form.serialNumber).trim(),
    charger_type         : form.chargerType?.value || '',
    rated_power_kw       : form.ratedPower === '' ? null : Number(form.ratedPower),
    connector_type       : form.connectorType?.value || '',
    connector_count      : form.noOfConnector === '' ? null : Number(form.noOfConnector),
    input_supply         : form.inputSupply?.value || '',
    max_output_voltage_v : form.outputVoltage === '' ? null : Number(form.outputVoltage),
    installation_date    : installationDateToApi(form.installationDate),
    admin_status         : form.adminStatus?.value || '',
    sim_iccid            : String(form.sim).trim() || null,
    imei                 : String(form.imei).trim() || null,
    installation_notes   : String(form.note).trim(),
    };
    const chargerId = String(form.chargerId ?? '').trim();
    if (chargerId) {
        payload.charger_id = chargerId;
    }
    return payload;
};

export const mapStationListToOptions = (rows = []) =>
    rows.map((row) => {
        const value = row.value ?? row.station_id ?? row.id ?? '';
        const label = row.station_name ?? row.label ?? value;
        return { value, label };
    }).filter((o) => o.value);

/** react-select value: keep station_id as value, show station_name as label */
/** Normalize partner-charger-details API `data` for forms and display */
export const readPartnerChargerDetails = (data = {}) => ({
    chargerId          : data.charger_id ?? '',
    chargerName        : data.charger_name ?? '',
    stationId          : data.station_id ?? data.station ?? '',
    stationName        : data.station_name ?? '',
    manufacturer       : data.manufacturer ?? '',
    model              : data.model ?? '',
    serialNumber       : data.serial_number ?? '',
    chargerType        : data.charger_type ?? '',
    ratedPower         : data.rated_power_kw ?? data.rated_power ?? '',
    connectorType      : data.connector_type ?? '',
    noOfConnector      : data.connector_count ?? data.no_of_connector ?? data.number_of_connectors ?? '',
    inputSupply        : data.input_supply ?? '',
    outputVoltage      : data.max_output_voltage_v ?? data.output_voltage ?? '',
    installationDate   : data.installation_date ?? '',
    adminStatus        : data.admin_status ?? '',
    sim                : data.sim_iccid ?? '',
    imei               : data.imei ?? data.imei_number ?? '',
    note               : data.installation_notes ?? data.installation_note ?? '',
});

export const stationSelectOption = (stationId, stationName, options = []) => {
    const id = String(stationId ?? '').trim();
    if (!id) return null;
    const matched = findSelectOption(options, id);
    const name = String(stationName ?? '').trim();
    return {
        value : id,
        label : name || (matched?.label !== id ? matched?.label : '') || id,
    };
};