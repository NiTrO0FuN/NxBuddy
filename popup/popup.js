// Online status toggle
const onlineStatusLabel = document.getElementById("onlineStatus").children[0];
const onlineStatusToggle = document.getElementById("onlineStatus").getElementsByTagName("input")[0];

onlineStatusLabel.innerText = chrome.i18n.getMessage("toggleOnlineStatus");
onlineStatusToggle.oninput = async function () {
  chrome.permissions.request({ origins: ["*://nxserv.gg/*"] });
  chrome.storage.local.set({ onlineStatus: this.checked });
};

chrome.storage.local.get("onlineStatus").then((r) => {
  if (r.onlineStatus) {
    onlineStatusToggle.checked = r.onlineStatus;
  }
});

// ImgBB hosting
const apiKeyLabel = document.getElementById("imgbb").children[0].children[0];
const apiKeyInput = document.getElementById("imgbb").children[0].children[1];
const ImgBBLabel = document.getElementById("imgbb").children[1].children[0];
const ImgBBToggle = document.getElementById("imgbb").children[1].getElementsByTagName("input")[0];

apiKeyLabel.innerText = chrome.i18n.getMessage("apiKey");
apiKeyInput.placeholder = chrome.i18n.getMessage("apiKey_placeholder");
apiKeyInput.oninput = function () {
  if (isAPIkeyValid(this.value) || this.value === "") {
    chrome.storage.local.set({ apiKey: this.value });
  }
};

ImgBBLabel.innerText = chrome.i18n.getMessage("toggleImgBB");
ImgBBToggle.oninput = function () {
  chrome.storage.local.set({ imgbb: this.checked });
};

chrome.storage.local.get(["apiKey", "imgbb"]).then((r) => {
  if (r.apiKey) {
    apiKeyInput.value = r.apiKey;
    if (isAPIkeyValid(r.apiKey)) {
      ImgBBToggle.disabled = false;
    }
  }
  if (r.imgbb) {
    ImgBBToggle.checked = r.imgbb;
  }
});

// Color changer

const primaryColorToggleLabel = document.getElementById("colorChanger").children[0].children[0];
const primaryColorToggle = document.getElementById("colorChanger").children[0].getElementsByTagName("input")[0];
const primaryColorInputLabel = document.getElementById("colorChanger").children[1].children[0];
const primaryColorInput = ColorPicker(document.getElementById("primaryColor"), function (_, hsv) {
  chrome.storage.local.set({ primaryColor: hsv });
});

primaryColorToggleLabel.innerText = chrome.i18n.getMessage("primaryColorToggleLabel");
primaryColorToggle.oninput = async function () {
  chrome.storage.local.set({ wantTheme: this.checked });
};

primaryColorInputLabel.innerText = chrome.i18n.getMessage("primaryColorLabel");

chrome.storage.local.get(["wantTheme", "primaryColor"]).then((r) => {
  if (r.wantTheme) {
    primaryColorToggle.checked = r.wantTheme;
  }
  if (r.primaryColor) {
    primaryColorInput.setHsv(r.primaryColor);
  }
});

function isAPIkeyValid(key) {
  return /^[a-zA-Z0-9]{32}$/.test(key);
}

// Storage listener
chrome.storage.local.onChanged.addListener(function (changes) {
  if (changes.apiKey) {
    if (isAPIkeyValid(changes.apiKey.newValue)) {
      ImgBBToggle.disabled = false;
    } else {
      ImgBBToggle.checked = false;
      chrome.storage.local.set({ imgbb: false });
      ImgBBToggle.disabled = true;
    }
  }
});
