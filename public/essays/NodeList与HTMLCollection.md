# NodeList与HTMLCollection

前几天刷知乎的时候看到了一个`Nodelist`和`HTMLCollection`的问题，发现这个知识点自己记得不是很清楚，所以还是有必要弄弄清楚。

《JavaScript高级程序设计》中是这样说的。`NodeList`是一种类数组对象，保存的是一组节点包括元素节点，文本节点等等。它具有`length`属性，也可以通过方括号索引或者`item()`方法来访问其中的节点，但他并不是一个`Array`的实例，也就是说并不是一个真正的数组。`NodeList`是基于DOM结构动态执行查询的结果，因此DOM结构的变化能够实时地反应到`NodeList`对象当中。`HTMLCollection`对象与`NodeList`对象十分相似，它不仅具有`length`属性，也可以通过方括号索引或者`item()`方法来访问其中的节点，而且也是根据DOM的变化实时更新的。不同之处在于它还有一个方法`nameItem()`，此方法可以通过元素的`name`属性来获取相应的元素，并且`HTMLCollection`中的节点都是元素节点，是不包括文本等其他类型节点的。

一般来说，在需要获取原生DOM对象的时候，使用不同的方法所获得的对象类型是不同的。例如，在大多数浏览器中，`document.body.childNodes`得到的就是`NodeList`，`document.querySelectorAll()`获取的也是`NodeList`对象，但它是静态的，不会根据DOM的变化而相应地更新。`document.getElementsByTagName()`或者`document.getElementsByClassName()`等方法得到的则是`HTMLCollection`。

还有一点，不过也不用太在意。。。IE8及以下版本浏览器中，注释属于`HTMLCommentElement`，算作`Element`，因此也会出现在`HTMLCollection`里。

参考
[DOM中的NodeList与HTMLCollection](http://www.cnblogs.com/summerTea/p/4943533.html)
[原生DOM探究 - NodeList v.s. HTMLCollection ](http://www.cnblogs.com/joyeecheung/p/4067927.html)
[Difference between HTMLCollection, NodeLists, and arrays of objects](http://stackoverflow.com/questions/15763358/difference-between-htmlcollection-nodelists-and-arrays-of-objects)



