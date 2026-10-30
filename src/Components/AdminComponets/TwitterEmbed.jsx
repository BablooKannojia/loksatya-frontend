// Twitter/X post embed ke helpers.
//
// FLOW (kyun aisa banaya):
//  1. Editor (Jodit) ke andar tweet ek "placeholder" blockquote (class
//     `tweet-embed-placeholder`) ke roop me rehta hai jisme visible link + label
//     hota hai. Isse editor me hamesha kuch dikhta hai, aur Twitter ka widgets.js
//     editor ke DOM ko kabhi touch nahi karta (widgets.js blockquote ko iframe se
//     replace kar deta hai, aur Jodit iframe ko strip kar deta hai => tweet gayab).
//  2. Preview / Publish ke time `toPublishHtml()` placeholder ko asli
//     `<blockquote class="twitter-tweet"><a href=...>` me badal deta hai (jo
//     public page `processDescription` aur widgets.js expect karte hain).
//  3. Edit ke time `toEditorHtml()` purane saved `twitter-tweet` blockquotes ko
//     wapas placeholder bana deta hai.
//
// NOTE: pehle `<a href="..."></a>` (khaali anchor) insert hota tha. Jodit ka
// cleanHTML `removeEmptyElements` khaali inline element ~300ms me hata deta hai,
// isliye blockquote khaali reh jaata tha aur tweet kabhi render nahi hota tha.

const TWEET_URL_REGEX =
  /^https?:\/\/(?:www\.|mobile\.)?(?:twitter|x)\.com\/([A-Za-z0-9_]+)\/status(?:es)?\/(\d+)/i;

