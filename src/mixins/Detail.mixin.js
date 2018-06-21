import status from "./Status.mixin";
import loader from "./Loader.mixin";
import LeaveBlock from "./LeaveBlock.mixin";
export default function ({
    model,
    form,
    schema,
    validation,
    placeholder,
}) {
    const MODEL_NAME = model;
    const STATUS_NAME = "detail";
    return {
        mixins: [
            loader(STATUS_NAME),
            status('tracker')([
                'isDirty',
                'isSaved',
                { name: 'validated', default() { return true; } },
                { name: 'isNew', default() { return true; } }
            ]),
            LeaveBlock()
        ],
        mounted() {
            this.$$refreshDetail(this.$route.params);
            this.$$watchers = [];
            Object.keys(this.detail).forEach(field => {
                const watcher = this.$watch(`${STATUS_NAME}.${field}`, (val, oldVal) => {
                    if (this._continue) return;
                    if (val !== oldVal && !this.tracker.isDirty) {
                        this.tracker.isDirty = true;
                    }
                });
                this.$$watchers.push(watcher);
            });
        },
        beforeRouteUpdate(to, from, next) {
            this.$$refreshDetail(to.params);
            next();
        },
        beforeDestroy() {
            this.$$watchers.forEach(watcher => watcher());
        },
        data() {
            schema = !!schema ? schema : (detail) => { return detail; };
            const detail = schema(this[`$${MODEL_NAME}`].schema());
            validation = !!validation ? validation : () => this.$$Models[`${MODEL_NAME}`].validation();
            placeholder = !!placeholder ? placeholder : () => this[`$${MODEL_NAME}`].placeholder();
            return {
                detail,
                placeholder: placeholder(),
                validation: validation(),
                _continue: false
            }
        },
        methods: {
            $$onRefreshDetail(data) {
                return data;
            },
            async $$refreshDetail(query) {
                if (query && query.id) {
                    this._continue = true;
                    const detail = await this.$$find(MODEL_NAME, query.id);
                    this.detail = this.$$onRefreshDetail(detail);
                    this.$nextTick(() => {
                        this._continue = false;
                    });
                }
            },
            async $$saveDetail(data) {
                const validate = await this.$refs[form].validate();
                if (!validate) {
                    this.$$warning('表单验证不通过，请继续填写。');
                    return Promise.reject(new Error('表单验证不通过，请继续填写。'));
                }
                this.$$loading(STATUS_NAME);
                const result = await this.$$save(MODEL_NAME, { ...this.detail, ...data });
                this.$$loaded(STATUS_NAME);
                return result;
            },
            async $$destroyDetail() {
                if (! await this.$$confirm('删除不可恢复，确认删除？')) return;
                this.$$loading(STATUS_NAME);
                await this.$$del(MODEL_NAME, this.detail.id);
                this.$$loaded(STATUS_NAME);
            },
            $$onRestfulBefore(modelName, method) {
                if (modelName != MODEL_NAME) return;
                this.$$loading(STATUS_NAME);
            },
            $$onRestfulSuccess(modelName, method) {
                if (modelName != MODEL_NAME) return;
                if (['save'].indexOf(method) > -1) {
                    this.tracker.isSaved = true;
                }
                if (['find'].indexOf(method) > -1) {
                    this.tracker.isNew = false;
                }
                this.$$loaded(STATUS_NAME);
            },
            $$onRestfulError(modelName, method, err) {
                if (modelName != MODEL_NAME) return;
                this.$$loaded(STATUS_NAME);
                this.$$error(err);
            }
        }
    }
}