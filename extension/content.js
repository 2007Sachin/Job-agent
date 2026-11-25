const last = { at: 0 };

function field(selector) {
  const node = document.querySelector(selector);
  return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
}

function readPage() {
  return {
    title: field("[data-job-title], h1"),
    company: field("[data-job-company], .company, [class*='company']"),
    location: field("[data-job-location], .location, [class*='location']"),
    description: field("[data-job-description], .description, [class*='description']").slice(0, 4000),
    url: location.href,
  };
}

function button() {
  if (document.getElementById("job-agent-save")) return;
  const el = document.createElement("button");
  el.id = "job-agent-save";
  el.type = "button";
  el.textContent = "Save to Job-agent";
  el.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:2147483646;background:#1b6b3a;color:#f4fff6;border:0;border-radius:12px;padding:10px 14px;font:600 15px -apple-system,sans-serif;cursor:pointer";
  el.addEventListener("click", async () => {
    const now = Date.now();
    if (now - last.at < 5000) {
      el.textContent = "Wait a few seconds";
      return;
    }
    last.at = now;
    const stored = await chrome.storage.local.get(["token", "origin"]);
    if (!stored.token) {
      el.textContent = "Pair it in the popup first";
      return;
    }
    const origin = stored.origin || "http://127.0.0.1:3000";
    el.textContent = "Saving…";
    const res = await fetch(`${origin}/api/extension/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: stored.token, ...readPage() }),
    });
    el.textContent = res.ok ? "Saved. Open Find jobs." : "Could not save";
  });
  document.body.appendChild(el);
}

button();
