# 多此一举生成器

这个工具仅需输入文字便可生成 pc 端微信聊天截图
因为使用了 Node Canvas 的缘故，需要使用者自己部署本地项目，本工作流仅提供快捷调用，实际功能由本地 Node.js 项目提供。

Node.js 项目地址: https://github.com/RongleCat/fmcat-redundant-generator

拉取项目后先安装依赖，运行 npm run test-dark 测试是否能生成图片
安装依赖卡住的请访问: https://www.npmjs.com/package/canvas

## 变量
**headUrl**: 聊天截图的头像路径，需要网络地址
**nodePath**: 指定 Node.js 的路径，如果没有路径会自动引入 .zshrc 尝试寻找 node 命令，如果无法满足请大佬自行修改。
**projectPath**: Node.js 项目路径，需要系统绝对路径