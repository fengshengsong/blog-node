# JavaScript设计模式与开发实践 - 需要记住的东西

## 准备

## 单例模式

### 单例模式的定义

在JavaScript中，单例模式可以定义为对于一个构造函数仅可以创建出一个对象实例，并且有一个可以全局访问这个对象实例的方法。当调用这个方法时，如果这个对象实例存在就返回对实例的引用，若不存在就创建一个对象实例，然后返回对这个实例的引用。

### 单例模式的实现

使用对象字面量直接创建的对象实例一定是单例的。简单但是并不实用，有污染全局空间，缺少封装性等等缺点。一点改进是使用私有变量然后返回访问这些私有变量的接口。例如：
```javascript
	var SingletonEgg = function(){
    	var name = name;
        var getName = function(){
        	return this.name;
        };
        return {
        	getName:this.getName
        }
    };
```

所以在讨论单例模式的时候一般都是不带它玩的。那么如何实习一个比较标准的单例模式呢？可以用一个变量来标志唯一的对象实例是否存在,这个变量就是对对象实例的引用。例如：
```javascript
	var SingletonOne = function(name){
    	this.name = name;
  	};
	SingletonOne.getInstance = (function(){
  		var instance = null;
  		return function(name){
            if(!instance){
                instance = new SingletonOne(name);
            }
            return instance;
  		};
	})();
```
在上面代码中，必须通过```SingletonOne.getInstance```方法来获取唯一对象，这和传统的new形式不同，因此也不太方便。那么现在想要实现一个比较“传统”的单例类，就是说可以通过普通的new形式就能得到一个对象实例。可以使用闭包来创建这样一个单例。
```javascript
	var SingletonTwo = (function(){
    	var instance = null;
      	return function(name){
        	if(instance){
            	return instance;
            }
            this.name = name;
           	return instance = this;
        };
    })();
```
上面的单例类将保证只能创建一个实例对象的操作放在了内部，这就造成了如果想要通过在这个单例类变成一个普通的可以产生多个实例的类，就要去修改构造函数内部的代码，这样是极其不方便的。可以通过引入代理的方式来解决这个问题。
```javascript
	var SingletonThree = function(name){
    	this.name = name;
    };
    var ProxySingletonThree = (function(){
    	var instance = null;
        return function(name){
        	if(!instance){
           		instance = new SingletonThree(name);
            }
            return instance;
        };
    })();
```
通过```ProxySingletonThree```来实现单例模式，原来的```SingletonThree```去做自己应该做的事情，将保证单例性质的操作放在代理类中。这样```SingletonThree```本身和单例并没有什么关联，也可以创建多个实例。

### 惰性单例的实现

JavaScript是在浏览器中施展拳脚的一门语言，也就是说需要和DOM加载联系起来。某些DOM元素不仅仅是在页面中仅需要一个，而且也是在用户需要时才去生成渲染，这就涉及到了惰性加载。例如上面的SingletonOne就是一种惰性加载，在用户需要时调用getInstance方法才会被创建。例如：
```javascript
	var createSingleElement = (function(){
    	var element = null;
        return function(){
        	if(!element){
            	//创建DOM元素
            }
            return element;
        };
    })();
```
通用的惰性单例实现。
```javascript
	var getSingle = function(fn){
    	var result = null;
        return function(){
        	return result || (result = fn.apply(this,arguments))
        }
    };
```

##策略模式

### 策略模式的定义

策略模式的定义是：定义一系列的算法，把他们一个个都封装起来，并且是他们可以互相替换。

### 策略模式的实现

#### 一个简单的例子

将不变的部分和变化的部分分离是每个设计模式的主题，策略模式也不例外，策略模式的目的就是将算法的使用和算法的实现分离开来。例如：
```javascript
	var strategies = {
    	"S": function(salary){
        	return salary*4;
        },
        "A": function(salary){
        	return salary*3;
        },
        "B": function(salary){
        	return salary*2;
        }
    };
    var calculateBonus = function(level,salary){
    	return strategies[level](salary);
    };
    calculateBonus('S',1000);
```

#### 使用策略模式的表单验证

将校验逻辑封装成策略对象，也就是说将表单需要满足的规则封装在一个strategy对象中。
```javascript
    var strategies = {
        isNotEmpty: function(value,errorMsg) {
            if(value === '') {
                return errorMsg;
            }
        },
        minLength: function(value,length,errorMsg) {
            if(value.length < length) {
                return errorMsg;
            }
        },
        mobileFormat: function(value,errorMsg) {
            if(!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
                return errorMsg;
            }
        }
    };
```

