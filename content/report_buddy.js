//Get or update rules
let rules = {}
chrome.storage.local.get("rules").then(async r => {
    let storedRules = r.rules
    if(!storedRules || (Date.now() - storedRules.lastUpdate > 1*60*60*1000)) {
        storedRules = {lastUpdate: Date.now()}
        storedRules.darkrp = await fetchRules("darkrp")
        storedRules.ttt = await fetchRules("ttt")
        chrome.storage.local.set({rules: storedRules})
    }
    rules = storedRules
})

async function fetchRules(serverType) {
    const newRules = {}
    let parser = new DOMParser();
    const result = await (await fetch("https://nxserv.gg/help/rules/"+serverType)).text()
    const rules_html = parser.parseFromString(result, "text/html");
    const sectionsDiv = rules_html.getElementsByClassName("gamerules")[0].querySelectorAll(":scope > div")

    for(const sectionDiv of sectionsDiv) {
        const sectionName = sectionDiv.getElementsByTagName("h2")[0].innerText
        const sectionRules = {}
        const subSectionsDiv = sectionDiv.querySelectorAll(":scope > div")
        for(const subSectionDiv of subSectionsDiv) {
            const subSectionName = subSectionDiv.getElementsByTagName("h3")[0].innerText
            const subSectionRules = []
            for(const rule_html of subSectionDiv.querySelectorAll(":scope > ol > li")) {
                subSectionRules.push(rule_html.innerText)
            }
            sectionRules[subSectionName] = subSectionRules
        }
        newRules[sectionName] = sectionRules
    }
    return newRules
}

function writeReportTemplate(serverType, dialog, brokenRules) {
    if(serverType === "darkrp"){writeDarkRPReportTemplate(dialog, brokenRules)}
    else if(serverType === "ttt"){writeTTTReportTemplate(dialog, brokenRules)}
}

function writeDarkRPReportTemplate(dialog, brokenRules) {
    const tabs = document.getElementsByClassName("react-tabs")[0]

    const title = document.querySelector("input[name='title']")
    if(title.value!=chrome.i18n.getMessage("report_title")){title.addAtCaret(chrome.i18n.getMessage("report_title"))}

    let brokenRulesQuotes = []
    for(const section in brokenRules) {
        for(const subSection in brokenRules[section]) {
            let brokenRulesText = ""
            for(const ruleNbr in brokenRules[section][subSection]) {
                if(!brokenRules[section][subSection][ruleNbr]) {continue}
                brokenRulesText += `\n${parseInt(ruleNbr)+1}. ${rules.darkrp[section][subSection][ruleNbr]}`
            }
            if(brokenRulesText == ""){continue}
            brokenRulesQuotes.push(`[h1]${section}[/h1]\n[b]${subSection}[/b]\n${brokenRulesText}`)
        }
    }

    let brokenRulesToPrint = ""
    for(const quote of brokenRulesQuotes) {
        brokenRulesToPrint += `[quote]${quote}[/quote]\n`
    }


    const report =
`[h1]${chrome.i18n.getMessage("report_rpname")}:[/h1]\n
[h1]${chrome.i18n.getMessage("report_steamid")}:[/h1]\n
[h1]${chrome.i18n.getMessage("report_date")}:[/h1]\n${chrome.i18n.getMessage("dateString", new Date().toLocaleString().split(" "))}\n
[h1]${chrome.i18n.getMessage("report_location")}:[/h1]\n
[h1]${chrome.i18n.getMessage("report_brokenrules")}:[/h1]\n${brokenRulesToPrint}[h1]${chrome.i18n.getMessage("report_proofs")}:[/h1]\n
`

    const textarea = tabs.getElementsByTagName("textarea")[0]
    if(textarea) {textarea.addAtCaret(report)} 

    dialog.close()
}

