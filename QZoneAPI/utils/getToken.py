def getTk(skey):
    hash =  5381
    for char in skey:
        hash += (hash << 5) + ord(char)
    return str(hash & 2147483647)