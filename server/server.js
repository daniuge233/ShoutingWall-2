const WebSocket = require('ws');
const express = require('express');
const fs = require('fs');
const path = require('path');
const User = require('./User');

const websocketURL = ""
const token = "";

const app = express();

app.use(express.static('./server/static'));

// 服务器端口
// 用户列表更新: 3001
// 消息监听: 3010
// 消息发送: 3011
const UserUpdate = new WebSocket(`${websocketURL}:3001`, { headers: { Authorization: `Bearer ${token}` } });
const MsgListener = new WebSocket(`${websocketURL}:3010`, { headers: { Authorization: `Bearer ${token}` } });
const MessageSender = new WebSocket(`${websocketURL}:3011`, { headers: { Authorization: `Bearer ${token}` } });

const interval = 5000;

setInterval(() => {
  if (UserUpdate.readyState == WebSocket.OPEN) User.UpdateNewUser(UserUpdate);
  User.ClearTasks();
}, interval);

UserUpdate.addEventListener('message', evt => {
  User.UserUpdateMsg(evt.data);
})

MsgListener.addEventListener('message', evt => {
  User.UserTaskMsg(evt.data, MessageSender);
})



function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath, fileList); // 递归进入子文件夹
    } else {
      const extname = path.extname(file).toLowerCase();
      if (extname === '.png') { // 只保留 .png 文件
        let pth = fullPath.replace(/^server\/static\//, "");
        const relativePath = `http://localhost:${server.address().port}/` + pth;
        fileList.push(relativePath);
      }
    }
  }

  return fileList;
}

app.get('/picList', function (req, res) {
  const fileList = walkDir('server/static/outputs/');
  res.send(fileList);
});

app.get('/delete/:id/:file', function (req, res) {
  const url = `./server/static/outputs/${req.params.id}/${req.params.file}`;
  fs.unlinkSync(url);
  res.end("OK");
})

const server = app.listen(8080, function () {
  console.log("服务已启动");
});
