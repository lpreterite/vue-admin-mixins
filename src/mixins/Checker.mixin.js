import state from './Status.mixin';
/**
 * 选择组状态集成功能
 * @param  {...[String]} subs 状态名
 * @return {mixin}         vue集成类
 */
export default function (...subs) {

    function getVague(list, checkedList) {
        return list.length > checkedList.length && checkedList.length > 0;
    }
    function getCheckedAll(list, checkedList) {
        return list.length === checkedList.length && checkedList.length > 0;
    }

    return {
        mixins: [
            state('checker')(subs),
        ],
        data() {
            subs = ['defaults'].concat(subs);
            const checker = {};
            subs.forEach(sub => checker[sub] = {
                checkedAll: false,
                vague: false,
                checkedList: []
            });

            return {
                status: {
                    checker: checker
                }
            }
        },
        methods: {
            /**
             * 选择全部，建议绑定总控选择框
             * 
             * @param {any} sub 子状态，默认是defaults
             * @param {any} checked 总控的状态，选择与否
             * @param {any} list 选项列表
             */
            $checkAll(sub, checked, list) {
                const state = this.checker[sub];
                state.checkedAll = checked;
                state.checkedList = state.checkedAll ? [...list] : [];
                state.vague = false;
            },
            /**
             * 选中一个
             * 
             * @param {any} sub 子状态，默认是defaults
             * @param {any} checked 选择与否
             * @param {any} item 选中的对象
             * @param {any} list 选项列表
             */
            $checkOne(sub, checked, item, list) {
                const state = this.checker[sub];
                if (checked) {
                    if (state.checkedList.indexOf(item) === -1) state.checkedList.push(item);
                } else {
                    state.checkedList.splice(state.checkedList.indexOf(item), 1);
                }
                state.checkedAll = getCheckedAll(list, state.checkedList);
                state.vague = getVague(list, state.checkedList);
            },
            /**
             * 更新选中状态，建议绑定单个选项的change事件
             * 
             * @param {any} sub 子状态，默认是defaults
             * @param {any} checkedList 选中列表
             * @param {any} list 选择列表
             */
            $checked(sub, checkedList, list) {
                const state = this.checker[sub];
                state.checkedAll = getCheckedAll(list, state.checkedList);
                state.vague = getVague(list, state.checkedList);
            }
        },
        computed: {
            checker() {
                return this.status.checker;
            }
        }
    };
};