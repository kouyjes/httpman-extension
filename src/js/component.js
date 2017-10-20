var test = [];
(function (Vue) {
    var loadingGridComp = {
        render: function (createElement) {
            var nodes = [];
            for (var i = 1; i <= 9; i++) {
                nodes.push(createElement('div', {
                    attrs: {
                        'class': 'sk-cube'
                    }
                }));
            }
            return createElement('div', {
                attrs: {
                    'class': 'loading-grid'
                }
            }, nodes);
        },
        props: {
            loading: {
                type: Boolean
            }
        }
    };
    var loadingCircleComp = {
        render: function (createElement) {
            var nodes = [];
            for (var i = 1; i <= 3; i++) {
                nodes.push(createElement('div', {
                    attrs: {
                        'class': 'sk-child'
                    }
                }));
            }
            return createElement('div', {
                attrs: {
                    'class': 'loading-circle'
                }
            }, nodes);
        },
        props: {
            loading: {
                type: Boolean
            }
        }
    };
    var responseView = {
        template: '#response-view',
        props: ['response'],
        data: function () {
            return {
                viewType:'View'
            };
        },
        methods:{
            setView: function () {
                this.viewType = 'View';
            },
            setSource: function () {
                this.viewType = 'Source';
            }
        }
    };
    var fileComp = {
        template: '#file-upload',
        props: ['value'],
        methods: {
            onClick: function () {
                this.$refs.fileInput.click();
            },
            onFileChange: function () {
                var fileInput = this.$refs.fileInput;
                var files = fileInput.files;
                if (files.length === 0) {
                    return;
                }
                var param = {};
                var file = files[0];
                param.type = 'file';
                param.caption = fileInput.value || file.name;
                param.value = file;

                this.$emit('change', param);
                test.push(param);

            }
        }
    };
    Vue.component('loading-grid', loadingGridComp);
    Vue.component('loading-circle', loadingCircleComp);
    Vue.component('response-view', responseView);
    Vue.component('file-upload', fileComp);
})(Vue);