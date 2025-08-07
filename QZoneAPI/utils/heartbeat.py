import re
import json
import time
import utils.post
import utils.delete
import utils.getToken

# 心跳机制，保持QQ空间登陆
def Heartbeat(uin, cookie):
    p_skey = re.search(r'\bp_skey=([^;]+)', cookie)
    p_skey = p_skey.group(1)
    g_tk = utils.getToken.getTk(p_skey)

    response = utils.post.send_message(uin, g_tk, cookie, "Heartbeat", "", "")

    hstr = response.decode('utf-8')
    hstr_p = re.search(r'frameElement\.callback\((\{.*?\})\)', hstr)
    jstr = hstr_p.group(1)
    jres = json.loads(jstr)

    tid = jres["t1_tid"]
    
    print(tid, g_tk)

    time.sleep(2)

    print(utils.delete.delete(uin, cookie, tid, g_tk))