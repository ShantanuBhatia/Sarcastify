browser.contextMenus.create({
    id: "sponge-mock",
    title: "Sarcastify",
    contexts: ["selection"],
});
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sponge-mock") {
        // Mixed-case version of highlighted text
        const text = sarcastify(info.selectionText);
        

        // clipboard-helper.js defines function copyToClipboard.
        const code = "copyToClipboard(" +
            JSON.stringify(text) + ");";

        browser.tabs.executeScript({
            code: "typeof copyToClipboard === 'function';",
        }).then((results) => {
            // The content script's last expression will be true if the function
            // has been defined. If this is not the case, then we need to run
            // clipboard-helper.js to define function copyToClipboard.
            if (!results || results[0] !== true) {
                return browser.tabs.executeScript(tab.id, {
                    file: "clipboard-helper.js",
                });
            }
        }).then(() => {
            return browser.tabs.executeScript(tab.id, {
                code,
            });
        }).catch((error) => {
            // This could happen if the extension is not allowed to run code in
            // the page, for example if the tab is a privileged page.
            console.error("Failed to copy text: " + error);
        });
    }
});



/*
Go through the text and randomly decide whether to change a letter to uppercase or not. 
If you go too many letters without changing one, change it and THEN move on
*/
const sarcastify = (text) => {
    const threshold = 0.4;
    const max_consec_lower = 4;
    let sarcastic = "";
    let consec_lower = 0;
    for(let i=0; i< text.length; i++) {
        if(consec_lower == max_consec_lower) {
            sarcastic += text[i].toUpperCase();
            consec_lower = 0;
        } else {
            if(Math.random() > threshold){
                sarcastic += text[i].toUpperCase();
                consec_lower = 0;
            } else {
                sarcastic += text[i];
                consec_lower++;
            }
        }
    }
    return sarcastic;
}
