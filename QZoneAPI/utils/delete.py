import requests
import time

def delete(uin, cookie, tid, g_tk):
    url = f'https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_delete_v6?&g_tk={g_tk}'
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
        "Cookie": cookie,
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Content-Type": "application/x-www-form-urlencoded",
        "Connection": "keep-alive",
        "Referer": f"https://user.qzone.qq.com/{uin}/311",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "same-origin",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
    }
    params = {
        "hostuin": uin,
        "tid": tid,
        "t1_source": "1",
        "code_version": "1",
        "format": "fs",
        "qzreferrer": f"https://user.qzone.qq.com/{uin}/311"

        # "uin": uin,
        # "topicId": f'{uin}_{tid}__1',
        # "feedsType": 0,
        # "feedsFlag": 0,
        # "feedsKey": tid,
        # "feedsAppid": 311,
        # "feedsTime": int(time.time()),
        # "fupdate": 1,
        # "ref": "feeds",
        # "qzreferrer": f'https://user.qzone.qq.com/{uin}'
    }

    response = requests.post(url, headers=headers, data=params)
    return response.content