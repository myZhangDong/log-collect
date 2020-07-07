# log-collect

log-collect是一个简单、轻量级的日志控制、采集模块。它使用浏览器的console方法，不会丢失行号、堆栈等信息，同时又能提供日志的级别控制，和日志的采集导出功能。

## Features

### 简单
log-collect 使用浏览器自带的console，功能简单，是可以用来代替浏览器原生console的方法，同时提供日志级别和采集功能。可以很方便的使用它采集日志追踪问题。

### 实用
log-collect 没有更多的功能，但都是很实用的，可以用它做日志级别控制，也可以很方便的使用它采集日志来追踪问题，同时可以设置日志缓存的大小（默认3M），从而不影响性能。

## Download
```shell
npm install @eastzhang/logcollector --save-dev
```

## 示例

引入：
```javascript
import Logger from @eastzhang/logcollector

Logger.trace('trace')
Logger.warn('warn')
Logger.debug('debug')
Logger.info('info')

// 也可以获取一个新的logger
const logger = Logger.getLogger('test logger')
logger.log('test logger')

```

## APIs

+ getLogger(name): 获取一个新的Logger实例，可以使用多个Logger实例来打印日志，每个实例的日志都可以保存

+ getLoggers(): 获取全部Logger实例

+ setLevel(): 设置日志级别levels = {
	"TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
    "ERROR": 4, "SILENT": 5
}, 默认为DEBUG

+ getLevel(): 获取当前日志级别

+ enableAll(): 允许打印、采集全部日志

+ disableAll(): 禁止打印所有日志

+ getLogs(): 获取采集的日志

+ setConfig(config): config={
	useCache: false, //是否采集缓存日志
    maxCache: 3*1024*1024 //缓存日志最大值
}

## License
Copyright (c) 2020 eastzhang  
Licensed under the MIT license.

## [github](https://github.com/myZhangDong/log-collect)




