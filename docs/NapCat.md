# NapCat服务配置方法
NapCat服务配置是整个配置过程中最重要的一环，故单独列出。<br/>
如本文档有任何疏漏，请以[官方文档](https://napneko.github.io/guide/start-install)为准。<br/>
本文档环境为Debian.

1. 在您的服务器的防火墙配置中开放3000、3001、3010、3011、6099端口。

3. 安装[Docker](http://docker.com)并在控制台运行：
> [!NOTE]
> 国内网络环境安装Docker失败的可能性极大，建议自行科学或换源。
````
curl -o \
napcat.sh \
https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.sh \
&& sudo bash napcat.sh \
--docker y \
--qq "123456789" \
--mode ws \
--proxy 1 \
--confirm
````
请将<code>--qq</code>字段中的数字更换为您机器人的QQ号。
> [!CAUTION]
> 不建议设置为常用的QQ号。最好为机器人专门创建一个QQ号。<br/>
> 避免频繁登录这个QQ号。

3. 按照指示操作。<br/>
注意：在设置完毕后程序会提示你确认操作，请不要确认。将它返回的命令复制下来，并在其中添加:
````
-p 3010:3010 -p 3011:3011
````
然后，执行您修改后的命令。

4. 在浏览器访问<code>您的服务器ip:6099/webui</code>

5. 输入默认登录token: <code>napcat</code>并扫码登录QQ.
> [!TIP]
> 如果您的webui架设在公网端口，请一定在登录后更改您的登录token.<br/>
> 另请注意：这个token不同于Readme中的服务器Token. 请注意甄别。

6. 在”网络配置“选项卡中新建三个"WebSocket服务器"。
- 如果您的服务器与将要运行这个项目的服务器不是一台，"Host"请填写"0.0.0.0"。否则，请填写其他循环ip.
- 这三个服务器的Port请分别设置为3001、3010、3011.
- 如果您的Host填写的是"0.0.0.0"，请一定要设置Token.
> [!NOTE]
> 三个服务器的Token请设置为相同的，否则请自行更改<code>/server/server.js</code>中的代码。

7. 启用这三个服务器。

NapCat服务配置完毕。
