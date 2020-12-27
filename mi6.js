
// let rp = files.path("./")+"teset.txt"
// log(files.read(rp))
// log(
//     files.listDir(rp)
// )
// // log(files.listDir(rp,function(e){return true;}))
// files.write(rp, "这是用于测试的一段文字")
 
  
    
let rp = files.path("./");
rp = files.join(rp,"xxsq");
let rp视频列表 = files.join(rp, "视频列表");
let rp头像列表 = files.join(rp, "头像列表");
let 视频列表 = "/sdcard/xxsq/视频列表"
let 头像列表 = "/sdcard/xxsq/头像列表"
// 确保存在路径
files.ensureDir(files.join(rp, "1"));
log("移动结束",
    files.move(视频列表, rp视频列表),
    files.move(头像列表, rp头像列表)
);
log(
    files.listDir(rp)
)