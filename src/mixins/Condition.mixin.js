import Fecha from "admin/utils/type/Fecha"

export default function (options) {
    options = { search: { fields: [] }, format: "YYYY-MM-DD HH:mm:ss", ...options }

    const __defaults = (fields) => fields.reduce((result, fieldset) => {
        if (['Search'].indexOf(fieldset.type) > -1) return result
        const fieldName = fieldset.name
        result[fieldName] = typeof fieldset.default === 'undefined' ? (typeof fieldset.type === 'function' ? fieldset.type() : "") : fieldset.default
        return result
    }, {})

    return {
        data() {
            return {
                conditions: {
                    attrs: options.condition,
                    values: __defaults(options.condition)
                }
            }
        },
        methods: {
            $$updateCondition(query) {
                // console.log(this.conditions.values, query)
                this.conditions.values = { ...this.conditions.values, ...query }
            },
            $$parseCondition(query) {
                return Object.keys(query).reduce((result, fieldName) => {
                    const fieldset = options.condition.find(field => field.name == fieldName)
                    if (!fieldset) {
                        result[fieldName] = query[fieldName]
                    } else {
                        switch (typeof fieldset.type === 'function' ? fieldset.type.name : fieldset.type) {
                            case 'Date':
                                result[fieldName] = Fecha.format(query[fieldName], options.format)
                                break
                            case 'Daterange':
                                if (typeof fieldset.subs === 'undefined') {
                                    result[fieldName] = query[fieldName].map(date => Fecha.format(date, options.format))
                                } else {
                                    fieldset.subs.forEach(field => result[field] = Fecha.format(query[field], options.format))
                                }
                                break
                            // case 'Array':
                            //     result[fieldName] = query[fieldName] === "all" ? "" : query[fieldName]
                            //     break
                            case 'Search':
                                // search作为组合UI设定固不解析
                                break
                            default:
                                result[fieldName] = query[fieldName]
                                break
                        }
                    }
                    return result
                }, {})
            },
            $$serializeCondition(query) {
                const result = options.condition.reduce((result, fieldset) => {
                    const fieldName = fieldset.name
                    if (typeof query[fieldName] === 'undefined') return result
                    switch (typeof fieldset.type === 'function' ? fieldset.type.name : fieldset.type) {
                        case 'Date':
                            result[fieldName] = Fecha.parse(query[fieldName], options.format)
                            break
                        case 'Daterange':
                            if (typeof fieldset.subs === 'undefined') {
                                result[fieldName] = query[fieldName].map(date => Fecha.parse(date, options.format))
                            } else {
                                result[fieldName] = fieldset.subs.map(field => Fecha.parse(query[field], options.format))
                            }
                            break
                        // case 'Array':
                        //     result[fieldName] = query[fieldName] === '' ? "all" : query[fieldName]
                        //     break
                        case 'Search':
                            // search作为组合UI设定固不解析
                            break
                        default:
                            result[fieldName] = query[fieldName]
                            break
                    }
                    return result
                }, {})
                return { ...query, result }
            }
        }
    }
}