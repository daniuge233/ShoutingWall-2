import urllib
import requests
import base64
import re
import json

def img2base64(path):
    resp = requests.get(path)
    resp.raise_for_status()       # 如果请求不成功会抛出异常
    img_data = resp.content      # 二进制图片数据
    img_base64 = base64.b64encode(img_data)
    return img_base64

def upload(file, p_skey, skey, uin, tk, cookie):
    try:
        base_url = "https://up.qzone.qq.com/cgi-bin/upload/cgi_upload_image"
        url = f"{base_url}?g_tk={tk}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Origin": "https://user.qzone.qq.com",
            "Sec-Fetch-Dest": "empty",
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Site": "same-site",
            "Sec-Fetch-Mode": "cors",
            "Priority": "u=3, i",
            "Cookie": cookie
        }
        params = {
            "filename": "filename",
            "uin": uin,
            "skey": skey,
            "zzpaneluin": uin,
            "zzpanelkey": "",
            "p_uin": uin,
            "p_skey": p_skey,
            "qzonetoken": "",
            "uploadtype": 1,
            "albumtype": 7,
            "exttype": 0,
            "refer": "shuoshuo",
            "output_type": "jsonhtml",
            "charset": "utf-8",
            "output_charset": "utf-8",
            "upload_hd": 1,
            "hd_width": "",
            "hd_height": "",
            "hd_quality": 96,
            "backUrls": "http://upbak.photo.qzone.qq.com/cgi-bin/upload/cgi_upload_image,http://119.147.64.75/cgi-bin/upload/cgi_upload_image",
            "url": url,
            "base64": 1,
            "jsonhtml_callback": "callback",
            "picfile": f"{file}",
            "qzreferrer": f"https://user.qzone.qq.com/{uin}"
        }
        encoded_data = urllib.parse.urlencode(params)
        response = requests.post(url, headers=headers, data=encoded_data)
        return response.content
 
    except Exception as e:
        print(f"Error: {e}")

def getUploadData(path, uin, p_skey, skey, tk, cookie):
    res = upload(
        file=img2base64(path).decode("utf-8"),
        p_skey=p_skey,
        skey=skey,
        uin=uin,
        tk=tk,
        cookie=cookie
    )
    res = str(res)
    parsed = re.search(r'frameElement\.callback\(\s*([\s\S]*?)\s*\);', res)
    json_txt = parsed.group(1)
    jo = json.loads(json_txt)

    return jo

def getRichvalData(data):
    d = data['data']
    richval = f',{d["albumid"]},{d["lloc"]},{d["sloc"]},{str(d["type"])},{str(d["height"])},{str(d["width"])},,{str(d["height"])},{str(d["width"])}'
    return richval

def getPicBo(data):
    d = data['data']['url']
    match = re.search(r'bo=([^&]+)', d)
    bo = match.group(1)
    return bo