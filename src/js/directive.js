(function (Vue) {
    var jsonEditor = {
        inserted: function (el, binding, vNode) {
            var options = {
                mode: 'code',
                modes: ['code', 'tree', 'text'],
                onEditable: function (node) {
                    return true;
                },
                onChange: function () {
                    var object = null;
                    try {
                        object = el.editor.get();
                    } catch (e) {
                    }
                    if (object) {
                        binding.value.object = object;
                    }

                },
                onError: function (err) {

                },
                onModeChange: function (newMode, oldMode) {

                }
            };
            el.editor = new JSONEditor(el, options, binding.value.object);
            el.querySelector('.ace_text-input').onpaste = function () {
                el.editor.format();
            };
        }
    };
    var titleDesc = {
        inserted: function (el, binding, vNode) {
            if (el.placeholder) {
                el.title = el.placeholder;
            }
        }
    };
    var iframeHtml = {
        _update: function (el, binding) {
            var doc = el.contentWindow.document;
            doc.open();
            doc.write(binding.value);
        },
        inserted: function (el, binding) {
            iframeHtml._update.apply(this, arguments);
        },
        update: function (el, binding) {
            iframeHtml._update.apply(this, arguments);
        }
    };
    var jsonViewer = {
        _update: function (el,binding) {

            var jsonObject = null,
                value = binding.value;

            if(!value){
                return;
            }
            try{
                jsonObject = JSON.parse(value);
            }catch(e){
                console.error(e);
            }

            $(el).empty();
            if(jsonObject){
                $(el).jsonview(jsonObject);
            }else{
                $(el).append($('<span class="error-text"/>').text(value));
            }
        },
        inserted: function (el, binding) {
            jsonViewer._update.apply(this,arguments);
        },
        update: function (el, binding) {
            jsonViewer._update.apply(this,arguments);
        }
    };
    Vue.directive('json-editor', jsonEditor);
    Vue.directive('title-desc', titleDesc);
    Vue.directive('iframe-html', iframeHtml);
    Vue.directive('json-viewer', jsonViewer);
})(Vue);