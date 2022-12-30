---
title: 搭建基于Github Page的Blog过程及问题
date: 2022-12-30 20:50:25
tags: blog
description: 如何使用git来同步更新版本与多端同步写blog。
---

上午在开了一个github仓库做github page，写完作业打算弄一下blog，安装nodejs和git时发现一些问题，在blog搭好前，我准备记录一下搭建过程中的所有问题。

# 1. git提示
   首先安装git，进入终端，执行如下：
   ```
   brew install git
   ```
   随后报错：
   ```
   Error: Your CLT does not support macOS 13.1.
   ```
   解决方案：
   ```
   softwareupdate --all --install --force
   sudo rm -fr /Library/Developer/CommandLineTools/
   sudo xcode-select --install
   ```

# 2.`hexo d`失败
   在deploy新编辑的blog过程中，经常报错：
   ```
   fatal: unable to access 'https://github.com/a1henu/a1henu.github.io.git/': HTTP/2 stream 1 was not closed cleanly before end of the underlying stream
   ```
   排查发现是git默认的通信协议出了问题，可以通过将默认通信协议修改为http/1.1来解决问题：
   ```
   git config --global http.version HTTP/1.1
   ```
   完美解决。

# 3. 多端同步
   成功弄好页面以后，新问题是如何在不同的电脑上如何同步我的hexo源文件以及deploy新的blog。

   在这里我们就可以利用git的branch进行多终端工作，每次只需从git将更新push到工作电脑，然后作出修改以及写作，最后deploy blog&pull源文件即可。

   ## 机制
   我们在执行`hexo d`时候，上传到github的是hexo编译后的文件，是用来生成网页链接的，不包含源文件。  
   也就是说上传的是本地目录里生成的`.github_deploy`中的文件，其他我们更改的都没有上传到github。  
   所以可以利用github的分支管理，将源文件上传到另一个分支。  

   ## 上传分支
   首先，在github上新建一个hexo分支，并设置为default，之后在准备好的目录中打开终端，  
   ```
   git clone git@github.com:a1henu/a1henu.github.io.git
   ```
   将其克隆到本地，接下来把除了`.git`以外其他文件夹删除，将博客源文件全部复制过来，将`theme`文件夹中`.git`文件夹删除，而后  
   ```
   git add .
   git commit -m "add branch"
   git push
   ```
   这样就上传完了。

   ## 更换电脑操作
   - 安装git  
      ```bash
      sudo apt-get install git
      ```
   - 设置git全局邮箱、用户名  
      ```bash
      git config --global user.name "username"
      git config --global user.email "githubemail"
      ```
   - 设置ssh key  
      ```bash
      ssh-keygen -t rsa -C "githubemail"
      #生成后填到github上
      ssh -T git@github.com
      #验证
      ```
   - 安装nodejs
   - 安装hexo  
      安装后不需要初始化，直接  
      ```bash
      git clone git@github.com:a1hene/a1hene.github.io.git` 
      ```
      然后进入克隆到的文件夹  
      ```bash
      cd a1henu.github.io
      npm install
      npm install hexo-deployer-git --save
      ```
      生成，部署
      ```bash
      hexo clean
      hexo g
      hexo d
      ```
      可以开始写了  
      ```bash
      hexo new newpage
      ```
   
   ### Tips
   1. 不要忘记每次写完把源文件push到git上
      ```bash
      git add .
      git commit -m "xx"
      git push
      ```
   2. 如果是已经clone过文件夹的电脑上写作，每次只需要和远端同步一下就好了  
      ```bash
      git pull
      ```