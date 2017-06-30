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
                    binding.value = el.editor.get();
                },
                onError: function (err) {

                },
                onModeChange: function (newMode, oldMode) {

                }
            };
            el.editor = new JSONEditor(el, options,binding.value);
        }
    };
    var fileSelect = {
        inserted: function (el,binding,vNode) {
            var fileInput = el.querySelector('input[type="file"]');
            var param = binding.value;
            fileInput.addEventListener('change', function () {
                var files = fileInput.files;
                if(files.length === 0){
                    return;
                }
                var file = files[0];
                param.type = 'file';
                param.caption = fileInput.value || file.name;
                param.value = file;
            });
            el.addEventListener('click', function () {
                el.querySelector('input[type="file"]').click();
            });
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
    Vue.directive('file-select',fileSelect);
    Vue.directive('title-desc',titleDesc);
    Vue.directive('iframe-html',iframeHtml);
})(Vue);