# API文档

## StatusMixin

### StatusMixin的依赖

| 组件来源 | 组件名称 |
|------|------|
| 无   | 无   |

### StatusMixin的使用

```js
import { StatusMixin } from 'vue-admin-mixins';
export default {
    mixins: [StatusMixin('loader')()]
}
```

### StatusMixin的例子

调用`StatusMixin()`会返回一个构造器，可传入`Array`和`Object`并生成对应字段，默认字段为`false`;

```html
<template>
    <div :class="{loading: loader.defaults}"></div>
    <div>apple: {{ apple.has ? '0':'1' }} - {{ apple.disabled ? '不可用':'可用' }} - {{ apple.visibled ? '可见的':'不可见的' }}</div>
    <div>
        <div>{{ model.isSaved ? '已储存':'未储存' }}</div>
        <input type="text" v-model="input">
        <button :disabled="model.isDirty" @click="save(input)">save</button>
    </div>
</template>
<script>
import { StatusMixin } from 'vue-admin-mixins';
export default {
    mixins: [
        StatusMixin('loader')(),
        StatusMixin('apple')(['has','disabled','visibled']),
        StatusMixin('model')(['isDirty','isSaved',{name: 'isNew', default(){ return true; }}'])
    ],
    data(){
        return { input: '' }
    },
    watch: {
        input(val, oldVal){
            if(val != oldVal) this.model.isDirty = true;
        }
    },
    methods: {
        save(input){
            this.model.isSaved = !!input;
        }
    }
}
</script>
```

## LoaderMixin

### LoaderMixin的依赖

| 组件来源    | 组件名称         |
|-------------|------------------|
| vue-admin-mixins | StatusMixin |

### LoaderMixin的使用

```js
import { LoaderMixin } from 'vue-admin-mixins';
export default{
    mixins: [LoaderMixin('users','user_detail')],
}
```

### LoaderMixin的例子

```html
<template>
    <div v-if="loader.users">加载中...</div>
    <div v-else>
        <!-- 用户列表 -->
    </div>
</template>
<script>
export default {
    mixins: [LoaderMixin('users','user_detail')],
    async mounted(){
        this.$$loading('users');
        await refreshUsers(this, this.$route.query);
        this.$$loaded('users');
    },
}
</script>
```

## RedirectMixin

扩展路由处理，简单的返回扩展

### RedirectMixin的依赖

| 组件来源 | 组件名称 |
|------|------|
| 无   | 无   |

### RedirectMixin的使用

```html
<template>
    <!-- 返回redirect字段的地址 -->
    <a @click="$back()">返回</a>
    <!-- 当路由没有redirect字段时跳转至传入路由 -->
    <a @click="$back({name: 'index'})">返回</a>
</template>
<script>
import { RedirectMixin } from 'vue-admin-mixins';
export default {
    mixins: [RedirectMixin('redirect')]
}
</script>
```

调用`this.$$back(route?)`方法时，优先返回`$route.query.redirect`的路径；当没有`$route.query.redirect`参数时，按传入的路由跳转；传入的路由都没有时，则调用`$router.back()`跳转路由处理。

## ConditionMixin

条件筛选扩展，建议结合[FilterBar组件](../src/components/FilterBar.vue)一并使用。

| 组件来源 | 组件名称 |
|---------|---------|
| 无       | 无       |

### ConditionMixin的使用

