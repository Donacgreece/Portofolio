import { readdir, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { basename, join } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1");
const SITE = "https://donacgreece.github.io/Portofolio";
const locales = {
  en: {
    source: "content/blog/en", output: "docs/blog", lang: "en", locale: "en-US",
    blog: "Technical notes", intro: "Practical notes on infrastructure, monitoring, automation and software built for real operations.",
    home: "Portfolio", all: "All articles", search: "Search articles", empty: "No articles match your search.",
    read: "Read article", minute: "min read", latest: "Latest writing", language: "Ελληνικά", rss: "RSS feed",
    back: "Back to all articles", related: "More technical notes", author: "Dimitris Galatsanos · IT Systems Engineer",
  },
  gr: {
    source: "content/blog/gr", output: "docs/gr/blog", lang: "el", locale: "el-GR",
    blog: "Τεχνικές σημειώσεις", intro: "Πρακτικά κείμενα για υποδομές, monitoring, αυτοματισμούς και λογισμικό που υποστηρίζει πραγματικές λειτουργίες.",
    home: "Portfolio", all: "Όλα τα άρθρα", search: "Αναζήτηση άρθρων", empty: "Δεν βρέθηκαν άρθρα για αυτή την αναζήτηση.",
    read: "Διαβάστε το άρθρο", minute: "λεπτά ανάγνωσης", latest: "Πρόσφατα άρθρα", language: "English", rss: "Ροή RSS",
    back: "Επιστροφή στα άρθρα", related: "Περισσότερες τεχνικές σημειώσεις", author: "Δημήτρης Γαλατσάνος · Μηχανικός Συστημάτων Πληροφορικής",
  },
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function parseScalar(value) {
  const clean = value.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) return clean.slice(1, -1);
  if (clean === "true") return true;
  if (clean === "false") return false;
  if (clean.startsWith("[") && clean.endsWith("]")) return clean.slice(1, -1).split(",").map(item => parseScalar(item));
  return clean;
}

function parseDocument(source, slug) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Missing front matter in ${slug}`);
  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const field = lines[index].match(/^([\w-]+):\s*(.*)$/);
    if (!field) continue;
    const [, key, raw] = field;
    if (raw.trim()) data[key] = parseScalar(raw);
    else {
      const list = [];
      while (lines[index + 1]?.match(/^\s+-\s+/)) list.push(parseScalar(lines[++index].replace(/^\s+-\s+/, "")));
      data[key] = list;
    }
  }
  if (!data.title || !data.date || !data.excerpt) throw new Error(`Required metadata missing in ${slug}`);
  return { ...data, tags: Array.isArray(data.tags) ? data.tags : [], slug, body: match[2].trim() };
}

function safeUrl(url) {
  const value = String(url || "").trim();
  return /^(https?:\/\/|\/|\.\.?\/)/i.test(value) ? value : "#";
}

function inlineMarkdown(source) {
  let text = escapeHtml(source);
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => `<img src="${escapeHtml(safeUrl(url))}" alt="${alt}" loading="lazy">`);
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `<a href="${escapeHtml(safeUrl(url))}"${/^https?:/i.test(url) ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return text;
}

function markdown(source) {
  const lines = source.split(/\r?\n/);
  const output = [];
  let paragraph = [];
  let list = null;
  let code = null;
  const flushParagraph = () => { if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`); paragraph = []; };
  const flushList = () => { if (list) output.push(`<${list.type}>${list.items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`); list = null; };
  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph(); flushList();
      if (code) { output.push(`<pre><code>${escapeHtml(code.lines.join("\n"))}</code></pre>`); code = null; }
      else code = { lines: [] };
      continue;
    }
    if (code) { code.lines.push(line); continue; }
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); const level = heading[1].length; output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); continue; }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet || ordered) {
      flushParagraph(); const type = bullet ? "ul" : "ol";
      if (list && list.type !== type) flushList();
      list ||= { type, items: [] }; list.items.push((bullet || ordered)[1]); continue;
    }
    if (line.startsWith("> ")) { flushParagraph(); flushList(); output.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`); continue; }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    paragraph.push(line.trim());
  }
  flushParagraph(); flushList();
  if (code) output.push(`<pre><code>${escapeHtml(code.lines.join("\n"))}</code></pre>`);
  return output.join("\n");
}

