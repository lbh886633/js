
var st = {
      appName: "카카오톡 채널 관리자센터"                                 // app名字
    , appPackage: app.getAppName(this.appName) || "com.kakao.yellowid"  // app包名
    , appVersion: "3.8.3"                                               // app版本
    , version: "1.0"                                                    // 脚本版本
    , 注册文件路径: "/sdcard/xxxxkk/regEmail.txt"                        // 邮箱路径
    , 注册成功保存路径: "/sdcard/xxxxkk/regFinish.txt"                   // 注册成功保存路径
    , 注册结束缓存路径: "/sdcard/xxxxkk/regCache.txt"                    // 注册结束操作触发时的缓存
    , account: "defaultName"                                            // 注册时的账号
    , password: "pdboss00"                                              // 注册时的密码
}

toastLog("启动中..." + st.version)
log("当前版本："+st.version+"\n"+[
    "基于英语界面制作"
].pop())

var words = {
    "직접 입력해서 로그인": "직접 입력해서 로그인"
}
var conf = {
    循环执行日志: true 
}
waitUserClick("开始运行")
files.ensureDir(st.注册文件路径);
if(!files.isFile(st.注册文件路径) && confirm("邮箱文件不存在！是否结束运行？\n继续运行将自动生成邮箱。")){
    toastLog("结束运行")
    exit();
}
if(!files.isFile(st.注册文件路径) || files.read(st.注册文件路径).length < 10) {
    邮箱生成(100, st.注册文件路径)
    log("邮箱生成完成")
}

let 主要操作 = [
    step(
        "打开" + st.appName
        , function(){ return (this.uo = !addPackUS().findOne(30)) }
        , openApp
    )
    , step(word("직접 입력해서 로그인"))
    , step(word("Create New Kakao Account"))
    , step(word("I have an email account."))
    , step(
        word("Agree to All Terms")
        , false
            // function(){
            //     return (this.uo = text("Agree to All Terms").className("android.widget.CheckBox").findOne(1000))
            // })
        , function () {
            console.hide();
            sleep(50);
            let rect = this.uo.bounds();
            clickOn({ 
                x: rect.centerX()
                , y: rect.centerY()
            })
            console.show();
        }
    )
    , step(word("Agree"))
    , step(
        word("Enter your email address")
        , false
        , function() { 
            log("填入邮箱", this.uo.setText(
                (st.account = 取注册(st.注册文件路径))
            )) 
        }
    )
    , step(word("Send Verification Email"))
    , step(
        word("Enter verification code")
        , false
        , function() {
            log("等待输入邮箱验证码，并提交")
            while (text("Confirm").findOne(1000)) {
                sleep(2000);
            }
            log("离开验证码界面！");
        }
    )
    , step(
        word("To sign up, register a password.")
        , false
        , function() { 
            let editUOs = addPackUS(className("android.widget.EditText")).find();
            if(editUOs.length == 2) {
                log("填入密码");
                editUOs.forEach((uo)=>{
                    console.info(uo.setText(st.password))
                })
            } else {
                log("获取到的输入框数量不为2。", editUOs.length)
            }
        }
    )
    , step(word("Next"))
    , step(
        word("Set up your Kakao Account Profile.")
        , null
        , function(){
            let num = 3;
            let 设置账号信息操作 = [
                step(
                    word("Enter your nickname.")
                    , null
                    , function(){
                        log("设置账号名字：", this.uo.setText(st.account.split("@")[0]))
                    }
                )
                // , step(word("Confirm"))
                , step(
                      word("Year")
                    , false
                    , false
                    , selectDate
                )
                , step(
                      word("Month")
                    , false
                    , false
                    , selectDate
                )
                , step(
                      word("Day")
                    , false
                    , false
                    , function(){
                        selectDate(1,4);
                    }
                )
                , step(word("Female"))
                , step(word("Confirm"))
                , step(
                    "界面检测"
                    , function(){ 
                        return !addPackUS(text("Set up your Kakao Account Profile."))
                                .findOne(100) || num-- < 0;
                    }
                    , function(){ return "跳出循环执行"}
                )
            ]
            循环执行(设置账号信息操作);
        }
    )
    , step(word("Confirm"))
    , step(
        "注册结果"
        , text(word("Get Started"))
        , function(){
            saveReg(st.account, st.password, st.注册结束缓存路径)
            let uo = addPackUS(clickable(true).filter(function(uo){
                let rect = uo.bounds();
                return rect.bottom < device.height*0.2 && rect.right < device.width*0.2;
            })).findOne(50);
            if(uo && clickOn(uo)){
                saveReg(st.account, st.password)
                log("注册成功！")
            }
        }
    )
    , step(
        "异常处理"
        , function(){
            let time = 3000;
            let arr = [

                function(t){
                    let e = addPackUS(text("Webpage not available")).findOne(t || 100);
                    if(e) {
                        back();
                        sleep(100);
                    }
                }

            ]

            let nt = time / arr.length;
            arr.forEach((e)=>{
                try{
                    e(nt)
                } catch(e){
                    console(e)
                }
            })
        }
    )
    , step(
        "暂停2秒"
        , function(){sleep(2000)}
    )
]

