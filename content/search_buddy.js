const API_URL = "https://api.nitrofun.eu";

function create_thread_result(thread) {
  const threadNode = document.createElement("a");
  threadNode.href = "/forum/thread/" + thread.id;
  threadNode.classList.add("forum-thread-body", "search_result");

  const flag = document.createElement("img");
  flag.classList.add("server-flag");
  const lang = thread.language == "fr" ? "fr" : thread.language == "en" ? "us" : "ru";
  flag.src = `/static/flags43/${lang}.svg`;

  const threadName = document.createElement("span");
  threadName.innerText = thread.title;

  threadNode.appendChild(flag);
  threadNode.appendChild(threadName);

  return threadNode;
}

function purge_old_search(parent) {
  Array.from(parent.getElementsByClassName("forum-thread-body")).forEach((node) => node.remove()); // Copy to avoid removing while looping
}

async function validate_search_content(input, checkboxs, button, spinner) {
  const content = input.value;

  const languages = Array.from(checkboxs.getElementsByTagName("label")).reduce((lang_list, label) => {
    if (label.getElementsByTagName("input")[0].checked) lang_list.push(label.textContent);
    return lang_list;
  }, []);

  if (content.length < 3 || content.length > 200 || languages.length == 0) {
    input.classList.add("input-error");
    return [];
  }

  button.classList.add("hide");
  spinner.classList.remove("hide");

  const threadNodes = [];

  try {
    result = await search_content(content, languages);
    if (result.resultCount > 0) {
      result.threads.forEach((thread) => {
        threadNodes.push(create_thread_result(thread));
      });
    }
  } catch (error) {
    console.log(error);
  }

  button.classList.remove("hide");
  spinner.classList.add("hide");

  return threadNodes;
}

async function search_content(content, languages) {
  const request = new URL(API_URL);
  request.pathname = "/search";
  request.search = new URLSearchParams({ content: content, lang: languages.join("|") });
  response = await fetch(request);
  if (response.status == 200) {
    return await response.json();
  }
  throw new Error("Error fetching buddy API");
}

function addSearchBuddy() {
  const catlist = document.getElementsByClassName("catlist")[0];
  const parentDiv = catlist.parentElement;

  // Search buddy
  const searchBuddy = document.createElement("div");
  searchBuddy.classList.add("buddyLine");

  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL("icons/icon.png");
  icon.width = 32;
  searchBuddy.appendChild(icon);

  const search_input = document.createElement("input");
  search_input.classList.add("input");
  search_input.placeholder = chrome.i18n.getMessage("search_placeholder");
  search_input.addEventListener("focusin", () => search_input.classList.remove("input-error"));
  searchBuddy.appendChild(search_input);

  const search_languages = document.createElement("div");
  search_languages.style = "gap: 8px; display: flex";
  for (lang of ["EN", "RU", "FR"]) {
    const label = document.createElement("label");
    label.classList.add("checkbox");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = true;

    label.appendChild(input);
    label.appendChild(document.createElement("span"));
    label.append(lang);

    search_languages.appendChild(label);
  }
  searchBuddy.appendChild(search_languages);

  const search_button = document.createElement("btn");
  search_button.classList.add("button");
  search_button.innerText = chrome.i18n.getMessage("search");
  search_button.addEventListener("click", async () => {
    purge_old_search(parentDiv);
    for (node of await validate_search_content(search_input, search_languages, search_button, spinner)) {
      parentDiv.insertBefore(node, catlist);
    }
  });
  searchBuddy.appendChild(search_button);

  const spinner = document.createElement("div");
  spinner.classList.add("spinner", "smallspinner", "hide");
  const child1 = document.createElement("div");
  const child2 = document.createElement("div");
  child1.classList.add("double-bounce1");
  child2.classList.add("double-bounce2");
  spinner.appendChild(child1);
  spinner.appendChild(child2);
  searchBuddy.appendChild(spinner);

  parentDiv.insertBefore(searchBuddy, catlist);
  parentDiv.insertBefore(document.createElement("br"), catlist);
}
