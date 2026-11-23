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

export const normalizePartnerSessionListRow = (row = {}) => ({
    ...row,
    session_id         : row.session_id ?? '',
    display_session_id : row.display_session_id ?? (row.session_id ? `S-${row.session_id}` : ''),
    charger_id         : row.charger_id ?? '',
    station_name       : row.station_name ?? row.station_id ?? '',
    start_time         : row.start_time ?? '',
    duration           : row.duration ?? '',
    status             : row.status ?? row.latest_status ?? '—',
});

export const buildPartnerSessionListRequest = (userDetails, page, appliedFilters = {}) => {
    const payload = {
        userId  : userDetails?.user_id,
        email   : userDetails?.email,
        page_no : page,
    };
    const search = String(appliedFilters.search_text ?? '').trim();
    const stationId = String(appliedFilters.station_id ?? '').trim();
    if (search) payload.search_text = search;
    if (stationId) payload.station_id = stationId;
    if (appliedFilters.start_date && appliedFilters.end_date) {
        payload.start_date = appliedFilters.start_date;
        payload.end_date = appliedFilters.end_date;
    }
    return payload;
};

export const readPartnerSessionDetails = (data = {}) => {
    const samples = Array.isArray(data.meter_samples) ? data.meter_samples : [];
    const latestSample = samples.length ? samples[samples.length - 1] : {};
    return {
        display_session_id : data.display_session_id ?? (data.session_id ? `S-${data.session_id}` : ''),
        session_id         : data.session_id ?? '',
        charger_id         : data.charger_id ?? '',
        station_id         : data.station_id ?? '',
        station_name       : data.station_name ?? '',
        user               : data.user ?? '',
        start_time         : data.start_time ?? '',
        end_time           : data.end_time ?? '',
        duration           : data.duration ?? '',
        status             : data.latest_status ?? '',
        error_code         : data.latest_error_code ?? '',
        energy_kwh         : data.energy_kwh,
        voltage            : latestSample.voltage,
        current            : latestSample.current,
        power              : latestSample.power,
        events             : data.events ?? [],
        meter_samples      : samples,
    };
};

export const normalizePartnerAlertListRow = (row = {}) => ({
    ...row,
    alert_id     : row.alert_id ?? row.id ?? '',
    time         : row.created_at ?? row.updated_at ?? '',
    message      : row.title ?? row.alert_type ?? row.error_code ?? '—',
    station_name : row.station_name ?? row.station_id ?? '',
    charger_id   : row.charger_id ?? '',
    severity     : row.severity ?? '',
    admin_status : row.admin_status ?? '',
});

export const buildPartnerAlertListRequest = (userDetails, page, appliedFilters = {}) => {
    const payload = {
        userId  : userDetails?.user_id,
        email   : userDetails?.email,
        page_no : page,
    };
    const search = String(appliedFilters.search_text ?? '').trim();
    const adminStatus = String(appliedFilters.admin_status ?? '').trim();
    const severity = String(appliedFilters.severity ?? '').trim();
    if (search) payload.search_text = search;
    if (adminStatus) payload.admin_status = adminStatus;
    if (severity) payload.severity = severity;
    return payload;
};