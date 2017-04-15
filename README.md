# work

起始模版

app/index.html会在postinstall阶段生成，若需修改模版或配置，在打包前执行`npm run copyindex`重新生成app/index.html

bundle任务使用browserify打包，concat任务使用gulp-concat合并，两种方式可同时使用，配置constants.js提供路径

全局变量`Template`用于获取预处理的Handlebars模版，模版在`app/templates`中定义，需同时配置copyindex.js和gulpfile.babel.js

+ [google/web-starter-kit](https://github.com/google/web-starter-kit "google/web-starter-kit")
