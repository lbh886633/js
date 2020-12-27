
let rp = files.path("./")+"teset.txt"
log(files.read(rp))
// log(files.listDir(rp,function(e){return true;}))
files.write(rp, "这是用于测试的一段文字")
 
  