```html
<template>
    <FilterBar 
        v-model="conditions.values"
        :condition="conditions.attrs">
        <iv-button
            type="primary"
            @click="changeQuery($$parseCondition(conditions.values))">
            <iv-icon type="search" size="14" style="vertical-align:text-bottom" /> 查询
        </iv-button>
    </FilterBar>
</template>
<script>
import { ConditionMixin } from 'vue-admin-mixins';
export default {
    mixins: [
        ConditionMixin({
            condition: [
                { name: "start", type: Date, hidden: true },
                { name: "end", type: Date, hidden: true },
                { name: "daterange", type: "Daterange", subs: ['start','end'], placeholder: "反馈时间" },
                { name: "status", hidden: true },
                { name: "archive", type: Array, default: 'all', options: [{id:'1', name:'待处理'},{id:'2', name:'已处理'}], placeholder:"处理说明", clearable:true },
                { name: "connect", type: String, title: '联系方式', default: '', hidden: true },
                { name: "user_id", type: String, title: '用户id', default: '', hidden: true },
                { name: "search", type: "Search", subs: ['user_id','connect'], search_by: 'user_id' }
            ]
        })
    ]
    mounted () {
        this.$$updateCondition(this.$$serializeCondition({...this.$route.query,...this.$route.params}))
        this.refresh(this.conditions.values)
    },
    beforeRouteUpdate(to, from, next){
        this.$$updateCondition(this.$$serializeCondition({...to.query,...to.params}))
        this.$nextTick(()=>this.refresh(this.conditions.values))
        next();
    },
    methods: {
        refresh(query){
            ...
        },
        changeQuery(query, params=this.$route.params){
            this.$router.push({
                name: this.$route.name,
                query: query,
                params: params
            });
        }
    }
}
</script>
```

### 设置说明

| 字段名称        | 说明                                                                                                 |
|-----------------|----------------------------------------------------------------------------------------------------|
| name            | 字段名称                                                                                             |
| type            | 类型，`FilterBar`将会根据此字段改变显示方式，目前支持：`Date`, `Daterange`, `String`, `Array`, `Search` |
| subs            | 当类型是`Daterang`或`Search`时有效，内容为筛选项中名称集                                              |
| hidden          | 是否显示该筛选项                                                                                     |
| options         | 当类型是`Array`时有效，内容为筛选可选项                                                               |
| search_by       | 当类型是`Search`是有效，内容为筛选项中某项的名称                                                      |
| clearable       | 当类型是`Array`是有效，用于`iview-select`                                                             |
| placeholder     | 用于显示输入提示                                                                                     |
| style           | 用于设置筛选项样式                                                                                   |
| search_by_style | 用于设置筛选项搜索的样式                                                                             |

#### Daterange设置例子

使用`iview-datapicker`时，时间段使用数组表示

```js
import { ConditionMixin } from 'vue-admin-mixins';
export default {
    mixins: [
        ConditionMixin({
            condition: [
                { name: "daterange", type: "Daterange", placeholder: "反馈时间" },
            ]
        })
    ]
    ...
}
```

由于部分接口设计需分拆成两个字段，以下配置能满足需要。

```js
import { ConditionMixin } from 'vue-admin-mixins';
export default {
    mixins: [
        ConditionMixin({
            condition: [
                { name: "start", type: Date, hidden: true },
                { name: "end", type: Date, hidden: true },
                { name: "daterange", type: "Daterange", subs: ['start','end'], placeholder: "反馈时间" },
            ]
        })
    ]
    ...
}
```

#### Search设置例子

为满足多个字符串方式的筛选只能使用一个时的需求，可使用以下设置。


```js
import { ConditionMixin } from 'vue-admin-mixins';
export default {
    mixins: [
        ConditionMixin({
            condition: [
                { name: "connect", type: String, title: '联系方式', default: '', hidden: true },
                { name: "user_id", type: String, title: '用户id', default: '', hidden: true },
                { name: "search", type: "Search", subs: ['user_id','connect'], search_by: 'user_id' }
            ]
        })
    ]
    ...
}
```

## ModelMixin

进行异步数据请求，传入模型必须带上`ModelName`字段，用于生成关联。

### ModelMixin的依赖

| 组件来源 | 组件名称 |
|------|------|
| 无   | 无   |

### ModelMixin的使用

