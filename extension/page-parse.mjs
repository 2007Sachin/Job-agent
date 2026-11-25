function text(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
}

export function parseJobPage(html, url = "") {
  const title = text(html, /data-job-title[^>]*>([^<]+)/i)
    || text(html, /<h1[^>]*>([^<]+)/i);
  const company = text(html, /data-job-company[^>]*>([^<]+)/i)
    || text(html, /class="[^"]*company[^"]*"[^>]*>([^<]+)/i);
  const location = text(html, /data-job-location[^>]*>([^<]+)/i)
    || text(html, /class="[^"]*location[^"]*"[^>]*>([^<]+)/i);
  const description = text(html, /data-job-description[^>]*>([\s\S]*?)<\//i)
    || text(html, /class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\//i);
  return {
    title: title.slice(0, 160),
    company: company.slice(0, 160),
    location: location.slice(0, 160),
    description: description.slice(0, 4000),
    url: String(url).slice(0, 500),
  };
}
