# 你不知道的JavaScript - this&object prototype - 需要记住的东西

## 关于this

### this到底指向哪里？

this这个关键字的用法很复杂。先来看下面的例子。
```javascript
    function foo(num) {
         console.log(num);
         this.count++;
    }
    foo.count = 0;
    var i = 0;
    for(i=0;i<10;i++) {
         foo(i);
    }
```
foo函数执行过程中，this并不指向foo这个函数对象，因此this.count指向的也不是函数内部的属性count。this.count语句创建了一个全局变量，其值是undefined。可以将this显式地绑定到foo函数对象上，
```javascript
    function foo(num) {
         console.log(num);
         this.count++;
    }
    foo.count = 0;
    var i = 0;
    for(i=0;i<10;i++) {
         foo.call(foo,i); //强制指向foo
    }
```
Tip: arguments.callee可以用来引用当前正在运行的函数对象，这是唯一一种可以在匿名函数内部引用自身的方法，但是不建议使用。

### this的作用域

this在任何时候都不指向函数的词法作用域。在JavaScript内部，作用域与对象类似，可见的标识符都是其属性。但是作用域无法通过JavaScript代码来访问，它存在于JavaScript引擎内部。因此不能使用this来引用一个词法作用域内的东西。

## this全面解析

### 调用栈与调用位置

this是在函数运行被调用时绑定的，也就是说完全取决于函数的调用位置。那什么是调用位置呢？调用栈又是什么？来看例子。
```javascript
    function foo() {
         //当前调用栈是foo
         //当前调用位置是全局作用域
         console.log("foo");
         bar();
    }
    function bar() {
         //当前调用栈是foo->bar
         //当前调用位置在foo中
         console.log("bar");
         baz();
    }
    function baz() {
         //当前调用栈是foo->bar->baz
         //当前调用位置在bar中
         console.log("baz");
    }
    //foo的调用位置即是全局作用域
    foo();
```
调用位置是函数在代码中被调用的位置，而不是声明的位置。调用栈是为了达到当前执行位置所调用的所有函数。

### this到底该指向哪

this的绑定有四条规则如下。

- 默认绑定
```javascript
    function foo() {
         console.log(this.a);
    }
    var a = 2;
    foo();
```
foo()直接使用不带任何修饰的函数引用来进行调用，因此只能使用默认绑定，this指向全局对象。需要注意的是，在严格模式下，全局对象无法使用默认绑定，因此this会指向undefined。

- 隐式绑定
```javascript
    function foo() {
         console.log(this.a);
    }
    var obj = {
         a: 2,
         foo: foo
    }
    obj.foo();
```
当函数引用有上下文对象时，隐式绑定规则会把函数中的this绑定到这个上下文对象。但隐式绑定有一个问题就是隐式绑定丢失，被隐式绑定的函数有可能会丢失绑定对象，然后会使用默认绑定将this绑定到全局对象或者undefined上，这取决与是否采用严格模式。看下面的例子。
```javascript
    function foo() {
         console.log(this.a);
    }
    var obj = {
         a: 2,
         foo: foo
    }
    var bar = obj.foo();
    var a = 1;
    bar(); //1
```
这里的函数bar只是obj.foo的一个引用，引用的是foo函数本身，因此bar是一个不带任何修饰的函数调用，应用了默认绑定规则。
```javascript
    function foo() {
         console.log(this.a);
    }
    var obj = {
         a: 2,
         foo: foo
    }
    function doFoo(fn) {
         fn();
    }
    var a = 1;
    doFoo(obj.foo); //1
```
参数传递也是一种隐式赋值，因此将函数作为参数传递时也会发生隐式丢失的问题。

