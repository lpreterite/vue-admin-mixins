import state from './Status.mixin';
export default function (...subs) {
    subs = subs || [];
    return {
        mixins: [
            state('loader')(subs),
        ],
        data() {
            subs = ['defaults'].concat(subs);
            const loader = {};
            subs.forEach(sub => loader[sub] = false);

            return {
                status: { loader }
            }
        },
        methods: {
            $$loading(sub = "defaults") {
                this.status.loader[sub] = true;
            },
            $$loaded(sub = "defaults") {
                this.status.loader[sub] = false;
            }
        },
        computed: {
            loader() {
                return this.status.loader;
            }
        }
    };
};