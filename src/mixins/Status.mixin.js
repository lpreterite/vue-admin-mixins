export default function (stateName) {
    if(typeof stateName === 'undefined') throw Error('The stateName is required in Status.mixin')
    return function (opts) {
        if (typeof opts === 'undefined') {
            opts = { defaults: function () { return false } };
        }
        if (opts.constructor === Array) {
            const attrs = ['defaults', ...opts];
            opts = {};
            attrs.forEach(attr => {
                if (typeof attr === 'string') {
                    opts[attr] = function () { return false };
                } else {
                    opts[attr.name] = function () { return attr.default };
                }
            });
        }
        return {
            data() {
                const status = {};
                status[stateName] = {};
                const attrs = { ...this.attrs, [stateName]: opts };
                Object.keys(opts).forEach(attr => status[stateName][attr] = opts[attr]());
                return { status, attrs };
            },
            computed: {
                [stateName]() {
                    return this.status[stateName];
                }
            }
        };
    }
}