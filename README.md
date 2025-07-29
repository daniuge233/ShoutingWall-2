# 🎉 ShoutingWall 2 🎉<br/>基于非官方QQ机器人的校园墙功能实现

「ShoutingWall」是一个基于NapCat实现的QQ机器人，可以实现“校园表白墙”的功能。<br/>
这是它的实现架构：
````
  ┌────────────┐
  |  用户       |
  └────────────┘ 
        ▲
  回复消息|
        |发送指令
        ▼
┌─────────────────┐     WebSocket:3001 (获取好友列表)    ┌───────────┐
│                 │──────────────────────────────────>│           |
│  NapCat服务      │─────WebSocket:3010 (监听消息)──────>│  User.js  |
│                 │<──────────────────────────────────│ 处理用户消息 │
└─────────────────┘     WebSocket:3011 (发送消息)       └────┬──────┘
                                                           | 处理用户信息
                                                           |
                                                           ▼
                                                      ┌─────────┐
                                                      │ Utils.js│
                                                      └────┬────┘
                                                           │ 图片上服务器
                                                           ▼
                                                      ┌─────────┐   图片路径
                                                      │server.js│───────────┐
                                                      └─────────┘           │
                                                                            │
                                                                            ▼
┌─────────────────┐                                                  ┌─────────────┐
│                 │                                                  │  本地服务器   │
│   server.py     │─────────────────────────────────────────────────>│  图片存储     │
│                 │        访问图片                                    └─────────────┘
└─────────────────┘
         │
         │ 发说说
         ▼
┌─────────────────┐       ┌───────────────┐        ┌───────────────┐
│     post.py     │──────>│uploadImage.py │        │  QZone接口     │
└─────────────────┘       └───────────────┘        └───────────────┘
     |   ▲                      │                         ▲
     |   └──────────────────────┘                         |
     |          信息回传                                    |
     └────────────────────────────────────────────────────┘
                发送动态

┌─────────────────┐              
│  heartbeat.py   │──────┐
└─────────────────┘      │ 心跳机制
        ▲                │ 保持QQ空间登录
        └────────────────┘
````

## 使用方法

### 前期设置
> [!NOTE]
> 以下操作默认环境为Debian.
1. 配置NapCat环境，详情请看[NapCat环境配置](https://github.com/daniuge233/ShoutingWall-2/blob/main/docs/NapCat.md)
2. 安装[Node.JS](http://nodejs.org/)和[Python](http://python.org)
3. 安装环境：
````bash
sudo npm install express json puppeteer uuid ws
````
4. 打开<code>/server/server.js</code>, 编辑<code>websocketURL</code>和<code>token</code>, 将它们分别设置为您NapCat WebSocket服务器的地址(ws://xxxxxxxx)和NapCat服务器设置的Token.
5. 打开<code>/QZoneAPI/server.py</code>, 编辑<code>cookie</code>和<code>uin</code>, 将它们分别设置为您QQ空间登陆的Cookie和您的QQ号。Cookie可在登录网页版QQ空间后查看网页控制台获取。
6. 返回根目录, 先后运行：
````bash
sudo node ./server/server.js
sudo python QZoneAPI/server.py
````
7. 向您的NapCat服务登录的账号发送"使用方法"即可获取机器人的使用方法。
