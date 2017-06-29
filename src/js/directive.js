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
                    binding.value.object = el.editor.get();
                },
                onError: function (err) {

                },
                onModeChange: function (newMode, oldMode) {

                }
            };
            el.editor = new JSONEditor(el, options,binding.value.object);
        }
    };
    var fileSelect = {
        inserted: function (el,binding,vNode) {
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
    Vue.directive('json-editor',jsonEditor);
    Vue.directive('file-select',fileSelect);
    Vue.directive('title-desc',titleDesc);
})(Vue);