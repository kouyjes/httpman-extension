(function () {
    HttpResponse.prototype.fill = function (option) {
        if (option.token !== this.token) {
            return;
        }
        var _ = this;
        var data = option.data, request = option.request, xhr = option.xhr,
            startTime = option.startTime, endTime = option.endTime;
        var url = request.url;
        var _headers = [];
        var headerString = xhr.getAllResponseHeaders();
        var contentTypeValue = null;
        if (headerString) {
            headerString.split(/\n/).forEach(function (str) {
                str = str.trim();
                if (!str) {
                    return;
                }
                var index = str.indexOf(':');
                var name = str.slice(0, index);
                name = name.trim();
                var value = str.slice(index + 1);
                _headers.push({
                    name: name,
                    value: value
                });
                name = name.toLowerCase();
                if(name === 'content-type'){
                    contentTypeValue = value.trim();
                }
            });
        }

        HttpResponse.contentTypes.some(function (type) {
            if(type.value === contentTypeValue){
                this.contentType = type;
                return true;
            }
        }.bind(this));

        JsRuntime.getAllCookies(url).then(function (cookies) {
            var _cookies = [];
            cookies.map(function (cookie) {
                if (!cookie.name) {
                    return;
                }
                _cookies.push({
                    name: cookie.name,
                    value: cookie.value,
                    path: cookie.path,
                    domain: cookie.domain
                });
            });

            _.text = JSON.stringify(data);
            _.cookies = _cookies;
            _.headers = _headers;

            _.abstract = {
                statusCode: xhr.status,
                statusText: xhr.statusText,
                cost: (endTime - startTime) + 'ms'
            };
        });
    };


    HttpRequest.prototype.template = function () {
        var headers = {};
        this.headers.forEach(function (header) {
            if (header.name && header.value) {
                headers[header.name] = header.value;
            }
        });
        var option = {
            method: this.method,
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            headers: headers,
            cookies: [].concat(this.cookies),
            url: this.url,
            contentType: this.contentType.value,
            processData: false
        };
        return option;
    };
    HttpRequest.prototype.build = function () {
        var method = this[this.method];
        if (!method) {
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
        if (this.contentType.name === 'Multipart') {
            option.contentType = false;
            option.data = this.body.getFormData();
        } else if (this.contentType.name === 'Json') {
            option.data = this.body.toJson();
        } else {
            option.contentType = false;
            option.data = this.body.serializeArray();
        }
        return option;
    };
    HttpRequest.prototype._send = function (option) {
        return new Promise(function (resolve, reject) {
            $.ajax(option).then(function (data, state, xhr) {
                resolve.call(this, arguments);
            }, function () {
                reject.call(this, arguments);
            });
        });
    };
    HttpRequest.prototype.send = function () {
        var option = this.build();
        var _ = this;
        return JsRuntime.removeAllCookies(option.url).then(function () {
            return JsRuntime.addAllCookies(option.url, option.cookies);
        }).then(function () {
            return _._send(option);
        }.bind(this));
    };
})();