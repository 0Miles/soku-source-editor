# 介绍
[English](../en/introduction.md) | 中文  
  
- 介绍
- [开始使用](./getting-started.md)
- [编辑模块](./edit-module.md)
- [发布版本](./release-version.md)
- [发布到Gitee](./release-on-gitee.md)

## 关于源

SokuLauncher模块中心中的源是使用Github Pages托管的Github存储库。这些存储库包括特定文件，如modules.json，以一定的文件夹结构组织，其中包含有关模块的JSON格式信息。一旦将此类Github存储库的URL添加到SokuLauncher的源列表中，当用户按下“检查更新”按钮或在其他适当的时间，启动器将检查这些存储库的内容，并向用户显示可用的更新。

## 源存储库的结构

一个源存储库通常包括：

- ``soku-mod-source.json`` 用于识别存储库为源的文件
- ``modules.json`` 记录包含模块的信息
- ``modules`` 文件夹用于存储模块和版本信息文件

源不包含任何模块的库文件或可执行文件。这些文件应该使用SokuSourceEditor打包成zip，并通过各自仓库的Github Releases頁发布。

## SokuSourceEditor的工作原理

在使用SokuSourceEditor编辑源时，它会生成预定格式的模块信息和版本信息文件，并自动提交它们。编辑后，在源页面上点击同步按钮将自动合并分支并将这些提交推送到源的存储库。这些操作依赖于Git，因此安装Git并配置用户和登录信息是使用SokuSourceEditor的先决条件。

## 为什么使用Github存储库作为源

Github的Pages服务是免费的，消除了维护模块更新源信息的额外费用。借助Github强大的机制，添加协作者以编辑源非常轻松。如果新开发人员想要加入但尚未获得权限，他们可以复制源存储库，进行编辑，并提交PR。此外，SokuSourceEditor提供API集成，以将模块发布到Github Releases，使模块开发人员更加方便。如果这种方法变得流行，基于Github存储库的源会让未来开发命令行的CI/CD工具将更为简单。

## 为什么使用SokuSourceEditor将模块发布到Github Releases

所有发布任务仅需点击几下，SokuSourceEditor负责各种发布流程。然后，用户可以在SokuLauncher上看到更新！  
SokuSourceEditor将模块文件打包成结构化的zip，提供了几个优势。我们可以设置炫酷的模块图标、横幅或用户模块中心安装模块时可见的模块描述。  
此外，由于固定的包结构，SokuLauncher很容易识别模块信息，使通过SokuSourceEditor发布的每个zip都成为SokuLauncher的合法模块安装包。即使没有自动更新，用户只需将zip文件拖放到SokuLauncher上即可安装模块。