下面实现的Validator类负责接受用户的请求并且委托给strategy对象
```javascript
    var Validator = function(){
    	this.cache = [];  // 保存效验规则
	};
    //向Validator中添加规则，参数分别是需要设置规则的表单元素dom，需要添加的规则rule
    //以及错误信息errorMsg
    Validator.prototype.add = function(dom,rule,errorMsg) {
    	//例如rule为minLength:6,则str为['minLength','6']
        var str = rule.split(":");
        this.cache.push(function(){
        	//strategy为minLength, str为['6']
            var strategy = str.shift();
            // 把表单节点dom的value值添加进参数列表,str为[dom.value,'6']
            str.unshift(dom.value);
            // str为[dom.value,'6',errorMsg]
            str.push(errorMsg);
            // 进行上述操作的理由是保证参数的顺序
            return strategies[strategy].apply(dom,str);
        });
    };
    Validator.prototype.start = function(){
        for(var i = 0, validatorFunc; validatorFunc = this.cache[i++]; ) {
            // 开始效验并取得效验后的返回信息
            var msg = validatorFunc();
            if(msg) {
                return msg;
            }
        }
    };
```

如何使用Validator对象
```javascript
    var validateFunc = function(){
        var validator = new Validator(); // 创建一个Validator对象
        /* 添加一些效验规则 */
        validator.add(registerForm.userName,'isNotEmpty','用户名不能为空');
        validator.add(registerForm.password,'minLength:6','密码长度不能小于6位');
        validator.add(registerForm.userName,'mobileFormat','手机号码格式不正确');
        var errorMsg = validator.start(); // 获得效验结果
        return errorMsg; // 返回效验结果
    };
    var registerForm = document.getElementById("registerForm");
    registerForm.onsubmit = function(){
        var errorMsg = validateFunc();
        if(errorMsg){
            alert(errorMsg);
            return false;
        }
    };
```

## 代理模式

### 代理模式的定义

代理模式是指是为一个对象提供一个代理，代理可以用来控制对对象的访问。代理内部含有对对象的引用，这样就可以通过代理来操作对象，同时代理内部含有与对象相同的方法以便能够在需要时来代替对象。代理模式的关键是，当不方便直接访问一个对象或不满足访问这个对象的条件的时候，提供一个代理对象来控制对这个对象的访问，实际上访问的是代理对象。然后代理对象对请求做出一些处理之后，再把请求转交给原来的对象。

### 一个例子

作者的例子就不说了，根据自己的理解举个栗子，道理都是相同的。栗子还是很好吃的。
```javascript
	var me = {
    	say: function(person,message){
            person.hear(message);
        };
    };
    var you = {
    	hear: function(message){
        	console.log(message);
        };
    };
    me.say(you,'im your father');
```
毫无疑问会被打，那我换个方式。
```javascript
	var me = {
    	say: function(person,message){
            person.hear(message);
        };
    };
    var you = {
    	hear: function(message){
        	console.log(message);
        };
    };
    var tyson = {
    	hear: function(){
        	you.hear('im your father');
        };
    };
    me.say(tyson,'tell him');
```
不会被打了，这就是代理模式的好处。

### 保护代理和虚拟代理

在上面的例子中，如果是和tyson不太熟的人就会被拒绝，这种根据某些条件过滤掉某些不符合要求的请求，叫做保护代理。虚拟代理不太好带入上面的例子中。。。将一些开销很大的对象在真正需要它的时候再去创建叫做虚拟代理。下面来看看虚拟代理的其他例子和应用。

### 虚拟代理实现图片预加载

一个不使用代理的图片预加载函数可以这样实现。
```javascript
	var myImage = (function(){
    	var imageNode = document.createElement('img');
        document.body.appendChild(imageNode);
        var img = new Image;
        img.onload = function(){
        	imageNode.src = src;
        };
        return {
        	setSrc: function(src){
            	imageNode.src = 'link';
                img.src = src;
            }
        }
    })();
    myImage.setSrc('link');
```
使用了代理模式的预加载图片，通过代理对象proxyImage来控制对myImage对象的访问。
```javascript
	var myImage = (function(){
    	var imageNode = document.createElement('img');
        document.body.appendChild(imageNode);
        return {
        	setSrc: function(src){
            	imageNode.src = src;
            }
        }
    })();
    var proxyImage = (function(){
    	var img = new Image;
        img.omload = function(){
        	myImage.setSrc(this.src);
        }
        return {
        	setSrc: function(src){
            	myImage.setSrc("");
                img.src = src;
            }
        }
    })();
    proxyImage.setSrc("");
```
在说明使用代理的作用之前，先来了解一下什么是单一职责原则。
单一职责原则，是指就一个类（对象、函数）而言，应该仅有一个引起它变化的原因。如果一个对象承担了过多的职责，就意味着它将变得巨大，引起它变化的原因就多，它把这些职责耦合到了一起，这种耦合会导致程序难于维护和重构。这时候，我们可以把该对象（本体）的其中一部分职责分离出来给一些第三方对象去做，本体只管自己的一些核心职责，这些第三方对象就称作代理。代理对象可以作为对象（也叫“真正的主体”）的保护者，让真正的主体对象做尽量少的工作。在代理模式中，一个对象充当了另一个对象的接口的角色。通常代理和本体的接口应该保持一致性，这样当不需要代理的时候，用户可直接访问本体。当我们不方便直接访问一个对象时，就可以考虑给该对象设置一个代理对象。
具体到上面的例子中，在不使用代理模式时，myImage对象除了负责设置img节点的src属性之外还要负责进行预加载操作，这是不太符合单一职责原则的。所以可以使用代理模式将某部分操作分离出去，例如这里的用proxyImage对象来进行图片预加载操作。这样在不需要预加载之后也不需要去改动myImage对象。

