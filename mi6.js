
let rp = files.path("./")
files.listDir(rp,function(e){
    log(e)
    return false
})
files.witre(files.join(rp,"test.txt"), "这是用于测试的一段文字")

