export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, provider, system } = req.body;

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
            contents: [{ role: "user", parts: [{ text: system ? system + "\n\n" + prompt : prompt }] }]
          })
        }
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || `HTTP ${r.status}`);
      output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No Gemini response";
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
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || `HTTP ${r.status}`);
      output = data?.choices?.[0]?.message?.content || "No OpenAI response";
    }

    // ANTHROPIC
    else if (provider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2000,
          system: system || "",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || `HTTP ${r.status}`);
      output = data?.content?.[0]?.text || "No Anthropic response";
    }

    // GROK
    else if (provider === "grok") {
      const r = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROK_KEY}`
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt }
          ],
          max_tokens: 2000
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || `HTTP ${r.status}`);
      output = data?.choices?.[0]?.message?.content || "No Grok response";
    }

    // PERPLEXITY
    else if (provider === "perplexity") {
      const r = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.PERPLEXITY_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt }
          ],
          max_tokens: 2000
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || `HTTP ${r.status}`);
      output = data?.choices?.[0]?.message?.content || "No Perplexity response";
    }

    // GITHUB MODELS
    else if (provider === "github") {
      const r = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GITHUB_PAT}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || `HTTP ${r.status}`);
      output = data?.choices?.[0]?.message?.content || "No GitHub response";
    }

    // CLOUDFLARE
    else if (provider === "cloudflare") {
      const accountId = process.env.CF_ACCOUNT_ID || process.env.CLOUDFLARE_ID;
      if (!accountId) throw new Error("Cloudflare Account ID not configured");
      const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CLOUDFLARE_KEY}`
        },
        body: JSON.stringify({
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt }
          ],
          max_tokens: 2000
        })
      });
      const data = await r.json();
      if (!r.ok || !data.result) throw new Error(data.errors?.[0]?.message || `HTTP ${r.status}`);
      output = data.result.response || "No Cloudflare response";
    }

    else {
      return res.status(400).json({ error: "Unknown provider. Use: gemini, openai, anthropic, grok, perplexity, github, cloudflare" });
    }

    return res.status(200).json({ provider, output });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
