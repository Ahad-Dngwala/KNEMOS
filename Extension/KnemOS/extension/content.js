chrome.runtime.sendMessage({
  type:"page_content",
  url:location.href,
  title:document.title,
  text:(document.body?.innerText || "").slice(0,50000)
});