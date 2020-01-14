const JasmineCore = require('jasmine-core')

// @ts-ignore
global.getJasmineRequireObj = function () { // 为了让 jasmine-ajax 插件运行成功，我们需要手动添加全局的 getJasmineRequireObj 方法
    return JasmineCore
}

require('jasmine-ajax') // 每次跑具体测试代码之前会先运行该文件，我们可以在这里去初始化 jasmine-ajax
