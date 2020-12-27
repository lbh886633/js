
// let rp = files.path("./")+"teset.txt"
// log(files.read(rp))
// log(
//     files.listDir(rp)
// )
// // log(files.listDir(rp,function(e){return true;}))
// files.write(rp, "这是用于测试的一段文字")
 
let rp = files.path("./");
log(rp)

rp = files.join(rp,"1.png");

log("路径",rp)

log(
    files.move("/sdcard/xxsq/头像列表/1.png", rp)
)

log(files.isFile(rp))

exit();
let rp = files.path("./");
log(rp)
rp = files.join(rp,"xxsq");
log("路径",rp)
let img = files.readBytes("/sdcard/xxsq/头像列表/1.png")

log(
    files.writeBytes(rp,img)
)

log(files.isFile("/sdcard/xxsq/头像列表/1.png"))