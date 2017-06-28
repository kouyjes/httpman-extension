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
            binding.value.text = '';
            el.editor = new JSONEditor(el, options);
        }
    };
    Vue.directive('json-editor',jsonEditor);
})(Vue);