- 显式绑定
两个函数apply()与call()，其第一个参数是一个对象，在调用函数时强制将其的this绑定到这个对象上。如果传入的是一个字符串类型、布尔类型或者数字类型的原始值，这个原始值会被自动转换成它的对象形式，也就是自动装箱。但是显式绑定仍然无法解决丢失绑定这个问题。

	- 硬绑定
	```javascript
        function foo() {
             console.log(this.a);
        }
        var obj = {
             a: 2,
        }
        var bar = function() {
             foo.call(obj);
        }
    ```
    ES5提供了内置的方法`Function.prototype.bind`来实现硬绑定
    ```javascript
        var baz = foo.bind(obj);
	```

- new绑定
JavaScript也有new关键字，但其使用机制与面向类的语言并不相同。JavaScript中的“构造函数”从严格意义上来说，并不是构造函数。它们只是一些使用new操作符时被调用的普通函数。使用new来调用函数，会自动执行如下过程：
	1. 创建一个全新的对象
	2. 这个新对象会被执行[prototype]连接
	3. 这个新对象会被绑定到函数调用的this
	4. 如果函数中没有定义特定的返回对象，那么会自动返回这个新对象
```javascript
    function foo(a) {
         this.aa = a;
    }
    var bar = new foo(1);
    console.log(bar.aa);
```

### 绑定的优先级

>　new绑定 -> 显式绑定 -> 隐式绑定 -> 默认绑定

### 绑定例外

- 被忽略的this
如果你把null或者undefined作为this的绑定对象传入apply、call或者bind，这些值在调用时会被忽略，实际应用的是默认绑定规则。但这会产生一些难以分析的问题。所以如果想要将其绑定到一个空对象，可以手动创建一个。在JavaScript中创建一个空对象可以使用Object.create(null)，这种方式比使用{}空的更加彻底，因为其创建出来的对象并不包含Object.prototype这个委托。
```javascript
    function foo(a,b) {
         console.log(a,b);
    }
    //空对象
    var nul = Object.create(null);
    foo.apply(nul,[2,3]);
    //使用bind进行柯里化
    var bar = foo.bind(nul,2);
    bar(3);
```

- 间接引用
赋值表达式的返回值是目标函数的引用，例如语句o.foo = p.foo的返回值就是foo，因此调用位置就是foo()，其在全局作用域中。
```javascript
    function foo() {
         console.log(this.a);
    }
    var a =2;
    var p = {
         a: 3,
         foo: foo
    };
    var o = {
         a: 4
    };
    o.foo(); //3
    (o.foo = p.foo)(); //2
```

- 软绑定
硬绑定会降低函数的灵活性，使用硬绑定之后就无法使用隐式绑定或者显式绑定来修改this。如果可以给默认绑定指定一个全局对象和undefined以外的值，就可以实现和硬绑定相同的效果，同时保留下隐式绑定和显式绑定修改this的能力。
```javascript
	if(!Function.prototype.softBind){
    	Function.prototype.softBind = function(obj){
        	var fn = this;
            var curried = [].slice.call(arguments,1);
            var bound = function(){
            	return fn.apply(!this||this===(window||global)?
                				obj:this,
                                curried.concat.apply(curried,arguments)
                );
            }
            bound.prototype = Object.create(fn.prototype);
            return bound;
        };
    }
```

## 对象

### 一些常识以及人生的经验

> 类型：string, number, boolean, null, undefined, object
> 内置对象：String, Number, Boolean, Object, Function, Array, Date, RegExp, Error

- 在实际使用过程中JavaScript引擎会将自动将字符串字面量转换为字符串对象。
- null和undefined没有对应的对象，只有文字形式。
- Date只有对象，没有文字形式。
- Object，Array，Function，RegExp无论使用文字形式还是构造形式，它们都是对象，不是字面量。

### 属性与方法

- 在对象中，属性名永远都是字符串。ES6新增了可计算属性名。
- 从技术角度来说，函数不属于一个对象。即使你在对象的文字形式中声明了一个函数表达式，这个函数也不会“属于”这个对象，它们只是对相同函数对象的多个引用。

### 遍历

对象的属性有多种遍历方法，for in，for of，every，forEach，some。其中for of会寻找对象内置的iterator对象并调用它的next()方法来遍历数据值。




























