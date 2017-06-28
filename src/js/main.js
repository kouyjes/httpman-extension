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
            response:{
                text:''
            }
        },
        methods:{
            selectMethod: function (method) {
                this.selection.method = method;
            },
            selectContentType: function (contentType) {
                this.selection.contentType = contentType;
            },
            addParam: function (param) {
                var body = this.selection.body;
                var p = {
                    name:'',
                    value:''
                };
                if(!param){
                    body.params.push(p);
                    return;
                }
                var index = body.params.indexOf(param);
                if(index >= 0){
                    body.params.splice(index + 1,0,p);
                }else{
                    body.params.push(p);
                }
            },
            removeParam: function (param) {
                var body = this.selection.body;
                var index = body.params.indexOf(param);
                if(index >= 0){
                    body.params.splice(index,1);
                }
            },
            send: function () {
                var selection = this.selection;
                var _ = this;
                _.status.loading = true;
                $.ajax(selection.build()).then(function (data) {
                    _.response.text = JSON.stringify(data);
                });
            }
        }
    });
});