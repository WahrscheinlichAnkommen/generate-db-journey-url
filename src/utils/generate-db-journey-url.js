import axios from 'axios';
import moment from 'moment-timezone';

/**
 * Sends a POST request to the DB endpoint along with given payload and
 * extracts and returns the vbid.
 *
 * @param {Object} payload - The data to be sent with POST request.
 * @return {Promise<string>} The vbid from the response.
 */
const getRequestVbid = async (payload) => {
    const response = await axios.post(
        'https://int.bahn.de/web/api/angebote/verbindung/teilen',
        payload
    );
    return response.data.vbid;
};

/**
 * Extracts and transforms date information from refreshToken.
 *
 * @param {string} refreshToken - The token from which to extract date.
 * @return {string} The extracted date in ISO 8601 string format.
 */
const getDateFromToken = (refreshToken) => {
    const match = refreshToken.match(/\$[0-9]{12}\$/);
    if (!match) return;
    const rawDate = match[0].slice(1, -1);
    const date = moment.tz(
        `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}T${rawDate.slice(8, 10)}:${rawDate.slice(10, 12)}:00`,
        'Europe/Berlin'
    );
    return date.toISOString();
};

/**
 * Extracts first and last stations names from refreshToken.
 *
 * @param {string} refreshToken - The token from which to extract station names.
 * @return {Object} An object with properties 'firstStation' and 'lastStation'.
 */
const getStationsFromToken = (refreshToken) => {
    const matches = refreshToken.match(/@O=([^@]*)@/g) || [];
    const stations = matches.map((m) => m.slice(3, -1));
    return { firstStation: stations[0], lastStation: stations.slice(-1)[0] };
};

/**
 * Extracts relevant journey information from refreshToken.
 *
 * @param {string} refreshToken - The token from which to extract journey info.
 * @return {Object} A object with properties 'date', 'origin' and 'destination'.
 */
const extractInfoFromToken = (refreshToken) => {
    const date = getDateFromToken(refreshToken);
    const { firstStation, lastStation } = getStationsFromToken(refreshToken);
    return {
        date: date,
        origin: firstStation,
        destination: lastStation,
    };
};

/**
 * Returns the base URL with the desired locale. If specified locale is unknown, returns English URL.
 * @param {string} locale The locale of the URL; currently supports: cs (Czech), da (Danish), de (German), en (Englisch), es (Spanish), fr (French), it (Italian), nl (Dutch), pl (Polish)
 * @return {string} The base URL with specified locale (if valid) or fallback locale (English).
 */
const getUrlWithLocale = (locale) => {
    const locales = ['cs', 'da', 'de', 'en', 'es', 'fr', 'it', 'nl'];

    let url;
    if (locale === 'de') {
        url = 'https://www.bahn.de/buchung/start?';
    } else if (locales.includes(locale)) {
        url = `https://int.bahn.de/${locale}/buchung/start?`;
    } else {
        console.info(`Unknown locale ${locale}, using default URL`);
        url = 'https://int.bahn.de/en/buchung/start?';
    }

    return url;
};

/**
 * Constructs and returns a journey URL from given refreshToken by extracting necessary info from it, making a backend
 * call using provided info, constructing URL params and returning constructed URL.
 *
 * @param {string} refreshToken - The token from which to get necessary data to construct journey url.
 * @param {string} lang - The locale of the URL; currently supports: cs (Czech), da (Danish), de (German), en (Englisch), es (Spanish), fr (French), it (Italian), nl (Dutch), pl (Polish)
 * @return {Promise<string>} The constructed journey URL.
 * @throws {Error} Will throw an error if the asynchronous request failed.
 */
export const generateDbJourneyUrl = async (refreshToken, lang = 'en') => {
    const url = getUrlWithLocale(lang);

    const refreshTokenInfo = extractInfoFromToken(refreshToken);

    const payload = {
        hinfahrtDatum: refreshTokenInfo.date,
        hinfahrtRecon: refreshToken,
        startOrt: refreshTokenInfo.origin,
        zielOrt: refreshTokenInfo.destination,
    };

    const vbid = await getRequestVbid(payload);
    const params = new URLSearchParams({ vbid: vbid });
    return `${url}${params.toString()}`;
};
