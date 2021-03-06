# 高性能JavaScript - 需要记住的东西

## 加载与执行

### 脚本的位置与组织

页面加载过程中，在遇到body标签之前，不会渲染页面中的任何部分。每当遇到脚本时，页面的加载和渲染都必须停下来等待脚本执行完成。原因是脚本执行过程中可能会对DOM进行操作，进而很大可能会修改页面的内容。在这种情况下，如果把script标签全部放在body标签之前，那么只有等待脚本全部加载完毕后才会开始对DOM进行渲染，这大大影响了用户体验。相应的措施是将脚本的放在页面的最后。
加载脚本时，每个脚本文件都必须等到前一个文件下载并执行完成后才会开始下载。并且每次加载外部脚本都会有一次HTTP请求，这是非常影响性能的。将多个脚本合并成数量相对较少的脚本可以在一定程度上解决这个问题。

### 无阻塞加载脚本

#### defer与async

可以对script元素设置defer属性，说明该脚本不会修改DOM，因此可以与页面的加载并行执行。任何带有defer属性的脚本文件一定会在DOM加载完成之后才会被执行，也就是在onload事件之前被执行。值得注意的是，defer属性仅当src属性声明时才有有效。
HTML5中引入了async，用于异步加载。两者之间的区别是async在加载完成后会自动执行，而defer是在DOM加载完成后才会执行。

#### 动态加载

动态加载是指通过javascript创建script标签并指定其src属性来加载相应的脚本文件。但是简单的动态创建script标签，一但进行了append操作插入到DOM里时就会自动执行代码。想要在脚本完全加载完成后再执行，一个比较简单的动态加载方法如下：
```javascript
	function loadScript(url,callback){
    	var script = document.createElement("script");
        script.type = "text/javascript";
        if(script.readyState){
        	//针对IE
        	script.onreadystatechange = function(){
            	if(script.readyState=="loaded"||script.readyState=="complete"){
                	script.onreadystatechange = null;
                    callback();
                }
            };
        }else{
        	//其他浏览器
        	script.onload = function(){
            	callback();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }
```
由于浏览器的跨域限制，所以并不推荐使用XHR脚本注入方法。

#### 推荐的类库
LazyLoad, LABjs
[如何使用](http://www.ruanyifeng.com/blog/2011/10/javascript_loading.html)

## DOM编程

### DOM访问和修改

1. 减少访问DOM的次数，尽量将运算操作放在ECMAScript中。
2. 更新HTML推荐使用innerHTML来取代DOM方法。但在少数基于webkit的新版浏览器中，原生的DOM方法会更快一些。
3. 先创建需要复制的元素然后再克隆这个元素，要比直接创建要快那么一点。
4. HTML集合会实时更新，因此每当有关于集合的操作时都会执行查询过程，这对性能有着很大的影响。由于访问数组的速度比访问集合的速度快很多，所以如果对集合有着较多次数的访问，那么将集合转为数组是一个不错的选择。但是将集合转为数组需要多遍历一次集合，因此在对集合访问次数较少的情况下就不需要多此一举了。
5. 遍历一个集合，一个优化原则是将集合存储在局部变量中，并且把length属性缓存在循环外部。
6. 选择合适的API。例如querySelectorAll()会返回一个NodeList，这是一个类数组对象，并不是HTML集合，不会实时对应更新的DOM。

### 重绘和重排

当浏览器下载完所有页面HTML，JavaScript，CSS和图片之后，它解析文件并创建两个内部数据结构：DOM树和渲染树。DOM树中每一个需要显示的节点在渲染树中至少存在一个对应的节点，也就是说DOM树中隐藏的节点是不会渲染的，这也合乎常理。渲染树中的节点称之为帧(frames)或盒(boxes)。当DOM树和渲染树构建完成后，浏览器便开始绘制(paint)页面元素。
当DOM树中页面节点的几何属性例如宽高改变后，浏览器需要重新计算元素的几何属性，而且其他元素的几何属性和位置也会因此改变。浏览器会使渲染树上受到影响的部分失效，然后重构渲染树。这个过程被称作重排(reflow)。完成重排后，浏览器会重新绘制屏幕上受影响的部分到屏幕上，称之为重绘(repaint)。但不是所有的DOM 改变都会影响几何属性。例如，改变一个元素的背景颜色不会影响它的宽度或高度。在这种情况下，只需要重绘不需要重排。重绘和重排的代价非常高，因此应当合并多次对DOM和样式的修改，然后一起处理。

#### 改变样式尽量使用类。

如果需要对DOM节点的样式进行修改，不要重复使用element.style.attribute='some attribute'的形式。这也会多次访问DOM节点。可以对节点进行一次性的样式设置或者对其设置不同的类来改变其样式。

#### 批量修改DOM

1. 元素脱离文档流。
2. 文档片段(推荐)。
3. 克隆节点。

#### 元素的动画操作

对元素进行动画操作时，例如对某个元素的slideUp和slideDown操作，这会导致在此元素下面的所有进行重排和重绘。因此可以使用绝对定位等方法使其脱离文档流，从而减少对其他元素的影响。原则上应该对所有的动画都设置为绝对定位，否则就尽量减少其动画操作。因为对于并不是非常重要的动画效果来说，页面的卡顿是更加难以接受的。

#### 事件委托

事件委托利用事件冒泡，仅仅对一系列需要指定事件监听器的元素的父元素指定一个事件监听器，来监听这一系列的事件。在父元素监听到事件后，在事件处理程序内部根据event.target来判断事件源是哪个元素然后采取相应的操作。

## 数据存取

### 尽量使用字面量和局部变量

对字面量和局部变量的访问速度要远快于数组元素和对象成员，应该尽量使用字面量和局部变量。数组元素是通过数字进行索引来访问元素，对象成员则是通过字符串进行索引来访问其成员，这也是为什么访问数组元素会比访问对象成员要快那么一点的原因。
如果有某个跨作用域的值在函数中被引用了较多次数，那么将它存储到局部变量是一个可以提升性能的做法。这是因为局部变量总是存在与作用域链的起始位置，全局变量存在于作用域链的最末端。变量在作用域链中位置越深，访问所耗费的时间就越长。

### 改变作用域链

一般来说，一个执行环境的作用域链是不会改变的。但是有两个语句可以在执行时临时改变作用域链。第一个是with语句，不推荐使用。第二个是try-catch语句中的catch子句，同样应当避免使用。

### 闭包会影响到内存消耗和执行速度

一般情况下，函数运行完成后其上下文环境(context)就会被销毁，但是在函数内部使用了闭包的情况下，其上下文环境是不能被销毁的，这样就需要更多的内存开销。因此使用闭包会有更多的内存开销，应当尽量避免使用闭包。

### 原型链和嵌套对象

嵌套对象和原型链同理。位置越深访问越慢。访问window.some.obj.name的速度总是比访问window.some.obj要慢。访问obj.prototype.name总是比访问obj.name要慢。