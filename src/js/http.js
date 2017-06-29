var BaseHttp = (function () {
    function BaseHttp(){
        this.tabs = ['Body','Headers','Cookies'];
        this.tabState = this.tabs[0];
    }
    BaseHttp.prototype.setTabState = function (tab) {
        this.tabState = tab;
    };
    return BaseHttp;
})();
var HttpResponse = (function () {
    function HttpResponse(response){
        BaseHttp.apply(this,arguments);
        if(response){
            Object.assign(this,response);
        }
        this.text = '';
        this.headers = [];
        this.cookies = [];
    }
    HttpResponse.prototype = Object.create(BaseHttp.prototype);
    return HttpResponse;
})();
var HttpHeaders = (function () {
    function HttpHeaders(headers){
        if(headers){
            Object.assign(this,headers);
        }
    }
    HttpHeaders.prototype.size = function () {
        return Object.keys(this).length;
    };
    return HttpHeaders;
})();
var HttpRequest = (function () {
    HttpRequest.config = {
        methods:['GET','POST','UPDATE','PUT','DELETE','OPTION'],
        contentTypes:[
            {
                name:'Json',
                caption:'Json',
                value:'application/json'
            },
            {
                name:'Urlencoded',
                caption:'Urlencoded',
                value:'application/x-www-form-urlencoded'
            },
            {
                name:'Multipart',
                caption:'Multipart',
                value:'multipart/form-data'
            }
        ]
    };
    function HttpRequestBody(body){

        if(body){
            Object.assign(this,body);
        }
        this.object = {};
        this.params = [];

    }
    HttpRequestBody.prototype.toJson = function () {
        return JSON.stringify(this.object);
    };
    HttpRequestBody.prototype.serializeArray = function () {
        var paramStrings = [];
        this.params.forEach(function (param) {
            if(!param.name){
                return;
            }
            paramStrings.push(param.name + '=' + param.value);
        });
        return paramStrings.join('&');
    };
    HttpRequestBody.prototype.getFormData = function () {
        var formData = new FormData();
        this.params.forEach(function (param) {
            formData.append(param.name,param.value);
        });
        return formData;
    };
    function HttpRequest(httpRequest){

        BaseHttp.apply(this,arguments);
        this.method = HttpRequest.config.methods[0];
        this.url = '';
        this.headers = [];
        this.cookies = [];
        this.contentType = HttpRequest.config.contentTypes[0];
        this.body = new HttpRequestBody();

        if(httpRequest){
            Object.assign(this,httpRequest);
        }
        if(!(this.body instanceof HttpRequestBody)){
            this.body = new HttpRequestBody(this.body);
        }
    }
    HttpRequest.prototype = Object.create(BaseHttp.prototype);
    HttpRequest.serializeArray = function (params) {
        var paramStrings = [];
        params.forEach(function (param) {
            if(!param.name){
                return;
            }
            paramStrings.push(param.name + '=' + param.value);
        });
        return paramStrings.join('&');
    };
    HttpRequest.prototype.setContentType = function (contentType) {
        if(['Urlencoded','Multipart'].indexOf(contentType.name) >= 0){
            Object.keys(this.body.object).forEach(function (key) {
                if(!key){
                    return;
                }
                var value = this.body.object[key];
                if(typeof value === 'string'){
                    this.body.params.push({
                        name:key,
                        value:value
                    });
                }
            }.bind(this));
            this.body.object = {};
        }else{
            this.body.params.forEach(function (param) {
                if(param.name && param.type !== 'file'){
                    this.body.object[param.name] = param.value;
                }
            }.bind(this));
            this.body.params = [];
        }

        this.contentType = contentType;
    };
    HttpRequest.prototype.template = function () {
        var headers = {};
        this.headers.forEach(function (header) {
            if(header.name && header.value){
                headers[header.name] = header.value;
            }
        });
        var option = {
            method : this.method,
            xhrFields: {
                withCredentials: true
            },
            headers:headers,
            cookies:[].concat(this.cookies),
            url : this.url,
            contentType : this.contentType.value
        };
        return option;
    };
    HttpRequest.prototype.build = function () {
        var method = this[this.method];
        if(!method){
            method = this['_default_'];
        }
        return method.call(this);
    };
    HttpRequest.prototype['_default_'] = function () {
        var option = this.template();
        return option;
    };
    HttpRequest.prototype['GET'] = function () {
        var option = this.template(this);
        option.data = this.body.serializeArray()
        return option;
    };
    HttpRequest.prototype['POST'] = function () {
        var option = this.template();
        if(this.contentType.name === 'Multipart' && this.body.files.length > 0){
            option.data = this.body.getFormData();
        }else if(this.contentType.name === 'Json'){
            option.data = this.body.toJson();
        }else{
            option.data = this.body.serializeArray();
        }
        return option;
    };
    HttpRequest.prototype._send = function (option) {
        return new Promise(function (resolve,reject) {
            $.ajax(option).then(function (data,state,xhr) {
                resolve.call(this,arguments);
            }, function () {
                reject.call(this,arguments);
            });
        });
    };
    HttpRequest.prototype.send = function () {
        var option = this.build();
        var _ = this;
        return JsRuntime.removeAllCookies(option.url).then(function () {
            return JsRuntime.addAllCookies(option.url,option.cookies);
        }).then(function () {
            return _._send(option);
        }.bind(this));
    };
    return HttpRequest;
})();