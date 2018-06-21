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