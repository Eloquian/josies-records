export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { image, mimeType } = await req.json()

  if (!image) {
    return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400 })
  }

  // Step 1: Gemini Vision — read the label
  const geminiKey = process.env.GEMINI_API_KEY
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: image,
              }
            },
            {
              text: `You are a vinyl record expert. Examine this record label image carefully and extract the following information. Return ONLY a valid JSON object with these exact keys (use null for anything not visible):

{
  "artist": "artist or band name",
  "title": "album or single title",
  "label": "record label name",
  "catalogueNo": "catalogue number",
  "year": "year of release",
  "country": "country of manufacture",
  "format": "LP / 7\\\" / 12\\\" / EP etc",
  "side": "Side A / Side B / Side 1 / Side 2 etc",
  "speed": "33 / 45 / 78 RPM",
  "genre": "primary genre",
  "style": "sub-genre or style",
  "notes": "any other notable info from the label"
}

Return only the JSON object, no other text.`
            }
          ]
        }],
        generationConfig: { temperature: 0.1 }
      })
    }
  )

  if (!geminiRes.ok) {
    const err = await geminiRes.text()
    return new Response(JSON.stringify({ error: `Gemini error: ${err}` }), { status: 500 })
  }

  const geminiData = await geminiRes.json()
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

  let labelData = {}
  try {
    const clean = rawText.replace(/```json|```/g, '').trim()
    labelData = JSON.parse(clean)
  } catch {
    return new Response(JSON.stringify({ error: 'Could not parse label data from image' }), { status: 500 })
  }

  // Compute confidence from how many key fields were found
  const keyFields = [labelData.artist, labelData.title, labelData.label, labelData.catalogueNo]
  const found = keyFields.filter(Boolean).length
  const confidence = found >= 3 ? 'high' : found >= 1 ? 'medium' : 'low'

  // Step 2: Discogs lookup — return up to 5 matches
  const discogsToken = process.env.DISCOGS_TOKEN
  const query = [labelData.artist, labelData.title].filter(Boolean).join(' ')

  let matches = []
  if (query) {
    try {
      const params = new URLSearchParams({
        q: query,
        type: 'release',
        per_page: '5',
        token: discogsToken,
      })
      if (labelData.artist) params.set('artist', labelData.artist)
      if (labelData.catalogueNo) params.set('catno', labelData.catalogueNo)

      const discogsRes = await fetch(
        `https://api.discogs.com/database/search?${params}`,
        { headers: { 'User-Agent': 'JosiesRecordCatalogue/1.0' } }
      )

      if (discogsRes.ok) {
        const discogsJson = await discogsRes.json()
        matches = (discogsJson.results || []).slice(0, 5).map(r => {
          const parts = (r.title || '').split(' - ')
          return {
            id: String(r.id),
            artist: parts[0] || labelData.artist || null,
            title: parts.slice(1).join(' - ') || labelData.title || null,
            label: r.label?.[0] || null,
            catno: r.catno || null,
            year: r.year ? String(r.year) : null,
            country: r.country || null,
            format: r.format?.[0] || null,
            genre: r.genre?.[0] || null,
            style: r.style?.[0] || null,
            source: 'Discogs',
            sourceUrl: r.uri ? `https://www.discogs.com${r.uri}` : null,
          }
        })

        // Fetch estimated value only for the top match
        if (matches.length > 0) {
          try {
            const value = await getDiscogsValue(matches[0].id, discogsToken)
            if (value) matches[0].estimatedValue = value
          } catch {
            // value fetch failed — continue without it
          }
        }
      }
    } catch {
      // Discogs lookup failed — continue with just label data
    }
  }

  return new Response(JSON.stringify({ ...labelData, confidence, matches }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function getDiscogsValue(releaseId, token) {
  const res = await fetch(
    `https://api.discogs.com/marketplace/price_suggestions/${releaseId}`,
    { headers: { 'User-Agent': 'JosiesRecordCatalogue/1.0', 'Authorization': `Discogs token=${token}` } }
  )
  if (!res.ok) return null
  const data = await res.json()
  const vg = data['Very Good Plus (VG+)']?.value
  if (vg) return `$${vg.toFixed(2)}`
  const good = data['Good (G)']?.value
  if (good) return `$${good.toFixed(2)}`
  return null
}
