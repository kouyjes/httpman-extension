(function (Vue) {
    var loadingGridComp = {
        render: function (createElement) {
            var nodes = [];
            for(var i = 1;i <= 9;i++){
                nodes.push(createElement('div',{
                    attrs:{
                        'class':'sk-cube'
                    }
                }));
            }
            return createElement('div',{
                attrs:{
                    'class':'loading-grid'
                }
            },nodes);
        },
        props:{
            loading:{
                type:Boolean
            }
        }
    };
    var loadingCircleComp = {
        render: function (createElement) {
            var nodes = [];
            for(var i = 1;i <= 3;i++){
                nodes.push(createElement('div',{
                    attrs:{
                        'class':'sk-child'
                    }
                }));
            }
            return createElement('div',{
                attrs:{
                    'class':'loading-circle'
                }
            },nodes);
        },
        props:{
            loading:{
                type:Boolean
            }
        }
    };
    var responseView = {
        template:'#response-view',
        props:['response']
    };
    Vue.component('loading-grid',loadingGridComp);
    Vue.component('loading-circle',loadingCircleComp);
    Vue.component('response-view',responseView);
})(Vue);