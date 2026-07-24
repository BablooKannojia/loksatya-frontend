// Twitter/X status URL ko validate + embed markup banane ke liye chhote helpers.
// Multiple tweets ek hi article me daalne ke liye bas alag-alag blockquote
// insert hote hain — widgets.js ek hi baar load hokar sabko render kar deta hai.

const TWEET_URL_REGEX =
  /^https?:\/\/(www\.)?(twitter|x)\.com\/[A-Za-z0-9_]+\/status\/\d+/i;

export function isValidTweetUrl(url) {
  return typeof url === "string" && TWEET_URL_REGEX.test(url.trim());
}

export function buildTweetEmbedHtml(url) {
  const cleanUrl = url.trim();
  return `<blockquote class="twitter-tweet"><a href="${cleanUrl}"></a></blockquote>`;
}

// Twitter ka widgets.js sirf ek baar load karta hai (agar pehle se load nahi hai),
// aur agar already loaded hai to naye blockquotes ko turant render karwa deta hai.
export function ensureTwitterWidgetsScript() {
  if (typeof window === "undefined") return;

  if (window.twttr && window.twttr.widgets) {
    window.twttr.widgets.load();
    return;
  }

  if (document.getElementById("twitter-widgets-js")) return;

  const script = document.createElement("script");
  script.id = "twitter-widgets-js";
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  document.body.appendChild(script);
}