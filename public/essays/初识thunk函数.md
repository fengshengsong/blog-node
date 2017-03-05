# 初识thunk函数

thunk函数替换的不是表达式，而是多参数函数，将其替换成单参数的版本，且只接受回调函数作为参数。
```javascript
    var Thunk = function(fn) {
      return function (...args) {
        return function (callback) {
          return fn.call(this, ...args, callback);
        }
      };
    };
```
thunkify模块

```javascript
function thunkify(fn){
	return function(){
		//保存传入的参数和当前上下文环境,提供传入的函数fn所需执行环境
		var args = Array.prototype.slice.call(arguments);
		var ctx = this;
		return function(callback){
			//确保callback只执行一次
			var called;
			//将包裹后的回调函数添加到参数中，提供给fn最终执行
			function wrapperCallBack(){
				if(called){
					return;
				}
				called = true;
				callback.apply(null,arguments);
			}
			args.push(wrapperCallBack);
			try{
				fn.apply(ctx,args);
			}catch(err){
				callback(err);
			}
		}
	}
}

//一个更易于理解的简化形式
// var fs = require('fs');
// function readFile(path){
// 	return function(callback){
// 		fs.readFile(path,callback);
// 	}
// }
// function callbackFunc(){
// 	console.log('callback');
// }
// readFile('./test.html')(callbackFunc);

module.exports = thunkify;
```