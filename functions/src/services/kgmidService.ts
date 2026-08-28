import axios from "axios";

export interface KgmidResult {
  kgmid: string | null;
  name: string | null;
  cid: string | null;
  source: string;
}

const GOOGLE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Extracts the Knowledge Graph Machine ID (`/g/<token>`) from a Google Maps
 * place-sheet document. The token appears both in the embedded KG metadata and
 * in the place `data=!...!16s%2Fg%2F<kgmid>!...` share segment.
 */
export const extractKgmid = (html: string): string | null => {
  if (!html) return null;

  const quoted = html.match(/"kgmid"\s*:\s*"([A-Za-z0-9_-]+)"/);
  if (quoted?.[1]) return quoted[1];

  const encoded = html.match(/16s%2Fg%2F([A-Za-z0-9_-]+)/i);
  if (encoded?.[1]) return encoded[1];

  const decoded = html.match(/!16s\/g\/([A-Za-z0-9_-]+)/i);
  if (decoded?.[1]) return decoded[1];

  const generic = html.match(/\/g\/([A-Za-z0-9_-]{4,})/);
  if (generic?.[1]) return generic[1];

  return null;
};

/**
 * Resolves the KGMID (Knowledge Graph Machine ID) for a business.
 *
 * 1. Uses the Google Places (New) API — driven by PLACES_API_KEY — to pin the
 *    exact place for "<business> in <city>" and obtain its stable `cid`.
 * 2. Reads that place's Maps sheet HTML server-side and extracts the `/g/`
 *    Knowledge Graph token, the same unique-identifier field the
 *    google-maps-scraper product ships as KGMID.
 *
 * Best-effort by design: any failure returns nulls so the audit never breaks.
 */
export const resolveKgmid = async (
  businessName: string,
  city: string,
  apiKey: string
): Promise<KgmidResult> => {
  if (!apiKey) {
    return { kgmid: null, name: null, cid: null, source: "PLACES_KEY_MISSING" };
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.googleMapsUri"
      },
      body: JSON.stringify({ textQuery: `${businessName} in ${city}` })
    });

    if (!res.ok) {
      return { kgmid: null, name: null, cid: null, source: "PLACES_ERROR" };
    }

    const data: any = await res.json();
    const place = data?.places?.[0];
    if (!place) {
      return { kgmid: null, name: null, cid: null, source: "PLACE_NOT_FOUND" };
    }

    const name: string = place.displayName?.text ?? businessName;
    const mapsUri: string = place.googleMapsUri ?? "";
    const cidMatch = mapsUri.match(/cid=(\d+)/);
    const cid = cidMatch?.[1] ?? null;
    if (!cid) {
      return { kgmid: null, name, cid: null, source: "NO_CID" };
    }

    const mapsRes = await axios.get(`https://maps.google.com/maps?cid=${cid}`, {
      timeout: 8000,
      maxRedirects: 5,
      headers: {
        "User-Agent": GOOGLE_UA,
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const html: string = mapsRes.data ?? "";
    const kgmid = extractKgmid(html);

    return { kgmid, name, cid, source: kgmid ? "MAPS_SHEET" : "KG_MISSING" };
  } catch (err: any) {
    console.warn("[resolveKgmid] failed:", err.message);
    return { kgmid: null, name: null, cid: null, source: "ERROR" };
  }
};
