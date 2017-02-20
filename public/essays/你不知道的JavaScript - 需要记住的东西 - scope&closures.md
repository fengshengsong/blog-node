# 你不知道的JavaScript - scope&closures - 需要记住的东西

## 作用域是什么

几乎所有编程语言的基本功能之一就是能够存储变量当中的值，并且在之后对这个值进行访问和修改。作用域是一套规则，这套规则可以用来存储变量并且在之后可以方便的找到这些变量。

- 变量赋值的编译和赋值过程
对于语句`var a = 2;`来说，编译器首先会在编译时在当前作用域内声明一个变量（假设此变量此前不存在），然后在运行时在作用域中查找该变量进行赋值操作。

- LHS查询和RHS查询
当变量出现在赋值操作的左侧时进行LHS查询，出现在右侧时进行RHS查询或者说是出现在赋值操作的非左侧时进行RHS查询。一个更容易理解的说法是赋值操作的目标是谁(LHS)以及谁是赋值操作的源头(RHS)。一个示例：
```javascript
    function foo(a) {
         var b = a;
         return a + b;
    }
    var c = foo(2);
```
代码中有3处LHS查询：
```javascript
    c = ..
    a = ..   //隐式变量分配
    b = ..
```
有4处RHS查询：
```javascript
    foo(..
    ..= a
    return a.. + b..
```

## 词法作用域

- 词法作用域是定义在词法阶段的作用域。换句话说，就是在写代码时将变量和块级作用域写在哪里来决定的。
```javascript
    if(true) {
         var num = 1;
    }
    alert(num);
```
上述代码在JavaScript中可以正常运行。
```javascript
    function a() {
         var num = 1;
    }
    alert(num);
```
上述代码会抛出一个变量未定义的错误。

- JavaScript中的函数是在定义它们的作用域里运行，而不是在执行它们的作用域里运行。
例如:
```javascript
    var ff = 'ss';
    function b(){
    	alert(ff);
    	var ff = 'oo';
    	alert(ff);
    }
    b();
```
上述代码的运行结果是`undefined`和`oo`，并不是`'ss'`和`'oo'`。作用域查找会在查找到的第一个匹配的标识符时停止。在多层的嵌套作用域中可以定义同名的标识符，但是内部的标识符会遮蔽外部的标识符。而作用域查找始终从运行时所处的最内部作用域开始，然后逐级向外查找，直到找到匹配的标志符为止。
再来看这个例子，在函数b内部，语句`var ff = 'oo'`将导致语句`var ff = 'ss'`被完全隐藏。函数内部首先声明了一个`var ff`，但是直到运行到赋值语句时才会进行赋值操作。第一个`alert`语句在赋值语句之前执行，此时在函数内部作用域中可以找到已经定义但尚未赋值的变量ff，因此输出`undefined`。

- 访问被遮蔽的全局变量
可以使用全局对象（一般来说是浏览器中的`window`对象）来访问那些被遮蔽的全局变量。
```javascript
    var ff = 'ss';
    function b(){
    	alert(window.ff);
    	var ff = 'oo';
    	alert(ff);
	}
	b();
```
上述代码的运行结果是`'ss'`和`'oo'`。

- 欺骗词法作用域
`eval`函数接受一个字符串为参数，并将其其中的内容视为在书写时就存在于那个位置一样。`eval`函数可以在运行期间修改词法作用域，但在严格模式中，`eval`函数有着自己的词法作用域，这意味着参数中的声明无法修改所在的作用域。`with`可以重复引用同一个对象。但其声明会根据所传进去的对象为其创建一个全新的词法作用域。
```javascript
    function foo(obj) {
         with(obj) {
              a = 2;
         }
    }
    var obj = {
         b: 3
    };
    foo(obj);
    console.log(obj.a); //undefined
    console.log(a); //2,a在全局作用域上
```
上述两种方式都不推荐使用。

## 函数作用域和块作用域

### 函数作用域

对于函数来说，无论函数在哪里被调用，也无论它如何被调用，它的词法作用域都只由函数被声明时的位置所决定。JavaScript中并不存在块级作用域，只有函数可以限定一个变量的作用范围。

#### IIFE(Immediately Invoked Function Expression) 立即执行函数表达式

如果函数不需要函数名且需要能够自动运行，那么使用IIFE是一种不错的选择。实现的第一种形式是：
```javascript
    var a = 2;
    (function IIFE() {
         var a = 3;
         console.log(a);
    })();
    console.log(a);
```
`(function IIFE(){})()`中，第一个()函数IIFE变为函数表达式，第二个()立即执行了这个函数。其作为函数表达式只能在(..)内部被访问，这意味着函数名不会污染外部作用域。
另一种形式是：(function(){}())，对应上面的例子如下，
```javascript
    var a = 2;
    (function IIFE() {
         var a = 3;
         console.log(a);
    }());
	console.log(a);
```

书中给出几种用法如下：