```html
<template>
        <ContentItem v-for="(item, index) in list.data"
                     :value="item"
                     :key="index">
        <iv-button slot="buttons" type="ghost" size="small"  @click="destroy(item)"><iv-icon type="trash-a" /> 删除</iv-button>
        </ContentItem>
</template>
<script>
  import ModelMixin from "@/mixins/Model.mixin";
  import ContentsModel from '@/models/ContentsModel';
export default {
    mixins: [
          ModelMixin({
                contact,
                models:[
                    ContentsModel
                ]
            })
    ]
    methods:{
          destroy(item){
                this
                    .$$confirm('删除不可恢复，确认删除？')
                    .then(result=>result?Promise.resolve():Promise.reject())
                    .then(()=>this.$$active(CONTENTS, 'changeStatus', {id: item.id, status: 5,})) //草稿删除逻辑 status = 5，默认 fetch 非5的文章
                    .then(()=>this.refresh(this.$$parseCondition(this.conditions.values)))
            },
    }
}
</script>
```
以`$$active`为公用数据请求函数，并提供请求前、请求成功与请求失败的处理函数以供灵活使用

#### $$onRequestBefore钩子

| 名称 | 参数 | 说明 |
|------|------|
| `$$onRequestBefore` | `modelName`类名, `method`方法名, `ctx`上下文内容 | 请求前处理，必须返回`ctx`上下文 |

`ctx`上下文包含：
| 名称 | 说明 |
|-|-|
|query|请求参数|
|options={origin}|请求源|

#### $$onRestfulError钩子

| 名称 | 参数 | 说明 |
|-|-|-|
| `$$onRestfulError` | `modelName`类名, `method`方法名, `err`错误内容 | 请求出错后的处理 |

`ctx`上下文包含：
| 名称 | 说明 |
|-|-|
|err| 错误内容 |

#### $$onRestfulSuccess钩子

| 名称 | 参数 | 说明 |
|-|-|-|
| `$$onRestfulSuccess` | `modelName`类名, `method`方法名, `result`请求返回的内容 | 请求成功后的处理 |

`ctx`上下文包含：
| 名称 | 说明 |
|-|-|
|result|请求成功返回的信息|

#### $$fetch方法
| 名称 | 参数 | 说明 |
|-|-|-|
| `$$fetch` | `MODEL_NAME`类名, `query`请求参数, `options`设置 | 请求数据列表 |

#### $$find方法
| 名称 | 参数 | 说明 |
|-|-|-|
| `$$find` | `MODEL_NAME`类名, `id`请求对象ID, `options`设置 | 请求单个数据 |

#### $$save方法
| 名称 | 参数 | 说明 |
|-|-|-|
| `$$save` | `MODEL_NAME`类名, `data`请求保存对象, `options`设置 | 请求保存对象 |

#### $$del方法
| 名称 | 参数 | 说明 |
|-|-|-|
| `$$del` | `MODEL_NAME`类名, `id`请求对象ID, `options`设置 | 请求删除数据 |

## DirtyHandlerMixin

每次路由跳转前根据DetailMixin中的tracker的isDirty和isSaved状态进行脏数据提示

### DirtyHandlerMixin的依赖

| 组件来源 | 组件名称 |
|------|------|
| 无   | 无   |

### DirtyHandlerMixin的使用

```html
<template>
    <iv-button @click="$$back({ name: 'memberproductconfig' })">取消</iv-button>
</template>
<script>
  import MemberShipModel from "@/models/MemberShipModel";
  import DetailMixin from "@/mixins/Detail.mixin";
  const MEMBER_SHIP = MemberProductConfigModel.ModelName; 
export default {
   mixins: [
            DetailMixin({
                model: MEMBER_SHIP,
                form: FORM_NAME,
            })
        ]
}
</script>
```
在DetailMixin中已引用DirtyHandlerMixin，且DetailMixin中对DirtyHandlerMixin状态进行了处理，二者密不可分，故可直接通过调用DetailMixin来使用DirtyHandlerMixin的数据监听

## DetailMixin

在执行数据请求前进行条件验证，并提供请求后的状态的相应处理方法

### DetailMixin的依赖

| 组件来源    | 组件名称         |
|-------------|------------------|
| vue-admin-mixins | StatusMixin |
| vue-admin-mixins | LoaderMixin |
| vue-admin-mixins | DirtyHandlerMixin |

### DetailMixin的使用

