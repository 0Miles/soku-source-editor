# 发布版本
[English](../en/release-version.md) | 中文  
  
- [介绍](./introduction.md)
- [开始使用](./getting-started.md)
- [编辑模块](./edit-module.md)
- 发布版本
- [发布到Gitee](./release-on-gitee.md)

## 前期准备
### 创建 Github 个人访问令牌
请参考[此Github官方文件](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)创建个人访问令牌。  
请至少勾选以下权限：
- ``repo``
- ``admin:org > write:org``
- ``admin:org > read:org``

### 设置 Github 令牌
在设置页面中，将生成的令牌填入 Github Token 字段中。
![release-version1](./release-version(1).png)

## 创建版本
在要创建版本的模块页面，点击“添加版本”按钮。  
![release-version2](./release-version(2).png)
  
将新版本模块文件拖放到“模块文件”区域，并输入相关信息，然后点击“添加”。
![release-version3](./release-version(3).png)

- “Release notes”字段支持多语言和Markdown，将用作在Github Release上展示的内容。只有默认语言的内容会发布到Github上，其他语言的内容将在SokuLauncher的更新提示中展示。

- “Main file”指的是作为模块入口的文件，通常是dll文件。
- “Config files”是一些用作配置文件的文件，在更新时，如果用户的模块文件夹已有这些文件，将保留用户原有的文件而不覆盖。

## 发布到Github
点击“发布”按钮。
![release-version4](./release-version(4).png)
  
勾选您想要发布到的目标仓库，然后点击“发布”。
![release-version5](./release-version(5).png)  
如果勾选了“在发布后将此版本设置为推荐版本”，这个版本将在发布完成后自动被设为推荐版本，供用户更新。

稍等片刻，发布完成。  
![release-version6](./release-version(6).png)

## 将更改同步到远程仓库
完成创建版本或发布后，需要将更改同步到远程模块仓库。  
请在Source页面点击有更改的Source的同步按钮，同步通常会在几秒内完成。
![release-version7](./sync.png)