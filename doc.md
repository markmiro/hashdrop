# HashDrop

Different ways a file can be dropped.

TODO: `toIpfs()` would need some password to know that the user is allowed to publish content to it. For now, no password. In the future, you'll sign a message, send it to the backend / API and it will match the signature to a signature it's already seen.

---

## User keeps file safe

User shouldn't modify the file contents. The best way to ensure this is to base64 encode the file or zip it and download it to a safe place. It should have the CID in the name so it's easy to search your file system for it in the future. This is because you'll likely publish the hash on Twitter or someplace, so you need the hash.

### Flows

1. Choose file
1. Click to save it

- - a) Save base64 file
- - b) Drop hash

### Drop hash

https://hashdrop.me/#/drop

Start with `_file`

```
getCid(_file) -> cid
toEth(cid)
tweet(cid, "I published the hash")
```

### Drop file

https://hashdrop.me/#/drop

Start with `cid`, `file`

```
toIpfs(file)
tweet(cid, "I published the document")
```

### View dropped file

https://hashdrop.me/#/drop/[cid]

Start with `_cid`

```
fromIpfs(_cid) -> file
```

---

## File is encrypted on IPFS

This is the easier method, but will cost more eth because we're encrypting the file and saving both the original and encrypted hashes.

Note: it's also worth storing the encryption method on-chain? If the method gets updates, it would be good for the UI to know which version is used so it can decrypt it.

### Drop hash

https://hashdrop.me/#/drop

Start with `_pk`, `_file`

```
getCid(_file) -> cid
ethSign(_pk, cid) -> _filePass
enc(_file, _filePass) -> encFile

toIpfs(encFile)
getCid(encFile) -> encCid
toEth(cid, encCid)
tweet(cid, "I published the hash")
```

### Drop file

https://hashdrop.me/#/drop/[cid]

Start with `_pk`, `_cid`

```
ethSign(_pk, _cid) -> _filePass

fromEth(_cid) -> _encCid
fromIpfs(_encCid) -> _encFile
dec(_encFile, _filePass) -> file

ipfsUnpin(_encCid)
toIpfs(file)
tweet(cid, "I published the document")
```

### View dropped file

https://hashdrop.me/#/drop/[cid]

Start with `_cid`

```
fromIpfs(_cid) -> file
```
