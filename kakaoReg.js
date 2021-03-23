
var st = {
      appName: "카카오톡 채널 관리자센터"                                 // app名字
    , appPackage: app.getAppName(this.appName) || "com.kakao.yellowid"  // app包名
    , appVersion: "3.8.3"                                               // app版本
    , version: "0.1"                                                    // 脚本版本
    , 注册文件路径: "/sdcard/xxxxkk/testEmail.txt"                       // 邮箱路径
    , 注册成功保存路径: "/sdcard/xxxxkk/regFinish.txt"                   // 注册成功保存路径
    , 注册结束缓存路径: "/sdcard/xxxxkk/regCache.txt"                    // 注册结束操作触发时的缓存
    , account: "defaultName"                                            // 注册时的账号
    , password: "pdboss00"                                              // 注册时的密码
}

toastLog("启动中..." + st.version)

var words = {
    "직접 입력해서 로그인": "직접 입력해서 로그인"
}
var conf = {
    循环执行日志: true                         // 循环执行的日志
}

// ===  生成邮箱文件  ===
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
            sleep(30);
            let rect = this.uo.bounds();
            clickOn({ 
                x: rect.centerX()
                , y: rect.centerY()
            })
            console.show();
        }
    )
    , step(word("Agree"))
    // 设置账号
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
            // 等待输入验证码
            log("等待输入邮箱验证码，并提交")
            while (text("Confirm").findOne(1000)) {
                sleep(2000);
            }
            log("离开验证码界面！");
        }
    )
    // 设置密码
    , step(
        // TODO
        word("To sign up,register a password.")
        , false
        , function() { 
            // 获取两个密码输入框，不是两个就跳过
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
    // Set up your Kakao Account Profile 
    // 设置账号名字
    , step(
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
            //TODO 选择日
            selectDate(1,4);
        }
    )
    // 选择性别
    , step(word("Female"))
    , step(word("Confirm"))
    , step(
        "注册结果"
        , text(word("Get Started"))
        , function(){
            saveReg(st.注册结束缓存路径)
            // 返回上一页
            let uo = addPackUS(clickable(true).filter(function(uo){
                let rect = uo.bounds();
                return rect.bottom < device.height*0.2 && rect.right < device.width*0.2;
            })).findOne(50);
            // 返回上一级
            if(uo && clickOn(uo)){
                //TODO 保存当前结果
                saveReg()
                log("注册成功！")
            }
        }
    )
    // === 处理其它异常 ===
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
循环执行(主要操作,600)


// ======   以下内容为测试    ===============================================

// log(
    // addPackUS(text("首页")).findOne(1000)
// )
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

// ======   以下内容为其它操作    ===============================================
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
            // 重新获取到列表控件
            uo = className("android.widget.ListView").findOne(1000)
            if(uo){
                // 拿到子元素
                uo = uo.children();
                // 随机抽取一个子元素
                uo = uo[random(0,uo.length-1)]
                // 元素存在则点击
                if(uo) clickOn(uo);
            } else log("选择年份时找不到控件！")
        } else toastLog("未找到控件！")
    }
}

/**
 * 打开app
 */
 function openApp() {
    let 操作 = [
        step(
            "启动" + st.appName
            , function(){return !(addPackUS().findOne(1000))}
            , function(){
                // 不在软件内，启动软件
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
                // 检测是否已经启动到主界面
                while(!addPackUS().findOne(1000)) {
                    sleep(1000);
                }
                // 结束当前的操作
                return "跳出循环执行";
            }
            , null
            , 3000
        )
    ]
    循环执行(操作,10,null)
    sleep(1000)
}

// ======   以下内容为工具类    ===============================================

/**
 * 保存账号密码
 * @param {String} 账号 
 * @param {String} 密码 
 * @param {String} 保存路径 
 */
