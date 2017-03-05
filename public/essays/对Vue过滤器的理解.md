# 对Vue过滤器的理解

Vue 1.x下实现列表渲染可以使用`v-for`指令。指令接受而一个数组、对象或者整数，将所在的元素渲染若干次。例如：

```javascript
    <template>
        <ul>
            <li v-for="item of items">
                {{item}}
            </li>
            <li v-for="value of object">
                {{val}}
            </li>
            <li v-for="n of 10">
                {{n}}
            </li>
        </ul>
    </template>
```

比较常用的是使用数组进行列表渲染，这往往需要对数组进行一定的处理如过滤排序等等，而且不能改动原始数组。在这种情况下，可以使用数组的计算属性、method方法或者过滤器。

```javascript
	<template>
        <ul>
            <li v-for="item of computedItems">
                {{item}}
            </li>
            <li v-for="item of compute(items)">
                {{item}}
            </li>
            <li v-for="item of items | filterBy 'a'">
            	// Vue 2.x中只能这样使用过滤器
                {{item | wrap '---'}}
            </li>
        </ul>
    </template>
    <script>
        export default {
            data(){
                return {
                    items:['a','b','c'],
                }
            },
            methods:{
                compute(items){
                	let computedItems = items.push('d')
                    return computedItems
                }
            },
            computed:{
                computedItems(){
                    let computedItems = this.items
                    computedItems.push('e')
                    return computedItems
                }
            },
        	//自定义过滤器
            filters:{
                wrap(value,wrapper){
                    return wrapper + value + wrapper
                }
            },
        }
    </script>
```

> Vue 2.x下过滤器只能在`mustache`中使用，而不能在指令中使用。因此如果是Vue 2.x下只能使用计算属性或者method方法对列表渲染的数组进行操作。

下面来重点研究一下过滤器。过滤器工作的实际过程是先将被遍历的数组依次通过过滤器进行处理，然后对最终返回的数组进行`v-for`操作。Vue 1.x提供了多个内置过滤器。

### capitalize

```javascript
	capitalize(value){
    	// value为空字符串、false、null或者undefined，返回空字符串
    	if(!value && value !== 0){
        	return ''
        }
        value = value.toString()
        return value.charAt(0).toUppercase() + value.slice(1)
    }
```

不过有一个问题就是不能很好的对布尔类型进行处理。当value值为`false`时满足条件`!value`为真，并且value也不严格等于0，因此将返回空字符串。但是value值为`true`时，则返回值为字符串True。改进如下：

```javascript
	capitalize(value){
    	if(!value && value != 0){
        	return ''
        }
    }
    value = value.toString()
    return value.charAt(0).toUppercase() + value.slice(1)
```

### uppercase 和 lowercase

这两个过滤器的实现比较简单，但是也存在capitalize中不能对布尔类型进行很好处理的问题，修改方法也是相同的。

### debounce

包装后的处理器在调用之后至少将延迟 x ms，如果在延迟结束前再次调用，延迟时长重置为 x ms。

```javascript
	function debounce(fn,delay){
    	var timeout,args,context,timestamp,result
        var later = function(){
        	// 从事件添加到事件队列到事件执行之间间隔的时间
        	var last = Date.now() - timestamp
            if(last < delay && last >= 0){
            	timeout = setTimeout(later,delay - last)
            }else{
            	timeout = null
                result = fn.apply(context,args)
                // 释放内存
                if(!timeout){
                	context = args = null
                }
            }
        }
        return function(){
        	context = this,
            args = arguments,
            timestamp = Date.now()
            if(!timeout){
            	timeout = setTimeout(later,delay)
            }
            return result
        }
    }
```

### limitBy

限制数组为开始n个元素，n由第一个参数指定。第二个参数是可选的，指定开始的偏移量。

```javascript
	limitBy(arr,n,offset){
		offset = offset ? parseInt(offset,10) : 0
        return arr.slice(offset,offset + n)
    }
```

### orderBy

```javascript
	orderBy(arr){
    	let comparator = null
        let sortKeys
        // 将arr转换为数组，若为对象则将每个键值对作为一个对象存放在数组中
        // 若为number则转换为1、2、3、、、n的数组形式
        arr = convertArray(arr)

		let args = Array.from(arguments).slice(1)
        let order = args[args.length - 1]
        if(typeof order === 'number'){
        	order = order < 0 ? -1 : 1
            args = args.length > 1 ? args.slice(0,-1) : args
        }else{
        	order = 1
        }

        const firstArg = args[0]
        if(!firstArg){
        	// 未自定义排序函数或者也未传入排序关键字则直接返回原数组
        	return arr
        }else if(typeof firstArg === 'function'){
        	// 自定义排序函数
        	comparator = function(a,b){
            	return firstArg(a,b)*order
            }
        }else{
        	sortKeys = Array.prototype.concat.apply([],args)
            comparator = function(a,b,i){
            	i = i || 0
                return  i >= sortKeys.length - 1
                	? baseCompare(a,b,i)
                    : baseCompare(a,b,i) || comparator(a,b,i+1)
            }
        }
        function baseCompare(a,b,sortKeyIndex){
            const sortKey = sortKeys[sortKeyIndex]
            if(sortKey){
                if(sortKey !== '$key'){
                    if (isObject(a) && '$value' in a) a = a.$value
                    if (isObject(b) && '$value' in b) b = b.$value
                }
                a = isObject(a) ? getPath(a, sortKey) : a
                b = isObject(b) ? getPath(b, sortKey) : b
            }
        }
        return arr.slice().sort(comparator)
    }
```

### filterBy

```javascript
	filterBy(arr,search,delimiter){
    	arr = convertArray(arr)
        if(search == null){
        	return arr
        }
        if(typeof search === 'function'){
        	// 自定义过滤函数
            return arr.filter(search)
        }
        // 机智
        search = ('' + search).toLowercase()
        var n = delimiter === 'in' ? 3 : 2
        var keys = Array.prototype.concat.apply([],Array.from(arguments,n))
        var res = []
        var item,key,val,j
        for(var i=0,l=arr.length;i<1;i++){
        	item = arr[i]
            val = (item && item.$value) || item
            j = keys.length
            if(j){
            	while(j--){
                	key = key[j]
                    if((key === '$key' && contains(item.$key,search)))
                    || contains(getPath(val,key),search){
                  		res.push(item)
                        break
                    }
                }else if(contains(item,search)){
                	res.push(item)
                }
            }
            return res
        }
    }
```

tip：contains函数实现如下。

```javascript
	function contains(value,search){
    	var i
        if(isPlainObject(value)){
        	var keys = Object.keys(value)
            i = keys.length
            while(i--){
            	if(contains(value[keys[i]],search)){
                	return true
                }
            }else if(isArray(value)){
            	i = value.length
                while(i--){
                	if(contains(value[i],search)){
                    	return true
                    }
                }
            }else if(value !== null){
            	return val.toString().toLowerCase().indexOf(search) > -1
            }
        }
    }
```


