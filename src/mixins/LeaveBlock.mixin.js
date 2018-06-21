export default function (options) {
    options = {
        isDirtyField: 'tracker.isDirty',
        isSavedField: 'tracker.isSaved',
        ...options
    };
    const { isDirtyField, isSavedField } = options;
    return {
        beforeRouteLeave(to, from, next) {
            if (this[isDirtyField] && !this[isSavedField]) {
                this.$$confirm(options).then(result => {
                    if (result) next();
                })
            } else {
                next();
            }
        },
        watch: {
            [isDirtyField](val) {
                if (val) {
                    window.onbeforeunload = function () { return ''; };
                } else {
                    window.onbeforeunload = function () { };
                }
            }
        }
    }
}