console.show()
循环执行(主要操作, 200)


function selectDate(satrt, end){
    satrt = satrt || 1;
    end = end || 3;
    let uo = addPackUS(className("android.widget.ListView")).findOne(1000);
    if(uo){
        let uo = className("android.widget.ListView").findOne(1000)
        if(uo){
            let max = random(satrt,end);
            for (let i = 0; i < max; i++) {
                log("滑动", uo.scrollForward())
                sleep(100)
            }
            uo = className("android.widget.ListView").findOne(1000)
            if(uo){
                uo = uo.children();
                uo = uo[random(0,uo.length-1)]
                if(uo) clickOn(uo);
            } else log("选择年份时找不到控件！")
        } else toastLog("未找到控件！")
    }
}

function openApp() {
    let 操作 = [
        step(
            "启动" + st.appName
            , function(){return !(addPackUS().findOne(1000))}
            , function(){
                if(!launchApp(st.appName) && !launch(st.package)) toastLog("启动'" + st.appName + "'程序失败！");
                else {
                    for (let i = 0; i < 5; i++) {
                        if(addPackUS().findOne(1000)) break;
                    }
                }
            }
        )
        , step(
            "检测" + st.appName + "启动状态"
            , addPackUS()
            , function(){
                while(!addPackUS().findOne(1000)) {
                    sleep(1000);
                }
                return "跳出循环执行";
            }
            , null
            , 3000
        )
    ]
    循环执行(操作,10,null)
    sleep(1000)
}

function 取注册(账号路径) {
    if (!files.exists(账号路径 || 路径.zhuce)) {
        alert("没有找到", 账号路径 || 路径.zhuce)
        exit()
    }
    var 读取 = files.read(账号路径 || 路径.zhuce)
    if (读取) {
        var 分割 = 读取.split("\n")
        var 账号a = 分割[0].split("，")
        账号 = 账号a[0]
        密码 = 账号a[1]
        log(账号a[0])
        log(账号a[1])
        log("删除数据 " + 分割.splice(0, 1))
        newtext = 分割.join('\n');
        files.write(账号路径 || 路径.zhuce, newtext);
        return 账号a[0]
    } else {
        alert("没号了,脚本停止")
        exit()
    }
}

function saveReg(账号,密码,保存路径) {
    let acc = 账号+','+密码;
    console.info("账号保存", acc);
    files.append(保存路径 || st.注册成功保存路径, "\n"+acc); 
}


function detectionPopup(time) {
    time = time || 3000;
    let action=[];
    let funList = [
        function (t) {  // Okay 按钮
            action = addPackUS(text("确定")).findOnce()
            if (action) action.click();
        },
        // function (t) {  // OK   按钮
        //     action = addPackUS(text("OK")).findOnce()
        //     if (action) action.click();
        // }
    ];

    try{
        for (let i = 0; i < funList.length; i++) {
            funList[i](parseInt(time/funList.length));
        }
    }catch(err){
        console.info("-10");
    }
}

function addPackUS(us){
    return us ? us.packageName(st.appPackage) : packageName(st.appPackage);
}


function word(str, ws) {
    ws = typeof ws == "object" ? ws : words;
    let rew;
    if(typeof ws == "object") rew = ws[str];
    return rew ? rew : str;
}

