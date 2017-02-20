# gulp入坑

## 先入个门

首先是安装。值得注意的一点是，在使用命令``npm install -g gulp``全局安装之后，在项目内部也需要再使用``npm install gulp --save-dev``局部安装一次。这是因为在不同的项目中使用不同版本的gulp，如果仅在全局装一个gulp所有项目就只能使用同一个版本的gulp了。全局安装gulp是为了执行gulp任务，本地安装gulp则是为了调用gulp插件的功能。其实甚至不需要全局安装整个gulp，只安装gulp-cli就可以在命令行执行gulp任务。

接下来需要新建一个gulpfile.js文件，用于指定gulp需要完成哪些任务。一个示例如下。

```javascript
    var gulp = require('gulp');
    var sass = require('gulp-sass');
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');
    var rename = require('gulp-rename');

    gulp.task('default',function(){
    	console.log('hello gulp');
    });

    gulp.task('scripts', function() {
        gulp.src('./js/*.js')
            .pipe(concat('all.js'))
            .pipe(gulp.dest('./dist'))
            .pipe(rename('all.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./dist'));
    });

    gulp.task('sass', function() {
        gulp.src('./sass/*.scss')
            .pipe(sass())
            .pipe(gulp.dest('./css'));
    });
```
## 如何使用

目前的gulp 3.x版本只有四个方法：task，watch，src和dest，用法可以看看API。在熟悉API之后来看这样一个问题。我们知道可以在gulp task中规定任务之间的依赖，也就是说可以规定在这个任务之前需要先执行哪些任务。
```javascript
	gulp.task('one',function(){
    	//code
    });
    gulp.task('two',['one'],function(){
    	//code
    });
```
任务one定义的function执行完毕后，任务two定义的function才会开始执行。但是在gulp任务中大多数情况下都是对数据流的操作，其进度与函数执行完成与否无关。所以说很有可能函数本身已经执行完毕了，但是数据流操作仍在进行中。怎么解决呢？这就需要根据数据流的操作来决定任务是否开始执行。那么如何在一个任务运行系统中监听数据流的结束？对于数据流而言，代码语句的执行结束仅仅意味着数据操作的开始，唯一能确定数据操作结束的是最后一个数据流所触发的end事件。因此，只有想办法监听到这个end事件，才有可能实现真正意义上的任务依赖。而在任务定义的函数中返回最后一个数据流，是一个相对来说使用起来最方便的方案。
所以在官方文档中有这样三种解决方法。
1. 在任务定义的function中返回一个数据流，也就是stream，当该数据流的end事件触发时，任务结束。
2. 在任务定义的function中返回一个promise对象，当该promise对象resolve时，任务结束。
3. 在任务定义的function中传入callback变量，当callback()执行时，任务结束。

## 常用插件

### browser-sync
这是一个神器不谦虚

### gulp-cancat
合并文件

### gulp-sass
编译sass、scss文件

### gulp-rename
重命名文件

### gulp-minify-css / gulp-clean-css
压缩css文件

### gulp-autoprefixer
添加浏览器兼容的css前缀

### gulp-uglify
压缩js文件

### gulp-watch
监视文件变动

### gulp-jshint
js语法检测

### gulp-imagemin
压缩图片

### gulp-clean
清空文件夹

## 参考

[Gulp中文网](http://www.gulpjs.com.cn/)
[前端构建工具gulp入门教程](http://www.tuicool.com/articles/FJVNZf)
[Why do we need to install gulp globally and locally?](http://stackoverflow.com/questions/22115400/why-do-we-need-to-install-gulp-globally-and-locally)
[BrowserSync，迅捷从免F5开始](https://segmentfault.com/a/1190000002607627)