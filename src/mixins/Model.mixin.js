export default function ({ contact, models }) {
    return {
        beforeCreate() {
            models.forEach(Model => {
                const modelName = Model.ModelName;
                this[`$${modelName}`] = new Model({ contact });
            })
        },
        methods: {
            $$onRestfulBefore(modelName, method) {

            },
            $$onRestfulSuccess(modelName, method) {

            },
            $$onRestfulError(modelName, method, err) {
                this.$$error(err);
            },
            $$fetch(MODEL_NAME, query) {
                const $model = this[MODEL_NAME];
                if (!$model) return Promise.reject(`The ${MODEL_NAME} model is not find!`);
                this.$$onRestfulBefore(MODEL_NAME, 'fetch');
                return $model
                    .fetch(query)
                    .then(
                        result => {
                            this.$$onRestfulSuccess(MODEL_NAME, 'fetch');
                            return result;
                        }
                    ).catch(err => {
                        this.$$onRestfulError(MODEL_NAME, 'fetch', err);
                    });
            },
            $$find(MODEL_NAME, id) {
                const $model = this[MODEL_NAME];
                if (!$model) return Promise.reject(`The ${MODEL_NAME} model is not find!`);
                this.$$onRestfulBefore(MODEL_NAME, 'find');
                return $model
                    .find(id)
                    .then(
                        result => {
                            this.$$onRestfulSuccess(MODEL_NAME, 'find');
                            return result;
                        }
                    )
                    .catch(err => {
                        this.$$onRestfulError(MODEL_NAME, 'find', err);
                    });
            },
            $$save(MODEL_NAME, data) {
                const $model = this[MODEL_NAME];
                if (!$model) return Promise.reject(`The ${MODEL_NAME} model is not find!`);
                this.$$onRestfulBefore(MODEL_NAME, 'save');
                return $model
                    .save(data)
                    .then(
                        result => {
                            this.$$onRestfulSuccess(MODEL_NAME, 'save');
                            return result;
                        }
                    )
                    .catch(err => {
                        this.$$onRestfulError(MODEL_NAME, 'save', err);
                    });
            },
            $$del(MODEL_NAME, id) {
                const $model = this[MODEL_NAME];
                if (!$model) return Promise.reject(`The ${MODEL_NAME} model is not find!`);
                this.$$onRestfulBefore(MODEL_NAME, 'delete');
                return $model
                    .delete(id)
                    .then(
                        result => {
                            this.$$onRestfulSuccess(MODEL_NAME, 'delete');
                            return result;
                        }
                    )
                    .catch(err => {
                        this.$$onRestfulError(MODEL_NAME, 'delete', err);
                    });
            },
        },
    }
}