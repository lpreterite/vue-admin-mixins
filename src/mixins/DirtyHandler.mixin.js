export default function(options){
    options = { content: '离开将丢失页面内容，确认 离开？', "ok-text": '确定离开', ...options }
    return {
        beforeRouteLeave(to, from, next) {
            if (this.tracker.isDirty && !this.tracker.isSaved) {
                this.$$confirm(options).then(result => {
                    if (!result) window.onbeforeunload = function () { }
                    next(result)
                })
            } else {
                window.onbeforeunload = function () { }
                next();
            }
        },
        watch: {
            ['tracker.isDirty'](val) {
                if (val) {
                    window.onbeforeunload = function () { return ''; };
                } else {
                    window.onbeforeunload = function () { };
                }
            }
        }
    }
}