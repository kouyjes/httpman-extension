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
    function HttpRequestBody(){
        this.object = {};
        this.params = [];
        this.files = [];
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
        this.files.forEach(function (fileItem) {
            formData.append(fileItem.name,fileItem.value);
        });
        this.params.forEach(function (param) {
            formData.append(param.name,param.value);
        });
        return formData;
    };
    function HttpRequest(httpRequest){
        this.method = HttpRequest.config.methods[0];
        this.url = '';
        this.headers = {};
        this.contentType = HttpRequest.config.contentTypes[0];
        this.body = new HttpRequestBody();
        if(httpRequest){
            Object.assign(this,httpRequest);
        }
    }
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
    HttpRequest.prototype.template = function () {
        var option = {
            method : this.method,
            xhrFields: {
                withCredentials: true
            },
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
        method.call(this);
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
    return HttpRequest;
})();