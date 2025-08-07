const puppeteer = require("puppeteer");
const fs = require("fs");
const uuid = require('uuid');
const path = require('path');

let RunTime = 0;

// 消息转为图片的函数
async function ProcessMessage(message, meta) {
    // 初始化浏览器
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();

    // 元数据
    let msg_type = meta["msgType"];
    let user_id = meta["user_id"];
    let avatarURL = `https://q.qlogo.cn/g?b=qq&nk=${user_id}&s=160`;
    let title = "", avatar = "";
    if (msg_type == 1) {
        title = "神秘人";
        avatar = "";
    } else {
        title = meta["nickName"];
        avatar = avatarURL;
    }

    // 处理消息
    let base = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><style>body{display:flex;flex-direction:column;align-items:left;margin:0;padding:0;background-repeat:no-repeat;font-family:Arial,Helvetica,sans-serif;color:rgb(26,26,26);background-color:#F1F1F1}.wrapper{width:1179px}#header{position:relative;width:100%;height:160px;background:url("http://localhost:8080/bg_header.png") no-repeat}#title{position:absolute;left:120px;top:50px;font-size:55px}#content{width:100%;min-height:1850px;padding:50px 0 0 35px;box-sizing:border-box}.msg{display:flex;margin-bottom:60px}.avatar{width:120px;height:120px;border-radius:50%;margin-right:30px;flex-shrink:0}.container{display:inline-flex;flex-wrap:wrap;background-color:white;padding:35px;justify-content:center;align-items:center;border-radius:25px;font-size:35px;max-width:630px}.container_img{border-radius:20px;max-width:630px;min-height:120px;height:100%}#footer{width:100%;height:278px;background:url("http://localhost:8080/bg_footer.png") no-repeat center/cover;margin-top:20px}</style></head><body><div class="wrapper"><header id="header"><span id="title">${title}</span></header><main id="content">`;
    for (let i = 0; i < message.length; i++) {
        let msg = message[i];

        if (msg["type"] == "text") {
            // 防止html解析
            let data = escapeHTML(msg["data"]);
            // 解析QQ表情
            let result = data.replace(/\$\(\{(\d+)\}\)/g, (match, p1) => {
                return `<img src="http://localhost:8080/emojies/${p1}.png">`;
            });
            let addition = `<div class="msg"><img src="${avatar}" class="avatar"><div class="container">${result}</div></div>`;
            base += addition;
        } else if (msg["type"] == "image") {
            let addition = `<div class="msg"><img src="${avatar}" class="avatar"><img class="container_img" src="${msg["data"]}"></div>`;
            base += addition;
        }
    }
    base += '</main><footer id="footer"></footer></div></body></html>';

    // 生成图片
    await page.setContent(base);

    const bodyHandle = await page.$('body');
    const boundingBox = await bodyHandle.boundingBox();

    await page.setViewport({
        width: 1179,
        height: Math.ceil(boundingBox.height),
    });
    const buffer = await page.screenshot({
        type: 'png'
    });
    
    let outputDir = path.join(__dirname, 'static', 'outputs', user_id.toString());
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(`${outputDir}/${uuid.v4()}.png`, buffer);

    // 关闭浏览器
    await browser.close();
}

// 替换html防止解析
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function GetTimer() {
    let seconds = RunTime;

    const SECONDS_IN_MINUTE = 60;
    const SECONDS_IN_HOUR = 3600;
    const SECONDS_IN_DAY = 86400;
    const SECONDS_IN_MONTH = 2592000; // 近似一个月为30天
    const SECONDS_IN_YEAR = 31104000; // 近似一年为12个月

    let years = Math.floor(seconds / SECONDS_IN_YEAR);
    seconds %= SECONDS_IN_YEAR;

    let months = Math.floor(seconds / SECONDS_IN_MONTH);
    seconds %= SECONDS_IN_MONTH;

    let days = Math.floor(seconds / SECONDS_IN_DAY);
    seconds %= SECONDS_IN_DAY;

    let hours = Math.floor(seconds / SECONDS_IN_HOUR);
    seconds %= SECONDS_IN_HOUR;

    let minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
    seconds %= SECONDS_IN_MINUTE;

    return `${years}年${months}月${days}天${hours}时${minutes}分${seconds}秒`;
}

setInterval(() => {
    RunTime++;
}, 1000);

module.exports = { ProcessMessage, GetTimer };