const fs = require('fs');
const path = require('path');

const utils = require('./utils');

let UserList = [];

// 处理队列
let Queue = [];
function enqueue(element) {
    Queue.push(element);
}
function size() {
    return Queue.length;
}

// 用户的定义
class User {
    metadata = {};
    receivedMessages = [];

    // 用户qq号, 开始时间戳, 消息类型(0: 不匿名; 1: 匿名)
    constructor(user_id, beginTime, msgType, nickName) {
        this.user_id = user_id;
        this.beginTime = beginTime;
        this.msgType = msgType;
        this.nickName = nickName;

        this.metadata = {
            user_id: user_id,
            nickName: nickName,
            msgType: msgType
        };
    }

    getID() {
        return this.user_id;
    }

    getTimer() {
        return Math.floor(Date.now() / 1000) - this.beginTime;
    }

    getMsgType() {
        return this.msgType;
    }

    getNickName() {
        return this.nickName;
    }

    processMessage(msg) {
        // 处理每条消息中的每个元素
        // * 考虑了一条消息中同时包含文字和图片的可能
        let flag = false;
        for (let i = 0; i < msg.length; i++) {
            let m = msg[i];
            let type = m["type"];
            if (type == "text") {
                // 如果一条消息中的前一个字符是QQ表情
                if (flag) {
                    const index = this.receivedMessages.length;
                    this.receivedMessages[index - 1]["data"] += m['data']['text'];
                    flag = false;
                    continue;
                }
                this.receivedMessages.push({
                    type: "text",
                    data: m['data']['text']
                })

            } else if (type == "face") {
                try {
                    const id = m['data']['id'];
                    let index = this.receivedMessages.length;
                    // 如果当前没有消息 或 第一个字符是QQ表情(防止被误认为是上一条消息的表情)
                    if (index == 0 || i == 0) {
                        index++;
                        this.receivedMessages.push({
                            type: "text",
                            data: ""
                        })
                    }
                    // QQ表情会被解析为$({<id>})的形式嵌入到消息中
                    this.receivedMessages[index - 1]['data'] += `$({${id}})`;
                    flag = true;   
                } catch (e) {
                    console.log(e);
                }

            } else if (type == "image") {
                this.receivedMessages.push({
                    type: "image",
                    data: m['data']['url']
                })
            } else {
                continue;
            }
        }
    }

    getMessage() {
        return this.receivedMessages;
    }

    getMeta() {
        return this.metadata;
    }
}

// 请求用户列表
function UpdateNewUser(UserUpdate) {
    const msg = {
        "action": "get_friend_list",
        "params": {
            "no_cache": false
        }
    };

    UserUpdate.send(JSON.stringify(msg));
}

// 更新用户列表
// * 这里的「用户」指所有机器人的"好友"!
function UserUpdateMsg(message) {
    let data = JSON.parse(message)["data"];
    if (!data) return;

    let user_ids = [];

    // 注册新用户
    for (const user of Object.values(data)) {
        const user_id = user["user_id"];
        user_ids.push(user_id);
        if (!UserList.includes(user_id)) {
            UserList.push(user_id);
        }
    }

    // 注销离开的用户
    for (const user_id of [...UserList]) {
        if (!user_ids.includes(user_id)) {
            UserList.splice(UserList.indexOf(user_id), 1);
        }
    }
}

