var opened = false;
var panel = 0;
function createPanel(){
    if (opened === false){
        opened = true;
        chrome.windows.create({
            url: 'html/panel.html',
            type: 'popup',
            focused: true,
            top:300,
            left:500,
            width: 1500,
            height: 600
        }, function(window) {
            panel = window.id;
        });
    }else if (opened === true) {
        chrome.windows.update(panel, {focused: true});
    }
}

function removePanel(windowId){
    if (windowId == panel) {
        panel = 0;
        opened = false
    }
    return false;
}
chrome.browserAction.onClicked.addListener(createPanel);
chrome.windows.onRemoved.addListener(removePanel);

