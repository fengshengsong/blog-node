# vue-validator入坑指南

请注意，当你想要使用如 v-if 和 v-for 这些 terminal 指令时，应把可验证的目标元素包裹在 <template> 之类的不可见标签内。因为 v-validate 指令不能与这些 terminal 指令使用在同一元素上。