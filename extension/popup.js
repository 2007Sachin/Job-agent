const token = document.getElementById("token");
const origin = document.getElementById("origin");
chrome.storage.local.get(["token", "origin"], (stored) => {
  token.value = stored.token || "";
  origin.value = stored.origin || "http://127.0.0.1:3000";
});
document.getElementById("save").addEventListener("click", () => {
  chrome.storage.local.set({ token: token.value.trim(), origin: origin.value.trim() || "http://127.0.0.1:3000" });
});
