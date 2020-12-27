// 本次储存检测
let rootPath = files.path("./")
log("本次文件路径", rootPath)
files.listDir(rootPath, (element => {
    log(element)
    let d = files.join(rootPath, element)
    if (files.isDir(d)) {
        files.listDir(d, e => { console.info(d + " " + e) })
    }
}));