function readingTime(body) { return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 210)); }
function formatDate(date, locale) { return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`)); }

function styles() {
  return `<style>
:root{--bg:#f5f5f1;--surface:#fff;--text:#17171a;--muted:#64657f;--line:#d9d9e9;--brand:#2427c9;--brand-dark:#171aa4;--brand-soft:#e4e5ff;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--sans:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--text);background:var(--bg);font-family:var(--sans);-webkit-font-smoothing:antialiased}a{color:inherit}.shell{width:min(calc(100% - 48px),1180px);margin:auto}.blog-nav{position:sticky;z-index:20;top:0;border-bottom:1px solid var(--line);background:rgba(245,245,241,.94);backdrop-filter:blur(16px)}.blog-nav .shell{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:20px}.blog-brand{color:var(--brand);font-weight:850;text-decoration:none;letter-spacing:-.03em}.blog-links{display:flex;align-items:center;gap:10px}.blog-button{display:inline-flex;min-height:40px;align-items:center;padding:0 14px;border:1px solid var(--brand);border-radius:8px;color:var(--brand);font:700 11px var(--mono);text-decoration:none}.blog-button.primary{color:#fff;background:var(--brand)}.blog-hero{padding:86px 0 68px;border-bottom:1px solid var(--line);background:radial-gradient(circle at 86% 14%,rgba(36,39,201,.12),transparent 25%)}.eyebrow{color:var(--brand);font:700 11px var(--mono);letter-spacing:.15em;text-transform:uppercase}.blog-hero h1{max-width:850px;margin:16px 0 22px;color:var(--brand);font-size:clamp(56px,8vw,108px);line-height:.88;letter-spacing:-.07em}.blog-hero p{max-width:700px;margin:0;color:var(--muted);font-size:19px;line-height:1.65}.blog-main{padding:68px 0 96px}.blog-tools{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:34px}.blog-tools h2{margin:0;color:var(--brand);font-size:clamp(30px,4vw,48px);letter-spacing:-.05em}.blog-search{width:min(100%,360px);min-height:46px;padding:0 16px;border:1px solid var(--line);border-radius:9px;background:var(--surface);font:600 14px var(--sans);outline:none}.blog-search:focus{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-soft)}.post-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.post-card{min-height:320px;display:flex;flex-direction:column;padding:28px;border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:0 12px 34px rgba(30,32,130,.06);transition:transform .18s,border-color .18s}.post-card:hover{transform:translateY(-4px);border-color:var(--brand)}.post-card.featured{grid-column:1/-1;min-height:360px;background:linear-gradient(135deg,var(--brand),var(--brand-dark));color:#fff}.post-meta{display:flex;flex-wrap:wrap;gap:9px;align-items:center;color:var(--muted);font:700 10px var(--mono);letter-spacing:.06em;text-transform:uppercase}.featured .post-meta{color:#cfd0ff}.post-category{padding:5px 8px;border:1px solid currentColor;border-radius:5px}.post-card h3{max-width:800px;margin:28px 0 14px;color:var(--brand);font-size:clamp(28px,4vw,46px);line-height:1;letter-spacing:-.05em}.featured h3{color:#fff;font-size:clamp(38px,5vw,64px)}.post-card p{max-width:760px;margin:0 0 28px;color:var(--muted);font-size:15px;line-height:1.65}.featured p{color:#e4e5ff;font-size:17px}.post-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:auto}.post-tag{padding:5px 8px;border-radius:5px;background:var(--brand-soft);color:var(--brand);font:700 10px var(--mono)}.featured .post-tag{background:rgba(255,255,255,.13);color:#fff}.post-link{margin-top:24px;color:var(--brand);font:800 12px var(--mono);text-decoration:none}.featured .post-link{color:#fff}.blog-empty{display:none;padding:50px;border:1px dashed var(--line);color:var(--muted);text-align:center}.article-hero{padding:72px 0 58px;border-bottom:1px solid var(--line)}.article-hero h1{max-width:980px;margin:20px 0;color:var(--brand);font-size:clamp(45px,7vw,82px);line-height:.95;letter-spacing:-.065em}.article-lead{max-width:760px;margin:0;color:var(--muted);font-size:19px;line-height:1.65}.article-layout{display:grid;grid-template-columns:minmax(0,760px) 220px;justify-content:center;gap:70px;padding:64px 0 100px}.article-body{font-size:18px;line-height:1.8}.article-body h2,.article-body h3,.article-body h4{margin:2em 0 .65em;color:var(--brand);line-height:1.12;letter-spacing:-.035em}.article-body h2{font-size:36px}.article-body h3{font-size:27px}.article-body p{margin:0 0 1.35em}.article-body ul,.article-body ol{margin:0 0 1.5em;padding-left:1.4em}.article-body li{margin:.45em 0}.article-body a{color:var(--brand);text-underline-offset:3px}.article-body code{padding:.16em .35em;border-radius:4px;background:var(--brand-soft);color:var(--brand-dark);font: .88em var(--mono)}.article-body pre{overflow:auto;margin:1.8em 0;padding:20px;border-radius:10px;color:#f5f5ff;background:#171aa4}.article-body pre code{padding:0;color:inherit;background:none}.article-body blockquote{margin:1.8em 0;padding:8px 0 8px 22px;border-left:4px solid var(--brand);color:var(--muted)}.article-body img{max-width:100%;height:auto;border-radius:12px}.article-aside{align-self:start;position:sticky;top:100px;padding:20px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}.article-aside b{display:block;margin-bottom:12px;color:var(--brand)}.article-aside span{display:block;margin:8px 0;color:var(--muted);font:12px/1.5 var(--mono)}.article-back{display:inline-flex;margin-bottom:18px;color:var(--brand);font:700 11px var(--mono);text-decoration:none}.blog-footer{padding:30px 0;border-top:1px solid var(--line);color:var(--muted);font:11px var(--mono)}.blog-footer .shell{display:flex;justify-content:space-between;gap:20px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:760px){.shell{width:min(calc(100% - 28px),1180px)}.blog-hero{padding:60px 0 50px}.blog-tools{align-items:stretch;flex-direction:column}.blog-search{width:100%}.post-grid{grid-template-columns:1fr}.post-card.featured{grid-column:auto}.article-layout{grid-template-columns:1fr;gap:30px;padding-top:42px}.article-aside{position:static;order:-1}.blog-footer .shell{flex-direction:column}.blog-links .rss-link{display:none}}
.post-cover{width:calc(100% + 56px);height:220px;object-fit:cover;margin:-28px -28px 24px;border-radius:16px 16px 0 0}.article-cover{width:min(calc(100% - 48px),1180px);max-height:580px;display:block;object-fit:cover;margin:44px auto 0;border-radius:16px}
</style>`;
}

function head({ title, description, canonical, lang, type = "website" }) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f5f1"><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="${type}"><meta property="og:image" content="${SITE}/og.png"><meta name="twitter:card" content="summary_large_image"><title>${escapeHtml(title)}</title><link rel="icon" href="${SITE}/favicon.svg" type="image/svg+xml">${styles()}</head>`;
}

function navigation(copy, depth, article = false) {
  const home = "../".repeat(depth);
  const other = copy.lang === "en" ? `${article ? "../../" : "../"}gr/blog/` : `${article ? "../../../" : "../../"}blog/`;
  const rss = copy.lang === "en" ? `${article ? "../../" : "../"}rss.xml` : `${article ? "../../" : "../"}rss.xml`;
  return `<nav class="blog-nav"><div class="shell"><a class="blog-brand" href="${home}">DG / ${escapeHtml(copy.blog)}</a><div class="blog-links"><a class="blog-button rss-link" href="${rss}">${copy.rss}</a><a class="blog-button" href="${other}">${copy.language}</a><a class="blog-button primary" href="${home}">${copy.home}</a></div></div></nav>`;
}

function footer(copy) { return `<footer class="blog-footer"><div class="shell"><span>© ${new Date().getUTCFullYear()} Dimitris Galatsanos</span><span>${copy.author}</span></div></footer>`; }

function card(post, copy) {
  const tags = post.tags.map(tag => `<span class="post-tag">${escapeHtml(tag)}</span>`).join("");
  const search = escapeHtml(`${post.title} ${post.excerpt} ${post.category} ${post.tags.join(" ")}`.toLocaleLowerCase(copy.locale));
  const cover = post.cover ? `<img class="post-cover" src="${escapeHtml(safeUrl(post.cover))}" alt="" loading="lazy">` : "";
  return `<article class="post-card${post.featured ? " featured" : ""}" data-search="${search}">${cover}<div class="post-meta"><span class="post-category">${escapeHtml(post.category || "Technology")}</span><time datetime="${escapeHtml(post.date)}">${formatDate(post.date, copy.locale)}</time><span>${readingTime(post.body)} ${copy.minute}</span></div><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p><div class="post-tags">${tags}</div><a class="post-link" href="${encodeURIComponent(post.slug)}/">${copy.read} →</a></article>`;
}

function indexPage(posts, copy) {
  const canonical = `${SITE}/${copy.lang === "en" ? "blog" : "gr/blog"}/`;
  return `${head({ title: `${copy.blog} | Dimitris Galatsanos`, description: copy.intro, canonical, lang: copy.lang })}<body>${navigation(copy, copy.lang === "en" ? 1 : 2)}<header class="blog-hero"><div class="shell"><span class="eyebrow">LOG / KNOWLEDGE BASE</span><h1>${copy.blog}</h1><p>${copy.intro}</p></div></header><main class="blog-main"><div class="shell"><div class="blog-tools"><h2>${copy.latest}</h2><label><span class="sr-only">${copy.search}</span><input class="blog-search" id="blogSearch" type="search" placeholder="${copy.search}…"></label></div><div class="post-grid" id="postGrid">${posts.map(post => card(post, copy)).join("")}</div><div class="blog-empty" id="blogEmpty"${posts.length ? "" : ' style="display:block"'}>${copy.empty}</div></div></main>${footer(copy)}<script>const search=document.getElementById('blogSearch');const cards=[...document.querySelectorAll('.post-card')];const empty=document.getElementById('blogEmpty');search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase(document.documentElement.lang);let shown=0;cards.forEach(card=>{const match=card.dataset.search.includes(q);card.hidden=!match;if(match)shown++});empty.style.display=shown?'none':'block'});</script></body></html>`;
}

function articlePage(post, posts, copy, translations) {
  const canonical = `${SITE}/${copy.lang === "en" ? "blog" : "gr/blog"}/${encodeURIComponent(post.slug)}/`;
  const translation = post.translation_key && translations.get(`${copy.lang === "en" ? "gr" : "en"}:${post.translation_key}`);
  const languageLink = translation ? (copy.lang === "en" ? `../../gr/blog/${encodeURIComponent(translation.slug)}/` : `../../../blog/${encodeURIComponent(translation.slug)}/`) : null;
  const suggestions = posts.filter(item => item.slug !== post.slug).slice(0, 2);
  const cover = post.cover ? `<img class="article-cover" src="${escapeHtml(safeUrl(post.cover))}" alt="">` : "";
  return `${head({ title: `${post.title} | Dimitris Galatsanos`, description: post.excerpt, canonical, lang: copy.lang, type: "article" })}<body>${navigation(copy, copy.lang === "en" ? 2 : 3, true)}<header class="article-hero"><div class="shell"><a class="article-back" href="../">← ${copy.back}</a><div class="post-meta"><span class="post-category">${escapeHtml(post.category || "Technology")}</span><time datetime="${escapeHtml(post.date)}">${formatDate(post.date, copy.locale)}</time><span>${readingTime(post.body)} ${copy.minute}</span></div><h1>${escapeHtml(post.title)}</h1><p class="article-lead">${escapeHtml(post.excerpt)}</p></div>${cover}</header><main class="shell article-layout"><article class="article-body">${markdown(post.body)}${suggestions.length ? `<h2>${copy.related}</h2>${suggestions.map(item => `<p><a href="../${encodeURIComponent(item.slug)}/">${escapeHtml(item.title)} →</a></p>`).join("")}` : ""}</article><aside class="article-aside"><b>${copy.author}</b><span>${formatDate(post.date, copy.locale)}</span><span>${readingTime(post.body)} ${copy.minute}</span>${languageLink ? `<a class="blog-button" href="${languageLink}">${copy.language}</a>` : ""}</aside></main>${footer(copy)}</body></html>`;
}

function rss(posts, copy) {
  const base = `${SITE}/${copy.lang === "en" ? "blog" : "gr/blog"}`;
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(copy.blog)}</title><link>${base}/</link><description>${escapeHtml(copy.intro)}</description><language>${copy.lang}</language>${posts.map(post => `<item><title>${escapeHtml(post.title)}</title><link>${base}/${encodeURIComponent(post.slug)}/</link><guid>${base}/${encodeURIComponent(post.slug)}/</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escapeHtml(post.excerpt)}</description></item>`).join("")}</channel></rss>`;
}

async function loadPosts(copy) {
  const directory = join(ROOT, copy.source);
  const files = (await readdir(directory)).filter(file => file.endsWith(".md"));
  const posts = await Promise.all(files.map(async file => parseDocument(await readFile(join(directory, file), "utf8"), basename(file, ".md"))));
  return posts.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.title.localeCompare(b.title, copy.locale));
}

const all = {};
const translations = new Map();
for (const [key, copy] of Object.entries(locales)) {
  all[key] = await loadPosts(copy);
  for (const post of all[key]) if (post.translation_key) translations.set(`${key}:${post.translation_key}`, post);
}

const sitemap = [];
for (const [key, copy] of Object.entries(locales)) {
  const output = join(ROOT, copy.output);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await writeFile(join(output, "index.html"), indexPage(all[key], copy));
  for (const post of all[key]) {
    const directory = join(output, post.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, "index.html"), articlePage(post, all[key], copy, translations));
    sitemap.push(`${SITE}/${key === "en" ? "blog" : "gr/blog"}/${post.slug}/`);
  }
  const rssPath = join(ROOT, key === "en" ? "docs/rss.xml" : "docs/gr/rss.xml");
  await mkdir(join(ROOT, key === "en" ? "docs" : "docs/gr"), { recursive: true });
  await writeFile(rssPath, rss(all[key], copy));
  sitemap.push(`${SITE}/${key === "en" ? "blog" : "gr/blog"}/`);
}
await writeFile(join(ROOT, "docs/sitemap-blog.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap.map(url => `<url><loc>${url}</loc></url>`).join("")}</urlset>`);
console.log(`Generated ${all.en.length} English and ${all.gr.length} Greek blog posts.`);
