# vuex 一点人生的经验

## 一个例子

## getters

纯函数

## mutations

## actions

mutations 必须同步执行。可以在actions内部执行异步操作。

绑定所有actions
```javascript
import * as actions from './actions'
const vm = new Vue({
  vuex: {
    getters: { ... },
    actions // 绑定所有 actions
  }
})
```


## 应用结构

Vuex 并不限制你的代码结构，但是制定了一套需要遵守的规则：

1. 应用 state 存在于单个对象中。
2. 只有 mutation handlers 可以改变 state。
3. Mutations 必须是同步的，它们做的应该仅仅是改变 state。
4. 所有类似数据获取的异步操作细节都应封装在 actions 里面。
5. 组件通过 getters 从 store 中获取 state，并通过调用 actions 来改变 state。










