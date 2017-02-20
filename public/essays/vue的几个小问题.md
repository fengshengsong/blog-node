# vue的几个小问题

## 在vue中如何对当前选中的元素进行样式设置

第一种方法是：
```javascript
<li v-for='item in items' :class="{'current':item.isCurrent}" @click="setCurrent($index)"></li>
```
在items中需要加入变量isCurrent用来判断是否为当前元素。
```javascript
data:{
     items:[
          {isCurrent:true},
          {isCurrent:false}
     ]
}
```
同时在methods中加入setCurrent方法。
```javascript
setCurrent: function (index) {
    this.items.map(function (val,ind) {
        ind===index ? val.isCurrent=true : val.isCurrent=false;
    });
}
```

第二种方法是直接在组件的data中增加一个变量isCurrent。
```javascript
data: {
    isCurrent: 0,
    items:[]
}
```
然后就可以简化一下。
```javascript
<li v-for='item in items' :class="{'current':(isCurrent==$index)}" @click="setCurrent($index)"></li>
```
这时的setCurrent方法就变成了：
```javascript
setCurrent: function (index) {
    this.isCurrent=index
}
```

如果想要刷新页面之后保证当前选中元素不变，则可以使用localStorage来保存isCurrent。
```javascript
data: {
    isCurrent:Number(window.localStorage.getItem('isCurrent'))||0
    items:[]
}
setCurrent (index) {
     window.localStorage.setItem('isCurrent',index)
     this.isCurrent=index
}
```

## 在vue中使用v-for时默认选中指定的option

同样是利用$index来操作。
```javascript
<select>
      <option v-for="item in items" :selected="isSelected($index)"></option>
</select>
isSelected (index) {
      return index === optionIndex? 1 : 0;
}
```

## 监听vue中使用v-for渲染的DOM元素

vue默认异步更新DOM。每当观察到数据变化时，vue会开始一个队列，将同一事件的所有的数据变化缓存起来。如果一个watcher被多次触发，只会被一次推入到队列中。等到下一次事件循环，vue会清空队列，只进行必要的DOM更新。例如，当设置了vm.somevalue = 'new value'，DOM 不会立即更新，而是在下一次事件循环清空队列时更新。如果想在DOM更新之后做点什么，可以在数据变化使用Vue.nextTick(callback)，回调函数callback会在此次DOM更新后调用。

