# Edit Modules
English | [中文](../zh-Hans/edit-module.md)  
  
- [Introduction](./introduction.md)
- [Getting Started](./getting-started.md)
- Edit Module
- [Release Version](./release-version.md)
- [Release on Gitee](./release-on-gitee.md)

## Add a Module
Click the "Add Module" button.
![edit-module1](./edit-module(1).png)
  
Fill in the module information and click "Add" to create the module.
![edit-module2](./edit-module(2).png)

The "Description" field supports markdown and multiple languages. You can switch the language you want to edit via the dropdown in the upper right.  
  
"Module priority" affects the loading order of modules during game execution, with more significant impact on older d3d9.dll users. Generally, keeping it at 0 is sufficient.  
  
The "Repository" field can be filled with the Github repo used to store releases.  
- If you're a module author, you can use your own module repository.  
- If you're a Source maintainer, it's recommended to use the [package-template](https://github.com/soku-cn/package-template) to create an organization repository with an README.md indicating the original module repository's location.

## Modify Module Information
Go to the module page you want to modify and click the pencil icon on the module card.
![edit-module3](./edit-module(3).png)  

After making the necessary changes, click "Edit."
![edit-module4](./edit-module(4).png)

## Sync Changes to Remote Repository
After creating or editing a module, you need to sync the changes to the remote module repository.  

Click the sync button next to the Source with changes in the Source tab. The synchronization process typically completes within a few seconds.
![edit-module5](./sync.png)