// 用户发消息
// 这里的「用户」指贴墙的人!
function UserTaskMsg(message, MessageSender) {

    const data = JSON.parse(message);

    if (!data["message_id"] || data["raw_message"] == "请求添加你为好友" || data["message"] == undefined) return;        // 过滤类型

    console.log(data["message"]);

    const sender_id = data["user_id"];
    const msg = data["message"];

    // 确保是好友
    if (!FilterFriend(sender_id)) return;

    // 用户想获取提示信息
    if (data["message"][0]["data"]["text"] == "使用方法") {
        Usage(sender_id, MessageSender);
        return;
    }
    // 用户想要开始
    else if (data["message"][0]["type"] == "text" 
             && (data["message"][0]["data"]["text"] == "墙匿" 
             || data["message"][0]["data"]["text"] == "墙不匿" 
             || data["message"][0]["data"]["text"] == "墙"
             || data["message"][0]["data"]["text"] == "墙墙")) {
        console.log("开始");
        
        // 查重
        let checkIndex = FindUser(sender_id);
        if (checkIndex != -1) {
            Queue.splice(checkIndex, 1);
        }

        // 判断匿名
        let msgType = 0;
        if (data["message"][0]["data"]["text"] == "墙匿") {
            msgType = 1;
        }

        // 获取昵称
        let nickName = data["sender"]["nickname"];
        
        // 新建用户
        let newUser = new User(sender_id, Math.floor(Date.now() / 1000), msgType, nickName);
        enqueue(newUser);
        console.log(Queue)
    }
    // 用户想要结束
    else if (data["message"][0]["type"] == "text" && (data["message"][0]["data"]["text"] == "谢谢墙墙" || data["message"][0]["data"]["text"] == "xxqq")) {
        // 确保用户正在操作
        let checkIndex = FindUser(sender_id);
        if (checkIndex == -1) return;

        let _msg = Queue[checkIndex].getMessage();
        let meta = Queue[checkIndex].getMeta();

        if (_msg.length < 1) {
            Queue.splice(checkIndex, 1);
            return;
        }

        // 再见宣言～
        GoodbyeMessage(Queue[checkIndex].getID(), MessageSender);
        // 移出队列
        Queue.splice(checkIndex, 1);
        utils.ProcessMessage(_msg, meta);
    }
    // 用户正在发送消息
    else {
        // 确保用户正在操作
        let checkIndex = FindUser(sender_id);
        if (checkIndex == -1) {
            UnknownCommand(sender_id, MessageSender);
            return;
        }

        let user = Queue[checkIndex];
        user.processMessage(msg);

        console.log(Queue);
    }
}

function Usage(user_id, MessageSender) {
    const msg = {
        "action": "send_private_msg",
        "params": {
            "user_id": user_id,
            "message": `🎉欢迎使用「瀚阳喊话墙」🎉\n\n开始命令:「墙」/「墙不匿」（不匿名） 或 「墙匿」（匿名）\n结束命令:「谢谢墙墙」或「xxqq」\n先发送开始命令, 然后发送你想说的话, 最后发送结束命令\n剩下的墙墙会自动处理嗒！\n支持的消息类型: 文字、图片\n技术原因, 目前暂不支持开图\n\n目前墙墙处于公开测试阶段!\n意见建议 / Bug反馈: QQ 2899824569 或 daniuge233u@gmail.com\n墙墙自上次检修已屹立不倒${utils.GetTimer()}`
        }
    };

    MessageSender.send(JSON.stringify(msg));
}

function UnknownCommand(user_id, MessageSender) {
    const msg = {
        "action": "send_private_msg",
        "params": {
            "user_id": user_id,
            "message": `未知命令\n发送「使用方法」获取墙墙指南！`
        }
    };

    MessageSender.send(JSON.stringify(msg));
}

function GoodbyeMessage(user_id, MessageSender) {
    const msg = {
        "action": "send_private_msg",
        "params": {
            "user_id": user_id,
            "message": "👌"
        }
    };

    MessageSender.send(JSON.stringify(msg));
}

// 过滤非好友
function FilterFriend(user_id) {
    const set = new Set(UserList)
    return set.has(user_id)
}

// 清理任务列表
function ClearTasks() {
    for (let i = Queue.length - 1; i >= 0; i--) {
        let user = Queue[i];
        let timer = user.getTimer();
        if (timer >= 300) {
            Queue.splice(i, 1);
        }
    }
}

// 查找Task并返回下标
function FindUser(target) {
    for (let i = 0; i < size(); i++) {
        let user = Queue[i];
        let id = user.getID();
        if (id == target) return i;
    }
    return -1;
}

module.exports = { UpdateNewUser, UserUpdateMsg, UserTaskMsg, ClearTasks, /*UpdateFriendProcessor, FriendProcessorMsg*/ }