```html
<template>
     <div slot="footer">
            <iv-row>
                <iv-col span="24">
                    <iv-button v-if="!tracker.isNew" :disabled="false" type="error" @click="destroy">删除</iv-button>
                    <span class="pull-right">
                        <iv-button @click="$$back({ name: MODEL_NAME })">取消</iv-button>
                        <iv-button type="primary" @click="save">保存</iv-button>
                    </span>
                </iv-col>
            </iv-row>
        </div>
</template>
<script>
  import MemberShipModel from "@/models/MemberShipModel";
  import DetailMixin from "@/mixins/Detail.mixin";
  const MEMBER_SHIP = MemberShipModel.ModelName; 
export default {
   mixins: [
            DetailMixin({
                model: MEMBER_SHIP,
                form: FORM_NAME,
            })
        ],
    methods:{
             save(){
                this
                    .$$saveDetail()
                    .then(()=>this.$$back({ name: MEMBER_SHIP }));
            },
    }
}
</script>
```
#### $$onRestfulBefore钩子

| 名称 | 参数 | 说明 |
|-|-|-|
| `$$onRestfulBefore` | `modelName`类名, `method`方法名 | 获得请求结果前的处理

`ctx`上下文包含：
| 名称 | 说明 |
|-|-|
| 无 | 无 |

#### $$onRestfulSuccess钩子

| 名称 | 参数 | 说明 |
|-|-|-|
| `$$onRestfulSuccess` | `modelName`类名, `method`方法名 | 成功获得请求结果后的处理

`ctx`上下文包含：
| 名称 | 说明 |
|-|-|
| 无 | 无 |

#### $$onRestfulError钩子

| 名称 | 参数 | 说明 |
|-|-|-|
| `$$onRestfulError` | `modelName`类名, `method`方法名, `err`错误内容 | 请求出错后的处理 |

`ctx`上下文包含：
| 名称 | 说明 |
|-|-|
|err| 错误内容 |

#### $$refreshDetail方法
| 名称 | 参数 | 说明 |
|-|-|-|
| `$$refreshDetail` |  `query`请求参数 | 刷新数据 |

#### $$saveDetail方法
| 名称 | 参数 | 说明 |
|-|-|-|
| `$$saveDetail` |  `data`请求参数对象 | 进行表单验证并调用$$save方法 |

#### $$destroyDetail方法
| 名称 | 参数 | 说明 |
|-|-|-|
| `$$destroyDetail` | - | 进行删除确认并调用$$del方法 |

## MessageMixin

全局信息反馈

### MessageMixin的依赖

| 组件来源 | 组件名称 |
|------|------|
| 无   | 无   |

### MessageMixin的使用
```js
 //js
  import Message from "./Message.mixin";
    export default function () {
        const message = Message();
        return {
            install(Vue) {
                Vue.mixin({
                    ...message,
                    methods: {
                        ...message.methods,
                    }
                });
            }
        }
    }
```
```html
<template>
     <MButton type="minor" size="larg" block circle :loading="status[CDKEY].submit == 0" @click="submit(account.user)"> 立即激活</MButton>
</template>
<script>
export default {
    methods:{
             async submit(user){
                if(!user) return api.jumpLogin(encodeURIComponent(this.$route.fullPath), process.env.version,'cms', process.env.platform)
                let cdkey = this.sources.vipcard
                if(cdkey.code == '') {this.$$message(this.err_messages.code);return }
                if(cdkey.verify_code.toLowerCase() != this.sources.captcha.code) {this.$$message(this.err_messages.verify_code);this.sources.captcha = this.generateCode();return }

                if(!this.valid()) return
                const result = await this.$$active(USER, 'exchange_vip', this.sources.vipcard, { origin: 'passport' })
                if(result) return
                this.$$success('激活成功')
                setTimeout(()=>this.$$back({ name: 'mine-setting' }),3000)
            },
    }
}
</script>
```

## ModalMixin

模态框的状态管理

### ModalMixin的依赖

| 组件来源    | 组件名称         |
|-------------|------------------|
| vue-admin-mixins | StatusMixin |