function writeTTTReportTemplate(dialog, brokenRules) {
    const tabs = document.getElementsByClassName("react-tabs")[0]

    const title = document.querySelector("input[name='title']")
    if(title.value!=chrome.i18n.getMessage("report_title")){title.addAtCaret(chrome.i18n.getMessage("report_title"))}

    let brokenRulesQuotes = []
    for(const section in brokenRules) {
        for(const subSection in brokenRules[section]) {
            let brokenRulesText = ""
            for(const ruleNbr in brokenRules[section][subSection]) {
                if(!brokenRules[section][subSection][ruleNbr]) {continue}
                brokenRulesText += `\n${parseInt(ruleNbr)+1}. ${rules.ttt[section][subSection][ruleNbr]}`
            }
            if(brokenRulesText == ""){continue}
            brokenRulesQuotes.push(`[h1]${section}[/h1]\n[b]${subSection}[/b]\n${brokenRulesText}`)
        }
    }

    let brokenRulesToPrint = ""
    for(const quote of brokenRulesQuotes) {
        brokenRulesToPrint += `[quote]${quote}[/quote]\n`
    }


    const report =
`[h1]${chrome.i18n.getMessage("report_name")}:[/h1]\n
[h1]${chrome.i18n.getMessage("report_steamid")}:[/h1]\n
[h1]${chrome.i18n.getMessage("report_date")}:[/h1]\n${chrome.i18n.getMessage("dateString", new Date().toLocaleString().split(" "))}\n
[h1]${chrome.i18n.getMessage("report_location")}:[/h1]\n
[h1]${chrome.i18n.getMessage("report_brokenrules")}:[/h1]\n${brokenRulesToPrint}[h1]${chrome.i18n.getMessage("report_proofs")}:[/h1]\n
`

    const textarea = tabs.getElementsByTagName("textarea")[0]
    if(textarea) {textarea.addAtCaret(report)} 

    dialog.close()
}

function askForBrokenRules(serverType) {
    const dialog = document.createElement("dialog")
    dialog.classList.add("brokenRules")

    const instructions = document.createElement("h1")
    instructions.innerText = chrome.i18n.getMessage("selectBrokenRules")
    dialog.appendChild(instructions)

    const brokenRules = {}
    for(const section in rules[serverType]) {
        brokenRules[section] = {}
        let title = document.createElement("h2")
        title.innerText = section
        dialog.appendChild(title)

        for(const subSection in rules[serverType][section]) {
            brokenRules[section][subSection] = {}
            title = document.createElement("h3")
            title.innerText = subSection
            dialog.appendChild(title)
            const oList = document.createElement("ol")
            rules[serverType][section][subSection].forEach((rule, i) => {
                const element = document.createElement("li")
                element.innerText = rule
                element.addEventListener("click", () => {
                    element.classList.toggle("selected")
                    brokenRules[section][subSection][i] = !brokenRules[section][subSection][i]
                })
                oList.appendChild(element)
            });
            dialog.appendChild(oList)
        }
    }

  
    const validateDiv = document.createElement("div")
    validateDiv.classList.add("validate")
    const validateBtn = document.createElement("btn")
    validateBtn.className = "join button" //Hijacking nx styles
    validateBtn.innerText = chrome.i18n.getMessage("validate")
    validateBtn.addEventListener("click", () => writeReportTemplate(serverType, dialog, brokenRules))
    validateDiv.appendChild(validateBtn)
    dialog.appendChild(validateDiv)
    document.body.appendChild(dialog)

    dialog.showModal()
}

function addReportBuddy() {
    const form = document.getElementsByTagName("form")[0]
    const tabs = document.getElementsByClassName("react-tabs")[0]

    //Report buddy
    const reportBuddy = document.createElement("div")
    reportBuddy.classList.add("buddyLine")

    const icon = document.createElement("img")
    icon.src = chrome.runtime.getURL("icons/icon.png")
    icon.width = 32
    reportBuddy.appendChild(icon)

    const button_darkrp = document.createElement("btn")
    button_darkrp.classList.add("button")
    button_darkrp.innerText = chrome.i18n.getMessage("reportBuddyBtnDarkRP")
    button_darkrp.addEventListener("click", () => askForBrokenRules("darkrp"))
    reportBuddy.appendChild(button_darkrp)

    const button_ttt = document.createElement("btn")
    button_ttt.classList.add("button")
    button_ttt.innerText = chrome.i18n.getMessage("reportBuddyBtnTTT")
    button_ttt.addEventListener("click", () => askForBrokenRules("ttt"))
    reportBuddy.appendChild(button_ttt)

    form.insertBefore(reportBuddy, tabs)
    form.insertBefore(document.createElement("br"), tabs)
}