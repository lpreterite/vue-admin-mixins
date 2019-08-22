export default function ({ contact, models, origin = "develop" }) {
    return {
        beforeCreate() {
            this._MODELS = {};
            models.forEach(Model => {
                const modelName = Model.ModelName;
                this[`$${modelName}`] = new Model({ contact });
                this._MODELS[`${modelName}`] = Model;
            })
        },
        methods: {
            async $$active(MODEL_NAME, action, query, options = { origin }) {
                let result
                const $model = this[`$${MODEL_NAME}`];
                if (!$model) return Promise.reject(`The ${MODEL_NAME} model is empty!`);
                if (typeof $model[action] !== 'function') return Promise.reject(`The ${MODEL_NAME} model.${action} is not a function!`);
                const { query: _query, options: _options } = await this.$$onRequestBefore(MODEL_NAME, action, { query, options });
                this.$$onRestfulBefore(MODEL_NAME, action)
                try {
                    result = await $model[action](_query, _options)
                    await this.$$onRestfulSuccess(MODEL_NAME, action, result);
                } catch (err) {
                    result = err
                    this.$$onRestfulError(MODEL_NAME, action, err);
                }
                return result;
            },

            $$onRequestBefore(modelName, method, ctx) {
                return ctx;
            },
            $$onRestfulBefore(modelName, method, ctx) {
            },
            $$onRestfulSuccess(modelName, method) {

            },
            $$onRestfulError(modelName, method, err) {
                this.$$error(err);
            },
            $$fetch(MODEL_NAME, query, options = { origin }) {
                return this.$$active(MODEL_NAME, 'fetch', query, options);
            },
            $$find(MODEL_NAME, id, options = { origin }) {
                return this.$$active(MODEL_NAME, 'find', { id }, options);
            },
            $$save(MODEL_NAME, data, options = { origin }) {
                return this.$$active(MODEL_NAME, 'save', data, options);
            },
            $$del(MODEL_NAME, id, options = { origin }) {
                return this.$$active(MODEL_NAME, 'destroy', { id }, options);
            },


        },
    }
}
