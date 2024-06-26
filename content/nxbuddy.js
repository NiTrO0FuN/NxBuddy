const onlineStatusCache = {};

function checkOnlineStatus(sid64) {
  if (!onlineStatusCache[sid64] || Date.now() - onlineStatusCache[sid64].lastUpdate > 10 * 1000) {
    //Update cache if >10sec old
    onlineStatusCache[sid64] = { status: fetch("/api/online/" + sid64).then((r) => r.json()), lastUpdate: Date.now() };
  }

  return onlineStatusCache[sid64].status;
}

function connectedIndicator(node) {
  if (node.nodeName !== "DIV") return;

  // Thread posts
  if (node.classList.contains("forum-post")) {
    const avatar_wrapper = node.getElementsByClassName("poster-area-avatar-wrapper")[0];
    const sid = avatar_wrapper.href.split("/").pop();
    if (!sid || sid === document.URL.split("/").pop()) return; //Me or moderator
    checkOnlineStatus(sid).then((status) => {
      avatar_wrapper.children[0].classList.add((status === "Offline" ? "dis" : "") + "connected");
    });
  }

  // Forum threads
  else if (node.classList.contains("forum-thread")) {
    const threadBodies = node.getElementsByClassName("forum-thread-body");

    for (const threadBody of threadBodies) {
      const sid = threadBody.getElementsByTagName("span")[threadBody.getElementsByTagName("span").length - 1].title;
      if (!sid || sid === "415950607") continue;
      checkOnlineStatus(sid).then((status) => {
        threadBody.getElementsByTagName("img")[0].classList.add((status === "Offline" ? "dis" : "") + "connected");
      });
    }
  }
}

function checkForAvatars() {
  const nodes = [...document.getElementsByClassName("forum-post"), ...document.getElementsByClassName("forum-thread")];
  for (const node of nodes) {
    connectedIndicator(node);
  }
}

function changeTheme(primaryColor) {
  const h = primaryColor.h;
  const l = primaryColor.v - (primaryColor.v * primaryColor.s) / 2;
  const s = Math.min(l, 1 - l) ? (primaryColor.v - l) / Math.min(l, 1 - l) : 0;
  document.body.style.setProperty("--primary-color", `hsl(${h} ${s * 100} ${l * 100})`);
  document.body.style.setProperty("--secondary-color", `hsl(${h} ${s * 100} ${l * 70})`);
  document.body.style.setProperty("--hover-color", `hsl(${h} ${s * 100} ${l * 120})`);
}

var wantOnlineStatus = false;
var wantAutoUpload = false;
chrome.storage.local.get(["onlineStatus", "imgbb", "wantTheme", "primaryColor"]).then((r) => {
  if (r.onlineStatus) {
    wantOnlineStatus = r.onlineStatus;
  }
  if (r.imgbb) {
    wantAutoUpload = r.imgbb;
  }
  if (r.wantTheme) {
    document.body.classList.add("themed");
  }
  if (r.primaryColor) {
    changeTheme(r.primaryColor);
  }
});

let lastUrl = location.href;

const observer = new MutationObserver((mutations) => {
  if (location.href != lastUrl) {
    lastUrl = location.href;
    // Report buddy
    if (lastUrl == "https://nxserv.gg/forum/category/2/create") {
      addReportBuddy();
    }
  }
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      // Quick online visualisator
      if (wantOnlineStatus) {
        mutation.addedNodes.forEach((addedNode) => {
          connectedIndicator(addedNode);
        });
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  observer.observe(document.body, { childList: true, subtree: true });

  if (lastUrl == "https://nxserv.gg/forum/category/2/create") {
    addReportBuddy();
  }

  document.body.addEventListener("drop", (e) => {
    e.preventDefault();
    const target = e.target;
    if (target.tagName !== "TEXTAREA" || !e.dataTransfer.files.length) {
      return;
    }
    for (file of e.dataTransfer.files) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64string = reader.result.split(",")[1];
        uploadImage(base64string).then((r) => {
          if (r.status === 400) {
            target.addAtCaret(chrome.i18n.getMessage("wrongAPIkey"));
          } else if (r.status === 200) {
            target.addAtCaret(`[img]${r.url}[/img]`);
          }
        });
      };
    }
  });

  document.body.addEventListener("dragover", (e) => {
    if (wantAutoUpload) {
      e.preventDefault();
    }
  });
});

chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.onlineStatus) {
    wantOnlineStatus = changes.onlineStatus.newValue;
    if (wantOnlineStatus) {
      checkForAvatars();
    } else {
      location.reload();
    }
  }
  if (changes.imgbb) {
    wantAutoUpload = changes.imgbb.newValue;
  }
  if (changes.wantTheme) {
    if (changes.wantTheme.newValue) document.body.classList.add("themed");
    else document.body.classList.remove("themed");
  }
  if (changes.primaryColor) {
    changeTheme(changes.primaryColor.newValue);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message === "onlineStatus" && wantOnlineStatus) {
    checkForAvatars();
  } else if (message === "searchBuddy" && document.URL === "https://nxserv.gg/forum") {
    setTimeout(addSearchBuddy);
  }
});
