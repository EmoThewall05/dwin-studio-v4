export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, provider } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    let output = "";

    // GEMINI
    if (provider === "gemini") {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await r.json();
      output =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No Gemini response";
    }

    // OPENAI
    else if (provider === "openai") {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await r.json();
      output =
        data?.choices?.[0]?.message?.content ||
        "No OpenAI response";
    }

    return res.status(200).json({
      provider,
      output
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