### 缓存代理

一个例子。
```javascript
	var mult = function(){
    	var a = 1;
        for(var i = 0,l = arguments.length; i < 1; i++){
        	a = a*arguments[i];
        }
        return a;
    };
    var proxyMult = (function(){
   		var cache = {};
        return function(){
        	var args = Array.prototype.join.call(arguments,',');
            if(args in cahe){
            	return cache[args];
            }
            return cache[args] = mult.apply(this,arguments);
        };
    })();
```
缓存代理同样可以用于ajax异步请求数据，例如在分页功能中，可以将已经拉取到的数据放到一个缓存对象中。

## 迭代器模式

### 迭代器模式的定义

迭代器模式就是指提供一种方法顺序访问一个聚合对象中的各个元素,同时不暴露对象的内部细节。大部分语言都实现了内置的迭代器，比如说JavaScript的```Array.prototype.forEach```函数。

### 内部迭代器与外部迭代器

内部迭代器和外部迭代器同样能完成迭代访问一个聚合对象。不同之处在于，使用外部迭代器时,是需要用户自己控制迭代顺序或者过程的，比如说需要显式地请求下一个迭代元素,而在使用内部迭代器时,迭代器会在初始调用后接手整个迭代过程，这是因为内部迭代器的迭代规则已经提前被规定好了。
相比较而言，外部迭代器肯定是更加灵活的，能满足更多的需求。

> 无论是内部迭代器还是外部迭代器，只要被迭代的聚合对象中拥有length属性而且可以用下标访问，那么就可以被迭代。因此可以迭代类数组对象和字面量对象。

### 实现一个简单的迭代器

```javascript
	var each = function(array,callback){
    	for(var i = 0, l = array.length; i < l; i++){
        	callback.call(array[i],i,array[i]);
        }
    };
    each([1,2,3],function(index,value){
    	console.log(index,value)
    });
```

### 更加广义的一个迭代器

一个称职的迭代器应该具有以下几种接口：定义初始元素、移动到下一个元素、获取当前元素、判断迭代是否结束。
```javascript
	var Iterator = function(obj){
    	//定义初始元素
        var current = 0;
        //移动到下一个元素
        var next = function(){
        	current++;
        };
        //获取当前元素
        var getCurrent = function(){
        	return obj[current];
        };
        //判断迭代是否结束
        var hasNext = function(){
        	return current < obj.length;
        };
    };
```
这也是一个外部迭代器的标准实现。

### 迭代器模式的应用

在应用方面，作者举的例子很经典，我做了一些精简修改，来看代码。
```javascript
	var getObj = function(){
    	try{
        	return new ObjOne();
        }catch(e){
        	if(Object.prototype.toString.call(ObjTwo) 
            === '[object Function]'){
            	return new ObjTwo();
            }else{
            	return {'hello':'im your father'};
            }
        }
    };
```
上面代码类似于浏览器的兼容性探测。分析一下，缺点显而易见，对象的功能在内部早已定义好，如果在后续开发中有新的需求时只能去修改原来的代码。我们可以将获取不同对象的代码分离出来，然后定义一个迭代器来选择适当的方法。还是那句话，将不变的部分和变化的部分分离是每个设计模式的主题。
```javascript
	var getObjOne = function(){
    	try{
        	return new ObjOne();
        }catch(e){
        	return false;
        }
    };
    var getObjTwo = function(){
    	if(Object.prototype.toString.call(ObjTwo)==='[object Function]'){
            return new ObjTwo();
        }else{
            return {'hello':'im your father'};
        }
    };
    var iteratorObj = function(){
    	for(var i = 0,fn; fn = arguments[i++];){
        	var obj = fn();
            if(obj !== false){
            	return obj;
            }
        }
    };
```

