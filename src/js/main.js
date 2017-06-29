$(function () {
    var mainApp = new Vue({
        el:'#app',
        data:{
            config:HttpRequest.config,
            status:{
                loading:false
            },
            selection:new HttpRequest(
                {
                    url:'http://172.24.65.164:8081'
                }
            ),
            response:new HttpResponse()
        },
        methods:{
            selectMethod: function (method) {
                this.selection.method = method;
            },
            selectContentType: function (contentType) {
                this.selection.setContentType(contentType);
            },
            addItem: function (items,item) {
                var itemObj = {
                    name:'',
                    value:''
                };
                if(!item){
                    items.push(itemObj);
                    return;
                }
                var index = items.indexOf(item);
                if(index >= 0){
                    items.splice(index + 1,0,itemObj);
                }else{
                    items.push(itemObj);
                }
            },
            removeItem: function (items,item) {
                var index = items.indexOf(item);
                if(index >= 0){
                    items.splice(index,1);
                }
            },
            addParam: function (param) {
                this.addItem(this.selection.body.params,param);
            },
            removeParam: function (param) {
                this.removeItem(this.selection.body.params,param);
            },
            addHeader: function (header) {
                this.addItem(this.selection.headers,header);
            },
            removeHeader: function (header) {
                this.removeItem(this.selection.headers,header);
            },
            send: function () {
                var selection = this.selection;
                var _ = this;
                _.status.loading = true;
                var option = selection.build();
                option.cookies.forEach(function (cookie) {
                    if(!cookie.name){
                        return;
                    }
                    chrome.cookies.set({
                        url:option.url,
                        name:cookie.name,
                        value:cookie.value,
                        domain:cookie.domain,
                        path:cookie.path
                    });
                });

                $.ajax(option).then(function (data,state,xhr) {
                    _.response.headers = [];
                    var headerString = xhr.getAllResponseHeaders();
                    if(headerString){
                        headerString.split(/\n/).forEach(function (str) {
                            str = str.trim();
                            if(!str){
                                return;
                            }
                            var index = str.indexOf(':');
                            var name = str.slice(0,index);
                            var value = str.slice(index + 1);
                            _.response.headers.push({
                                name:name,
                                value:value
                            });
                        });
                    }
                    _.response.text = JSON.stringify(data);


                    chrome.cookies.getAll({
                        url:option.url
                    }, function (cookies) {
                        console.log(cookies);
                    });
                });
            }
        }
    });
});