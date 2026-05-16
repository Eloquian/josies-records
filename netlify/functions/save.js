export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const record = await req.json()
  const spreadsheetId = process.env.SPREADSHEET_ID
  const sheetName = process.env.SHEET_NAME || 'Catalogue'
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON

  if (!serviceAccountJson) {
    return new Response(JSON.stringify({ error: 'Google credentials not configured' }), { status: 500 })
  }

  let serviceAccount
  try {
    serviceAccount = JSON.parse(serviceAccountJson)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid Google credentials' }), { status: 500 })
  }

  // Get Google OAuth token using service account JWT
  const token = await getGoogleToken(serviceAccount)

  // Build the row — order matches sheet headers
  const timestamp = new Date().toISOString()
  const row = [
    timestamp,
    record.artist || '',
    record.title || '',
    record.label || '',
    record.catalogueNo || '',
    record.year || '',
    record.country || '',
    record.format || '',
    record.speed || '',
    record.genre || '',
    record.style || '',
    record.source || '',
    record.sourceId || '',
    record.sourceUrl || '',
    record.estimatedValue || '',
    record.condition || '',
    record.notes || '',
  ]

  const sheetsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:Q:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row]
      })
    }
  )

  if (!sheetsRes.ok) {
    const err = await sheetsRes.text()
    return new Response(JSON.stringify({ error: `Sheets error: ${err}` }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function getGoogleToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const jwt = await signJWT(header, payload, serviceAccount.private_key)

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    })
  })

  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    throw new Error(`Token error: ${JSON.stringify(tokenData)}`)
  }
  return tokenData.access_token
}

async function signJWT(header, payload, privateKeyPem) {
  const encoder = new TextEncoder()

  const b64url = obj => btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const signingInput = `${b64url(header)}.${b64url(payload)}`

  // Import the private key
  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signingInput)
  )

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  return `${signingInput}.${sigB64}`
}
