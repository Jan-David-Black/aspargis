const publicVapidKey = 'BN1rZgnIUhURBJGNVVbLHUp2LMzfrKtPDfvP9QgNUzu1oBnFPLPLrOjKaNDry44Pzv0uD_YI4KAiqmQawoMHcr4';

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
} 

export function subscribe(){
    return navigator.serviceWorker.ready.then((sw)=>
        sw.pushManager.getSubscription().then((sub)=>{
            if(sub){return {sub:sub, new:false}}
            return sw.pushManager.subscribe({
                userVisibleOnly: true,
                //public vapid key
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            }).then((sub)=>({sub:sub, new:true}));
        })
    )
}