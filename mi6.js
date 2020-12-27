
let rp = files.path("./")
log(rp)
// log(files.listDir(rp,function(e){return true;}))
files.witre(files.join(rp,"teset.txt"), "这是用于测试的一段文字")
 
  