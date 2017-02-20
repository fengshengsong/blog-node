# vue之今天轮到vue-resource

## 基本

### 基本使用
```javascript
	// 全局使用
    Vue.http.get('/someUrl', [options])
    	.then(successCallback, errorCallback);
    Vue.http.post('/someUrl', [body], [options])
    	.then(successCallback, errorCallback);

    // 组件内使用
	this.$http.get('/someUrl', [options])
    	.then(successCallback, errorCallback);
	this.$http.post('/someUrl', [body], [options])
    	.then(successCallback, 	errorCallback);
```

### 七个方法
- get(url, [options])
- head(url, [options])
- delete(url, [options])
- jsonp(url, [options])
- post(url, [body], [options])
- put(url, [body], [options])
- patch(url, [body], [options])

## 使用$resource

### 换个马甲

> resource(url, [params], [actions], [options])

```javascript
	var resource = Vue.$resource(url);
	var resource = this.$resource(url);
    resource.get().then(successCallback).catch(errorCallback);
    resource.save().then(successCallback).catch(errorCallback);
```

### 六个方法
- get: {method: 'GET'}
- save: {method: 'POST'}
- query: {method: 'GET'}
- update: {method: 'PUT'}
- remove: {method: 'DELETE'}
- delete: {method: 'DELETE'}

### 私人订制
```javascript
	var options = {
    	one: {method:'GET',url:'http://localhost:3000/earth/nation{/name}'}
    }
    var resource = this.$resource('',{},options);
    // GET earth/nation/china
    resource.one({name: 'china'}).then((response) => {
    	//code
    });
```

## Interceptors

vue-resource interceptors是干嘛的呢？还是来看官方文档。

> Interceptors can be defined globally and are used for pre- and postprocessing of a request.

interceptors定义在全局并且用来预处理和后处理一个request请求。通俗点说，就是在一个request请求的前后可以进行一些操作，例如在请求之前修改request的方式，在请求之后对返回的response进行处理。然后返回response并传递给request请求中定义的successCallback或者errorCallback。

```javascript
	Vue.http.interceptors.push((request, next) => {
  		request.method = 'POST';
        console.log(this); //undefined
  		next((response) => {
			response.body = 'hello';
            return response;
  		});
	});
```
但是如果需要使用this关键字的话，由于ES6箭头函数的特殊作用域，所以这里的this值是undefined。因此最好一直使用普通写法。
```javascript
	Vue.http.interceptors.push(function(request, next) {
	request.method = 'POST';
    console.log(this);
	next(function(response) {
    	response.body = 'hello';
		return response;
	})
})
```

借张图，清楚地表示了interceptors的工作过程。
![interceptors_process](http://localhost:3000/essays/interceptors_process.png)

那么用处在哪呢？每次request请求都会触发interceptors，所以一些类似于loading组件就非常适合用interceptors来处理。

## 参考
[vue-resource](https://github.com/pagekit/vue-resource)
[Vue.js——vue-resource全攻略](http://www.doc00.com/doc/1001004eg)