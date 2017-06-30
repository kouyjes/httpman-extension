(function (Vue) {
    var jsonEditor = {
        inserted: function (el,binding,vNode) {
            var options = {
                mode: 'code',
                modes: ['code','tree','text'],
                onEditable: function (node) {
                    return true;
                },
                onChange: function () {
                    try{
                        binding.value = el.editor.get();
                    }catch(e){}

                },
                onError: function (err) {

                },
                onModeChange: function (newMode, oldMode) {

                }
            };
            el.editor = new JSONEditor(el, options,binding.value);
        }
    };
    var titleDesc = {
        inserted: function (el,binding,vNode) {
            if(el.placeholder){
                el.title = el.placeholder;
            }
        }
    };
    var iframeHtml = {
        _update: function (el,binding) {
            var doc = el.contentWindow.document;
            doc.open();
            doc.write(binding.value);
        },
        inserted: function (el,binding) {
            iframeHtml._update.apply(this,arguments);
        },
        update: function (el,binding) {
            iframeHtml._update.apply(this,arguments);
        }
    };
    Vue.directive('json-editor',jsonEditor);
    Vue.directive('title-desc',titleDesc);
    Vue.directive('iframe-html',iframeHtml);
})(Vue);