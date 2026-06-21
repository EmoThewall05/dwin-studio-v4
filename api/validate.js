export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { key } = req.body || {};
  if (!key) return res.status(400).json({ valid: false, error: 'No key provided' });

  try {
    const supaRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/emo_keys?key=eq.${encodeURIComponent(key)}&select=key,identifier`,
      { headers: { apikey: process.env.SUPABASE_ANON_KEY || '', Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}` } }
    );
    const data = await supaRes.json();
    if (Array.isArray(data) && data.length > 0) {
      return res.status(200).json({ valid: true, identifier: data[0].identifier });
    }
    return res.status(200).json({ valid: false, error: 'Invalid Emo Key' });
  } catch (err) {
    return res.status(200).json({ valid: false, error: 'Validation failed' });
  }
}
