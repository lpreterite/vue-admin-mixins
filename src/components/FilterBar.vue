<template>
    <iv-form class="adm-filterbar" :model="conditions.values" inline>
        <iv-form-item
            v-for="fieldset in conditions.attrs"
            :prop="fieldset.name"
            :key="fieldset.name"
            v-if="!fieldset.hidden">
            <iv-input
                v-if="[Array,'Daterange','Date','Search'].indexOf(fieldset.type) == -1"
                v-model="conditions.values[fieldset.name]"
                :style="fieldset.style || {width: '120px'}">
                <span slot="prepend">{{ fieldset.title || fieldset.name }}</span>
            </iv-input>
            <iv-input
                v-if="['Search'].indexOf(fieldset.type) > -1"
                v-model="conditions.values[fieldset.search_by]"
                :style="fieldset.style || {width: '200px'}">
                <span slot="prepend">
                    <span v-if="!fieldset.subs">{{ fieldset.title || fieldset.name }}</span>
                    <iv-select
                        v-else
                        :style="fieldset.search_by_style || {width: '80px'}"
                        v-model="fieldset.search_by"
                        @on-change="onSearchByChanged(fieldset)">
                        <iv-option v-for="(item,index) in fieldset.subs" :key="index" :value="item">{{ item | find(conditions.attrs) | display(['title', 'name']) }}</iv-option>
                    </iv-select>
                </span>
            </iv-input>
            <iv-select
                v-if="[Array].indexOf(fieldset.type) > -1"
                v-model="conditions.values[fieldset.name]"
                :style="fieldset.style || {width: '120px'}"
                :placeholder="fieldset.placeholder"
                :clearable="fieldset.clearable">
                <iv-option v-for="(item,index) in fieldset.options" :key="index" :value="item.id">{{ item.name }}</iv-option>
            </iv-select>
            <iv-date-picker
                v-if="['Daterange'].indexOf(fieldset.type) > -1"
                type="daterange"
                :format="fieldset.format || 'yyyy-MM-dd'"
                :placeholder="fieldset.placeholder"
                v-model="conditions.values[fieldset.name]"
                :on-changed="onDaterangeChanged(fieldset)"
                :style="fieldset.style || {width: '200px'}" />
            <iv-date-picker
                v-if="['Date'].indexOf(fieldset.type) > -1"
                type="date"
                :format="fieldset.format || 'yyyy-MM-dd'"
                :placeholder="fieldset.placeholder"
                v-model="conditions.values[fieldset.name]"
                :style="fieldset.style || {width: '200px'}" />
        </iv-form-item>
        <slot></slot>
    </iv-form>
</template>
<script>
export default {
    props: {
        value: Object,
        condition: Array
    },
    data(){
        return {
            conditions: {
                attrs: this.condition || [],
                values: this.value || {}
            }
        }
    },
    watch: {
        value(val){
            this.conditions.values = val
        },
        condition(val){
            this.conditions.attrs = val
            this.onChanged()
        }
    },
    methods: {
        onChanged(){
            this.$emit('input', this.conditions.values)
        },
        onSearchByChanged(fieldset){
            fieldset.subs.filter(field=>field!=fieldset.search_by).forEach(field=>this.conditions.values[field]='')
        },
        onDaterangeChanged(fieldset){
            if(typeof fieldset.subs === 'undefined') return
            for (let index = 0; index < fieldset.subs.length; index++) {
                this.conditions.values[fieldset.subs[index]] = this.conditions.values[fieldset.name][index]
            }
        }
    },
    filters: {
        find(name, array){
            return array.find(attr=>attr.name===name)
        },
        display(obj, fields){
            return fields.reduce((result,field)=>result || obj[field], '')
        }
    }
}
</script>
