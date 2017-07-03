function fixTwo(value){
    if(value < 10){
        return '0' + value;
    }
    return '' + value;
}
Date.prototype.toDetailString = function () {
    var result = [];
    result.push(this.getFullYear() + '-');
    result.push(fixTwo(this.getMonth() + 1) + '-');
    result.push(fixTwo(this.getDate()));
    result.push(' ');
    result.push(fixTwo(this.getHours()));
    result.push(':');
    result.push(fixTwo(this.getMinutes()));
    result.push(':');
    result.push(fixTwo(this.getSeconds()));
    return result.join('');
};
function MockTabs(){
}
MockTabs.prototype.executeScript = function () {
};
function MockChrome(){
    this.tabs = new MockTabs();
}
if(typeof chrome === 'undefined'){
    chrome = new MockChrome();
}
if(typeof chrome.downloads === 'undefined'){
    chrome.downloads = {};
}
if(typeof chrome.windows === 'undefined'){
    chrome.windows = {
        create: function () {
        },
        onRemoved:{
            addListener:null
        }
    };
}
var JsRuntime = {
    enabledClipboard:false
};
JsRuntime.notification = function (option) {
    if (!("Notification" in window)) {
        return;
    }
    else if (Notification.permission === "granted") {
        new Notification(option.title,option);
    }
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                new Notification(option.title,option);
            }
        });
    }
}
var windowCache = {};
var tabManager = {
    current:null
};
chrome.windows.onRemoved.addListener(function (windowId) {
    var keyId;
    Object.keys(windowCache).some(function (key) {
        if(windowCache[key].id === windowId){
            keyId = key;
            return true;
        }
    });
    if(keyId){
        delete windowCache[keyId];
    }
});
chrome.tabs.onRemoved.addListener(function(tabId){
    if(tabManager.current && tabManager.current.id === tabId){
        tabManager.current = null;
    }
});
chrome.windows.onFocusChanged.addListener(function(windowId){
    if(windowId < 0){
        return;
    }
    chrome.tabs.query({windowId:windowId,highlighted:true}, function(tabs){
        tabs.some(function (tab) {
            if(!tab.url.startsWith('chrome')){
                tabManager.current = tab;
            }
        });
    });
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if(!tab.url.startsWith('chrome')){
            tabManager.current = tab;
        }
    });
});
/*chrome.webRequest.onErrorOccurred.addListener(function (result) {
    alert(error);
});*/
JsRuntime.createWindow = function (url) {
    var win = windowCache[url];
    if(win){
        chrome.windows.update(win.id,{focused: true});
        return;
    }
    var width = screen.availWidth,height = screen.availHeight;
    var w = 1200,h = 800;
    var left  = (width - w)/2,top = (height - h)/2;
    chrome.windows.create({
            url: url,
            type:'popup',
            focused: true,
            left:left,
            top:top,
            width: 1200,
            height: 800
        },
        function(window) {
            windowCache[url] = window;
        });
};
JsRuntime.createTab = function (url) {
    chrome.tabs.create({
        url:url
    });
};
JsRuntime.getClipboardContent = function () {
    var input = $('#hidden-text-input');
    if(input.size() === 0){
        input = $('<input/>').css({
            width:0,
            height:0,
            border:'none',
            'font-size':0,
            padding:0,
            position:'absolute',
            top:0,
            left:0
        });
        $('body').append(input);
    }
    input.val('').trigger('focus');
    document.execCommand('paste');
    return input.val();
};
JsRuntime.getExecute = function (executor) {
    var params = ['(','',')','(',')',';'];
    if(typeof executor === 'function'){
        params[1] = executor.toString();
    }else{
        return JsRuntime.getExecute(function () {
           return executor;
        });
    }
    return params.join('');
};
JsRuntime.execute = function (executor,tabId) {
    var defer = jQuery.Deferred();
    tabId = tabId || (tabManager.current &&  tabManager.current.id);
    chrome.tabs.executeScript(tabId,
        {
            code:this.getExecute(executor),
            allFrames:true
        },
        function (datas) {
            var content = '';
            datas && datas.some(function (data) {
                if(data){
                    content = data;
                    return true;
                }
            });
            if(!content && JsRuntime.enabledClipboard){
                content = this.getClipboardContent();
            }
            defer.resolve(content);
        }.bind(this)
    );
    return defer.promise();
};
JsRuntime.getCurrentTabUrl = function () {
    return this.execute(function () {
        var href = window.location.href;
        return href;
    });
};
JsRuntime.getSelectContent = function (tabId) {
    return this.execute(function () {
        var selection = window.getSelection();
        return selection.toString();
    },tabId);
};
JsRuntime.download = function (content,filename,saveAs) {
    var defer = jQuery.Deferred();
    var blob = new Blob([content]);
    var url = URL.createObjectURL(blob);
    saveAs = saveAs === false?false:true;
    chrome.downloads.download({
         url:url,
         filename: filename,
         saveAs:saveAs,
         conflictAction:'overwrite'
     }, function () {
        defer.resolve();
     });
    return defer.promise();
};
JsRuntime.getAbsoluteUrl = function (url) {
    return chrome.runtime.getURL(url);
};
JsRuntime.setCookie = function (url,cookie) {
    return new Promise(function (resolve) {
        if(!cookie.name){
            resolve(cookie);
            return;
        }
        chrome.cookies.set({
            url:url,
            name:cookie.name,
            value:cookie.value,
            domain:cookie.domain,
            path:cookie.path
        }, function (d) {
            resolve(d);
        });
    });

};
JsRuntime.addAllCookies = function (url,cookies) {
    var promises = [];
    cookies.forEach(function (cookie) {
        promises.push(this.setCookie(url,cookie));
    }.bind(this));
    return Promise.all(promises);
};
JsRuntime.getAllCookies = function (url) {
    return new Promise(function (resolve,reject) {
        chrome.cookies.getAll({
            url:url
        }, function (cookies) {
            resolve(cookies || []);
        });
    });
};
JsRuntime.removeCookie = function (url,name) {
    return new Promise(function (resolve,reject) {
        chrome.cookies.remove({
            url:url,
            name:name
        }, function (d) {
            resolve(d);
        });
    });
};
JsRuntime.getId = function () {
    var id = 1;
    return function () {
        return id++;
    };
};
JsRuntime.removeAllCookies = function (url) {
    return this.getAllCookies(url).then(function (cookies) {
        var promises = [];
        cookies.forEach(function (cookie) {
            promises.push(this.removeCookie(url,cookie.name));
        }.bind(this));
        return  Promise.all(promises);
    }.bind(this));
};
