import state from './Status.mixin';
export default function (...subs) {
    subs = subs || [];
    return {
        mixins: [
            state('modal')(subs),
        ],
        data() {
            subs = ['defaults'].concat(subs);
            const modal = {};
            subs.forEach(sub => modal[sub] = false);

            return {
                status: { modal }
            }
        },
        methods: {
            $$show(sub = "defaults") {
                this.status.modal[sub] = true;
            },
            $$hide(sub = "defaults") {
                this.status.modal[sub] = false;
            }
        },
        computed: {
            modals() {
                return this.status.modal;
            }
        }
    }
}