//Online status toggle
const onlineStatusLabel = document.getElementById("onlineStatus").children[0]
const onlineStatusToggle = document.getElementById("onlineStatus").getElementsByTagName("input")[0]

onlineStatusLabel.innerText = chrome.i18n.getMessage("toggleOnlineStatus")
onlineStatusToggle.oninput = function() {
    chrome.storage.local.set({onlineStatus: this.checked})
}

chrome.storage.local.get("onlineStatus").then(r => {
    if(r.onlineStatus) {onlineStatusToggle.checked = r.onlineStatus}
});


//ImgBB hosting
const apiKeyLabel = document.getElementById("imgbb").children[0].children[0]
const apiKeyInput = document.getElementById("imgbb").children[0].children[1]
const ImgBBLabel = document.getElementById("imgbb").children[1].children[0]
const ImgBBToggle = document.getElementById("imgbb").children[1].getElementsByTagName("input")[0]

apiKeyLabel.innerText = chrome.i18n.getMessage("apiKey")
apiKeyInput.placeholder = chrome.i18n.getMessage("apiKey_placeholder")
apiKeyInput.oninput = function() {
    if(isAPIkeyValid(this.value) || this.value === ""){chrome.storage.local.set({apiKey: this.value})}    
}

chrome.storage.local.get("apiKey").then(r => {
    if(r.apiKey) {
        apiKeyInput.value = r.apiKey;
        if(isAPIkeyValid(r.apiKey)) {ImgBBToggle.disabled = false}
    }
});

ImgBBLabel.innerText = chrome.i18n.getMessage("toggleImgBB")
ImgBBToggle.oninput = function() {
    chrome.storage.local.set({imgbb: this.checked})
}

chrome.storage.local.get("imgbb").then(r => {
    if(r.imgbb) {ImgBBToggle.checked = r.imgbb}
});


function isAPIkeyValid(key) {
    return /^[a-zA-Z0-9]{32}$/.test(key)
}

//Storage listener
chrome.storage.local.onChanged.addListener(function(changes) {
    if(changes.apiKey) {
        if(isAPIkeyValid(changes.apiKey.newValue)) {
            ImgBBToggle.disabled = false
        } else {
            ImgBBToggle.checked = false
            chrome.storage.local.set({imgbb: false})
            ImgBBToggle.disabled = true
        }
    }
})