function saveReg(账号,密码,保存路径) {
    let acc = 账号+','+密码;
    console.info("账号保存", acc);
    files.append(保存路径 || st.注册成功保存路径, "\n"+acc); 
}


/**
 * 弹窗检测
 * @param {Number} time 检测最大时间
 */
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
        // 极低概率会出现控件消失或者就是脚本被关闭了，所以不用处理
        console.info("334");
    }
}

function addPackUS(us){
    return us ? us.packageName(st.appPackage) : packageName(st.appPackage);
}

// ======   以下内容为库    ===============================================

/**
 * 从形参对象 ws 或全局对象 words 中获取到当前 str 文字
 * 如果获取失败则返回当前文字 str
 * @param {String} str 键名字（要获取的原文字）
 * @param {Object} ws 自定义字符对象
 */
function word(str, ws) {
    ws = typeof ws == "object" ? ws : words;
    let rew;
    if(typeof ws == "object") rew = ws[str];
    return rew ? rew : str;
}

/**
 * 
 * @param {Function|UiSelector||UiObject} getUOFun ["get Ui Object Function"]   .findOne(sleepTime)   
 *      控件选择器函数。控件选择器。控件。坐标{x:1,y:1}。rect对象(存在centerX() centerY()即可)   
 * @param {Number} sleepTime 查找控件时每一次等待时间 500ms 
 * @param {Number} parentNumber 父级数量，最多向上面几层尝试。 3
 * @param {Object} rectScope 偏离范围，基于原对象的偏移范围 
 *                { left: device.width*0.1,
 *                  right: device.width*0.1,
 *                  top: device.height*0.1,
 *                  bottom: device.height*0.1 }
 */