##发布订阅/观察者模式

发布订阅模式又称为观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。DOM事件就是最常见的一种发布订阅模式。

### 发布订阅模式的通用实现

```javascript
	var Event = (function(){
    	var clientList = {},
        	listen,
            trigger,
            remove;
        listen = function(key,fn){
        	if(!this.clientList[key]){
            	this.clientList[key] = [];
            }
            this.clientList[key].push(fn);
        };
        trigger = function(){
        	var key = Array.prototype.shift.call(arguments);
            var fns = this.clientList[key];
            if(!fns || fns.length ===0){
            	return false;
            }
            for(var i=0,fn;fn=fns[i++];){
            	fn.apply(this,arguments);
            }
        };
        remove = function(key,fn){
        	var fns = this.clientList[key];
            if(!fns){
            	return false;
            }
            if(!fn){
            	fns && (fns.length=0);
            }else{
            	for(var l = fns.length-1; l>=0; l--){
                	var _fn = fns[l];
                    if(_fn === fn){
                    	fns.splice(l,1);
                    }
                }
            }
        };
        return {
            listen:listen,
            trigger:trigger,
            remove:remove
        }
	})();
```

### 能够解决的问题

举个例子。在篮球场上，一个球正在向你传来，这看作是一个事件称之为catch，当你成功接住球没有手滑失误之后，触发了接球成功的事件。这时你应该选择传球还是直接投篮怒打一铁,相应地你需要指挥队友跑位或者去卡位抢篮板，用代码来表示如下。
```javascript
	catch.success(function(){
    	you.pass();
        teammate.run();
        you.shoot();
        teammate.rebound();
    });
```
但是，有一天你成了卧底，球到了你手上你必须带球狂奔出界，这时有了一个新的方法叫做out(),队友肯定很生气要打你，这时又有了一个新的方法beat(),那么要在原来代码的基础上修改。
```javascript
	catch.success(function(){
    	pass();
        teammate.run();
        shoot();
        teammate.rebound();
        you.out();
        teammate.beat();
    });
```
可以看出，每次在你成功接球之后多了一种选择的话，都需要原来的基础上添加，有点麻烦。使用发布订阅模式重构一下，每次接到成功接住球之后，你都大喊一声“我接到球了！”表示一下，然后队友们听见之后就知道该干嘛干嘛去了。
```javascript
	catch.success(
    	you.trigger('catchSuccess');
    });
    var teammate = (function(){
    	this.listen('catchSuccess',function(){
        	run();
            rebound();
            beat();
        });
    })();
```

### 先发布再订阅

考虑这样一个问题，发布者先发布了一条消息，但在此之前并没有订阅者关心这条消息，那么无疑这条消息将如石沉大海一般。在某些情况下可以将这条消息先保存下来，然后等到有对象来订阅时再重新发布给订阅者。

### 一个比较健壮的发布订阅模式实现

```javascript
	var Event = (function(){
    	var global = this,
        Event,
        _default = 'default';

        Event = function(){
        	var _listen,
            	_trigger,
                _remove,
                _slice = Array.prototype.slice,
                _shift = Array.prototype.shift,
                _unshift = Array.prototype.unshift,
                namespaceCahce = {},
                _create,
                find,
                each = function(array,fn){
                	var ret;
                    for(var i = 0,l = array.length; i < l; i++){
                    	var n = array[i];
                        ret = fn.call(n,i,n);
                    }
                };
                _listen = function(key,fn,cache){
                	if(!cache[key]){
                    	cache[key]=[];
                    }
                    cache[key].push(fn);
                };
                _remove = function(key,fn,cache){
                	if(cache[key]){
                    	if(fn){
                        	for(var i = cache[key].length; i >= 0; i--){
                            	if(cahce[key][i] === fn){
                                	cache[key][i].splice(l,1);
                                }
                            }
                        }else{
                        	//若没有传入事件对应回调函数这个参数，则将全部移除
                        	cache[key] = [];
                        }
                    }
                };
                _trigger = function(){
                		//获取第一个参数，预期值为事件缓存
                	var cache = _shift.call(arguments),
                    	//获取第二个参数，预期值为事件名
                    	key = _shift.call(arguments),
                        args = arguments,
                        _self = this,
                        ret,
                        //获取事件名对应的回调函数队列
                        stack = cache[key];
                    if(!stack || !stack.length){
                    	return;
                    }
                    return each(stack,function(){
                    	return this.apply(_self,args);
                    });
                };
                _create = function(namespace){
                	var namespace = namespace || _default;
                    var cache = {},
                    	offlinestack = [],
                        ret = {
	
                        }
                };
        };
    })();
```

## 命令模式



## 组合模式






















