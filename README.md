# work

起始模版

## index.html

html模板位于views目录。config.json用于配置，一个key-value对为一个html文件，key将作为html文件名，value可选配置包括

+ file，页面模板路径
+ data，作为参数传入模板，依照模板自定义

html文件会在postinstall阶段生成，若需修改模版或配置，在打包前执行`npm run copyindex`重新生成

## bundle

bundle任务使用browserify打包，concat任务使用gulp-concat合并，两种方式可同时使用，配置constants.js提供路径

## Template

若使用Handlebars，全局变量`Template`用于获取预处理的Handlebars模版，模版在`app/templates`中定义，需同时配置copyindex.js和gulpConfig/constants.js

若使用zp-lib/templater，在`app/scripts/templates`中定义

+ [google/web-starter-kit](https://github.com/google/web-starter-kit "google/web-starter-kit")
+ [Including .css files with @import is non-standard behaviour which will be removed in future versions of LibSass.](https://github.com/sass/node-sass/issues/2362 "Including .css files with @import is non-standard behaviour which will be removed in future versions of LibSass.")
