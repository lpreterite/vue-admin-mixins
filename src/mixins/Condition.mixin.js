import Schema from "datagent/src/classes/Schema.class"

export default function(options){
    options = {
        schema: { parse: {}, serialize: {} },
        ...options
    }

    options.schema.parse = new Schema(options.schema.parse || {})
    options.schema.serialize = new Schema(options.schema.serialize || {})

    return {
        data(){
            return {
                conditions: {
                    attrs: options.condition,
                    values: options.schema.serialize.default()
                }
            }
        },
        methods: {
            $$updateCondition(query){
                this.conditions.values = query
            },
            $$mergeCondition(query){
                this.conditions.values = { ...this.conditions.values, ...query }
            },
            $$initCondition(){
                this.conditions.values = options.schema.serialize.default()
            },
            $$parseCondition(query){
                return this.onConditionParsed(options.schema.parse.format(query))
            },
            $$serializeCondition(query){
                return this.onConditionSerialized(options.schema.serialize.format(query))
            },
            onConditionParsed(query){
                return query
            },
            onConditionSerialized(query){
                return query
            }
        }
    }
}