function clickOn(getUOFun, sleepTime, parentNumber, rectScope) {
    //// 初始化
    // 创建对象
    let uo, maxNumber = 50, rect/* 坐标范围 */;
    // 1. 判断是不是一个方法
    if (typeof getUOFun != "function") {
        // 不是方法时判断是不是控件选择器
        if(typeof getUOFun.getClass == "function") {
            if (getUOFun.getClass() == selector().getClass()) {
                // 如果s不是一个数字或s小于0时赋值500ms
                if (typeof sleepTime != "number" || sleepTime < 0) sleepTime = 500;
                // us暂存控件选择器（暂存）
                let us = getUOFun;
                // 创建获取控件的函数
                getUOFun = function () {
                    // 如果存在包名则使用包名进行锁定获取，否则不使用
                    return us.findOne(sleepTime);
                };
            } else if(getUOFun.getClass() == depth(0).findOnce().getClass()) {
                // 将当前类与条件depth(0)（深度0）所找到的"控件"类型一致时执行
                uo = getUOFun;
            }
        } else if(typeof getUOFun == "object") {
            // 检测是否是坐标
            if(typeof getUOFun.x == "number" && typeof getUOFun.y == "number" ) {
                rect = {};
                rect.centerX = function(){return getUOFun.x}
                rect.centerY = function(){return getUOFun.y}
            } else if(typeof getUOFun.centerX == "function" && typeof getUOFun.centerY == "function"){
                rect = getUOFun;
            }
        }
    };
    // 规范化范围，默认范围是屏幕的10%
    if(typeof rectScope != "object") rectScope = {};
    if(typeof rectScope.left != "number") rectScope.left = device.width*0.1;
    if(typeof rectScope.right != "number") rectScope.right = device.width*0.1;
    if(typeof rectScope.top != "number") rectScope.top = device.height*0.1;
    if(typeof rectScope.bottom != "number") rectScope.bottom = device.height*0.1;

    // 设置标记，最多循环50次
    let i = 0;
    do {
        if (uo) {
            //// 点击操作
            // 点击
            if (uo.click()) {
                // 点击成功则直接返回跳出循环
                return true;
            } else {
                /// 通过坐标范围获取父控件点击
                // 获取rect对象
                rect = uo.bounds();
                // 进行对象实例化
                let actualRange = {
                    left: rect.left - rectScope.left,
                    right: rect.right - rectScope.right,
                    top: rect.top - rectScope.top,
                    bottom: rect.bottom - rectScope.bottom
                };
                // 父节点 
                let pUO = uo, pr = {};
                // 确保当前控件存在父控件
                while (typeof pUO.parent == "function") {
                    // 获取父对象以及父对象的范围
                    pUO = pUO.parent();
                    if(!pUO) {
                        break;
                    }
                    pr = pUO.bounds();
                    // 偏离范围
                    if(
                        actualRange.left <= pr.left
                        && actualRange.right >= pr.right
                        && actualRange.top <= pr.top
                        && actualRange.bottom >= pr.bottom
                    ) {
                        // 在范围内，可以点击
                        if(pUO.click()) {
                            return true;
                        }
                    }
                }

                /// 通过父级层次点击
                pUO = uo;
                for (let i = 0; i < parentNumber || 3; i++) {
                    // 不存在控件时跳出
                    if(!pUO) {
                        break;
                    }
                    // 存在函数且调用函数返回true
                    if(typeof pUO.click == "function" && pUO.click()) {
                        return true;
                    }
                    // 获取父控件
                    pUO = pUO.parent();
                }
            }
            // 通过父控件点击
            console.verbose("通过控件点击失败！");
            // 大幅将计数器增加，避免过多尝试
            i += parseInt(maxNumber*0.2);
        }
        // 通过坐标进行点击
        if(rect) {
            if (click(rect.centerX(), rect.centerY())) {
                // 点击成功则跳出循环
                console.verbose("通过坐标点击，可能无效");
                return true;
            } else {
                // 大幅将计数器增加，避免过多尝试
                i += parseInt(maxNumber*0.2);
            }
        }
        //// 获取控件
        // 尝试获取控件，如果以上已经执行完成或者getUOFun不是函数则不需要进行获取。
        if(typeof getUOFun == "function") {
            uo = getUOFun();
        } else {
            // 不是一个函数直接跳过
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

/**
 * 
 * @param {String} 标题 
 * @param {Function} 检测 
 * @param {Function} 执行 
 * @param {Function} 点击成功后 ！填入此参数后会导致"执行"参数失效！
 *                      默认会对this.uo属性进行点击，点击成功时才执行
 * @param {Number} 检测时间 
 */
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
    // 创建操作
    return {
        标题: 标题
        , 检测: 检测
        , 执行: 执行
    };
}

/**
 * 循环执行数组中的单元，当运行完"执行"函数后返回 "跳出循环执行" 时跳出循环执行
 * @param {Array} 数组 单元数组中必须保存对象，格式 {标题: String, 检测: Function, 执行: Function}
 * @param {Number} 等待时间 [100]每次运行完等待时间
 * @param {Object} 结束标记 ["跳出循环执行"]在运行时返回这个变量就结束执行，可以是任何值
 * @param {Boolean} 日志查看 [conf.循环执行日志]查看日志
 */
function 循环执行(数组, 等待时间, 结束标记, 日志查看) {
    let 进度 = 0;
    let 等待 = 等待时间 || 100;
    let 下标;
    结束标记 = 结束标记 || "跳出循环执行";
    // 写 true 是可以查看当前日志
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
            // 这里写true是可以查看日志
            if(日志查看 && 数组[下标].标题) console.verbose("当前操作步骤：", 数组[下标].标题);
            if(数组[下标].检测()) 进度 = 数组[下标].执行() != 结束标记 ? 进度 : -2;
            sleep(等待);
        }
 
        进度++;
    }
}

/**
 * 随机生成账号
 * @param {Number} num 邮箱数量 默认：1000个
 * @param {String} path 存放邮箱数据的路径 默认："/sdcard/xxsq/zhuce.txt"
 * @param {String} suf 邮箱的后缀 默认："@bosslee888.com"
 */
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
