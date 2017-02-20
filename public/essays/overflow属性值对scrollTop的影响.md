# overflow属性值对scrollTop的影响

在写页面滚动时遇到了scrollTop始终为0这个问题，document.documentElement.scrollTop或者document.body.scrollTop也没用。上网查了下，大多数都是因为浏览器兼容或者DTD设置的问题，还是没有解决我的问题，只好上MDN看了下scrollTop比较官方的释义。

> The Element.scrollTop property gets or sets the number of pixels that the content of an element is scrolled upward. An element's scrollTop is a measurement of the distance of an element's top to its topmost visible content. When an element content does not generate a vertical scrollbar, then its scrollTop value defaults to 0.

翻译一下就是这个Element.scrollTop属性可以设置或者获取一个元素所包含内容的滚动向上的像素值，也就是此元素顶部到其最高可见内容的距离。还是一头雾水。想了想可能跟body或者什么的CSS设置有关，所以查一查样式怎么设置的，然后一个一个的调试。最后发现跟body的overflow设置有关，为什么？

![css-overflow](http://localhost:3000/essays/css-overflow.png)

也就是说当你设置overflow为auto,hidden,或者scroll的时候，滚动时超出页面可视范围的内容就会被修剪，元素顶部到最高可见内容的距离当然是0了。当为默认值visible时元素内容不会被修剪，因此scrollTop的值就出来了。