const FULL_TWEET_URL_REGEX =
  /^https?:\/\/(?:www\.|mobile\.)?(?:twitter|x)\.com\/[A-Za-z0-9_]+\/status(?:es)?\/\d+(?:[?#]\S*)?\/?$/i;

const PLACEHOLDER_CLASS = "tweet-embed-placeholder";
const LABEL_CLASS = "tweet-embed-label";
const SCRIPT_ID = "twitter-widgets-js";

export function isValidTweetUrl(url) {
  return typeof url === "string" && TWEET_URL_REGEX.test(url.trim());
}

// Kisi bhi x.com / twitter.com status link ko canonical twitter.com form me laata hai
// (widgets.js ke liye sabse safe). Query string hata deta hai.
export function normalizeTweetUrl(url) {
  const m = String(url || "").trim().match(TWEET_URL_REGEX);
  return m ? `https://twitter.com/${m[1]}/status/${m[2]}` : null;
}

// Public (publish hone wala) markup — anchor ke andar text hai, khaali nahi.
export function buildTweetEmbedHtml(url) {
  const u = normalizeTweetUrl(url) || String(url || "").trim();
  return `<blockquote class="twitter-tweet"><a href="${u}">${u}</a></blockquote>`;
}

// Editor ke andar dikhne wala markup.
// Ye ek "atomic" (contenteditable=false) block hai: iska text edit nahi hota, isliye aadha
// kata hua link kabhi nahi bachta. Hatane ke liye "Remove" button ya poora block select karke
// Delete. Tweet ka link `data-tweet-url` me rehta hai — publish isi se banta hai.
const BOX_STYLE =
  "display:block;margin:12px 0;padding:10px 14px;border:1px solid #cfd9de;border-left:4px solid #0f1419;" +
  "border-radius:10px;background:#f7f9f9;color:#536471;font-size:14px;line-height:1.5;user-select:none;";
const REMOVE_STYLE = "float:right;margin-left:12px;color:#dc2626;font-weight:700;cursor:pointer;";

export function buildTweetEditorHtml(url) {
  const u = normalizeTweetUrl(url) || String(url || "").trim();
  return (
    `<div class="${PLACEHOLDER_CLASS}" contenteditable="false" data-tweet-url="${u}" style="${BOX_STYLE}">` +
    `<span data-tweet-remove="1" style="${REMOVE_STYLE}">\u2715 Remove</span>` +
    `<span class="${LABEL_CLASS}" style="display:block;font-weight:700;color:#0f1419;">\ud835\udd4f Post embed \u2014 publish/preview me asli tweet dikhega</span>` +
    `<a href="${u}" target="_blank" rel="noopener noreferrer" style="color:#1d9bf0;word-break:break-all;">${u}</a>` +
    `</div><p><br></p>`
  );
}

function findTweetUrlIn(el) {
  const anchors = Array.from(el.querySelectorAll("a[href]"));
  for (let i = anchors.length - 1; i >= 0; i--) {
    const n = normalizeTweetUrl(anchors[i].getAttribute("href"));
    if (n) return n;
  }
  const words = (el.textContent || "").split(/\s+/);
  for (const w of words) {
    const n = normalizeTweetUrl(w);
    if (n) return n;
  }
  return null;
}

// Editor HTML -> publish HTML
export function toPublishHtml(html) {
  if (typeof window === "undefined" || !html) return html || "";
  if (!/tweet-embed-placeholder|twitter\.com|x\.com/i.test(html)) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  // 1) Placeholder -> asli twitter-tweet blockquote.
  //    URL `data-tweet-url` se aata hai (user use edit nahi kar sakta). Purane/legacy placeholder
  //    me link se padhte hain. Placeholder ka label / Remove button publish me kabhi nahi jaata.
  body.querySelectorAll(`.${PLACEHOLDER_CLASS}`).forEach((el) => {
    const url = normalizeTweetUrl(el.getAttribute("data-tweet-url")) || findTweetUrlIn(el);
    if (!url) {
      // link nahi bacha => embed nahi banega
      if (el.tagName === "BLOCKQUOTE") {
        el.querySelectorAll(`.${LABEL_CLASS}, [data-tweet-remove]`).forEach((n) => n.remove());
        el.removeAttribute("class");
        el.removeAttribute("contenteditable");
        el.removeAttribute("style");
      } else {
        el.remove();
      }
      return;
    }
    const tpl = doc.createElement("template");
    tpl.innerHTML = buildTweetEmbedHtml(url);
    el.replaceWith(tpl.content);
  });

  // 2) Akela pada tweet URL (plain text ya link) => embed.
  //    Ek hi paragraph me kai URLs (line-by-line) ho to sab embed ho jaate hain.
  const candidates = body.querySelectorAll(
    `p, div, blockquote:not(.twitter-tweet):not(.${PLACEHOLDER_CLASS})`
  );
  candidates.forEach((el) => {
    if (!el.isConnected) return;
    if (el.closest("blockquote.twitter-tweet")) return;
    if (el.querySelector("p, div, blockquote, img, iframe, table, ul, ol, video")) return;

    const text = el.innerHTML
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .trim();
    if (!text) return;

    const tokens = text.split(/\s+/);
    if (tokens.length > 10 || !tokens.every((t) => FULL_TWEET_URL_REGEX.test(t))) return;

    const tpl = doc.createElement("template");
    tpl.innerHTML = tokens.map(buildTweetEmbedHtml).join("");
    el.replaceWith(tpl.content);
  });

  return body.innerHTML;
}

// Saved (publish) HTML -> editor HTML. Purane embeds edit ke time bhi safe rahenge.
export function toEditorHtml(html) {
  if (typeof window === "undefined" || !html) return html || "";
  if (!/twitter-tweet/i.test(html)) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body.querySelectorAll("script").forEach((s) => s.remove());
  doc.body.querySelectorAll("blockquote.twitter-tweet").forEach((bq) => {
    const url = findTweetUrlIn(bq);
    if (!url) return; // tweet link nahi mila => normal blockquote hi rehne do
    const tpl = doc.createElement("template");
    tpl.innerHTML = buildTweetEditorHtml(url).replace(/<p><br><\/p>$/, ""); // trailing khaali <p> yahan nahi
    bq.replaceWith(tpl.content);
  });
  return doc.body.innerHTML;
}

// Sirf diye gaye container ke tweets render karta hai (poore document ko nahi),
// taaki editor ka content kabhi na chhua jaaye.
export function renderTweetsIn(container) {
  if (typeof window === "undefined" || !container) return;

  const run = () => {
    try {
      window.twttr?.widgets?.load(container);
    } catch (e) {
      console.error("Tweet render failed:", e);
    }
  };

  if (window.twttr?.widgets) {
    run();
    return;
  }

  let script = document.getElementById(SCRIPT_ID);
  if (!script) {
    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);
  }
  script.addEventListener("load", () => {
    if (window.twttr?.ready) window.twttr.ready(run);
    else run();
  });
}

// Purana API (LiveNews form use karta hai) — ab optional container leta hai.
export function ensureTwitterWidgetsScript(container) {
  if (typeof window === "undefined") return;
  if (container) return renderTweetsIn(container);
  if (window.twttr && window.twttr.widgets) {
    window.twttr.widgets.load();
    return;
  }
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  document.body.appendChild(script);
}