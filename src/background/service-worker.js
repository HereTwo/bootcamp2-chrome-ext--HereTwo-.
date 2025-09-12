chrome.runtime.onInstalled.addListener((details)=>{
  console.log('Note Saver instalado. Detalhes:',details);
  chrome.storage.local.set({installedAt:Date.now()});
  chrome.alarms.create('heartbeat',{periodInMinutes:1});
});

chrome.alarms.onAlarm.addListener((alarm)=>{
  if(alarm.name==='heartbeat'){
    console.log('Heartbeat alarm:',new Date().toISOString());
  }
});

chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg&&msg.type==='PING'){
    sendResponse({ok:true,time:new Date().toISOString()});
  }
});
