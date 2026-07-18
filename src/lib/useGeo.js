import { useState, useEffect } from "react";

// State/city options for address dropdowns, from the free countriesnow.space
// geo API (open, no key, CORS *). Called client-side so nothing needs to ship
// in our bundle or run on our backend. Keyed by country/state NAME (what the
// form already stores). Any failure → empty list → the field degrades to a
// free-text input, so checkout never breaks if the service is unreachable.
const GEO_BASE = "https://countriesnow.space/api/v0.1";

async function getJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json && !json.error ? json : null;
  } catch {
    return null;
  }
}

export function useGeo(countryName, stateName) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    let cancel = false;
    if (!countryName) { setStates([]); return; }
    getJson(`${GEO_BASE}/countries/states/q?country=${encodeURIComponent(countryName)}`)
      .then((j) => { if (!cancel) setStates(j?.data?.states || []); });
    return () => { cancel = true; };
  }, [countryName]);

  useEffect(() => {
    let cancel = false;
    if (!countryName || !stateName) { setCities([]); return; }
    getJson(
      `${GEO_BASE}/countries/state/cities/q?country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`
    ).then((j) => { if (!cancel) setCities(Array.isArray(j?.data) ? j.data : []); });
    return () => { cancel = true; };
  }, [countryName, stateName]);

  return { states, cities };
}
