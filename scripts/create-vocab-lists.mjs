import https from 'node:https';
import crypto from 'node:crypto';

const SUPABASE_URL = "https://c--af78e400-d2aa-4584-8316-ae12b8d0c19c-prod.lovable.cloud";
const API_KEY = "sb_publishable_s_aLtLB6z1AL3tI1bRyMMA_YEkOrrHI";
const EMAIL = "ayman.soliman.cc@gmail.com";
const PASSWORD = "01055800234";

const SCHOOL = "Stanford";
const CLASS_NAME = "ESL";
const TEACHER_NAME = "Ayman";

async function login() {
  console.log("Authenticating as teacher Ayman...");
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "apikey": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  console.log(`Authenticated! User ID: ${data.user.id}`);
  return data.access_token;
}

async function fetchImageForWord(word, fallbackQuery) {
  const query = fallbackQuery || word;
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json`;
    const res = await fetch(url, {
      headers: { "User-Agent": "PokeAymanVocabularyBuilder/1.0 (contact: ayman.soliman.cc@gmail.com)" }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.query && data.query.pages) {
        for (const pageId in data.query.pages) {
          const page = data.query.pages[pageId];
          if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].thumburl) {
            const thumb = page.imageinfo[0].thumburl;
            if (!thumb.toLowerCase().endsWith('.svg.png') && !thumb.toLowerCase().includes('audio')) {
              return thumb;
            }
          }
        }
        // If all had svg or audio, pick first thumb
        for (const pageId in data.query.pages) {
          const page = data.query.pages[pageId];
          if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].thumburl) {
            return page.imageinfo[0].thumburl;
          }
        }
      }
    }
  } catch (e) {
    console.warn(`Could not fetch image for ${word}:`, e.message);
  }
  return "";
}

async function insertRecord(token, recordData) {
  const id = crypto.randomUUID();
  const payload = {
    id,
    data: {
      ...recordData,
      __backendId: id,
      created_at: new Date().toISOString()
    }
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/app_records`, {
    method: "POST",
    headers: {
      "apikey": API_KEY,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Insert failed (${res.status}): ${await res.text()}`);
  }
  return id;
}

export { login, fetchImageForWord, insertRecord, SCHOOL, CLASS_NAME, TEACHER_NAME };
