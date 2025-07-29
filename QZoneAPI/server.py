import time
import requests
import json
import re

import utils.post
import utils.heartbeat

cookie = ""
uin = 000000000

picListUrl = "http://localhost:8080/picList"
deleteUrl = "http://localhost:8080/delete/"

heartbeatTimer = 0

while True:

    # 获取图片列表
    picRes = requests.get(picListUrl)
    picList = json.loads(picRes.text)

    if heartbeatTimer >= 600:
        utils.heartbeat.Heartbeat(uin, cookie)
        heartbeatTimer = 0

    # 遍历列表
    for item in picList:
        print(item)
        utils.post.upload(uin, cookie, [item], "")
        match = re.search(r'/outputs/(\d+)/([^/]+\.png)', item)
        id = match.group(1)
        file = match.group(2)
        requests.get(deleteUrl + id + '/' + file)

    heartbeatTimer += 5
    time.sleep(5)
