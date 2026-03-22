import axios from 'axios';

const API_BASE = 'http://localhost:8000';
const CONSENT_KEY = 'brainscan_geo_consent';

export function getGeoConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'true';
}

export function setGeoConsent(enabled) {
  localStorage.setItem(CONSENT_KEY, enabled ? 'true' : 'false');
}

export async function trackInteraction(eventType, page) {
  try {
    await axios.post(`${API_BASE}/analytics/interaction`, {
      event_type: eventType,
      page,
      consent: getGeoConsent(),
    });
  } catch {
    // Non-blocking analytics event
  }
}

export function getGeoConsentHeader() {
  return getGeoConsent() ? 'true' : 'false';
}
