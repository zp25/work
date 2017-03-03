# work

起始模版

~~~
# .env
SCRIPT=bundle
~~~
配置

+ `SCRIPT`，js打包方式
  + `concat`，使用`gulp-concat`合并
  + `bundle`，使用browserify打包

app/index.html会根据`SCRIPT`配置在postinstall阶段生成，若需修改配置，在打包前执行`npm run copyindex`重新生成app/index.html

全局变量`Template`用于获取预处理的Handlebars模版，模版在`app/templates`中定义，需同时配置copyindex.js和gulpfile.babel.js

+ [google/web-starter-kit](https://github.com/google/web-starter-kit "google/web-starter-kit")
