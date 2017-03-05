# JavaScript启示录 - 需要记住的东西

1. 对于一个函数，如果使用new来调用该函数，则函数内部的this指向正在构建的新对象。如果仅仅是调用该函数，那么函数内部的this将指向包含该函数的父对象。例如：
	```javascript
        var Person = function(name){
        this.name=name;
        this.getName=function(){
            console.log(this.name);
            }
        }
        var a = new Person('feng');
        var b = Person('fss');
        console.log(a);
        console.log(b);
        console.log(name);  //window.name，输出fss
    ```

2. 可以放弃new关键字和构造函数的概念，在函数内部显式的返回一个对象，但是这样会避开原型继承的使用。
    ```javascript
        var Person = function Person(
              return:{
                  name:'name';
              };
         );
    ```

3. Math对象是一个静态对象，不能够使用new关键字去实例化它。实际上，Math只是一个对象命名空间，用于储存数学函数，方便开发人员调用。

4. 原始值复制是真实值复制，改变origin的值不影响copy的值。而对象的复制是引用复制，它们指向同一个引用，因此改变origin的值会影响到copy。

5. 当属性名称是Javascript无效标识符时，仍然可以使用中括号表示法获取，但不可以使用点表示法获得其值。一般情况下，不建议使用无效标识符作为属性名称。
	```javascript
	 	var foo = {
             '123':'name',
             'var':'variable'
        	};
        console.log(foo.123);      //错误
        console.log(foo['123']);   //正确
    ```

6. in操作符会遍历对象以及原型链中所有可枚举的属性。可以结合hasOwnProperty方法来过滤掉原型链中的属性来遍历实例属性。

7. 大多数情况下是不需要将属性值设置为字符串的，除非属性名是保留字或者包含空格等特殊情况。

8. 在Javascript中，省略函数参数是完全合法的。如果一个函数在定义时声明了参数，而调用时并未传递相应的参数，将为省略的参数赋予了undefined。同样的，如果调用时传入了为提前声明的参数，也可以通过函数的arguments对象来访问这些参数，并不会出现错误。

9. this值是基于调用函数的上下文的。可以使用其他变量来保留对this的引用，以便this值不丢失。例如：
    ```javascript
        var myObj = {
             myPro:'yes',
             myMeth:function(){
                  var that = this;
                  var foo = function(){
                      console.log(that.myPro);
                      console.log(this.myPro);
                      console.log(this);
                  }();
             }
        };
        var myPro = 'no';
        myObj.myMeth();
    ```

10. 当在prototype对象中的方法内部使用this关键字时，this指向该构造函数所创建的实例。

11. 使用新对象替换prototype属性会删除默认的constructor属性，并且不会影响之前所创建的实例。

12. 由Boolean构造函数创建的false布尔对象会转换为true值。例如:
    ```javascript
        var falseObj = new Boolean(false);
        //判断为真
        if(falseObj){
             console.log('true');
        }
    ```

13. 验证null值时使用===,使用==是无法区分null值和undefined值的。
