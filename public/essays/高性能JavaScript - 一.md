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
