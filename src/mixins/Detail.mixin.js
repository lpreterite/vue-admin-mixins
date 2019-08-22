import status from "./Status.mixin";
import loader from "./Loader.mixin";
import DirtyHandler from "./DirtyHandler.mixin";
export default function({
    model, // String
    form, // String
    schema = ()=>{ }, //Function
    validation = () => { }, //Function
    placeholder = () => { }, //Function
}){
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
            DirtyHandler()
        ],
        async mounted () {
            await this.$$refreshDetail(this.$route.params);
            this.$$watchers = [];
            Object.keys(this.sources.detail).forEach(field => {
                const watcher = this.$watch(`sources.${STATUS_NAME}.${field}`, (val, oldVal) => {
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
        beforeDestroy () {
            this.$$watchers.forEach(watcher=>watcher());
        },
        data() {
            const $model = this[`$${MODEL_NAME}`];
            const MODEL = this._MODELS[`${MODEL_NAME}`];
            const detail = schema(MODEL.schema.default()) || MODEL.schema.default()
            const _validation = validation(MODEL, this) || (MODEL.validation ? MODEL.validation($model) : {})
            const _placeholder = placeholder() || (MODEL.placeholder ? MODEL.placeholder() : {})
            return {
                options: {
                    validation: _validation,
                    placeholder: _placeholder,
                },
                sources: {
                    detail,
                },
                _continue: false
            }
        },
        methods: {
            $$onRefreshDetail(data){
                return data;
            },
            async $$refreshDetail(query) {
                if (query && query.id) {
                    this._continue = true;
                    const detail = await this.$$find(MODEL_NAME, query.id);
                    this.sources.detail = await this.$$onRefreshDetail(detail);
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
                const result = await this.$$save(MODEL_NAME, { ...this.sources.detail, ...data });
                this.$$loaded(STATUS_NAME);
                return result;
            },
            async $$destroyDetail() {
                if(! await this.$$confirm('删除不可恢复，确认删除？')) return;
                this.$$loading(STATUS_NAME);
                await this.$$del(MODEL_NAME, this.sources.detail.id);
                this.$$loaded(STATUS_NAME);
            },
            $$onRestfulBefore(modelName, method) {
                if (modelName == MODEL_NAME){
                    this.$$loading(STATUS_NAME);
                }else{
                    this.$$loading(modelName);
                }
            },
            $$onRestfulSuccess(modelName, method) {
                if (modelName == MODEL_NAME){
                    if (['save'].indexOf(method) > -1){
                        this.tracker.isSaved = true;
                    }
                    if (['find'].indexOf(method) > -1) {
                        this.tracker.isNew = false;
                    }
                    this.$$loaded(STATUS_NAME);
                } else {
                    this.$$loaded(modelName);
                }
            },
            $$onRestfulError(modelName, method, err) {
                if (modelName == MODEL_NAME){
                    this.$$loaded(STATUS_NAME);
                } else {
                    this.$$loaded(modelName);
                }
                this.$$error(err);
            }
        }
    }
}