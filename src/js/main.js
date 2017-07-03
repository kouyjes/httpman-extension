var appConsole = {
    name:'console',
    value:undefined
};
window.onerror = function (e) {
    appConsole.value = e.message;
};
$(function () {
    $.get('component.html').then(function (html) {
        $(document.body).append(html);
        initApp();
    });
    function initApp() {

        var mainApp = new Vue({
            el: '#app',
            data: {
                config: BaseHttp.config,
                console: appConsole,
                status: {
                    loading: false
                },
                selection: new HttpRequest(
                    {
                        url: 'http://'
                    }
                ),
                response: new HttpResponse()
            },
            methods: {
                selectMethod: function (method) {
                    this.selection.method = method;
                },
                selectContentType: function (contentType) {
                    this.selection.setContentType(contentType);
                },
                addItem: function (items, item) {
                    var itemObj = {
                        id: JsRuntime.getId(),
                        name: '',
                        value: ''
                    };
                    if (!item) {
                        items.push(itemObj);
                        return;
                    }
                    var index = items.indexOf(item);
                    if (index >= 0) {
                        items.splice(index + 1, 0, itemObj);
                    } else {
                        items.push(itemObj);
                    }
                },
                removeItem: function (items, item) {
                    var index = items.indexOf(item);
                    if (index >= 0) {
                        items.splice(index, 1);
                    }
                },
                addParam: function (param) {
                    this.addItem(this.selection.body.params, param);
                },
                removeParam: function (param) {
                    this.removeItem(this.selection.body.params, param);
                },
                addHeader: function (header) {
                    this.addItem(this.selection.headers, header);
                },
                removeHeader: function (header) {
                    this.removeItem(this.selection.headers, header);
                },
                fileChange: function (p, param) {
                    var params = this.selection.body.params;
                    param.type = p.type;
                    param.value = p.value;
                    param.caption = p.caption;
                    Vue.set(params, params.indexOf(param), param);
                },
                send: function () {
                    var selection = this.selection;
                    var _ = this;
                    _.response.reset();

                    var checkResult = selection.check();
                    if(!checkResult.result){
                        _.response.abstract.statusText = checkResult.message;
                        _.response.tabState = 'Console';
                        return;
                    }

                    _.status.loading = true;
                    var resultOption = {
                        token: _.response.token,
                        request: selection,
                        startTime: new Date()
                    };
                    selection.send().then(function (result) {
                        _.status.loading = false;
                        resultOption.data = result[0];
                        resultOption.xhr = result[2];
                        resultOption.endTime = new Date();
                        _.response.fill(resultOption);
                    }, function (result) {
                        _.status.loading = false;
                        resultOption.data = result[0].responseText;
                        resultOption.xhr = result[0];
                        resultOption.endTime = new Date();
                        _.response.fill(resultOption);
                        _.response.tabState = 'Console';
                    });

                }
            }
        });
    }
});