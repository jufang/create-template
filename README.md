# 安装依赖包
`pnpm i`

# 启动命令，执行选择模板
使用esno来运行 ts 代码

`npx esno src/index.ts 模板输出文件目录|react-project`

按照提示选择模板，主要是自己写的模板放在这里，选择`custom-reactcrud`

# 源码
具体代码逻辑可以查看`src/index.ts`
代码都有注释
# 引入包作用
* 几个 Node 里面常用模块：fs 文件模块、path 路径处理模块以及 fileURLToPath 转文件路径模块；
* minimist 解析命令行传入的参数；
```
node example/parse.js test1 test2 -a beep -b boop
# 输出 { _: [test1, test2], a: 'beep', b: 'boop' }
npx esno src/index.ts   
 输出 {_: []}
npx esno src/index.ts  --template react-ts
输出 {_: [], template: 'react-ts'}
npx esno src/index.ts  react-project/ --template react-ts
输出 {_: ['react-project/'], template: 'react-ts'}
```
* prompts 命令行交互提示；
* kolorist 给输入输出上颜色；