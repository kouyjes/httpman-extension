$(function () {
    $.get('component.html').then(function (html) {
        $(document.body).append(html);
        initApp();
    });
    function initApp(){
        var mainApp = new Vue({
            el:'#app',
            data:{
                config:HttpRequest.config,
                status:{
                    loading:false
                },
                selection:new HttpRequest(
                    {
                        url:'http://'
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
                    _.response.reset();
                    var resultOption = {
                        token:_.response.token,
                        request:selection,
                        startTime:new Date()
                    };
                    selection.send().then(function (result) {
                        _.status.loading = false;
                        resultOption.data = result[0];
                        resultOption.xhr = result[2];
                        resultOption.endTime = new Date();
                        _.response.fill(resultOption);
                    }, function (result) {
                        _.status.loading = false;
                        resultOption.xhr = result[0];
                        resultOption.endTime = new Date();
                        _.response.fill(resultOption);
                    });

                }
            }
        });
    }
});