- 当做函数调用并将参数传递进去
```javascript
    var a = 1;
    (function IIFE(global) {
         console.log(global.a);
    })(window);
```

- 解决undefined标识符的默认值被人为修改导致错误的异常
```javascript
     var undefined = true;
     (function IIFE(undefined) {
          var a; //定义a但未赋值，为undefined
          if(a === undefined) {
               console.log("undefined标志符未被修改");
          }
     })()
```

- 倒置代码的运行顺序，将需要运行的函数def放在第二位，在IIFE函数运行之后将函数def当做参数传递进去
```javascript
    (function(def){
         def(arg);
    })(function def(arg){
         console.log(arg);
    });
```

### 块作用域

JavaScript不支持块级作用域，但是这并不代表JavaScript不具备块级作用域的相关功能。

- 使用with语句从对象中创建的作用域仅在with声明中有效。
- try/catch中的catch分句会创建一个块级作用域，其中声明的变量仅在catch分句中有效。
- ES6引入了关键字let，let可以将变量绑定到所在的任意作用域中。
```javascript
    if(true){
         let a = 1;
         console.log(a); //1
    }
```
注意，使用let进行的声明并不会再作用域中得到提升，也就是说在使用let声明的变量之前必须先定义。还可以使用let来及时回收变量。
```javascript
	function process(data){}
    {
    	let someData = {};
        process(someData);
    }
```
- ES6引入的const关键字同样可以用来创建块级作用域，但是其声明的变量值是固定的，之后任何试图修改其值的操作都将引发错误。
```javascript
    if(true){
         const a = 1;
         a = 2; //error
         console.log(a);
    }
    console.log(a); //ReferenceError
```

## 提升

- 只有声明本身会被提升，而赋值或者其他运行逻辑会留在原地。函数声明会被提升，而函数表达式不会被提升。函数声明和变量声明都会被提升，但是函数首先会被提升，然后才是变量。

- 一个普通块内的函数声明通常会被提升到所在作用域的顶部，因此下列方式是错误的。
```javascript
    if(true){
         function foo(){console.log("a");}
    }else{
         function foo(){console.log("b");}
    }
    foo();
```
但是对于函数表达式来说，却是可以的。
```javascript
    var foo;
    if(true){
         foo = function(){console.log("a");};
    }else{
         foo = function(){console.log("b");};
    }
    foo();
```

## 作用域闭包

### 什么是闭包

闭包是能够访问其他函数内部作用域的函数。换一种说法，可以把闭包简单理解成"定义在一个函数内部的函数"，然后通过某种方式将该函数传递出去，因为函数内部的函数是可以访问所在函数的内部作用域的，这样就可以在包裹函数的外部访问包裹函数的内部作用域。
```javascript
    function foo() {
         var a = 2;
         function bar() {
              console.log(a);
         }
         return bar;
    }
    var baz = foo();
    baz(); //这是闭包
    function foo() {
         var a = 2;
         function bar() {
              console.log(a);
         }
         baz(bar);
    }
    function baz(fn) {
         fn(); //这也是闭包
    }
    foo();
    var fn;
    function foo() {
         var a = 2;
         function bar() {
              console.log(a);
         }
         fn = bar;
    }
    function baz() {
         fn(); //这还是闭包
    }
    foo();
    baz();
```
无论使用何种手段将内部函数传递到所在词法作用域之外，无论在何处执行这个函数都会使用闭包 ，也就是该内部函数会持有对原有定义作用域的引用。

### 闭包与循环

一个好玩的例子。
```javascript
    for (var i=1; i<=5; i++) {
        setTimeout( function timer() {
        	console.log( i );
        }, i*1000 );
    }
```
上述代码每次的输出都是6，为什么呢？延迟函数的回调会在循环结束时才执行，并且通过`var`声明的变量是存在于一个共享的全局作用域内，也就是说所有函数共享一个对i的引用。如何解决？
```javascript
	for (var i=1; i<=5; i++) {
		(function() {
        var j = i;
        setTimeout( function timer() {
        	console.log( j );
        	}, j*1000 );
        })();
	}
```
上述代码中每次循环都会生成一个新的作用域，使得延迟函数的回调可以将新的作用域封闭在每次循环内部，并且在作用域内部中都有一个对循环变量的副本可以供我们访问。一个改进如下：
```javascript
    for (var i=1; i<=5; i++) {
        (function(j) {
        	setTimeout( function timer() {
        		console.log( j );
        	}, j*1000 );
        })( i );
    }
```
ES6引入的关键字let此时也可以派上用场。
```javascript
    for (var i=1; i<=5; i++) {
    	let j = i;
    	setTimeout( function timer() {
    		console.log( j );
    	}, j*1000 );
    }
```
改进一下。
```javascript
    for (let i=1; i<=5; i++) {
    	setTimeout( function timer() {
    		console.log( i );
    	}, i*1000 );
    }
```