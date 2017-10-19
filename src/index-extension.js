var opened = false;
var panel = 0;
var _width = Math.round(screen.width * 0.65),
    _height = Math.round(screen.height * 0.65),
    _left = Math.round((screen.width - _width) / 2),
    _top = Math.round((screen.height - _height) /2);

function createPanel(){
    if (opened === false){
        opened = true;
        chrome.windows.create({
            url: 'html/panel.html',
            type: 'popup',
            focused: true,
            top:_top,
            left:_left,
            width: _width,
            height: _height
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

