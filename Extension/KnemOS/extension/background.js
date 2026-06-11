const HOST="com.knemos.native";

async function sendToNative(payload){

    if(!chrome.runtime.sendNativeMessage){
        console.warn(
            "Native Messaging unavailable"
        );

        return {
            status:"fallback"
        };
    }

    return chrome.runtime.sendNativeMessage(
        "com.knemos.native",
        payload
    );
}

chrome.tabs.onUpdated.addListener(async(tabId,changeInfo,tab)=>{
  if(changeInfo.status==="complete"){
    sendToNative({
      type:"tab_update",
      tabId,
      url:tab.url,
      title:tab.title,
      ts:Date.now()
    });
  }
});

chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg.type==="page_content"){
    sendToNative(msg).then(r=>sendResponse(r));
    return true;
  }
});