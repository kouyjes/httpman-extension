var BaseHttp = (function () {
    function BaseHttp(baseHttp) {
        this.tabs = ['Body', 'Headers', 'Cookies'];
        this.tabState = baseHttp && baseHttp.tabState ? baseHttp.tabState : this.tabs[0];
    }
    BaseHttp.config = {
        methods: ['GET', 'POST', 'UPDATE', 'PUT', 'DELETE', 'OPTION'],
        contentTypes: [
            {
                name: 'Json',
                caption: 'Json',
                value: 'application/json'
            },
            {
                name: 'Urlencoded',
                caption: 'Urlencoded',
                value: 'application/x-www-form-urlencoded'
            },
            {
                name: 'Multipart',
                caption: 'Multipart',
                value: 'multipart/form-data'
            }
        ]
    };
    BaseHttp.prototype.setTabState = function (tab) {
        this.tabState = tab;
    };
    BaseHttp.prototype.resetTabState = function () {
        this.tabState = this.tabs[0];
    };
    return BaseHttp;
})();
var HttpResponse = (function () {
    var responseContentTypes = [
        {
            name:'text',
            value:'application/text'
        },
        {
            name:'Json',
            value:'application/json'
        }
    ];
    function HttpResponse(response) {
        BaseHttp.apply(this, arguments);
        this.tabs = this.tabs.concat('Console');
        this.init();
        if (response) {
            Object.assign(this, response);
        }
    }
    HttpResponse.contentTypes = responseContentTypes;
    HttpResponse.prototype = Object.create(BaseHttp.prototype);
    HttpResponse.prototype.init = function () {
        this.token = JsRuntime.getId();
        this.contentType = HttpResponse.contentTypes[0];
        this.text = '';
        this.headers = [];
        this.cookies = [];
        this.abstract = {
            statusCode: undefined,
            statusText: undefined,
            cost: undefined
        };
    };
    HttpResponse.prototype.reset = function () {
        this.resetTabState();
        this.init();
    };
    return HttpResponse;
})();
var HttpHeaders = (function () {
    function HttpHeaders(headers) {
        if (headers) {
            Object.assign(this, headers);
        }
    }

    HttpHeaders.prototype.size = function () {
        return Object.keys(this).length;
    };
    return HttpHeaders;
})();
var HttpRequest = (function () {
    function HttpRequestBody(body) {
        this.object = {};
        this.params = [];
        if (body) {
            Object.assign(this, body);
        }
    }

    HttpRequestBody.prototype.toJson = function () {
        return JSON.stringify(this.object);
    };
    HttpRequestBody.prototype.serializeArray = function () {
        var paramStrings = [];
        this.params.forEach(function (param) {
            if (!param.name || param.type === 'file') {
                return;
            }
            paramStrings.push(param.name + '=' + param.value);
        });
        return paramStrings.join('&');
    };
    HttpRequestBody.prototype.getFormData = function () {
        var formData = new FormData();
        this.params.forEach(function (param) {
            formData.append(param.name, param.value);
        });
        return formData;
    };
    function HttpRequest(httpRequest) {

        BaseHttp.apply(this, arguments);
        this.method = BaseHttp.config.methods[0];
        this.url = '';
        this.headers = [];
        this.cookies = [];
        this.contentType = BaseHttp.config.contentTypes[0];
        this.body = new HttpRequestBody();

        if (httpRequest) {
            Object.assign(this, httpRequest);
        }
        if (!(this.body instanceof HttpRequestBody)) {
            this.body = new HttpRequestBody(this.body);
        }
    }

    HttpRequest.prototype = Object.create(BaseHttp.prototype);
    HttpRequest.prototype.check = function () {
        var urlReg = /^https?:\/{2}\w+.*/;
        if(!urlReg.test(this.url)){
            return {
                result:false,
                message:'Request url is invalid !'
            };
        }
        return {
            result:true
        };
    };
    HttpRequest.serializeArray = function (params) {
        var paramStrings = [];
        params.forEach(function (param) {
            if (!param.name) {
                return;
            }
            paramStrings.push(param.name + '=' + param.value);
        });
        return paramStrings.join('&');
    };
    HttpRequest.prototype.setContentType = function (contentType) {
        if (['Urlencoded', 'Multipart'].indexOf(contentType.name) >= 0) {
            if (contentType.name === 'Urlencoded') {
                this.body.params = this.body.params.filter(function (param) {
                    return param.type !== 'file';
                });
            }
            Object.keys(this.body.object).forEach(function (key) {
                if (!key) {
                    return;
                }
                var value = this.body.object[key];
                if (['string', 'number', 'boolean'].indexOf(typeof value) >= 0) {
                    this.body.params.push({
                        name: key,
                        value: '' + value
                    });
                }
            }.bind(this));
            this.body.object = {};
        } else {
            this.body.params.forEach(function (param) {
                if (param.name && param.type !== 'file') {
                    this.body.object[param.name] = param.value;
                }
            }.bind(this));
            this.body.params = [];
        }

        this.contentType = contentType;
    };
    return HttpRequest;
})();