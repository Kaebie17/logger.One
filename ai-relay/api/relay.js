// Generic CORS-bypass relay for Logger.One's "Generate Exercise via AI"
// feature. OpenAI/Gemini/Perplexity's APIs reject direct browser requests
// (they never set Access-Control-Allow-Origin for arbitrary origins, by
// design -- server-to-server calls aren't subject to CORS at all, so this
// function does the exact same fetch from here instead, and relays the
// response back with its own, origin-locked CORS headers so Logger.One's
// browser code can call THIS instead of the provider directly.
//
// This never stores anything: the browser supplies its own endpoint,
// headers (including the Authorization/x-api-key with the user's own key),
// and request body on every call -- it's a pure pass-through, not a
// hosted account or a stored key of any kind.
const ALLOWED_ORIGIN = "https://kaebie17.github.io";

// Restricting to these four hosts specifically (rather than relaying to
// any URL the caller names) closes the "open proxy" abuse case -- CORS
// origin-locking above only stops OTHER WEBSITES' browser JS from using
// this; it does nothing against a direct curl/script hitting this URL, so
// this allowlist is what actually limits what such a request could be
// used for.
const ALLOWED_HOSTS = [
    "api.openai.com",
    "generativelanguage.googleapis.com",
    "api.anthropic.com",
    "api.perplexity.ai",
];

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") { res.status(204).end(); return; }
    if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

    const { endpoint, headers, body } = req.body || {};
    if (!endpoint || typeof endpoint !== "string") {
        res.status(400).json({ error: "Missing 'endpoint'" });
        return;
    }

    let targetUrl;
    try { targetUrl = new URL(endpoint); }
    catch { res.status(400).json({ error: "Invalid endpoint URL" }); return; }

    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
        res.status(403).json({ error: `Host "${targetUrl.hostname}" is not an allowed AI provider` });
        return;
    }

    try {
        const upstream = await fetch(targetUrl.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(headers || {}) },
            body: JSON.stringify(body || {}),
        });
        const text = await upstream.text();
        res.status(upstream.status);
        res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
        res.send(text);
    } catch (e) {
        res.status(502).json({ error: "Upstream request failed", detail: String(e) });
    }
};