function clickOn(getUOFun, sleepTime, parentNumber, rectScope) {
    let uo, maxNumber = 50, rect;
    if (typeof getUOFun != "function") {
        if(typeof getUOFun.getClass == "function") {
            if (getUOFun.getClass() == selector().getClass()) {
                if (typeof sleepTime != "number" || sleepTime < 0) sleepTime = 500;
                let us = getUOFun;
                getUOFun = function () {
                    return us.findOne(sleepTime);
                };
            } else if(getUOFun.getClass() == depth(0).findOnce().getClass()) {
                uo = getUOFun;
            }
        } else if(typeof getUOFun == "object") {
            if(typeof getUOFun.x == "number" && typeof getUOFun.y == "number" ) {
                rect = {};
                rect.centerX = function(){return getUOFun.x}
                rect.centerY = function(){return getUOFun.y}
            } else if(typeof getUOFun.centerX == "function" && typeof getUOFun.centerY == "function"){
                rect = getUOFun;
            }
        }
    };
    if(typeof rectScope != "object") rectScope = {};
    if(typeof rectScope.left != "number") rectScope.left = device.width*0.1;
    if(typeof rectScope.right != "number") rectScope.right = device.width*0.1;
    if(typeof rectScope.top != "number") rectScope.top = device.height*0.1;
    if(typeof rectScope.bottom != "number") rectScope.bottom = device.height*0.1;

    let i = 0;
    do {
        if (uo) {
            if (uo.click()) {
                return true;
            } else {
                rect = uo.bounds();
                let actualRange = {
                    left: rect.left - rectScope.left,
                    right: rect.right - rectScope.right,
                    top: rect.top - rectScope.top,
                    bottom: rect.bottom - rectScope.bottom
                };
                let pUO = uo, pr = {};
                while (typeof pUO.parent == "function") {
                    pUO = pUO.parent();
                    if(!pUO) {
                        break;
                    }
                    pr = pUO.bounds();
                    if(
                        actualRange.left <= pr.left
                        && actualRange.right >= pr.right
                        && actualRange.top <= pr.top
                        && actualRange.bottom >= pr.bottom
                    ) {
                        if(pUO.click()) {
                            return true;
                        }
                    }
                }

                pUO = uo;
                for (let i = 0; i < parentNumber || 3; i++) {
                    if(!pUO) {
                        break;
                    }
                    if(typeof pUO.click == "function" && pUO.click()) {
                        return true;
                    }
                    pUO = pUO.parent();
                }
            }
            console.verbose("通过控件点击失败！");
            i += parseInt(maxNumber*0.2);
        }
        if(rect) {
            if (click(rect.centerX(), rect.centerY())) {
                console.verbose("通过坐标点击，可能无效");
                return true;
            } else {
                i += parseInt(maxNumber*0.2);
            }
        }
        if(typeof getUOFun == "function") {
            uo = getUOFun();
        } else {
            i = maxNumber;
            break;
        }
    } while (++i < maxNumber)

    if (50 <= i) {
        log("点击控件超时！")
        return false;
    }
    return true;
}

function step(标题, 检测, 执行, 执行成功后, 检测时间) {
    if(typeof 执行成功后 == "function") {
        执行 = null;
    }
    if(!检测) {
        try{
            检测 = addPackUS(text(标题))
        } catch(e) {
            检测 = text(标题)
        }
    }
    if(typeof 检测 == "object") {
        let 选择器 = 检测;
        检测 = function(){
            return (this.uo = 选择器.findOne(检测时间||1000));
        }
    }
    标题 = 标题 || 检测.toString();
    执行 = 执行 || function () {
        if(this.uo) {
            let re = clickOn(this.uo);
            log("点击" + this.标题, re);
            if (re) {
                return !执行成功后 || 执行成功后();
            } else {
                sleep(100);
            }
        } else {
            console.warn(this.标题 + "\n不存在 this.uo 对象！")
        }
    };
    return {
        标题: 标题
        , 检测: 检测
        , 执行: 执行
    };
}

function 循环执行(数组, 等待时间, 结束标记, 日志查看) {
    let 进度 = 0;
    let 等待 = 等待时间 || 100;
    let 下标;
    结束标记 = 结束标记 || "跳出循环执行";
    if(typeof 日志查看 != "boolean") {
        try{
            日志查看 = conf.循环执行日志;
        } catch(e) {
            日志查看 = true;
        }
    }
    if(!数组) throw "操作参数为空！";
    while (-1 < 进度) {
        下标 = 进度%数组.length;
        if(typeof 数组[下标] == "object") {
            if(日志查看 && 数组[下标].标题) console.verbose("当前操作步骤：", 数组[下标].标题);
            if(数组[下标].检测()) 进度 = 数组[下标].执行() != 结束标记 ? 进度 : -2;
            sleep(等待);
        }
 
        进度++;
    }
}

 function 邮箱生成(num, path, suf) {
    if(!(path)) path = 路径.zhuce;
    let accounts = new java.lang.StringBuilder();
    let startTime = new Date().getTime();
    let i = 0;
    let len = num||1000;

    threads.start(function () {
        while(i < len){
            log("邮箱生成进度：", (i/len).toFixed(2)*100+"%")
            sleep(100);
        }
    })

    for (; i < len; i++) {
        let account = newAccount(suf||"@bosslee888.com");
        accounts.append(account).append("\n");
    }
    // files.ensureDir(path);
    files.append(path, accounts.toString());
    log("完成，写入数据长度：", accounts.length());
    let endTime = new Date().getTime()
    log("耗时（ms）：", endTime-startTime)

    function newAccount(suffix) {

        let words = 'abcdefghijklmnopqrstovwxyz',
            account = "",
            accLen = 12,
            numLen = 3;

        for (let i = 0; i < accLen-numLen; i++) {
            let c = words[random(0,words.length)];
            if(c) account += c;
        }

        let num="";
        for (let j = 0; j < numLen; j++)
            num += random(0,9)+"";
        account += num;

        if(suffix.indexOf("@") < 0) 
            suffix = "@"+suffix;

        return account+suffix;
    }
}
function waitUserClick(title){
    let cf = floaty.rawWindow('<frame><button id="but">' + (title || "开始测试") + '</button></frame>')
    cf.setPosition(device.width*0.6, device.height*0.3)
    cf.setPosition(400,800)
    cf.but.click(()=>{
        toast("继续")
        cf.close()
        cf = null
    })
    while(cf){
        sleep(300);
    }
}