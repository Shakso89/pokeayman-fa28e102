import fs from 'node:fs';

const PIXABAY_KEY = '58123311-8a89c5e2df18a2650add733fa';
const SUPABASE_URL = 'https://lbmdlligjjrkmjmdtwsq.supabase.co/rest/v1/app_records';
const SUPABASE_KEY = 'sb_publishable_s_aLtLB6z1AL3tI1bRyMMA_YEkOrrHI';

async function main() {
  console.log('Fetching VB 6 - VB 25 records from Supabase...');
  const res = await fetch(SUPABASE_URL + '?select=id,data,owner_id&limit=1000', {
    headers: { apikey: SUPABASE_KEY }
  });
  const rows = await res.json();
  const records = rows.map(r => ({ db_id: r.id, owner_id: r.owner_id, ...(r.data || {}) }));

  const lists = records.filter(r => (r.type === 'vocab_list' || r.type === 'vocabulary_list') && (r.vocab_list_name || '').match(/^VB\s*([6-9]|1[0-9]|2[0-5])$/i));
  lists.sort((a,b) => parseInt(a.vocab_list_name.replace('VB','')) - parseInt(b.vocab_list_name.replace('VB','')));

  const listIds = new Set(lists.map(l => l.vocab_list_id));
  const words = records.filter(r => ['vocab_word','word','vocab_item','vocabulary_word'].includes(r.type) && listIds.has(r.vocab_list_id));

  console.log(`Found ${lists.length} lists and ${words.length} words.`);

  // Custom search query overrides for words that need clean Pixabay results
  const queryOverrides = {
    "o'clock": "clock wall",
    "OK": "thumbs up",
    "TV": "television screen",
    "thank you": "thank you",
    "thanks": "thank you card",
    "that": "pointing finger",
    "this": "pointing hand",
    "in": "inside box",
    "out": "outside exit",
    "on": "light switch on",
    "have": "giving hands",
    "here": "location pin",
    "he": "boy smiling",
    "how": "question mark",
    "let": "open gate",
    "like": "thumbs up like",
    "little": "small kitten",
    "long": "long road",
    "many": "many people crowd",
    "no": "no sign red",
    "not": "cross mark red",
    "please": "praying hands please",
    "play": "children playing",
    "see": "eye seeing",
    "sing": "singing microphone",
    "want": "wishing star",
    "what": "question mark",
    "where": "map compass",
    "yes": "check mark green",
    "young": "young child smiling",
    "fine": "sunny day fine weather",
    "go": "green traffic light go",
    "good": "good job medal",
    "goodbye": "waving hand goodbye",
    "welcome": "welcome mat door",
    "time": "clock time"
  };

  // Distinct search terms needed
  const wordMap = new Map();
  for (const w of words) {
    const text = (w.vocab_word || '').trim().toLowerCase();
    if (text) wordMap.set(text, null);
  }

  // Also include the cover terms
  const coverTerms = {
    'VB 6': 'elephant',
    'VB 7': 'frog',
    'VB 8': 'grape',
    'VB 9': 'happy smile',
    'VB 10': 'horse',
    'VB 11': 'ice cream',
    'VB 12': 'lion',
    'VB 13': 'monkey',
    'VB 14': 'numbers math',
    'VB 15': 'panda',
    'VB 16': 'pineapple',
    'VB 17': 'rabbit',
    'VB 18': 'school building',
    'VB 19': 'soccer ball',
    'VB 20': 'teacher classroom',
    'VB 21': 'tennis racket',
    'VB 22': 'tiger',
    'VB 23': 'umbrella',
    'VB 24': 'window',
    'VB 25': 'zoo animals'
  };

  console.log(`Collecting permanent images for ${wordMap.size} unique words...`);

  async function fetchPermanentUrl(query) {
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&safesearch=true&per_page=5`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    if (!data.hits || !data.hits.length) return null;

    // Pick first hit with previewURL
    for (const hit of data.hits) {
      if (hit.previewURL) {
        const preview = hit.previewURL;
        const ext = preview.slice(preview.lastIndexOf('.'));
        const base = preview.slice(0, preview.lastIndexOf('_'));
        const cdn640 = base + '_640' + ext;
        // Verify with HEAD request
        try {
          const test = await fetch(cdn640, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (test.ok) return cdn640;
          return preview; // fallback to 150px preview if 640 fails
        } catch (_) {
          return preview;
        }
      }
    }
    return null;
  }

  const resolvedWords = {};
  for (const term of wordMap.keys()) {
    const query = queryOverrides[term] || term;
    const imgUrl = await fetchPermanentUrl(query);
    if (imgUrl) {
      resolvedWords[term] = imgUrl;
      process.stdout.write('.');
    } else {
      console.log(`\nFailed for word: ${term}`);
    }
    // Respect rate limit slightly
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`\nResolved ${Object.keys(resolvedWords).length} of ${wordMap.size} words.`);

  console.log('Resolving covers...');
  const resolvedCovers = {};
  for (const [listName, coverTerm] of Object.entries(coverTerms)) {
    const imgUrl = await fetchPermanentUrl(coverTerm);
    if (imgUrl) {
      resolvedCovers[listName] = imgUrl;
      console.log(`${listName} cover (${coverTerm}) -> ${imgUrl}`);
    } else {
      console.log(`Failed cover for ${listName}`);
    }
    await new Promise(r => setTimeout(r, 60));
  }

  // Save full mapping to a JSON file
  const output = {
    generated_at: new Date().toISOString(),
    covers: resolvedCovers,
    words: resolvedWords
  };

  fs.writeFileSync('scripts/vb-permanent-images.json', JSON.stringify(output, null, 2));
  console.log('Wrote scripts/vb-permanent-images.json successfully!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
