import urllib
import requests
import utils.uploadImage
import utils.getToken
import re
import json
import time

def send_message(uin, tk, cookie, msg, richval, pic_bo):
    try:
        base_url = "https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_publish_v6"
        url = f"{base_url}?g_tk={tk}"
        headers = {
            "Referer": f"https://user.qzone.qq.com/{uin}",
            "Host": "user.qzone.qq.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Origin": "https://user.qzone.qq.com",
            "Content-Type": "application/x-www-form-urlencoded",
            "Sec-Fetch-Dest": "iframe",
            "Sec-Fetch-Mode": "navigate",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Site": "same-origin",
            "Cookie": cookie,
            "Priority": "u=1, i"
        }
        params = {
            "qzreferrer": f"https://user.qzone.qq.com/{uin}",
            "syn_tweet_verson": 1,
            "paramstr": 1,
            "pic_template": "tpl-2-1",
            "richtype": 1 if richval else "",
            "richval": richval,
            "pic_bo": pic_bo,
            "special_url": "",
            "subrichtype": 1 if richval else "",
            "con": msg,
            "feedversion": 1,
            "ver": 1,
            "ugc_right": 1,     # =1 -> 公开 | =64 -> 私密  ????
            "to_sign": 0,
            "hostuin": uin,
            "code_version": 1,
            "format": "fs"
        }
        encoded_data = urllib.parse.urlencode(params)
        response = requests.post(url, headers=headers, data=encoded_data)
        return response.content
    
    except Exception as e:
        print(f"Error: {e}")

def upload(uin, cookie, paths, msg):

    # 从cookie提取必要数据
    p_skey = re.search(r'\bp_skey=([^;]+)', cookie)
    p_skey = p_skey.group(1)
    g_tk = utils.getToken.getTk(p_skey)

    skey = re.search(r'\bskey=([^;]+)', cookie)
    skey = skey.group(1)

    print("p_skey: ", p_skey)
    print("g_tk: ", g_tk)
    print("skey: ", skey)
    print("-------------------------------------")

    richvals = []
    pic_bos = []

    print("正在上传图片...")
    for p in paths:
        imgdata = utils.uploadImage.getUploadData(path=p, uin=uin, p_skey=p_skey, skey=skey, tk=g_tk, cookie=cookie)

        print("当前处理URL: ", imgdata["data"]["url"])
        print("LLOC: ", imgdata["data"]["lloc"])
        print("SLOC: ", imgdata["data"]["sloc"])
        print("AlbumID: ", imgdata["data"]["albumid"])
        print("-------------------------------------")

        richvals.append(utils.uploadImage.getRichvalData(imgdata))
        pic_bos.append(utils.uploadImage.getPicBo(imgdata))

        time.sleep(0.1)

    richval = "\t".join(richvals)
    pic_bo = ",".join(pic_bos)
    pic_bo = pic_bo + "\t" + pic_bo
    print("richval: ", richval)
    print("pic_bo: ", pic_bo)

    print("-------------------------------------")

    res = send_message(uin, g_tk, cookie, msg, richval, pic_bo)
    hstr = res.decode('utf-8')
    hstr_p = re.search(r'frameElement\.callback\((\{.*?\})\)', hstr)
    jstr = hstr_p.group(1)
    jres = json.loads(jstr)
    print("返回信息: ", jres)
    return jres