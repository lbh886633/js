"ui";
// https://lbh886633.github.io/js/script.js

var fasle = false;
var testLog = true;
    testLog = false;
var tempSave = {
    /* 测试时使用，将h="0"改成 h="auto"即可 */
    // 版本号
    version: "99" + " -- ",
    firstEnvi: 0,
    privacy: 30,
    NUMBER: 0,
    自动打码: true,
    // 直接发送的消息
    getSayMessage: "Hi",
    firstAccount: true,
    // 当前模式
    model: "<无>",
    // 选择的版本
    switchVersion: "",
    // 从后台获取id   areaList：限制国家
    area: null,
};
{
    let logs = [
        "解决一些问题",
        "修复关注时卡在列表底部",
        "修复没有log当前模式",
        "修复关注存在的一些问题",
        "修复关注不会切换链接，优化日志提示",
        "修复已存在标签还询问问题", // "&labelNamesExclude => "&labelNamesExclude=
        "新增可插入全字匹配",
        "重发消息时加入颜文字",
        "新增ID用户关注",
        "优化关注",
        "优化发送消息",
        "遇到say hi也进行回复",
        "测试3",

    ];
    tempSave.version += logs.pop();
    events.broadcast.emit("unlockOK", "run...");
}

var server = {
    serverUrl: "没有链接",
    again: function (err,option) {
        try{
            if(err.name.indexOf("Error") < 0) {
                throw "重试";
            }
            console.verbose(err.name);
            console.verbose(err.message);
        } catch(e) {
            // 初始化次数
            if(typeof option != "object" ) {
                option = option || {};
            }
            option.number = option.number || 0;
            // 最多重试60秒
            option.timeout = option.timeout || Date.now() + 60*1000;
            // 3次上限
            if(option.number < 3 || err) {
                log("重试中...", option.number,"超时时长...", Date.now() - option.timeout)
                return option;
            }
        }
    },
    add: function (uri, o) {
        this.sendData(this.serverUrl + uri + "/add", o);
    },
    edit: function (uri, o) {
        this.sendData(this.serverUrl + uri + "/edit", o);
    },
    exce: function (uri, o) {
        this.sendData(this.serverUrl + uri + "/exce", o);
    },
    numberToString: function (str) {
        let num = parseInt(str);
        log(num)
        if (str && -1 < str.indexOf(".")) {
            switch (str.substring(str.length - 1)) {
                case "k":
                case "K":
                    num *= 1e3;
                    break;
                case "m":
                case "M":
                    num *= 1e6;
                    break;
                case "b":
                case "B":
                    num *= 1e9;
                    break;
                case "t":
                case "T":
                    num *= 1e12;
                    break;
            }
        }
        return num
    },
    /**
     * 请求json数据并反序列化对象进行返回，失败时不返回数据undefined
     * @param {String} uri URI地址
     */
    get: function (uri, option) {
        try {
            console.info("[↓]" + this.serverUrl + uri);
            let re = http.get(this.serverUrl + uri, {'Connection': 'close'});
            if (re.statusCode != 200) {
                throw {name:"请求失败", message: "状态码：" + re.statusCode};
            }
            if(option && option.resouce){
                return re;
            }
            return JSON.parse(re.body.string());
        } catch (err) {
            log("请求失败", err);
            let re = this.again(err, option);
            if(re) {
                return this.get(uri, re);
            }
        }
    },
    // 排除对象中的null与undefined数据
    excludeNull: function (o) {
        let p = {};
        for (let k in o) {
            // 排除 params 与空值
            if (o[k] != null && o[k] != undefined && k!="params") {
                p[k] = o[k];
            }
        }
        return p;
    },
    /**
     * 发起post请求
     * @param {String} uri 
     * @param {Object} o 
     * @returns {String} 返回的是 消息体
     */
    post: function (uri, o, option) {
        try {
            console.verbose("[↑]" + this.serverUrl +  uri + "\n" + JSON.stringify(o))
            if(option && option.resouce){
                return http.post(this.serverUrl + uri, o||{}, {'Connection': 'close'});
            }
            return http.post(this.serverUrl + uri, o||{}, {'Connection': 'close'}).body;
        } catch (err) {
            log("[↑]POST上传出错", err)
            let re = this.again(err, option);
            if(re) {
                return this.post(uri, o, re)
            }
        }
    },
    /**
     * 给服务器发送数据
     * @param {String} url uri 例子"account/add"
     * @param {Object|String} o 
     */
    sendData: function (url, o, option) {
        try {
            console.verbose("[↑]" + url + "\n" + JSON.stringify(o))
            log(http.post(url, o||{}, {'Connection': 'close'}).body.string());
        } catch (err) {
            log("上传出错", err)
            let re = this.again(err, option);
            if(re) {
                if(re.timeout && re.timeout < Date.now()) {
                    console.warn("重试超时！")
                    return false;
                } else {
                    return this.sendData(url, o, re)
                }
            }
        }
    },
    /**
     * 将对象转成 uri 
     * @param {Object} obj 对象
     */
    objToUri: function (obj) {
        let uri = "?";
        for (let key in obj) {
            uri += "&" + key + "=" + obj[key];
        }
        return uri;
    }
}
var accountList = [];
var switchAccountName;
var accounts = {
    progress: 0,
    list: []
};
var errorEnvi = [];
var appName = "TikTok";
// var appPackage = "com.zhiliaoapp.musically" || app.getPackageName(appName);
var appPackage = app.getPackageName(appName);
var color = "#fb2f2d";
var survive = true;
var Exit = exit;
var accountInfo = {};
var Fans = {
    path: null,
    list: null,
    temp: null
};
var emojiData = [
    "(๑• . •๑)"
    , "(๑•ั็ω•็ั๑)"
    , "(･ิϖ･ิ)っ"
    , "(๑>؂<๑）"
    , "(｡･ω･｡)ﾉ♡"
    , "٩( 'ω' )و"
    , "(ಡωಡ)"
    , "ԅ(¯ㅂ¯ԅ)"
    , "(´｡✪ω✪｡｀)"
    , "\^O^/"
    , "(^～^)"
    , "(๑＞ڡ＜)☆ "
    , "(๑>؂<๑）"
    , "(^_^) "
    , "(σ′▽‵)′▽‵)σ"
    , "(´▽｀)ノ♪"
    , "๑乛v乛๑"
    , "(*˘︶˘*).｡.:*♡"
    , "ε٩(๑> ₃ <)۶ з"
    , "٩(๑^o^๑)۶"
    , "✧٩(ˊωˋ*)و✧"
    , "(≧▽≦)"
    , "(*^ω^*)"
    , "(^ω^)"
    , "(^0^)/"
    , "(=^▽^=)"
    , "o(^o^)o"
    , "o(≧v≦)o"
    , "(☆∀☆)"
    , "(/≧▽≦/)"
    , "(^-^)"
    , "^ω^"
    , " (≧∇≦*)"
    , "(*^▽^)/★*☆"
    , "♪～(´ε｀　)"
    , "(✪▽✪)"
    , "ヾ(@゜∇゜@)ノ"
]

// 发送消息异常
let sendMessagesExceptionNumber = 0;
let sendMessagesExceptionNumberMax = 2;
function smenReset(){
    sendMessagesExceptionNumber = 0;
}
function smenDetection(){
    if(sendMessagesExceptionNumberMax <= sendMessagesExceptionNumber) throw "消息发送异常超过" + sendMessagesExceptionNumber + "或等于" + sendMessagesExceptionNumberMax + "次";;
}
// 切换模式
function switchModel(str){
    if(str) {
        tempSave.model = str;
        console.info("当前为", tempSave.model, "模式")
    }
}
// 采集粉丝信息时使用
var fansNameList = [], fansList = [], countGetFansNum = 0, getFansNum = 0;
var modelIdList = ["loginmodel", "updatemodel", "getmodel"];
var 根路径 = "/sdcard/xxxx/";
files.ensureDir(根路径+"1");
var 路径 = {}
// 生成文件路径对象 
路径 = 创建路径(根路径, [
    { 失败环境列表: "失败环境列表" },
    { 失败环境: "失败环境" },
    { 登录频繁号: "登录频繁号" },
    { 注册频繁号: "注册频繁号" },
    { zhuce: "zhuce" },
    { 邮箱备份: "邮箱备份" },
    { 邮箱: "邮箱" },   // 账号文件
    { 链接: "链接" },
    { 链接备份: "链接备份" },
    { 用户名: "用户名" },
    { 用户账号: "用户账号" },
    { 打招呼消息: "打招呼消息" },
    { 颜文字: "颜文字" },
    { 任务消息: "任务消息"},
    { 环境: "环境" },
    { 标签: "标签" },
    { 失败环境: "失败环境" },
    { 已用账号: "已用账号" },
    { 账号进度: "账号进度" },
    { 服务器链接: "服务器链接" },
], ".txt")
// 生成文件夹路径对象
路径.文件夹 = 创建路径(根路径, [
    { XX环境: "环境" },
    { 回收站: "回收站" },
    { 视频列表: "视频列表" },
    { 头像列表: "头像列表" },
    { 视频: "视频" },
    { 头像: "头像" },
    { 粉丝: "粉丝" },
    { 私信: "私信" },
    { 备份: "备份" },
    { 账号: "账号" },
    { 日志: "日志" }
], "/")
路径.注册完成号 = "/sdcard/DCIM/成功注册号.txt";
files.ensureDir(路径.注册完成号);

function 创建路径(rootPath, arr, tag) {
    let obj = {};

    for (let o in arr) {
        o = arr[o];
        for (let k in o) {
            obj[k] = rootPath + o[k] + tag;
            if(!files.exists(obj[k])) files.create(obj[k]);
        }
    }
    return obj;
}

// 开启日志输出到文件
{
    /// 先不记录日志到指定的地方
    /* let d = new Date()
    console.setGlobalLogConfig({
        "file": 路径.文件夹.日志
            + d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() 
            + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
            + ".txt",
        maxFileSize: 256*1024*1024,
        // 【启动到现在的时间毫秒 日期时间 线程名】级别 日志
        filePattern: "【[%r] [%d{yyyy-MM-dd HH:mm:ss,SSS}]】[%p] %m%n"
    });
    */
}
exit = function () {
    survive = false;
    Exit();
}
threads.start(function () {
    let password = "授权线程的加密密码";
    let serverAuthUrl = [];
    let requestNumber = 0;

    let i = 0;
    while(survive){
        // auth(); // 自带捕获
        try{
            if((i++) % 15 == 0) {
                tempSave.switchVersion = -1 < appPackage.indexOf("zhiliaoapp") ? "长版本" : "短版本";
                console.verbose("模式：" + tempSave.model + " --- 版本：" + tempSave.switchVersion + " --- 包名：" +appPackage);
            } else if(i % 5 == 0) console.verbose("模式：" + tempSave.model + " --- 版本：" + tempSave.switchVersion);
            popupDetection(null, "关闭异常日志");
            {
                // if(i==0) {
                //     popupDetection();
                // } else {
                //     action = text("Okay").findOne(30);
                //     if(action) action.click();
                //     if(30 < i) i = 0;
                // }
            }
        }catch(e){
            console.verbose("守护线程异常", e)
        }
        sleep(2000);
    }

    function auth() {
        // console.info("授权校验中...")
        // 将自己的信息发送到服务器上，服务器返回一个结果，与本机结果进行校验，如果一致则判断为已授权
        // serverAuthUrl 从服务器获取到链接，采用加密形式
        try{
            let re = http.get("https://lbh886633.github.io/js/auth.js");
            requestNumber++;
            if(parseInt(re.statusCode/10) == 20) {
                // 解密数据并切割链接出来
                let urlDataString = deData(password + "jiaa", re.body.string());
                urlDataString.split("\n").forEach((url)=>{
                    if(serverAuthUrl.indexOf(url) < 0) {
                        if(4 < url.length) {
                            serverAuthUrl.push(url);
                        }
                    }
                })
            }
        }catch(e){
            requestNumber += 0.2;
            console.verbose("异常", e)
        }
        // 对链接进行请求并处理
        serverAuthUrl.forEach((url)=>{
            try{
                // 请求数据并将数据内容进行执行
                eval(deData(password + "mili", http.get(url).body.string()))
            }catch(e){
                toastLog("授权校验失败！");
                engines.stopAll();
                threads.shutDownAll();
                exit();
            }
        })
    }
})

server.serverUrl = files.read(路径.服务器链接).split("\n").shift();

function c() {}
ui.layout(
    <drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="{{'TikTok '+tempSave.version}}" />
            </appbar>
            <viewpager id="viewpager">
                <frame>
                    <ScrollView>
                        <vertical>
                            {/* <input id="qqyz" textColor="{{color}}" gravity="center" hint="请输入激活码" inputType="number" text="qq1257802889" /> */}
                            <input id="jihuoma" h="0" text="" />

                            <linear padding="5 0 0 0" h="0">
                                <Switch id="autoService" textColor="red" text="无障碍服务（注意！必须开启才能正常运行脚本）" checked="{{auto.service != null}}" />
                            </linear>
                            

                            <vertical id="modelmenu" bg="#404EC9A2">
                                <linear padding="5 0 0 0" >
                                    <text textColor="black" textSize="20" text="模式选择" />
                                </linear>
                                <radiogroup orientation="horizontal">
                                    <radio id="mi6_null" checked="true" text="" />
                                    <radio id="mi6_reg" text="注册" />
                                    <radio id="mi6_dat" text="资料" />
                                    <radio id="mi6_vid" text="视频" />
                                    <radio id="mi6_foc" text="关注" />
                                    <radio id="mi6_fan" text="粉丝" />
                                </radiogroup>
                                <radiogroup orientation="horizontal">
                                    <radio id="mi6_null" checked="true" text="" />
                                    <radio id="mi6_task" text="任务" />
                                    <radio id="getUserList" text="采集用户" />
                                    <radio id="focusUser" text="关注用户" />
                                    <radio id="detectionException" text="检测异常" />
                                    <radio id="mi6_rep"  text="回复" />
                                </radiogroup>
                                {/* 测试时使用，将h="0"改成 h="auto"即可 */}
                                <radiogroup orientation="horizontal" h="auto">
                                    <radio id="mi6_null" checked="true" text="空" />
                                    <radio id="functionTest" text="测试函数" />
                                </radiogroup>
                                <radiogroup orientation="horizontal" h="0">
                                    <radio id="ptxz" text="登号" />
                                    <radio id="ptxz1" text="采集" />
                                    <radio id="ptxz2" text="还原" />
                                    <radio id="ptxz5" text="单注册" />
                                    <radio id="ptxz6" text="注册_7" />
                                    <radio id="ptxz3" text="注册" />
                                    {/* <radio id="ptxz4" text="分身注册" /> */}
                                </radiogroup>
                            </vertical>
                            <linear>
                                    <checkbox id="switchVersionzl" text="长版本号" />
                                    <checkbox id="switchVersion" text="短版本号" />
                                    <checkbox id="createAccount" text="生成邮箱" marginLeft="18sp"/>
                                    <checkbox id="daily" text="日常模式" />
                            </linear>
                            <linear>
                                <checkbox id="urlId" text="ID用户" />
                                <checkbox id="replaySayIn" text="回复sayhi" />
                            </linear>

                            <linear padding="5 0 0 0" margin="40dp">
                                <button id="ok" w="*" h="auto" layout_gravity="bottom" style="Widget.AppCompat.Button.Colored" text="启动" />
                            </linear>

                            <vertical id="loginmodel">
                                
                                <linear>
                                    <checkbox id="switchaccount" text="登录账号" />
                                    <checkbox id="readLocalAccountRecord" text="账号进度" />
                                    <checkbox id="autoValidation" checked="true" text="自动打码" />
                                    <checkbox id="regEditInfo" text="注册完改资料" />
                                </linear>

                                <linear padding="2 0 0 0">
                                    <text textColor="black" text="指定关注用户数量: " />
                                    <input lines="1" id="focusUserNumber" w="auto" text="100"/>
                                </linear>
                                <linear padding="2 0 0 0">
                                    <text textColor="black" text="指定国家: " />
                                    <input lines="1" id="areaCode" w="*" text="US"/>
                                </linear>
                                <linear padding="2 0 0 0">
                                    <checkbox id="setServerUrl" text="" />
                                    <text textColor="black" text="指定服务器地址: " />
                                    <input lines="1" id="serverUrl" w="*" lines="2" text="{{server.serverUrl}}"/>
                                </linear>
                                <linear padding="2 0 0 0">
                                    <text textColor="black" text="停留时间: " />
                                    <input lines="1" id="stopTime" w="*" text="1" inputType="number|numberDecimal"/>
                                </linear>
                                <linear padding="2 0 0 0">
                                    <text textColor="black" text="采集打招呼个数: " />
                                    <input lines="1" id="fanslistnumber" w="*" text="10" inputType="number|numberDecimal"/>
                                </linear>
                            </vertical>

                            <text h="30sp" lines="1" textColor="#007ACC">———————————————————————————————————————————————</text>

                            <vertical id="loginmodel">
                                <linear padding="5 0 0 0">
                                    <text textColor="black" textSize="20" text="登号设置（注册）" />
                                </linear>
                                <linear padding="5 0 0 0" >
                                    <text textColor="black" text="新密码: " />
                                    <input lines="1" id="szmm" w="auto" text="pd123456" />
                                </linear>
                            </vertical>
                            <vertical id="updatemodel">
                                <linear padding="5 0 0 0">
                                    <text textColor="black" textSize="20" text="还原设置" />
                                </linear>
                                <linear padding="5 0 0 0">
                                    <text textColor="black" text="关注数量: " />
                                    <input lines="1" id="gzsl" w="auto" text="200" />
                                    <text textColor="black" text="~" />
                                    <input lines="1" id="gzsl1" w="auto" text="200" />
                                    <text textColor="black" text="个,每次间隔" />
                                    <input lines="1" id="gzjg" w="auto" text="210" />
                                    <text textColor="black" text="~" />
                                    <input lines="1" id="gzjg1" w="auto" text="1200" />
                                </linear>
                                <linear padding="5 0 0 0">
                                    <text textColor="black" text="上传数量: " />
                                    <input lines="1" id="scsl" w="auto" text="1" />
                                    <text textColor="black" text="个" />
                                </linear>
                                <linear padding="5 0 0 0">
                                    <text textColor="black" text="话题和视频标题: " />
                                    <input id="htbt" w="*" text="Do you like me?" />
                                </linear>
                                <linear padding="5 0 0 0">
                                    <text textColor="black" text="@用户: " />
                                    <input lines="1" id="atyh" w="*" text="copyshoe001" />
                                </linear>
                                <linear>
                                    <checkbox id="yhm" text="改用户名" />
                                    <checkbox id="yhzh" text="用户账号" />
                                </linear>
                                <linear padding="5 0 0 0">
                                    <text textColor="black" text="简介: " />
                                    <input id="jj" w="*" text="follow me~" />
                                </linear>
                                <linear padding="5 0 0 0">
                                    <text textColor="black" text=" 网站: " />
                                    <input id="wz" w="*" text=" " />
                                </linear>
                            
                                <linear>
                                    <checkbox id="gzyh" checked="true" text="关注用户" />
                                    <checkbox id="zlxg" text="资料修改" />
                                    <checkbox id="ghtx" text="更换头像" />
                                    <checkbox id="scsp" text="上传视频" />
                                </linear>
                                {/* <linear h="{{tempSave.privacy||0}}"> */}
                                <linear h="30">
                                    <checkbox id="replymsg" text="回复消息" />
                                    <checkbox id="sayhellobyurl" text="链接问候" />
                                    <checkbox id="sayhellobysearch" text="搜索问候" />
                                    <checkbox id="getsay" checked="true" text="采集发送" />
                                    {/* <checkbox id="getall" checked="true" text="重新扫完" /> */}
                                </linear>
                                <linear padding="10 1 ">
                                    <img bg="#C3916A" w="*" h="1"/>
                                </linear>
                                <linear>
                                    <checkbox id="fanslist" text="采集粉丝" />
                                    <checkbox id="first_start" text="从头开始" />
                                    <checkbox id="continue" checked="true" text="现在继续" />
                                    <checkbox id="nofor" checked="true" text="关闭循环" />
                                </linear>
                            </vertical>
                            <vertical id="getmodel">
                                <linear padding="5 0 0 0">
                                    <text textColor="black" textSize="20" text="采集设置" />
                                </linear>
                                <linear padding="5 0 0 0">
                                    <checkbox id="labeltag" checked="true" marginRight="20" text="手动进入" />
                                    <text textColor="black" text="采集: " />
                                    <input lines="1" id="cjlj" w="auto" text="100"/>
                                    <text textColor="black" text=" 条链接" />
                                </linear>
                                {/* <linear padding="5 0 0 0">
                                    <text w="auto"  lines="1">标签：</text>
                                    <input lines="1" id="label" w="*" />
                                </linear> */}
                            </vertical>
                        </vertical>
                    </ScrollView>
                </frame>
            </viewpager>
        </vertical>
        <vertical layout_gravity="left" bg="#ffffff" w="280">
            <img w="280" h="200" scaleType="fitXY" src="http://images.shejidaren.com/wp-content/uploads/2014/10/023746fki.jpg" />
            <list id="menu">
                <horizontal bg="?selectableItemBackground" w="*">
                    <img w="50" h="*" padding="16" src="{{this.icon}}" tint="{{color}}" />
                    <text textColor="black" textSize="15sp" text="{{this.title}}" layout_gravity="center" />
                </horizontal>
            </list>
        </vertical>
    </drawer>
);

// ui绑定
ui.ptxz.click(()=>{
    // 登号
    setBg("loginmodel", "登号")
})
ui.ptxz1.click(()=>{
    // 采集 getmodel
    setBg("getmodel", "采集")
})
ui.ptxz2.click(()=>{
    // 还原 updatemodel
    setBg("updatemodel", "还原")
})
ui.ptxz3.click(()=>{
    // 注册 
    setBg("loginmodel", "注册")
})
ui.ptxz5.click(()=>{
    // 单注册
    setBg("loginmodel", "单注册")
})
ui.ptxz6.click(()=>{
    // 单注册
    setBg("loginmodel", "注册_7")
})
ui.daily.click((v)=>{
    if(v.checked){
        ui.modelmenu.setBackgroundColor(colors.parseColor("#44221100"));
    } else {
        ui.modelmenu.setBackgroundColor(colors.parseColor("#404EC9A2"));
    }
})
// s = encodeURI(s)

//创建选项菜单(右上角)
ui.emitter.on("create_options_menu", menu => {
    menu.add("设置");
    menu.add("日志");
    menu.add("关于");
    menu.add("退出");
});
//监听选项菜单点击
ui.emitter.on("options_item_selected", (e, item) => {
    switch (item.getTitle()) {
        case "设置":
            app.startActivity("settings");
            break;
        case "日志":
            app.startActivity("console");
            break;
        case "关于":
            alert("关于", "作者QQ");
            break;
        case "退出":
            exit()
            break;
    }
    e.consumed = true;
});
activity.setSupportActionBar(ui.toolbar);
//设置滑动页面的标题
ui.viewpager.setTitles(["功能区"]);
//让滑动页面和标签栏联动
// ui.tabs.setupWithViewPager(ui.viewpager);
//让工具栏左上角可以打开侧拉菜单
ui.toolbar.setupWithDrawer(ui.drawer);
ui.menu.setDataSource([
    {
        title: "选项一",
        icon: "@drawable/ic_android_black_48dp"
    },
    {
        title: "选项二",
        icon: "@drawable/ic_settings_black_48dp"
    },
    {
        title: "选项三",
        icon: "@drawable/ic_favorite_black_48dp"
    },
    {
        title: "退出",
        icon: "@drawable/ic_exit_to_app_black_48dp"
    }
]);

ui.menu.on("item_click", item => {
    switch (item.title) {
        case "退出":
            exit()
    }
})
//指定确定按钮点击时要执行的动作
ui.autoService.on("check", function (checked) {
    // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
    if (checked && auto.service == null) {
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    }
});


ui.emitter.on("resume", function () {
    // 此时根据无障碍服务的开启情况，同步开关的状态
    ui.autoService.checked = auto.service != null;
});



var storage = storages.create("gjdy");

function setBg(id, title) {
    ui.run(function () {
        modelIdList.forEach(e=>{
            if(e==id) eval('ui.'+e+'.setBackgroundColor(colors.parseColor("#809CDCFE"));');
            else eval('ui.'+e+'.setBackgroundColor(colors.parseColor("#FFFFFF"));');
        })
    })
    log("模式切换到：", title, id)
}
//回复数据()
function 回复数据() {
    try {
        var content = storage.get("pz");
        if (content != null) {
            ui.jihuoma.setText(content.k2);
            ui.szmm.setText(content.k3);
            ui.gzsl.setText(content.k4);
            ui.gzsl1.setText(content.k5);
            ui.gzjg.setText(content.k6);
            ui.gzjg1.setText(content.k7);
            ui.scsl.setText(content.k8);
            ui.htbt.setText(content.k9);
            ui.jj.setText(content.k10);
            ui.wz.setText(content.k11);
            ui.cjlj.setText(content.k12);
        }
    } catch (e) {
    }
}


function 保存数据() {
    try {
        storage.put("pz", {
            "k2": ui.jihuoma.text(),
            "k3": ui.szmm.text(),
            "k4": ui.gzsl.text(),
            "k5": ui.gzsl1.text(),
            "k6": ui.gzjg.text(),
            "k7": ui.gzjg1.text(),
            "k8": ui.scsl.text(),
            "k9": ui.htbt.text(),
            "k10": ui.jj.text(),
            "k11": ui.wz.text(),
            "k12": ui.cjlj.text(),
        })
    } catch (e) {

    }
}

var qd = 0
ui.ok.click(function () {
    //保存数据()
    if (qd == 0) {
        qd = 1
        //threads.start(悬浮)
        threads.start(主程序)
    } else {
        // qd = 0;
        toastLog("脚本已经启动了~");
    }
});

var 线, 线1
function 悬浮() {
    //console.show()
    var window = floaty.window(
        <vertical w="*">

            <linear id="h" gravity="center">
                <button id="action" text="启动" textSize="20sp" />
            </linear>
            <linear id="h1" gravity="center">
                <button id="bt2" text="隐藏" textSize="20sp" />
            </linear>
            <linear id="h2" gravity="center">
                <button id="bt3" text="退出" textSize="20sp" />
            </linear>
        </vertical>
    );

    setInterval(() => { }, 1000);
    var execution = null;
    //记录按键被按下时的触摸坐标
    var x = 0, y = 0;
    //记录按键被按下时的悬浮窗位置
    var windowX, windowY;
    //记录按键被按下的时间以便判断长按等动作
    var downTime;
    window.action.setOnTouchListener(function (view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                x = event.getRawX();
                y = event.getRawY();
                windowX = window.getX();
                windowY = window.getY();
                downTime = new Date().getTime();
                return true;
            case event.ACTION_MOVE:
                //移动手指时调整悬浮窗位置
                window.setPosition(windowX + (event.getRawX() - x),
                    windowY + (event.getRawY() - y));
                //如果按下的时间超过1.5秒判断为长按，退出脚本
                if (new Date().getTime() - downTime > 30000) {
                    exit();
                }
                return true;
            case event.ACTION_UP:
                //手指弹起时如果偏移很小则判断为点击
                if (Math.abs(event.getRawY() - y) < 5 && Math.abs(event.getRawX() - x) < 5) {
                    onClick();
                }
                return true;
        }
        return true;
    }
    );
    window.bt2.click(() => {
        window.h.visibility = 8;
        window.h1.visibility = 8;
        window.h2.visibility = 8;
    });
    window.bt3.click(() => {
        toast("退出脚本")
        exit()

    });
    function onClick() {
        if (window.action.getText() == '启动') {
            线 = threads.start(主程序)
            // 线1 = threads.start(监控)
            window.action.setText('停止');
        } else {
            window.action.setText('启动');
            var 停止线程 = threads.start(停止脚本)
        }
    }
}

function 停止脚本() {
    toastLog("正常退出脚本")
    threads.shutDownAll()
}

function 监控() {

}

var 账号 = ""
var 密码 = ""
var 取验证码 = ""
var 链接 = ""
var 计数 = 0
var 限制
var newtext = ""
var 序号 = ""
var 随机账号 = ""

// TODO
function 主程序() {
    log("当前版本：",tempSave.version)
    let dec = true;
    threads.start(function () {
        while(dec) {
            action = text("Don't show again").findOne(300);
            if(action) action.click()
            action = text("Start now").findOne(30)
                    || text("START NOW").findOne(30)
                    || text("立即开始").findOne(30)
                    || text("立即開始").findOne(30);
            if(action) action.click();
        }
    })
    console.show()
    console.setPosition(10,0)
    if (!requestScreenCapture()) {            
        toast("请求截图失败");
        exit();
    }
    dec = false;

    if(ui.functionTest.checked) {
        switchModel("测试");
        // 在执行完之后如果还为true则等待继续
        let cf = floaty.rawWindow(<frame><button id="but">开始测试</button></frame>)
        cf.setPosition(device.width*0.6, device.height*0.3)
        cf.setPosition(400,800)
        cf.but.click(()=>{
            toast("继续")
            cf.close()
            cf = null
        })
        // launch(appPackage)
        while(cf){
            sleep(300);
        }

        try{
            console.info("开始测试", appPackage);
            // TODO TEST 测试代码
            // TODO TEST 测试代码
            // TODO TEST 测试代码
                            
        }catch(e){
            log(e)
        }
        console.info("测试结束");
        return false;
    }

    if(ui.createAccount.checked){
        switchModel("邮箱生成");
        邮箱生成();
    }

    
    if(ui.switchVersionzl.checked){
        log("切换zl版本");
        appPackage = "com.zhiliaoapp.musically";
    }

    if(ui.switchVersion.checked){
        log("切换ss版本");
        appPackage = "com.ss.android.ugc.trill";
    }

    if(ui.readLocalAccountRecord.checked) {
        switchModel("读取本地账号记录");
        accountList = files.read(路径.账号进度).split("\n");
        log("当前已完成的进度：", accountList);
    }

    if(ui.setServerUrl.checked){
        switchModel("修改服务器链接")
        let surl = ui.serverUrl.text();
        if(5 < surl.length) {
            server.serverUrl = surl;
            let fileData = files.read(路径.服务器链接);
            files.write(路径.服务器链接, surl+"\n"+fileData);
        }
    }

    if (ui.getUserList.checked) {
        switchModel("采集用户");
        采集用户();
        console.info("采集用户模式结束");
        exit()
    }
        
    if (!tempSave.daily && ui.mi6_reg.checked) {
        switchModel("注册模式")
        if(files.read(路径.zhuce).length < 10) {
            邮箱生成();
        }
        tempSave.login = true;
        tempSave.continue = true;
        while (tempSave.continue) {
            sm清除数据();
            mi6注册模式("关闭账号检测");
            
            返回首页()
            if(text("Sign up").findOne(2000)) {
                log("无账号");   
            } else if(ui.regEditInfo.checked) {
                log("修改资料")
                try{
                    修改资料("注册")
                    更换头像()
                }catch(e){
                    console.warn("新注册的账号修改资料或更换头像时出现异常！")
                    console.error(e)
                }
            } else {
                log("不修改资料以及上传头像")
            }

            {/* 
                // 注册满账号列表的模式
            if(tempSave.continue) {
                // 在执行完之后如果还为true则等待继续
                let cf = floaty.rawWindow(<frame><button id="but">继续注册</button></frame>)
                cf.setPosition(400,800)
                cf.but.click(()=>{
                    toast("继续")
                    cf.close();
                    cf = null;
                })
                while(cf){
                    sleep(1000);
                }
            }
             */}
        }
        toastLog("注册结束");
        return false;
    }


    // 日常模式，关注、采集粉丝、回复消息
    tempSave.daily = ui.daily.checked;

    let whileNumber = 0;
    while(true) {
        if(ui.switchaccount.checked){
            // 账号列表可以从本地文件读取
            if(!accountList) accountList = [];
            switchAccount()
        }
        smenReset();
        // 如果 发送消息异常次数小于3次则继续运行
        try{
            sm停止TikTok();
            if(runTikTok()) {
                log("账号正常，还原成功")
                // 开启一个新线程来保存账号
                threads.start(function () {
                    // 检测当前列表中是否已经保存了当前的账号，如果没有保存则进行保存
                    if(accountList.indexOf(accountInfo.name) < 0) {
                        accountList.push(accountInfo.name);
                    }
                    let saveAcc = {
                        username: accountInfo.username,
                        isExceptoion: 0,
                        isInvalid: 0,
                        url: accountInfo.url,
                        name: accountInfo.name,
                        device: accountInfo.enviName,
                        focus: server.numberToString(accountInfo.focusNumber),
                        fans: server.numberToString(accountInfo.fansNumber),
                        likes: server.numberToString(accountInfo.likeNumber),
                    }
                    server.add("account", saveAcc);
                })


                if (!tempSave.daily && ui.mi6_dat.checked) {
                    switchModel("修改资料")
                    修改资料()
                    更换头像()
                }

                if (!tempSave.daily && ui.mi6_vid.checked) {
                    switchModel("上传视频")
                    上传视频();
                }

                if (tempSave.daily || ui.mi6_foc.checked) {
                    switchModel("关注模式")
                    限制 = random(Number(ui.gzsl.text()), Number(ui.gzsl1.text()))
                    mi6关注操作()
                }

                if (tempSave.daily || ui.mi6_fan.checked) {
                    switchModel("采集粉丝信息，打招呼")
                    采集粉丝信息()
                }

                if (tempSave.daily || ui.mi6_rep.checked) {
                    switchModel("回复")
                    返回首页()
                    // tempSave.RequiredLabels = readRequiredLabelsFile();
                    // 获取标签
                    tempSave.RequiredLabels = tempSave.RequiredLabels || getLabelList();
                    if(!tempSave.RequiredLabels || tempSave.RequiredLabels.length < 1 ){
                        console.warn("没有获取到标签数据！停止运行")
                        exit()
                    }
                    if(!tempSave.endTime ) {
                        tempSave.endTime = parseInt(ui.stopTime.text()) * 60 * 1000;
                        if(0 < tempSave.endTime){}
                        else {
                            console.error("时间填写错误！", tempSave.endTime);
                            exit();
                        };
                    }
                    // tempSave.issue 携带的问题
                    tempSave.issue = tempSave.issue || getIssue();
                    if(!tempSave.issue || tempSave.issue.length < 1) {
                        console.warn("未获取到要携带的问题");
                    }
                    mi6回复消息()
                }

                if (ui.detectionException.checked) {
                    switchModel("消息异常检测重试")
                    返回首页()
                    消息异常检测重试()
                }
                
                if (tempSave.daily || ui.mi6_task.checked) {
                    switchModel("任务模式");
                    任务发送指定消息();
                }
                
                if (ui.focusUser.checked) {
                    switchModel("指定关注模式");
                    focusUser(0 <  ui.focusUserNumber.text() ? ui.focusUserNumber.text() || 200 : 200);
                }

            }
            // if (!tempSave.daily && ui.mi6_reg.checked) {
            //     log("注册模式")
            //     tempSave.login = true;
            //     tempSave.continue = true;
            //     while (tempSave.continue) {
            //         mi6注册模式();
            //         if(tempSave.continue) {
            //             // 在执行完之后如果还为true则等待继续
            //             let cf = floaty.rawWindow(<frame><button id="but">继续注册</button></frame>)
            //             cf.setPosition(400,800)
            //             cf.but.click(()=>{
            //                 toast("继续")
            //                 cf.close();
            //                 cf = null;
            //             })
            //             while(cf){
            //                 sleep(1000);
            //             }
            //         }
            //     }
            // }
        }catch(err) {
            try{
                // 在采集粉丝的模式下，检测是否是发送异常
                smenDetection()
                log(err)
                console.error(err.stack);
                if(autoConfirm(10000, true,
                    "脚本  " + tempSave.model + "  模式运行出现异常！是否重新运行？", "异常堆栈信息：" + err.stack)
                ) {
                    continue;
                }
            }catch(e) {
                console.info("发送失败超过3次，开始下一个账号")
                // 其实不需要
                smenReset();
            }
        }
        toastLog("当前账号的 " + tempSave.model + " 模式操作结束 " + (++whileNumber));

        if(!ui.switchaccount.checked) {
            let j=0;
            // 暂存上一个账号信息
            let lastAccount = accountInfo;
            let nowAccount;
            for(; j < 5; j++) {
                nextAccount()
                // 加入账号信息检测
                for (let I = 0; I < 3; I++) {
                    返回首页(300);
                    try{
                        // 点击个人信息，没有点击的情况下不会去尝试获取信息
                        if(text("Me").findOne(2000).parent().click()) {
                            // 获取到个人信息s
                            nowAccount = getFansInfo("个人信息", true);
                            console.verbose("切换之前", lastAccount.username, lastAccount.name)
                            console.verbose("当前账号", nowAccount.username, nowAccount.name)
                            if(lastAccount.username != nowAccount.username) {
                                break;
                            }else{
                                // 切换失败，进度降低
                                accounts.progress--;
                            }
                        } else {
                            sleep(5000)
                        }
                    }catch(e){
                        console.log(e)
                    }
                    if(1 < I) {
                        sm停止TikTok();
                        返回首页(300);
                    }
                }
                if(lastAccount.username != [nowAccount.username||""]) {
                    log("账号切换完成")
                    console.verbose(
                        "选择账号："+switchAccountName
                        , "当前 username：" + nowAccount.username
                        , "当前 name：" + nowAccount.name
                    )
                    accountList.push(switchAccountName);
                    break;
                }
            }
            if(lastAccount.username == nowAccount.username) {
                log(lastAccount.username, nowAccount.username)
                toastLog("账号切换失败！");
                return false;
            }
            // 返回首页()
            log("账号进度", accounts.progress)
        }

    }
}


function 主程序1() {
    log("当前版本：",tempSave.version)
    //sleep(5000)
    console.show()
    console.setPosition(10,0)
    初始化()
    sleep(500)
    // 上传视频()
    // 更换头像()
    //exit()
    if (!requestScreenCapture()) {
        toast("请求截图失败");
        exit();
    }
    sleep(1000)

    if(ui.createAccount.checked){
        log("邮箱生成");
        邮箱生成();
    }
    if (ui.ptxz.checked) {
        log("登号模式")
        tempSave.login = true;
        登号模式()
    }

    if (ui.ptxz1.checked) {
        if(ui.continue.checked) {
            log("采集模式,正在自动进入中...\n如果自动进入卡住,请手动前往")
            try{
                采集前()
            }catch(e){
                console.warn("请手动前往",e)
            }
        }
        采集模式()
    }

    if (ui.ptxz2.checked) {
        还原模式()
    }
    if (ui.ptxz3.checked) {
        log("注册模式")
        tempSave.login = true;
        注册模式()
    }
   /*  if (ui.ptxz4.checked) {
        log("分身注册模式")
        添加并打开分身("TikTok")
        sleep(3000)
        抖音分身注册()
    } */
    if (ui.ptxz5.checked) {
        log("单注册模式")
        tempSave.login = true;
        单注册模式()
    }
    if (ui.ptxz6.checked) {
        log("注册_7模式")
        tempSave.login = true;
        注册7模式()
    }
    log("操作结束")
}

function 注册模式() {
    while (1) {
        if (打开抖音()) {
            if (注册前往登录()) {
                if (注册查看滑块()) {
                    if (注册打码()) {

                    } else {
                        xx("删除当前环境")
                        sleep(2000)
                    }
                }
            }
        }
        xx("新建环境")
    }
}

var 切换类型 = "切换到下一个环境"
var 是否删除 = 0
function 还原模式() {
    let tag=true,r=true;
    // 切换到第一个环境
    if(ui.first_start.checked) {
        firstEnvi()
        tag = false
    }
    if(ui.continue.checked){
        tag = false
    }
    while (1) {
        if(tag) r = 切换环境(切换类型)
        else tag = true
        if (r) {
            if (是否删除 == 1) {
                是否删除 = 0
                删除失败()
            }
            if (打开抖音()) {
                log("账号正常，还原成功")
                // // 开启一个新线程来保存账号
                threads.start(function () {
                    // accountInfo
                    // { username: 'kwepixzr76675',
                    //   focusNumber: '1460',
                    //   fansNumber: '446',
                    //   likeNumber: '81',
                    //   BI: 'follow me~',
                    //   url: 'https://betterlove.online/collections/taste-vibrator',
                    //   video: 
                    //    [ { on: 1, num: '16' },
                    //      { on: 2, num: '106' },
                    //      { on: 3, num: '328' },
                    //      { on: 4, num: '284' } ],
                    //   enviName: 'A环境 (663)',
                    //   envi: 'kwepixzr76675@A环境 (663)' }
                    /* 
                    username: zhanghao
                    isExceptoion: 0
                    isInvalid: 0
                    url: http://asdasf
                    name: asf
                    focus: 关注数：
                    fans: 1
                    likes: 喜欢视频数：
                    device: asdf
                    reservedA: 留字段a：
                    reservedB: 保留字段b： */
                    let saveAcc = {
                        username: accountInfo.username,
                        isExceptoion: 0,
                        isInvalid: 0,
                        url: accountInfo.url,
                        name: accountInfo.name,
                        device: accountInfo.enviName,
                        focus: server.numberToString(accountInfo.focusNumber),
                        fans: server.numberToString(accountInfo.fansNumber),
                        likes: server.numberToString(accountInfo.likeNumber),
                    }
                    server.add("account", saveAcc);
                })
                // 还原操作的业务

                if (ui.zlxg.checked) {
                    log("修改资料")
                    修改资料()
                }
                if (ui.ghtx.checked) {
                    log("更换头像")
                    更换头像()
                }
                if (ui.scsp.checked) {
                    log("上传视频")
                    上传视频()
                }

                // 以下操作执行前先判断简介和链接
                if(accountInfo.url != ui.wz.text()){
                    log("修改链接")
                    let 编辑信息 = textContains("Edit ").visibleToUser().findOne(2000)
                    if(编辑信息){
                        编辑信息.click()
                        // 修改链接
                        var 網站 = text("Website").visibleToUser().findOne(2000)
                        if (網站) {
                            log("網站 " + 網站.parent().parent().click())
                            sleep(random(1500, 2000))
                
                            setText(ui.wz.text())
                            sleep(1000)
                            var 儲存 = text("Save").visibleToUser().clickable(true).findOne(2000)
                            if (儲存) {
                                log("儲存 " + 儲存.click())
                                sleep(random(2000, 2500))
                            } else {
                                var 后退 = text("Cancel").visibleToUser().clickable(true).findOne(2000)
                                if (后退) {
                                    log("后退 " + 后退.click())
                                    sleep(random(2000, 2500))
                                }
                            }
                        } else {
                            log("修改失败，找不到 Website ")
                        }
                        返回首页()
                    }
                }
                if(accountInfo.BI != ui.jj.text()){
                    // 修改简介
                    log("修改简介")
                    let 编辑信息 = textContains("Edit ").visibleToUser().findOne(2000)
                    if(编辑信息){
                        编辑信息.click()
                        var 個人簡介 = text("Bio").visibleToUser().findOne(2000)
                        if (個人簡介) {
                            log("個人簡介 " + 個人簡介.parent().parent().click())
                            sleep(random(1500, 2000))
                
                            setText(ui.jj.text())
                            sleep(1000)
                            var 儲存 = text("Save").visibleToUser().clickable(true).findOne(2000)
                            if (儲存) {
                                log("儲存 " + 儲存.click())
                                sleep(random(1500, 2000))
                            } else {
                                var 后退 = text("Cancel").visibleToUser().clickable(true).findOne(2000)
                                if (后退) {
                                    log("后退 " + 后退.click())
                                    sleep(random(2000, 2500))
                                }
                            }
                        } else {
                            log("修改失败，找不到 Bio ")
                        }
                        返回首页()
                    }
                }

                if (ui.gzyh.checked) {
                    log("关注操作")
                    限制 = random(Number(ui.gzsl.text()), Number(ui.gzsl1.text()))
                    if (关注操作()) {

                    } else {
                        //号被封了
                        序号 = xx("获取当前环境名称")
                        cancelDelete(序号)
                        console.error("将当前环境加入失败待删除列表：", 序号)
                        files.write(路径.失败环境, 序号)
                        是否删除 = 1
                    }
                }

                返回首页()
                if (ui.fanslist.checked) {
                    log("采集粉丝信息")
                    采集粉丝信息()
                }
                if (ui.replymsg.checked) {
                    // 对标签对象进行加载
                    tempSave.RequiredLabels = readRequiredLabelsFile(路径.标签);
                    log("回复消息")
                    回复消息()
                }

                if (ui.sayhellobyurl.checked) {
                    log("通过链接打招呼")
                    发送消息()
                }
                if (ui.sayhellobysearch.checked) {
                    log("通过搜索打招呼")
                    通过搜索打招呼()
                }

            } 
            //  else {
            //     序号 = xx("获取当前环境名称")
            //     cancelDelete(序号)
            //     console.error("将当前环境加入失败待删除列表：", 序号)
            //     files.write(路径.失败环境, 序号)
            //     是否删除 = 1
            // }
        // 从头开始的时候，遇到返回值是false则跳出
        }else if(r==false) break;
        sleep(3000)
    }
}

function 登号模式() {
    while (1) {
        切换环境("新建环境");
        sleep(500)
        if (打开抖音()) {
            // 确保在个人页面
            for (let i = 0; i < 5; i++) {
                // 在个人页面即可跳出
                if(text("Sign up").find().length>0) break;

                // 如果在TikTok则点击个人页面
                if(!text("Me").packageName(appPackage).findOne(500)) {
                    console.verbose("没在首页")
                    i--;
                }else{
                    text("Me").packageName(appPackage).findOne(500).parent().click();
                }
                popupDetection();
            }
            log("个人信息页面");

            if (前往登录()) {
                if (查看滑块()) {
                    if (打码()) {
                        log("即将开始下一个")
                        /*
                        if (ui.gzyh.checked) {
                            log("关注操作")
                            限制 = random(Number(ui.gzsl.text()), Number(ui.gzsl1.text()))
                            关注操作()
                        }
                        if (ui.zlxg.checked) {
                            log("修改资料")
                            修改资料()
                        }
                        if (ui.scsp.checked) {
                            log("上传视频")
                            上传视频()
                        }
                        */
                        // 备份环境()
                    }
                }
            }
        }
        // xx("新建环境")
    }
}

////////////////////////////////////////////////////////////////////////////////////////////


function consoleDisplay(tag, param) {
    events.broadcast.emit("unlockOK", param);
    if(tag) console.show();
    else console.hide();
}

function 打开抖音() {
    if(tempSave.login){
        log("登录/注册模式")
        for (let i = 0; i < 5; i++) {
            // 检测是否打开抖音
            if (packageName(appPackage).findOne(2000)){
                // 连续检测5次弹窗，如果已经到了主页，出现Me控件则跳出
                for (let j = 0; j < 3; j++) {
                    // 检测弹窗
                    popupDetection(1000);
                    detectionStateDialog();
                    sleep(500)
                    if(text("Me").findOnce()){
                       break; 
                    }
                    
                    if(textContains("Use phone or email").findOne(100)) {
                        log("Use phone or email ...")
                        return true;
                    }
                }

                // 点击 我 
                clickAction(text("Me"), 50, 500);
                // 检测是否在个人信息页面且未登录账号
                if(text("Sign up").clickable(true).findOne(1000)){
                    return true;
                }
                if(text("Edit profile").findOnce()){
                    log("已经存在账号")
                    return false;
                }
                // log提示语句
                console.verbose("等待" + appName + "启动中..." + i);
            } else {
                // app.launchApp(appName);
                app.launch(appPackage)
            }
        }
        console.verbose("进行最后一次个人信息页面检测")
        // 检测是否在个人信息页面
        if(text("Sign up").clickable(true).findOne(3000))
            return true;
        else return false;
        // 检测是否没有账号
    } else if(runTikTok()){
        clickAction(text("Me"), 50, 500);
        等待加载();
        sleep(1000);
        return true;
    } else {
        if(ui.ptxz2.checked){
            序号 = xx("获取当前环境名称")
            cancelDelete(序号)
            console.error("将当前环境加入失败待删除列表：", 序号)
            files.write(路径.失败环境, 序号)
            是否删除 = 1;   // 标记可删除
        }
    }
}

function 前往登录() {
    var me = text("Me").visibleToUser().findOne(1000)
    if (me) {
        log("ok" + me.parent().click())
        sleep(random(1500, 2000))
    }
    if (lh_find(text("Sign up").clickable(true), "Sign usp", 0)) {
        if (lh_find(text("Already have an account? Log in").clickable(true), "Log in", 0)) {
            if (lh_find(text("Use phone / email / username"), "username", 0)) {
                if (lh_find(text("Email / Username"), "Email / Username", 0)) {
                    var 返回 = 读取账号()
                    sleep(400)
                    setText(1, 返回[0])
                    sleep(1000)
                    setText(2, 返回[1])
                    sleep(1000)
                    return true
                }
            }
        }
    } else {
        log("需要新建环境.")
        return false
    }

}


function 查看滑块() {
    if (lh_find(text("Log in").enabled(true).depth(11), "Log in", 1)) {

        let tagI = 0;
        // 检测是否按下了按钮，按下了按钮会存在两个控件，没按只有一个
        while(++tagI < 5 && text("Log in").findOne(200)){
            try{
                if(text("Log in").enabled(true).depth(11).findOne(200).parent().children().length==1){
                    console.verbose("等待载入");
                    sleep(1500)
                }
                lh_find(text("Log in").enabled(true).depth(11), "Log in", 1)
            }catch(e){
                log("跳出等待");
                break;
            }
            sleep(500)
        }
        sleep(2000);
        for (let ahb = 0; ahb < 3; ahb++) {

            log("检测按下按钮后的状态")
            var 频繁 = textContains("You are visiting our service too frequently").findOne(1000)
            if (频繁) {
                files.append(路径.登录频繁号, 账号 + "\n")
                log("频繁了,")
                xx("删除当前环境")
                sleep(2000)
                return false
            }
            var 没网络 = textContains("No network connection").findOne(1000)
            if (没网络) {
                alert("没网络,脚本停止")
                exit()
            }
            var 密码错误 = textContains("account or password").enabled(true).findOne(1000)
            if (密码错误) {
                log("账号或者密码错误,切换账号")
                var 返回 = 读取账号()
                sleep(400)
                setText(1, 返回[0])
                sleep(1000)
                setText(2, 返回[1])
                sleep(2000)
                查看滑块()
            }
            for (var i = 0; i < 60; i++) {
                sleep(2000)
                if (desc("Refresh").exists() || text("Refresh").exists()) {
                    log("加载图片中")
                    sleep(2000)
                    break
                }
                if (text("Me").visibleToUser().exists()) {
                    log("直接登录成功了")
                    return true
                }
            }
            if (lh_find(desc("Refresh"), "刷新", 1)) {
                sleep(3000)
                for (var i = 0; i < 60; i++) {
                    sleep(2000)
                    if (text("Loading...").exists()) {
                        log("加载图片中")
                    }
                    if (text("Network issue. Please try again.").exists()) {
                        lh_find(desc("Refresh"), "重新刷新", 1)
                        sleep(3000)
                    }
                    if (text("Network issue. Please try again.").exists() && text("Loading...").exists()) {

                    } else {
                        log("完成")
                        return true
                    }
                }

            }

            sleep(2000);
        }
    }
}

function 打码() {
    if (text("Me").visibleToUser().exists()) {
        log("直接登录成功了")
        return true
    }
    // var 滑块范围 = indexInParent(1).depth(8).classNameEndsWith("view.View").findOne(2000)
    var 滑块范围 = depth(8).classNameEndsWith("view.View").filter(function(uo){return uo.indexInParent()==0 || uo.indexInParent()==1;}).findOne(2000)
    if (滑块范围) {
        var 坐标 = 滑块范围.bounds()
        var clip = images.clip(captureScreen(), 坐标.left, 坐标.top, 坐标.right - 坐标.left, 坐标.bottom - 坐标.top);
        log("截图打码")
        var 返回 = 联众打码("lbh886633", "Libinhao886633", clip)
        if (返回) {
            if(返回!="end"){
                返回 = Number(返回.split(",")[0]) + 坐标.left - 20
                log(返回)
                var 起点 = depth(13).classNameEndsWith("Image").findOne(1000);

            }
            if (起点) {
                if(起点!="end"){
                    log("正在滑动")
                    var 起点坐标 = 起点.bounds()
                    swipe(起点坐标.centerX(), 起点坐标.centerY(), 返回 + (起点坐标.centerX() - 起点坐标.left), 起点坐标.centerY(), 1000)
                    sleep(5000)
                }
                var 密码错误 = textContains("account or password").enabled(true).findOne(1000)
                if (密码错误) {
                    log("账号或者密码错误,切换账号")
                    var 返回 = 读取账号()
                    sleep(400)
                    setText(1, 返回[0])
                    sleep(1000)
                    setText(2, 返回[1])
                    sleep(2000)
                    查看滑块()
                }
                var 还在 = desc("Refresh").findOne(1000)
                var 还在a = text("Refresh").findOne(300)
                if (还在 || 还在a) {
                    log("继续打码")
                    打码()
                }
                var 频繁 = textContains("You are visiting our service too frequently").findOne(1000)
                if (频繁) {
                    files.append(路径.登录频繁号, 账号 + "\n")
                    xx("删除当前环境")
                    stopScript("打码后频繁了")
                    sleep(2000)
                    return false
                }
                var 登录 = text("Log in").enabled(true).depth(11).findOne(1000)
                if (登录) {
                    log("滑块失败.重新获取")
                }
                if (text("Me").visibleToUser().findOne(1000)) {
                    files.append(路径.邮箱备份, "OK=>" + xx("获取当前环境名称"));
                    log("登录成功了")
                    return true
                }
            }
        }
    }
}

function 读取账号() {
    if (!files.exists(路径.邮箱)) {
        alert("没有找到 "+路径.邮箱)
        exit()
    }
    var 读取 = files.read(路径.邮箱)
    if (读取) {
        var 分割 = 读取.split("\n")
        var 账号a = 分割[0].split("，")
        账号 = 账号a[0]
        密码 = 账号a[1]
        log(账号a[0])
        log(账号a[1])
        log("删除数据 " + 分割.splice(0, 1))
        newtext = 分割.join('\n');
        files.write(路径.邮箱, newtext);
        files.append(路径.邮箱备份, "\n"+JSON.stringify(账号a));
        return 账号a;
    } else {
        alert("没号了,脚本停止")
        exit()
    }
}


function 随机滑动() {
    var x = device.width / 2 + random(-20, 20)
    var y = device.height * 0.85
    var x1 = device.width / 2 + random(-20, 20)
    var y1 = device.height * 0.1
    swipe(x, y, x1, y1, random(1000, 1200))

}

function lh_find(obj, msg, dj, time, closeLog) {
    sleep(random(100, 150))
    time = time || 2500
    var 结果 = obj.findOne(time)
    if (结果) {
        try{
            if (dj == 1) {
                if (lh_范围点击(结果.bounds(), msg)) return true
            } else {
                if (msg) {
                    console.log(msg)
                }
                if (结果.click()) {
                    return true
                } else if (结果.parent().click()) {
                    return true
                } else if (结果.parent().parent().click()) {
                    return true
                } else {
                    console.log("无指针失败->" + msg)
                }
            }
        }catch(err){
            console.error("点击异常。异常信息：", err);
        }
    } else {
        if (msg) {
            if(!closeLog) console.log("没找到 " + msg)
        } else {
            // console.log("没找到 ")
        }
    }
}


function lh_范围点击(x, y, x1, y1, msg) {
    if (typeof x == "object") {
        var x坐标 = random(Number(x.left) + 3, Number(x.right) - 3)
        var y坐标 = random(Number(x.top) + 3, Number(x.bottom) - 3)
        console.log(y + " " + x坐标 + " " + y坐标)
    } else {
        msg = msg || ""
        var x坐标 = random(x - 3, x1 - 3)
        var y坐标 = random(y + 3, y1 - 3)
        console.log(msg + " " + x坐标 + " " + y坐标)
    }
    sleep(random(900, 1000))
    return click(x坐标, y坐标)
}



//////////////


function 采集模式() {
    // 20 大概就是 10分钟，每30秒循环一次
    for(let jlk=0; jlk<20; jlk++){
        if(jlk%2) toastLog("请手动进入TikTok视频页");
        log("正在等待可评论的视频页");
        var 新增評論 = text("Add comment...").visibleToUser().findOne(30000)
        if (新增評論) {
            // 跳出循环
            jlk=100;
            log("新增評論")
            sleep(random(1500, 2000))
            var 次数 = Number(ui.cjlj.text())
            for (var i = 0; i < 次数; i++) {
                if (!packageName(getPackageName("TikTok")).exists()) {
                    app.launch(getPackageName("TikTok"))
                    sleep(4000)
                }
                var 油滑 = visibleToUser().scrollable(true).classNameEndsWith("DmtViewPager$c").scrollForward()
                sleep(random(2000, 2500))
                let cancel = text("CANCEL").findOne(1000)
                if(cancel){
                    cancel.click()
                    sleep(500)
                }
                var 更多 = classNameEndsWith("ImageView").drawingOrder(3).visibleToUser().findOne(5000)
                if (更多) {
                    log("更多 " + 更多.click())
                    var 複製連結 = text("Copy link").visibleToUser().findOne(5000)
                    if (複製連結) {
                        log("複製連結 " + 複製連結.parent().click())
                        var 内容 = getClip()
                        if (/tiktok.com/.test(内容)) {
                            log("写入 " + 内容 + " 进度" + (i + 1) + "/" + 次数)
                            files.append(路径.链接, 内容 + "\n")
                        } else {
                            log("不符合")
                        }
                    }
                }
                采集返回()
                sleep(500)
                var 下滑 = visibleToUser().scrollable(true).classNameEndsWith("ViewPager").scrollForward()
                sleep(1200)
            }
            log("采集结束")
        }
    }
}

function 采集返回() {
    log("采集返回")
    for (var i = 0; i < 5; i++) {
        sleep(1000)
        if (idContains("e5q").visibleToUser().findOne(500) || text("Add comment...").visibleToUser().findOne(100)) {
            log("采集成功")
            break
        } else {
            back()
        }
    }

}

function 采集前() {
    // 一、确认环境
    firstEnvi()
    while(是否是失败环境()){
        // 失败环境，切换下一个
        let re = xx("切换到下一个环境");
        if(re!="true") {
            console.warn("环境切换出现异常！异常值：",re);
            xx("切换到上一个环境");
            break;
        }
    }
    sleep(1000)

    // 二、启动TikTok
    launchApp("TikTok")
    let tagI=0
    // 等待搜索按钮
    while(++tagI < 20 &&!text("Discover").findOne(2000))
        log("等待TikTok完成启动")
    if(tagI>=20) {
        log("启动失败")
        return false;
    }
    // 点击搜索
    text("Discover").findOne(1000).parent().click()
    // sleep(4000)
    if(ui.labeltag.checked) {
        log("请手动进入视频页面")
        return true;
    }
    // 三、进入视频
    // 此时在搜索界面
    try{
        sleep(500)
        let str = ui.label.text();
        if(str) 搜索选择(str);
        else 滑动选择();
        等待加载()
        let videoList = className("androidx.recyclerview.widget.RecyclerView").findOne(3000).children()
        sleep(100)
        // 点击随机一个视频
        let clickRe = videoList[random(0, videoList.length - 1)].children()[0].click()
        log("进入视频：",clickRe)
        if(!clickRe){
            log(click(device.width*0.5,device.height*0.5))
        } 
    }catch(err){
        console.errror("自动进入视频失败！请手动进入。")
        log("异常信息：", err);
    }

    function 搜索选择(str) {
        log("效果不好，尽量别用");
        let action;
        for (let i = 0; i < 3; i++) {
            action = text("Search").className("android.widget.EditText").findOne(1000);
            if(action){
                // 找到搜索框
                action.click();
                action.setText(str);
                // KeyCode(66) //按下回车
    
                for (let i = 0; i < 5 && (text("HASHTAGS").find().length < 1); i++) {
                    try{
                        // 拿到列表
                        let searchList = className("androidx.recyclerview.widget.RecyclerView").findOne(1000);
                        if(searchList.children().length)
                        // 拿到第一个数据
                        let listOne = searchList.children()[0];
                        if(listOne) click(device.width*0.8, listOne.bounds().centerY());
                        console.verbose("点击第一个搜索数据");
                    }catch(err){
                        i--;
                        sleep(1000)
                        continue;
                    }
                    sleep(1000)
                }
                let hashtags;
                for (let i = 0; i < 20 ; i++) {
                    hashtags = text("HASHTAGS").findOne(1000)
                    if(hashtags) hashtags.parent().click();
                    let viewsList = textContains("views").find();
    
                    if(viewsList.length>0) 
                        if(viewsList[0].bounds().left < device.width){
                            // 屏幕内
                            if(viewsList[0].parent().parent().click()) {
                                log("进入标签")
                                break;
                            }
                        }
                    sleep(1000)
                }
                log("结束")
            }
        }
        log("如有异常，手动进入视频");
    }

    function 滑动选择() {
        等待加载();
        let i = random(0, 10);
        log("将滑动(次)：", i)
        for (; i > 0; i--) {
            // 滑动(随机y坐标)
            x = parseInt(device.width * 0.5)
            swipe(x, parseInt(device.height * 0.8 + random(0, 100)),
                x, parseInt(device.height * 0.3 + random(100, 200)),
                random(300, 700)
            )
            sleep(1000)
        }
        // 点击一个标签
        className("androidx.recyclerview.widget.RecyclerView").findOne(5000).children()[0].click()
    }
}

////////////////////////////////////////////
function mi6关注操作(num) {
    计数 = num || 0;
    log("关注", 计数);

    let 滑动异常次数 = 0;
    let 关注失败次数 = 0;
    let lastFansNameList = [];
    let 新链接 = 取链接();
    openUrlAndSleep3s(新链接)
    // sleep(1000)
    // for (let index = 0; index < 10; index++) {
    //     var 打开方式 = textContains("TikTok").visibleToUser().findOne(2000)
    //     if (打开方式) {
    //         log("选择抖音 " + 打开方式.parent().parent().click())
    //         sleep(1000)
    //     }
    //     var 始终 = text("始终").visibleToUser().findOne(1000)
    //     if(!始终) 始终 = text("ALWAYS").visibleToUser().findOne(2000)
    //     if (始终) {
    //         log("始终 " + 始终.click())
    //     }
    //     let action = text("Open App").findOne(1000);
    //     if(action) action.click();
    
    //     if(packageName(appPackage).findOne(10)) break;
    // }

    sleep(random(2000, 3000))
    var 粉絲 = text("Followers").drawingOrder(2).visibleToUser().findOne(2000)
    if (粉絲) {
        sleep(random(500, 1000))
        log("进入粉丝 " + 粉絲.parent().click())
        等待加载()
        var 按讚 = textContains("Likes").drawingOrder(2).visibleToUser().findOne(1000)
        if (!按讚) {
            log("进入粉丝列表成功")
            let 计数标志 = 0;
            while (计数 < 限制) {
                var 关注 = text("Follow").visibleToUser().find()
                for (var i = 0; i < 关注.length; i++) {
                    计数++
                    log("关注 " + 关注[i].click() + " 进度" + 计数 + "/" + 限制)
                    if (计数 >= 限制) {
                        计数标志 += 计数;
                        log("达到" + 限制 + "个关注了")
                        break
                    }
                    var 关注间隔 = random(Number(ui.gzjg.text()), Number(ui.gzjg1.text()))
                    sleep(关注间隔)
                }

                // 判断关注失败的人数是否超过40%（4个），超过则换号
                if(4 < 关注.length && 关注.length == text("Follow").visibleToUser().find().length) {
                    // 切换账号
                    let click;
                    if(3 <= 关注失败次数++) {
                        click = true;
                    }
                    if(autoConfirm(3000,click,"似乎关注失败了，是否开始下一个账号？")) {
                        log("开始下一个账号")
                        计数 = 限制;
                    }
                }

                {
                    // 获取到当前列表所有人的名字
                    let arr = []
                    let uo = className("androidx.recyclerview.widget.RecyclerView").visibleToUser()
                        .filter(function(uo){return uo.depth()==9 || uo.depth()==10})
                        .scrollable(true).findOne(500);
                    if(uo) {
                        uo.children().forEach((e)=>{
                            let letUO = e.findOne(className("android.widget.LinearLayout"));
                            if(letUO) {
                                letUO = letUO.findOne(className("android.widget.TextView"))
                                if(letUO) {
                                    // 保存当前的粉丝名字
                                    arr.push(letUO.text())
                                }
                            }
                        })
                    }
                    // 判断当前列表的人和上一次的是否一致，一致则换链接
                    let tempArr = [];
                    arr.forEach((name)=>{
                        if(-1 < lastFansNameList.indexOf(name)) {
                            tempArr.push(name);
                        }
                    })
                    if(arr.length - tempArr.length < 3) {
                        // 切换链接
                        let click;
                        // 检测3次
                        if(3 <= 关注失败次数++) {
                            click = true;
                        }
                        if(autoConfirm(3000,click,"似乎关注失败了，是否切换链接？")) {
                            log("切换链接")
                            mi6关注操作(计数);
                            log("切换链接后关注结束");
                            计数 = 限制;
                        }
                    }
                    // 将本次获取到的账号名保存起来
                    lastFansNameList = arr;
                }

               {/*  if(关注.length == text("Follow").visibleToUser().find().length) {
                    let click;
                    // 检测3次
                    if(3 <= 关注失败次数++) {
                        click = true;
                    }
                    // 剩余超过3个可点击的关注按钮
                    if(3 < 关注.length) {
                        // 切换账号
                        if(autoConfirm(3000,click,"似乎关注失败了，是否开始下一个账号？")) {
                            log("开始下一个账号")
                            计数 = 限制;
                        }
                    } else {
                        // 切换链接
                        if(autoConfirm(3000,click,"似乎关注失败了，是否切换链接？")) {
                            log("切换链接")
                            mi6关注操作(计数);
                            log("切换链接后关注结束");
                            计数 = 限制;
                        }
                    }
                } */}


                if(计数 >= 限制 || 计数标志 >= 限制 ) {
                    log("跳出循环", 计数, 计数标志)
                    break
                }
                var 封号了 = textContains("Your account was logged out. Try logging in again.").findOne(200)
                if (封号了) {
                    log("号被封了!")
                    return false
                }
                var 滑动;
                try{
                    sleep(1000)
                    滑动 = className("androidx.recyclerview.widget.RecyclerView").visibleToUser()
                            .filter(function(uo){return uo.depth()==9 || uo.depth()==10})
                            .scrollable(true).scrollForward();

                    sleep(1000)
                    log("滑动结果：", 滑动, "当前可关注按钮数量：", text("Follow").visibleToUser().find().length)
                    // 滑动失败了才检测
                    if (!滑动 && text("Follow").visibleToUser().find().length < 2) {
                        // 检测网络
                        try{
                            console.warn("检测网络中...")
                            do {
                                sleep(1000)
                            } while (399 < http.get("https://www.google.com").statusCode);
                        } catch(e) {
                            log("检测网络时发生异常！", e)
                        }
                        sleep(1000);
                        滑动 = className("androidx.recyclerview.widget.RecyclerView").visibleToUser()
                            .filter(function(uo){return uo.depth()==9 || uo.depth()==10})
                            .scrollable(true).scrollForward()
                        sleep(2000)
                        // 再次滑动失败才跳出
                        log("滑动结果2：", 滑动)
                        if(!滑动 && text("Follow").visibleToUser().find().length < 2){
                            log("到底了,换个链接")
                            if(detectionLoginView()) {
                                toastLog("号被封了！");
                                return false;
                            }
                            let re = mi6关注操作(计数);
                            log("到底后换链接并且关注完成");
                            return re;
                        }
                    }
                }catch(e){
                    log("滑动异常！", e)
                    if(5 < 滑动异常次数++) {
                        console.warn("滑动异常超过5次！");
                        return false;
                    } 
                }
                sleep(2000)
                log("滑动 " + 滑动)
                等待加载(10)
            }
            log("本次关注操作结束")
        } else {
            log("进入粉丝列表失败")
            if(!tempSave.inFansListError) tempSave.inFansListError = 0;
            if(tempSave.inFansListError < 5){
                log("重取链接进入", tempSave.inFansListError);
                mi6关注操作(计数);
                log("重取链接后关注操作完成")
            }
            else {
                console.error("进入粉丝列表失败！")
                tempSave.inFansListError = 0;
            }
        }
        计数 = 0;
        return true;
    }
    log("===","结束")
}

function 取链接() {
    let r;
    while (typeof r == "undefined") {
        try {
            log("正在获取链接")
            r = server.get("url/low").url;
        }catch(e){
            console.verbose(e);
        }
    }
    if(!r){
        throw "获取链接失败！";
    }
    return r;
    /// 以下为使用本地链接文件
    if (!files.exists(路径.链接)) {
        alert("没有找到",路径.链接)
        exit()
    }
    // 第一次执行时将文件复制一份
    if(!tempSave.链接文件) {
        if(!files.isFile(路径.链接备份)) files.copy(路径.链接, 路径.链接备份)
        tempSave.链接文件 = true
    }
    var 读取 = files.read(路径.链接)
    if (读取) {
        var 分割 = 读取.split("\n")
        链接 = 分割[0]
        log("删除数据 " + 分割.splice(0, 1))
        var newtext = 分割.join('\n');
        files.write(路径.链接, newtext);
        return 链接
    } else {
        alert("没链接了,脚本停止")
        log("还原文件")
        files.copy(路径.链接备份,路径.链接)
        exit()
    }
}

function 返回首页(dayleTime) {
    log("返回首页中..")
    dayleTime = dayleTime||2000;
    for (var i = 0; i < 10; i++) {
        popupDetection(dayleTime*0.25);
        if (packageName(appPackage).visibleToUser().exists()) {
            sleep(dayleTime*0.5)
            if (text("Me").visibleToUser().exists()) {
                break
            } else {
                back()
                sleep(dayleTime*0.25)
            }
            var 退出 = text("QUIT").visibleToUser().findOne(100)
            if (退出) {
                退出.click()
            }
        } else {
            log("启动tiktok")
            app.launch(appPackage)
            sleep(1000)
        }
    }
    // 点击 “Me” 
    lh_find(text("Me"),"个人信息", 0, 1000);
    // text("Me").findOne(2000).parent().click()
}

///////////////////////////
// 关注用户
function focusUser(max) {
    max = max || 200;
    log("关注用户数", max)
    let focusNumber = 0;
    let focusException = 0;
    // "Edit profile" 是自己
    let words = ["Follow","Message","Requested","Edit profile"];
    // 获取链接，持有用户
    for (let i = 0; i < 3; i++) {
        while(focusNumber < max) {
            // 检测当前是否是关注异常
            if(2 < focusException) { 
                log("关注异常，提前结束");
                focusNumber = max;
                break;
            }
            let user;
            if(ui.urlId.checked) {
                // 通过id用户打开
                user = getUrlByUserId()
            } else {
                // 通过用户列表打开
                try {
                    user = server.get("focusList/gain");
                } catch (err) {
                    console.verbose("请求用户异常！");
                }
                // 没有新用户了
                if(!user) break;
                // 用户不是一个对象，用户没有链接，用户链接长度过短
                if(typeof user != "object" || !user.url || user.url.length < 5 ) {
                    console.verbose("信息不符合", user);
                    if(user.code == 500){
                        log("没有需要关注的用户了！")
                        exit();
                    }
                    continue;
                }
            }
            log("正在打开用户信息")
            if(!user) {
                // 没有用户则直接跳出
                console.info("没有用户数据了")
                return false;
            }
            // 打开链接
            openUrlAndSleep3s(user.url, user);
            // 检测当前界面，如果当前界面不是用户信息页面则等待，
            let state;
            let nowTime = Date.now();
            let clickNumber = 0;
            do {
                state = detectionFollowStatus(true);
                try{
                    // 超时检测
                    if(30000 < (Date.now() - nowTime) ) {
                        log("超时！")
                        focusNumber--;
                        break;
                    }

                    if(!state) {
                        // 检测网络
                        let res;
                        try{
                            console.warn("检测网络中...")
                            do {
                                res = http.get("https://www.google.com");
                                // 网络异常才会重置
                                if(399 < res.statusCode) nowTime = Date.now();
                            } while (399 < res.statusCode);
                        } catch(e) {}
                        console.info("网络正常");
                        continue;
                    }
                    
                    if(state.text()=="Follow"){
                        // 点击
                        if(state.click()) {
                            console.verbose("点击关注");
                            // 点击关注，清空状态
                            state = null;
                            if( 2 < clickNumber++) {
                                // 关注异常
                                log("关注异常！")
                                focusException++;
                                // 向服务器取消持有
                                if(ui.urlId.checked) {
                                    log("归还ID用户", server.get("idList/regain?id=" + user.id || -1));
                                } else {
                                    log("归还用户", server.get("focusList/regain?id=" + user.id || -1));
                                }
                                break;
                            }
                            sleep(1000)
                        }
                    } else if (state.text() == "Edit profile") {
                        // 直接跳出，进度减一
                        focusNumber--;
                        break;
                    } else {
                        user.label = state.text();
                        // 上传当前状态
                        threads.start(function () {
                            log(server.post((ui.urlId.checked ? "idList":"focusList") + "/use?id="+user.id+"&label="+user.label,{}).json());
                        })
                        break;
                    }
                }catch(e){
                    console.verbose(e)
                }
                
                // 其他异常检测
                if(lh_find(text("OK"), "点击OK", 0, 1000)) {
                    focusNumber--;
                    break;
                }
                
            } while (!state);
            focusNumber++;
            log("进度：" + focusNumber + "/" + max);
            返回首页(300);
        }

        if(focusNumber < max) {
            sleep((5000*i) + 1)
        }
    }
    
    function detectionFollowStatus(wait) {
        for (let i = 0;wait && i < 50; i++) {
            let follow = className("android.widget.TextView")
                .clickable(true).drawingOrder(1).filter(function(uo){
                    return -1 < words.indexOf(uo.text());
                }).find()
            if (follow.length == 0) {
                follow = className("android.widget.Button")
                .clickable(true).filter(function(uo){
                    return -1 < words.indexOf(uo.text());
                }).find()
            }
            if (follow.length == 1){
                return follow[0];
            } else {
                console.verbose("等待加载：", follow.length);
            }

            // 打开方式，有时出现太慢
            try{
                // Open App
                if(lh_find(text("Open App"), "Open App", 0, 100, true)) {
                    等待加载()
                    let 打开方式 = text("TikTok").visibleToUser().findOne(1000)
                    if (打开方式) {
                        log("选择TikTok", 打开方式.parent().parent().click())
                        sleep(1500)
                    }
                    let 始终 = text("始终").visibleToUser().findOne(1000)
                    if (始终) {
                        log("始终 " + 始终.click())
                    }
                }
            }catch(err) {
                console.error("选择打开方式失败！")
                console.verbose(err)
                console.verbose(err.stack)
            }
            sleep(100)
            等待加载(200)
        }
    }

}

function 采集用户() {
    // 打开tiktok
    while(true){
        返回首页()
        // 这里需要做的是：打开链接，进入粉丝列表，出现异常的时候进行处理
        let url = server.get("url/label?label=采集粉丝")
        if(!url) {
            console.info("获取不到新的链接，可能已经全部获取。")
            exit();
        }
        openUrlAndSleep3s(url.url)
        let list;
        do{
            sleep(1000)
            // 进入粉丝列表
            let action = text("Followers").drawingOrder(2).visibleToUser().findOne(2000);
            if(action) {
                if(action.parent().click()){
                    sleep(2000)
                    等待加载()
                }
            }
            list = className("androidx.recyclerview.widget.RecyclerView")
                .packageName(appPackage)
                .filter(function(uo){
                    return (uo.depth() == 9 || uo.depth() == 10)
                        && device.width*0.8 < uo.bounds().right - uo.bounds().left;
                }).enabled(true).findOne(1000)

        }while(!list)
        // 获取用户列表的控件
        获取用户列表(list);
    }
}
function 获取用户列表(list) {
    log("进入用户列表...")
    等待加载()
    // 获取列表信息之后获取用户信息
    // 如果出现异常则返回到列表重新获取列表之后继续执行
    // 如果没有出现异常则返回列表后向下滑动后执行
    let saveList = [];
    let userList = list || getListUO();
    function getListUO() {
        return className("androidx.recyclerview.widget.RecyclerView")
                .packageName(appPackage)
                .filter(function(uo){
                    return (uo.depth() == 9 || uo.depth() == 10)
                        && device.width*0.8 < uo.bounds().right - uo.bounds().left;
                }).enabled(true).findOne(1000)
    }
    /*
        获取当前页面的用户信息，
        正常：返回列表之后滑动到下一页
        异常：设置标记scrol，返回列表，不滑动继续获取用户信息
        会对用户名字使用数组进行保存操作

        需要在上面再封装一层，功能是打开链接，
        如果已经在列表则不会进行打开链接的操作，
        而是直接运行的操作
     */
    do {
        let scrol = true;
        try{
            saveList = getFansInfoList(userList,saveList);
        }catch(err){
            log("出现异常")
            log(err)
            scrol = false;
        }
        for (let i = 0; i < 5; i++) {
            userList = getListUO();
            if(userList) log("存在");
            if(userList) break;
            else back();
        }
        sleep(2000)
        if(scrol){
            if(!userList.scrollForward()){
                // 滑动失败
                log("滑动失败，跳出循环，本次完成计数：", saveList.length)
                break;
            }
        }
        log("总保存数："+saveList.length)
        log("============")
    } while (true);
}

/**
 * 获取当前页面列表中的粉丝信息
 * userList 列表控件对象 saveList 保存数组列表
 */
function getFansInfoList(userList,saveList) {
    saveList = saveList || [];
    let ul = userList.children();
    for (let i = 0; i < ul.length; i++) {
        let userName = ul[i].find(className("TextView"))[0].text()
        if(saveList.indexOf(userName) < 0){
            if(ul[i].click()){
                // 将当前用户保存起来
                // 获取用户并将其保存到服务器
                getFansInfo(null,null,"focusList");
                saveList.push(userName);
            } else {
                log("点击失败");
            }
        }
        // 不在列表则进行返回
        for (let i = 0; i < 5; i++) {
            userList = className("androidx.recyclerview.widget.RecyclerView")
                    .id("cku").findOne(1000)
            if(userList)log("存在")
            if(userList) break;
            else back()
        }
        sleep(500)
    }
    return saveList;
}

function 消息异常检测重试() {
    var 列表 = [];
    var t = 100;
    var 操作 = [ 
        /*  
           {
                标题: "Inbox",
                uo: null,
                检测: function () {
                    this.uo = text("Inbox").findOne(t);
                    return this.uo;
                },
                执行: function () {
                    let r = clickOn(this.uo);
                    log("点击" + this.标题, re);
                    if (re) {
                    }
                }
            } 
        */
        
            step(
                // 设置标题
                "消息页", 
                /* 检测函数，将 text("Inbox").findOne(100) 的结果
                赋值给 this.uo 然后返回 this.uo 
                */
                function(){ return (this.uo = text("Inbox").findOne(t)) }, 
                // 需要点击所以不需要这个参数
                null,
                // 点击成功后执行这里
                function(){ sleep(500); 等待加载(); }
            ),
            step(
                "点击私信", 
                function(){return (this.uo = className("android.widget.RelativeLayout").clickable(true)
                        .boundsInside(device.width*0.85,0,device.width,device.height*0.1).findOne(t))},
                null,
                ()=>{}
                // function(){return "跳出循环执行";}
            ),
            step(
                "私信界面操作", 
                function(){return (this.uo = text("Direct messages").findOne(t))}, 
                // 在私信界面的操作，不需要点击
                function(){
                    /*
                        1. 获取当前的所有列表
                        2. 获取存在感叹号的用户
                            // 用户列表放外面创建，避免被刷新
                        3. 排除已经操作过的，如果全部操作过则翻页，翻页失败则结束
                        4. 进入一个用户，将其保存
                     */
                    // 用户列表 
                    while(true) {
                        try{
                            // 1. 获取当前的所有列表
                            let recycler = className("androidx.recyclerview.widget.RecyclerView")
                                                .boundsInside(0, 0, device.width, device.height)
                                                .findOne(1000);
                            let tag;
                            // 进入带有感叹号的选项，并将用户名保存
                            for (let uo of recycler.children()) {
                                // 2. 获取存在感叹号的用户
                                if(0 < uo.find(className("ImageView")).length) {
                                    // 获取用户名
                                    let dmt = uo.findOne(depth(10).className("TextView"));
                                    if(dmt) {
                                        let name = dmt.text();
                                        // 3. 排除已经操作过的。进行校验保存
                                        if(name && 列表.indexOf(name) < 0) {
                                            // 进入，直接点击uo会产生混乱的bug
                                            // 4. 进入一个用户，将其保存
                                            if(clickOn(text(name))) {
                                                // 进入成功，进行保存，设置标记，跳出遍历
                                                log(name)
                                                列表.push(name);
                                                tag = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if(tag) {
                                log("进行重试处理操作")
                                sleep(500)
                                log("操作结果：", resend(), feedback())
                                // 操作完返回上一页
                                back()
                                sleep(1000)
                            } else {
                                // 3.5 如果全部操作过则翻页，翻页失败则结束
                                if(!recycler.scrollForward()){
                                    // 翻页尝试两次
                                    sleep(3000);
                                    if(!className("androidx.recyclerview.widget.RecyclerView")
                                        .boundsInside(0, 0, device.width, device.height)
                                        .findOne(1000).scrollForward()) {
                                            log("结束操作！")
                                            return "跳出循环执行";
                                    }
                                }
                            }
                        }catch(err) {
                            log("出现异常", err)
                            // 出现异常返回首页，返回完后重新来过即可
                            返回首页()
                        }
                    }
                }
            ),
        ];
    循环执行(操作);
}

/**
 * 
 * @param {String} 标题 
 * @param {Function} 检测 
 * @param {Function} 执行 
 * @param {Function} 执行成功后 ！填入此参数后会导致"执行"参数失效！
 *                      默认会对this.uo属性进行点击，点击成功时才执行
 */
function step(标题,检测,执行,执行成功后) {
    if(typeof 执行成功后 == "function") {
        执行 = null;
    }
    // 创建操作
    return {
        标题: 标题 || 检测.toString(),
        检测: 检测,
        执行: 执行 || 
        function () {
            if(this.uo) {
                let re = clickOn(this.uo);
                log("点击" + this.标题, re);
                if (re) {
                    return !执行成功后 || 执行成功后();
                }
            } else {
                console.warn(this.标题 + "\n不存在 this.uo 对象！")
            }
        }
    };
}

function resend() {
    // 先拿到当前屏幕上的消息列表
    let recycler = className("androidx.recyclerview.widget.RecyclerView").findOne(3000);
    let msg;
    // TODO 如果最后一条消息是发送wathapps则重新从服务器获取消息
    // 使用pop从后向前遍历
    while ((msg = recycler.children().pop())) {
        // 拿到(最后)一条有问题的消息，点击失败时会向上找
        let errorMessageBody = msg.find(className("android.widget.RelativeLayout"));
        if(errorMessageBody.length == 1) {
            let icons = errorMessageBody[0].find(className("ImageView"));
            if(icons.length == 1) {
                if(clickOn(icons[0])) {
                    // 点击Resend
                    if(clickOn(text("Resend"))) {
                        return true;
                    };
                    return true;
                }
            }
        }
    }
    // 点击失败
    return false;
}
function feedback(feed) {
    console.hide();
    for (let num = 0; num < 3; num++) {
        // 获取控件的最后一个并且复制给feed
        if((feed = feed || text("This message violated our Community Guidelines. We restrict certain content and actions to protect our community. If you believe this was a mistake, tap Feedback to let us know.")
                    .find().pop())) {
            let rect = feed.bounds();
            // 左边范围
            let offsetX = 0.5 * (rect.centerX() - rect.left);
            // 下边范围
            let offsetY = 0.3 * (rect.centerY() - rect.bottom);
            // 点击最下面的区域
            for (let i = 0; i < 10; i++) {
                clickOn({x: rect.left+offsetX, y: rect.bottom+offsetY});
                sleep(100)
            }
            console.show();
            return true;
        }
        // 等待1秒(1000ms)
        sleep(1000)
    }
    return false;
}

///////////////////////////

function 上传视频() {
    var 话题内容 = ui.htbt.text()
    var at = ui.atyh.text()
    var 上传次数 = Number(ui.scsl.text())
    let 选择后操作 = [
        {
            标题: "编辑框",
            uo: null,
            检测: function() {
                this.uo = classNameEndsWith("EditText").visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.setText(话题内容);
                log("设置" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "去选封面",
            uo: null,
            检测: function() {
                this.uo = text("Select cover").clickable(true).findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "封面",
            uo: null,
            检测: function() {
                this.uo = classNameEndsWith("ImageView").idContains("bg6").find()
                return this.uo
            },
            执行: function() {
                if (this.uo.length > 5) {
                    let 坐标 = this.uo[2].bounds()
                    click(坐标.centerX(), 坐标.centerY())
                    sleep(random(1500, 2000))
                }
            }
        },
        {
            标题: "保存",
            uo: null,
            检测: function() {
                this.uo = text("Save").clickable(true).findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                }
            }
        },
        {
            标题: "发布",
            uo: null,
            检测: function() {
                this.uo = text("Post").visibleToUser().depth(10)
                        .boundsInside(device.width*0.5, device.height*0.8,device.width,device.height)
                        .findOne(2000)
                return this.uo
            },
            执行: function() {
                var 儲存到裝置中開啟 = desc("Save to deviceOn").visibleToUser().clickable(true).findOne(2000)
                if (儲存到裝置中開啟) {
                    log("儲存到裝置中開啟 " + 儲存到裝置中開啟.click())
                    sleep(random(1000, 1500))
                }
                log("發佈 " + this.uo.parent().parent().click() + "进度 " + (i + 1) + "/" + 上传次数)
                lh_find(text("Post Now"),"Post Now", 0);
                while (true) {
                    var 上传中 = textContains("%")
                                .boundsInside(0,0,device.width*0.2,device.height*0.2)
                                .visibleToUser().findOne(1000)
                    if (上传中) {
                        log("上传中 " + 上传中.text())
                        sleep(3000)
                    } else {
                        log("上传完成....")
                        break;
                    }
                }
                return "跳出循环执行"
            }
        },
        {
            标题: "进度检测",
            uo: null,
            num: 0,
            检测: function() {
                this.uo = textContains("%")
                .boundsInside(0,0,device.width*0.2,device.height*0.2)
                .visibleToUser().findOne(1000)
                return this.uo
            },
            执行: function() {
                console.info("正在上传")
                while(textContains("%")
                .boundsInside(0,0,device.width*0.2,device.height*0.2)
                .visibleToUser().findOne(1000)){
                    sleep(3000)
                    console.verbose()
                }
            }
        },
        {
            标题: "首页检测",
            uo: null,
            num: 0,
            检测: function() {
                this.uo = text("Me").visibleToUser().findOne(1000)
                return this.uo
            },
            执行: function() {
                console.error("当前是主页！")
                if(this.num++ > 3) {
                    return "跳出循环执行"
                }
            }
        }
    ]
    let 选择操作 = [
        {
            标题: "全部All",
            uo: null,
            检测: function() {
                this.uo = text("All").visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.parent().click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "视频",
            uo: null,
            检测: function() {
                this.uo = text("视频").visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.parent().click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "影片",
            uo: null,
            检测: function() {
                this.uo = text("Videos").visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.parent().click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "选择",
            uo: null,
            检测: function() {
                this.uo = classNameEndsWith("FrameLayout").clickable(true).visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    sleep(2000);
                    let sel = text("Select").findOne(5000);
                    if(sel) sel.parent().click();
                    for (let next = 0; next < 5; next++) {
                        下一步 = null;
                        下一步 = text("Next").visibleToUser().clickable(true).findOne(5000);
                        if(下一步) {
                            log("下一步 " + 下一步.click());
                            sleep(3000);
                            next--;
                        } else {
                            下一步 = classNameEndsWith("FrameLayout").clickable(true).visibleToUser().findOne(2000);
                            if(下一步) {
                                下一步.click();
                            } else {
                                back();
                            }
                        }
                        if(text("Post").findOnce()) {
                            break;
                        }
                    }
                    console.info("选择完毕，进入下一阶段")
                    循环执行(选择后操作)
                    console.info("第二阶段结束")
                    return "跳出循环执行";
                }
            }
        },
    ]
    let 打开视频列表操作 = [
        {
            标题: "拍摄",
            uo: null,
            检测: function() {
                this.uo = classNameEndsWith("FrameLayout").clickable(true)
                .drawingOrder(3).filter(function(uo){
                    return uo.depth() == 8 || uo.depth() == 9;
                }).findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    {
                        // log("权限检查(最长20秒)");
                        // for (let i = 0; i < 5; i++) {
                        //     if(text("Upload").visibleToUser().findOne(3000)){
                        //         break;
                        //     }
                        //     lh_find(text("允许") ,"",0,300)
                        //     lh_find(text("ALLOW"),"",0,300)
                        //     lh_find(text("Allow"),"",0,300)
                        // }
                    }
                }
            }
        },
        {
            标题: "权限检查",
            uo: null,
            检测: function() {
                this.uo = text("ALLOW").findOne(100) || text("Allow").findOne(50) || text("允许").findOne(50);
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "上传",
            uo: null,
            检测: function() {
                this.uo = text("Upload").visibleToUser().findOne(1000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.parent().parent().click();
                log("点击" + this.标题, re)
                if (re) {
                    log("已进入视频列表")
                    循环执行(选择操作)
                    return "跳出循环执行";
                }
            }
        },
    ]
    for (var i = 0; i < 上传次数; i++) {
        返回首页() 
        log("上传视频")
        移动文件(路径.文件夹.视频列表, 路径.文件夹.视频)
        let 拍摄;
        // 拍摄 = classNameEndsWith("FrameLayout").clickable(true).depth(8).drawingOrder(3).findOne(30000)
        if (false && 拍摄) {
            移动文件(路径.文件夹.视频列表, 路径.文件夹.视频)
            sleep(random(2000, 3000))
            log("拍摄 " + 拍摄.click())
            sleep(random(2000, 3000))
            let allow;
            for (let i = 0; i < 5; i++) {
                if(text("Upload").visibleToUser().findOne(1000)){
                    break;
                }
                lh_find(text("允许"),"",0,1000)
                lh_find(text("ALLOW"),"",0,1000)
                lh_find(text("Allow"),"",0,1000)
                sleep(1000)
            }
            
            var 上傳 = text("Upload").visibleToUser().findOne(30000)
            if (上傳) {

                log("上傳 " + 上傳.parent().parent().click())
                sleep(random(2000, 3000))
                var All = text("All").visibleToUser().findOne(30000)
                if (All) {
                    log("All " + All.parent().click())
                    sleep(random(1500, 2000))
                    var 视频 = text("视频").visibleToUser().findOne(30000)
                    if (视频) {
                        log("视频 " + 视频.parent().click())
                        sleep(random(1500, 2000))
                    }
                }
                var 影片 = text("Videos").visibleToUser().findOne(30000)
                if (影片) {
                    log("影片 " + 影片.parent().click())
                    sleep(random(1500, 2000))
                }
                var 选择 = classNameEndsWith("FrameLayout").clickable(true).visibleToUser().findOne(2000)
                if (选择) {
                    log("选择 " + 选择.click())
                    sleep(random(1500, 2000))
                    let sel = text("Select").findOne(5000)
                    if(sel) sel.parent().click();
                    let 下一步;
                    for (let next = 0; next < 5; next++) {
                        下一步 = null;
                        下一步 = text("Next").visibleToUser().clickable(true).findOne(5000);
                        if(下一步) {
                            log("下一步 " + 下一步.click())
                            sleep(3000)
                            next--;
                        } else {
                            下一步 = classNameEndsWith("FrameLayout").clickable(true).visibleToUser().findOne(2000)
                            if(下一步) {
                                下一步.click()
                            } else {
                                back();
                            }
                        }
                        if(text("Post").findOnce()) {
                            break;
                        }
                    }
                    var 编辑框 = classNameEndsWith("EditText").visibleToUser().findOne(5000)
                    if (编辑框) {
                        sleep(1000)
                        setText(话题内容)
                        sleep(random(1000, 1500))
                        if(false){
                            var 好友 = text("Friends").visibleToUser().findOne(5000)
                            if (好友) {
                                log("好友 " + 好友.click())
                                sleep(random(1500, 2000))
                                setText(at)
                                sleep(random(5000, 6000))
                                var 第一个 = classNameEndsWith("LinearLayout").visibleToUser().clickable(true).findOne(5000)
                                if (第一个) {
                                    log("第一个 " + 第一个.click())
                                    sleep(random(1500, 2000))
                                }
                                var 没用户 = textContains("No more update").visibleToUser().findOne(500)
                                if (没用户) {
                                    log("没用户 " + back())
                                    sleep(random(1500, 2000))
                                }
                                var 發佈 = text("Post").visibleToUser().depth(10).findOne(500)
                                if (!發佈) {
                                    log("选择失败 " + back())
                                    sleep(random(1500, 2000))
                                }
                            }
                        }
                    }
                    var 去往封面 = text("Select cover").clickable(true).findOne(2000)
                    if (去往封面) {
                        log("去往封面 " + 去往封面.click())
                        sleep(5000)
                        var 封面 = classNameEndsWith("ImageView").idContains("bg6").find()
                        if (封面.length > 5) {
                            var 坐标 = 封面[2].bounds()
                            click(坐标.centerX(), 坐标.centerY())
                            sleep(random(1500, 2000))
                        }
                        var 保存 = text("Save").clickable(true).findOne(2000)
                        if (保存) {
                            log("保存 " + 保存.click())
                            sleep(random(1800, 2000))
                        }
                    }
                    var 發佈 = text("Post").visibleToUser().depth(10).findOne(5000)
                    if (發佈) {
                        var 儲存到裝置中開啟 = desc("Save to deviceOn").visibleToUser().clickable(true).findOne(2000)
                        if (儲存到裝置中開啟) {
                            log("儲存到裝置中開啟 " + 儲存到裝置中開啟.click())
                            sleep(random(1000, 1500))
                        }
                        log("發佈 " + 發佈.parent().parent().click() + "进度 " + (i + 1) + "/" + 上传次数)
                        lh_find(text("Post Now"),"Post Now", 0);
                        while (true) {
                            sleep(3000)
                            var 上传中 = textContains("%").visibleToUser().findOne(1000)
                            if (上传中) {
                                log("上传中 " + 上传中.text())
                            } else {
                                log("上传完成....")
                                break
                            }
                        }
                    }
                } else {
                    log("没找到视频序号,放弃本次上传")
                    exit()
                }
            }
        }else {
            循环执行(打开视频列表操作)
        }
        sleep(1000)
    }
}

function 修改资料(注册模式标记) {
    let nowUsername;
    if(ui.yhm) var 用户名 = "不设置";   // 存放内容，用于开启标记
    if(ui.yhzh) {
        var 用户账号 = "不设置";
        nowUsername = accountInfo.username; // 修改账号的话就可以保存
    }
    var 网站 = ui.wz.text()
    var 简介 = ui.jj.text()
    返回首页()
    var 我 = text("Me").findOne(30000)
    if (我) {
        log("Me " + 我.parent().click())
        sleep(random(1000, 1500))
    }
    var 右上角 = false;
    // 右上角 = classNameEndsWith("RelativeLayout").drawingOrder(7).clickable(true).findOne(2000)
    if (右上角) {
        log("右上角 " + 右上角.click())
        sleep(random(1000, 1500))
        var 管理我的帳號 = textContains("account").visibleToUser().findOne(2000)
        if (管理我的帳號) {
            log("管理我的帳號 " + 管理我的帳號.parent().parent().click())
            sleep(random(1000, 1500))
            var 切換到專業帳號 = text("Switch to Pro Account").visibleToUser().findOne(2000)
            if (切換到專業帳號) {
                log("切換到專業帳號 " + 切換到專業帳號.parent().parent().click())
                sleep(random(1000, 1500))
                log("等待加载出切换界面(最高1小时)，如果一直加载不出来，请手动切换网络后手动进入切换账号版本页面。也可以手动切换后返回主页。");
                var 下一步;
                for (let nextI = 0; nextI < 30*60; nextI++) {
                    popupDetection();
                    下一步 = text("Business").packageName(appPackage).findOne(3000)
                    if(下一步) {
                        log("已进入切换页面");
                        break;
                    }
                    if(text("Me").packageName(appPackage).findOne(3000)){
                        if(confirm("是否已手动切换到专业版？")){
                            break;
                        }
                    }
                }

                if (下一步) {
                    console.verbose("界面加载完成，继续执行下一步");
                    // log("下一步 " + 下一步.parent().findOne(text("Next")).click())
                    log("下一步 " + 下一步.parent().click())
                    sleep(random(2000, 3000))
                    for (var i = 0; i < 3; i++) {
                        popupDetection();
                        log(scrollable(true).scrollForward())
                        sleep(1500)
                    }
                    var 購物 = textContains("Shopping/").packageName(appPackage).findOne(1500)
                    if (購物) {
                        var 坐标 = 購物.bounds()
                        click(坐标.centerX(), 坐标.centerY())
                        sleep(random(1000, 1500))
                    }

                    lh_find(text("Next"), "Next", 1, 5000)
                    sleep(random(3000, 4000))
                }else{
                    console.verbose("找不到Business控件！")
                    log("尝试直接修改");
                    返回首页();
                }
            } else {
                log("切换不到专业账号或者已经是专业了")
                返回首页()
            }
        }
    }
    var 編輯個人檔案 = textContains("Edit ").visibleToUser().findOne(2000)
    if (編輯個人檔案) {
        log("編輯個人檔案 " + 編輯個人檔案.click())
        sleep(random(1000, 1500))


        // 参数：控件文字 日志的文字信息
        function clickSC(textByUO, textByLog) {
            let uo = text(textByUO).visibleToUser().clickable(true).findOne(2000)
            if (uo) textByUO = uo.click();
            if (textByLog) console.verbose(textByLog, textByUO==true)
            return textByUO == true;
        }
        // 参数 控件文字 要输入的信息
        function editInfo(textByUO, textInfo) {
            let action = text(textByUO).visibleToUser().findOne(2000)
            if(action){
                log(action.parent().parent().click(), textByUO, textInfo);
                sleep(random(1500, 2000))

                setText(textInfo)
                sleep(1000)
                if(!clickSC("Save","储存"))
                    clickSC("Cancel", "后退")
                sleep(random(2000, 2500))
            } else {
                log("未找到",textByUO)
            }
        }

        if (用户名) {
            用户名 = 获取用户名(路径.文件夹.用户名)
            if (用户名 != "不设置") editInfo("Name", 用户名)
        }
        if (用户账号) {
            用户账号 = 获取用户名(路径.文件夹.用户账号)
            if (用户账号 != "不设置") editInfo("Username", 用户账号)
        }

        // editInfo("Website", 网站)
        editInfo("Bio", 简介)

    }
    // 如果修改了账号则需要进行更新
    if (!注册模式标记 && 用户账号) {
        返回首页();
        // 重新检查当前用户名
        runTikTok();
        server.get("account/update?username=" + nowUsername +"&newUsername=" + accountInfo.username);
    }
}

function 获取用户名(path) {
    if (files.isFile(path)) {
        if (!tempSave.getName) tempSave.getName = 0;
        // 从文件中读取数据
        let names = files.read(path).split("\n");
        while (names.length > 0) {
            if (testName(names[0])){
                // 将文件写回去
                files.write(path,names.join("\n"));
                return names[0];
            }
            // 删除第一个数据
            names.shift();
        }
        console.warn("文件已被读取完毕", path);
    } else console.warn("文件不存在", path);
    return "不设置";

    function testName(name) {
        if (!/[\u4E00-\u9FFF]/.test(name)) {
            if (/^\w+$/.test(name))
                return true;
            // else console.verbose("用户名包含非法字符!");
        }   // else console.verbose("用户名不能是汉字!");
        return false;
    }
}

function 更换头像() {
    返回首页()
    移动文件(路径.文件夹.头像列表, 路径.文件夹.头像, true);
    // 刷新图库
    media.scanFile(路径.文件夹.头像列表);
    media.scanFile(路径.文件夹.头像);

    循环执行([
        {
            标题: "编辑个人档案",
            uo: null,
            检测: function() {
                this.uo = textContains("Edit ").visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                log("点击" + this.标题, this.uo.click())
            }
        },
        {
            标题: "照片",
            uo: null,
            检测: function() {
                this.uo = classNameEndsWith("ImageView").visibleToUser().clickable(true).filter(function(uo){
                    return uo.depth()==11 || uo.depth()==12;   
                }).findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    // 移动文件(路径.文件夹.头像列表, 路径.文件夹.头像, true)
                }
            }
        },
        {
            标题: "从图库中选取",
            uo: null,
            检测: function() {
                this.uo = text("Select from Gallery").findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    {
                        // // 检测系统权限
                        // console.verbose("检测是否需要权限");
                        // for (let i = 0; i < 10; i++) {
                        //     // 系统授权
                        //     action = text("ALLOW").findOne(100);
                        //     if(action) action.click(); 
                        //     action = text("Allow").findOne(50);
                        //     if(action) action.click(); 
                        //     action = text("允许").findOne(50);
                        //     if(action) action.click(); 
                        //     if(text("All media").findOne(100)) break;
                        // }
                    }
                }
            }
        },
        {
            标题: "权限检查",
            uo: null,
            检测: function() {
                this.uo = text("ALLOW").findOne(100) || text("Allow").findOne(50) || text("允许").findOne(50);
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                if(!re) re = clickOn(this.uo);
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "全部",
            uo: null,
            检测: function() {
                this.uo = text("All media").visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "头像",
            uo: null,
            检测: function() {
                this.uo = text("头像").findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.parent().click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "头像",
            uo: null,
            检测: function() {
                this.uo = text("ok").findOne(1000)||text("OK").findOne(200)||text("确定").findOne(200)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    // 刷新
                    media.scanFile(路径.文件夹.头像);
                }
            }
        },
        {
            标题: "第一张",
            uo: null,
            检测: function() {
                this.uo = classNameEndsWith("view.View").visibleToUser().clickable(true).findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "确定",
            uo: null,
            检测: function() {
                this.uo = text("Confirm").clickable(true).visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "储存",
            uo: null,
            检测: function() {
                this.uo = text("Save").clickable(true).visibleToUser().findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {
                    log("等待出现上传文字")
                    while (!text("Uploading...").exists()) sleep(500)
                    log("等待上传完成")
                    do{
                        sleep(500)
                    } while (text("Uploading...").exists())
                    return "跳出循环执行"
                }
            }
        }
    ])
    log("头像更换结束")
    return true;
    var 我 = text("Me").findOne(30000)
    if (我) {
        log("Me " + 我.parent().click())
        sleep(random(1000, 1500))
    }
    var 編輯個人檔案 = textContains("Edit ").visibleToUser().findOne(2000)
    if (編輯個人檔案) {
        log("編輯個人檔案 " + 編輯個人檔案.click())
        sleep(random(1000, 1500))
        var 照片 = classNameEndsWith("ImageView").depth(11).visibleToUser().clickable(true).findOne(2000)
        if (照片) {
            // 从 头像列表 移动一个文件到 头像 ，并且删除原文件
            移动文件(路径.文件夹.头像列表, 路径.文件夹.头像, true)
            sleep(random(2000, 2500))
            log("头像 " + 照片.click())
            sleep(random(2000, 2500))
            var 從圖庫中選取 = text("Select from Gallery").findOne(2000)
            if (從圖庫中選取) {
                log("從圖庫中選取 " + 從圖庫中選取.click())
                sleep(random(1000, 1500))

                // 检测系统权限
                for (let i = 0; i < 10; i++) {
                    console.verbose("检测是否需要权限");
                    // 系统授权
                    action = text("ALLOW").findOne(100);
                    if(action) action.click(); 
                    action = text("Allow").findOne(50);
                    if(action) action.click(); 
                    action = text("允许").findOne(50);
                    if(action) action.click(); 
                    
                    if(text("All media").findOne(100)) break;
                }

                
                //console.hide()
                var 全部 = text("All media").visibleToUser().findOne(2000)
                if (全部) {
                    log("全部 " + 全部.click())
                    sleep(random(1000, 1500))
                    var 头像 = text("头像").findOne(2000)
                    if (头像) {
                        log("头像 " + 头像.parent().click())
                        sleep(random(1000, 1500))
                        var 第一张 = classNameEndsWith("view.View").visibleToUser().clickable(true).findOne(2000)
                        if (第一张) {
                            log("第一张 " + 第一张.click())
                            sleep(random(1000, 1500))
                            var 确定 = text("Confirm").clickable(true).visibleToUser().findOne(2000)
                            if (确定) {
                                log("确定 " + 确定.click())
                                sleep(random(1000, 1500))
                                var 儲存 = text("Save").clickable(true).visibleToUser().findOne(2000)
                                if (儲存) {
                                    log("儲存 " + 儲存.click())
                                    sleep(random(3000, 4000))
                                    for (let index = 0; index < 30; index++) {
                                        sleep(2000)
                                        if (!text("Uploading...").exists()) {
                                            log("更新头像完成")
                                            break
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        log("2222")
                    }
                }
                //console.show()
            }
        }
    }

}

function 采集粉丝信息() {
    // 1. 初始化数据
    返回首页()
    getFansNum = 0
    // 2. 点击 我 ，确保在个人信息页面
    tlog("点击 我 me")
    clickAction(text("Me"), 50)
    tlog("当前粉丝数", accountInfo.fansNumber)
    if(accountInfo.fansNumber < 1) {
        console.warn("粉丝数量为0")
        return false;
    }
    fansNameList = server.get("fans/list/username?accountUsername="+accountInfo.username);
    log("已采集过的粉丝数量：", fansNameList.length)
    // 扫描全部
    let allTag=true;
/*     if(ui.getall.checked) {
        log("从头开始全部扫描一遍")
        fansNameList = [];
    // 粉丝列表小于等于服务器保存的记录则给用户提示，是否继续采集粉丝
    } else  */
    if(accountInfo.fansNumber <= fansNameList.length) {
        if(autoConfirm(5000,false, "粉丝似乎已经全部采集，是否继续采集？",
            "当前粉丝数："+fansNameList.length+"\n已保存的粉丝数：" + accountInfo.fansNumber)) {
            allTag = false;
        } else {
            // 跳出本次扫描
            return false;
        }
    } else {
        if(20 < accountInfo.fansNumber) {
            // 服务器记录大于20则进行局部扫描
            allTag = false;
        }
    }
    // 3. 点击粉丝
    // text("Followers").boundsInside(520, 670, 920, 730).find().length
    // clickAction(function () { return text("Followers").boundsContains(523, 679, 916, 720).findOne(200).parent() }, 500, 600)
    // 谷歌手机的分辨率
    // clickAction(function () { return text("Followers").boundsInside(400, 700, 700, 800).findOne(200).parent() }, 500, 600)
    // 三星
    // lh_find(text("Followers").boundsInside(520, 710, 920, 760), "粉丝", 0)
    lh_find(text("Followers").boundsInside(device.width*0.3, 0, device.width*0.7, device.height), "粉丝", 0);
    // 4. 采集粉丝信息
    getFansList(fansNameList, fansList, allTag)
    返回首页()
}

/**
 * 在TikTok粉丝界面使用
 * @param {Array} fansNameList 粉丝名字列表
 * @param {Array} fansList 粉丝列表
 * @param {Boolean} all 是否扫描全部
 */
function getFansList(fansNameList, fansList, all) {
    // 遍历选取粉丝，在getFansInfo()获取数据，在save()保存数据
    try{
        if(typeof fansNameList.push != "function") throw "没有push方法";
    }catch(e){fansNameList=[]}
    try{
        if(typeof fansList.push != "function") throw "没有push方法";
    }catch(e){fansList=[]}

    log("开始")
    let i=0, tempList = [], tempSave = [], closeTag = 0, zeroFans=0, 
    // 获取当前粉丝总量
    fansTotal = accountInfo.fansNumber,
    // 已保存粉丝数量
    saveNumber = fansNameList.length;
    sleep(1000)

    function getList() {
        return className("androidx.recyclerview.widget.RecyclerView")
                .packageName(appPackage)
                .filter(function(uo){
                    return (uo.depth() == 9 || uo.depth() == 10)
                        && uo.bounds().right - uo.bounds().left > device.width*0.5;
                }).findOne(3000)
    }

    // while(true){ // 无限采集
    let saveNumberMax = saveNumber + ui.fanslistnumber.text();
    while(saveNumber < saveNumberMax) {
        sleep(200)
        等待加载(100, 500);
        // 获取粉丝列表父控件
        let FollowerParent = getList();
        if(!(textContains("FOLLOWERS").findOne(500) || textContains("粉絲").findOne(500)) || !FollowerParent) {
            log("未获取到粉丝列表！如果脚本卡住，请手动进入粉丝列表")
            sleep(3000);
            continue;
        }
        
        // 获取粉丝列表，每一个都是粉丝控件
        let FollowerList = FollowerParent.children();
        // 分数
        let score = 0;
        if(FollowerList.length < 1) {
            if(2 < zeroFans++){
                log("无粉丝")
                break;
            }
        }

        // 处理当前列表
        for (let fi = 0; fi < FollowerList.length; fi++) {
            f = FollowerList[fi];
            if(f.className() != "android.widget.RelativeLayout") {
                continue;
            }
            try{
                // 拿到粉丝名字 211
                let username = f.children()[1].children()[0].children()[0].text();
                
                // 暂存用户名字
                tempList.push(username);
                
                // 检测互关情况 311
                let follow = f.children()[2].children()[0].children()[0];
                if(follow.text() == "Follow back"){
                    // 互相关注
                    console.info("互相关注：", follow.click())
                }

                // 判断当前粉丝是否已经存在
                if(fansNameList.indexOf(username)<0){

                    // 进入操作
                    if(f.click()){
                        // 重置关闭标记
                        closeTag = 0;

                        // 获取粉丝信息
                        let fans = getFansInfo(username,null,null,true);

                        //  发送私信
                        if(ui.getsay.checked) {
                            // 随机拿到一条信息
                            tempSave.getSayMessage = getHelloMessage();
                            if(isNaN(tempSave.NUMBER)) tempSave.NUMBER = 1;
                            // let newMsg = Date.now().toString().substring(10) + "> " + (tempSave.getSayMessage||"Hi~");
                            let newMsg = (tempSave.getSayMessage||"Hi~");
                            let re = sayHello(fans, newMsg);
                            if(re){
                                console.info("消息发送成功", re.status);
                                threads.start(function(){
                                    log("正在上传粉丝信息");
                                    save(fans);
                                })
                            } else {
                                log("发送失败")
                            }
                            console.verbose(re)
                        }

                        // 返回粉丝列表
                        for (var i = 0; i < 5; i++) {
                            sleep(1000)
                            let fansList = getList();
                            if(fansList) {
                                if (FollowerList.length-3 < fansList.children().length
                                    || FollowerList.length == fansList.children().length
                                ) { 
                                    break
                                }
                            }
                            back()
                        }

                        // 统计数据
                        countGetFansNum++;
                        getFansNum++;
                    }else{
                        log("进入粉丝信息失败")
                    }
                    score++;
                }
            } catch (err) {
                console.error("异常信息：", err)
                console.log("再次尝试返回粉丝列表")
                smenDetection()
                // 返回粉丝列表
                for (var i = 0; i < 5; i++) {
                    sleep(1000)
                    if(text("Me").findOne(2000)) {
                        console.log("似乎返回到了首页")
                        返回首页();
                        lh_find(text("Followers").boundsInside(400, 700, 700, 800), "粉丝", 0);
                        等待加载();
                        sleep(1000);
                    }

                    let fansList  = getList();
                    if(fansList) {
                        if (FollowerList.length-3 < fansList.children().length
                        || FollowerList.length == fansList.children().length
                        ) {
                            break
                        }
                    }
                    back()
                }

            }
        }

        saveNumber = fansNameList.length;
        console.info("保存数量：", score,"当前进展：", getFansNum, "总进展：", countGetFansNum, 
                    "当前账号粉丝已保存：", saveNumber / fansTotal*100,"%")
        if(score == 0) {
            // 数量差 10%
            // fansNameList
            if(fansTotal - fansNameList.length < fansTotal * 0.1) {
                if(!all) {
                    log("当前粉丝均已保存，停止继续遍历");
                    break;
                }
                // 判断本次列表是否和上次相同
                let similar = 0;
                if(tempSave.tempList) {
                    tempList.forEach(e => {
                        if(tempSave.tempList.indexOf(e)>-1)
                            similar++;
                    })
                }
                log("相似度：" + similar/tempList.length, "   标记：",closeTag)
                // 当相似性超过8成时跳出循环，加入一个条件，需要在总粉丝于500以内时粉丝相差不到50个才跳出
                if(!isNaN(similar/tempList.length) && similar/tempList.length > 0.8 && 3 < closeTag++){
                    if(fansTotal < 500) {
                        if((fansTotal-saveNumber) < 50) {
                            console.warn("到底了")
                            break;
                        }
                        // 总粉丝小于500个，且没有完全遍历时继续遍历。
                    } else {
                        console.warn("提前结束")
                        break;
                    }
                }
            } else {
                console.verbose("")
            }
        }
        // 将本次暂存数据保存起来用于下次对比
        tempSave.tempList = tempList;
        // 清空暂存数据
        tempList = [];

        save({},true)
        // 滑到下一页
        let scrollDown = FollowerParent.scrollForward();
        if(!scrollDown) {
            // 重新获取
            FollowerParent = getList();
            if(FollowerParent) {
                if(!(scrollDown = FollowerParent.scrollForward())) {
                    log("到底了！");
                    break;
                }
            } else {
                console.error("不在列表界面")
            }
        }
        log("滑动", scrollDown)
    }
    log(saveNumber < saveNumberMax ? "遍历结束" : ("遍历目标"+ui.fanslistnumber.text()+"已达到"));
    return fansNameList;

}

// 获取信息的函数，需要在用户信息的界面
function getFansInfo(usernameP,mainTag, saveUri, noSaveTag) {
    function getNum(str){
        let uo = text(str).findOne(1000);
        if(uo) {
            let uos = uo.parent().children();
            for (let i in uos) {
                i = uos[i];
                if(!isNaN(parseInt(i.text())))
                    // 获取数据成功
                    return i.text()
            }
        }else console.verbose(str,"获取控件失败！")
        // 获取数据失败时返回 -1
        return -1;
    }

    等待加载()
    let name = "默认"+usernameP
        ,username = "默认"+usernameP
        ,fansNumber = -2
        ,focusNumber = -2
        ,likeNumber = -2
        ,urlExists = false
        ,url = ""
        ,uri = ""
        ,video = {} // 个人账号视频信息
        ,BI = "-"   // brief introduction
        ,myBI = "-" // 个人简介信息
        ,更多;

    try {
        log("尝试获取信息")
        // 主页检测的话没必要复制链接
        let len = mainTag ? 0 : 5;
        // url 复制连接
        for (let i = 0; i < len; i++) {
            // 检测是否存在 "更多"按钮
            更多 = classNameEndsWith("ImageView").drawingOrder(3).visibleToUser().findOne(500)
            if (更多) {
                log("更多", 更多.click())
                if(mainTag) {
                    log("获取自己的信息", i)
                    break;
                }
            }
            
            // 检测链接信息
            let 复制链接 = text("Copy link").visibleToUser().findOne(500)
            if (复制链接) {
                log("复制链接", 复制链接.parent().click())
                var 内容 = getClip()
                if (/tiktok.com/.test(内容)) {
                    urlExists = true;
                    url = 内容;
                    内容 = 内容.substring(0, 内容.lastIndexOf("/"))
                    uri = 内容.substring(内容.lastIndexOf("/")+1)
                } else {
                    log("不符合")
                }
                // 跳出
                break;
            }

            // 检测是否没有链接
            let more = text("More").findOne(2000);
            if (more) {
                log("粉丝无链接信息")
                back();
                sleep(200);
                // 跳出
                break;
            }
        }

        if(mainTag){
            let title = id("title").findOne(500);
            if(title){
                name = title.text();
            }
        } else {
            // 稍等
            sleep(300);
            // name 名字和更多在同级
            let temp = 更多.parent().children();
            temp.forEach(uo => {
                if (uo.id().indexOf("title") > -1) {
                    // 拿到名字
                    name = uo.text();
                    // 跳出循环
                    return false;
                }
            })
        }
        // 几个数据 focusNumber fansNumber likeNumber
        focusNumber = getNum("Following");
        fansNumber = getNum("Followers");
        // 如果前面两个数据都获取失败则直接跳过第三个数据
        if (!(focusNumber == -1 && fansNumber == -1)) {
            likeNumber = getNum("Likes");
            if (likeNumber == -1) likeNumber = getNum("Like");
        }
        // username 通过节点控件拿到账号数据
        let nodeUO = text("Following").findOne(1000) || text("Followers").findOne(1000) || text("Likes").findOne(1000);
        if (nodeUO) {
            // 拿到上2级的控件
            nodeUO = nodeUO.parent().parent().parent().children();
            // username 账号，和当前节点控件在同一级
            for (let e in nodeUO) {
                e = nodeUO[e];
                if(mainTag){
                    // 粉丝账号和"当前节点"在同一级，但是个人信息（当前账号）不在
                    // "当前账号"控件有且只有一个子控件 android.widget.TextView
                    if(e.children().length>1){
                        // 跳过这一个
                        continue;
                    }
                    e = e.children()[0]
                }
                if ("android.widget.TextView" == e.className()) {
                    username = e.text();
                    username = username.substring(username.indexOf("@") + 1);
                    break;
                }
            }
            
            try{
                // 倒数上一个 简介
                if(mainTag) myBI = nodeUO[nodeUO.length-2].text()
                // 最后一个 链接 或者简介
                BI = nodeUO[nodeUO.length-1].findOne(className("android.widget.TextView")).text()
            }catch(e){
                console.verbose("介绍获取异常",e)
            }

            if (!username) {
                log("获取账号(username)失败，保存为：", usernameP);
                username = usernameP;
            }
        } else {
            log("没有节点控件,获取账号(username)失败，保存为：", usernameP);
            username = usernameP;
        }

        log("账号：" + username, "关注：" + focusNumber, "粉丝：" + fansNumber, "喜欢：" + likeNumber)
        if(mainTag) {
            // 节省时间
            if (!(focusNumber == -1 && fansNumber == -1 && username == usernameP)) {
                video = getVideoPlayerNumberInfo()
            }
            return {
                name: name,
                username: username,
                focusNumber: focusNumber,
                fansNumber: fansNumber,
                likeNumber: likeNumber,
                BI: myBI,
                url: BI,
                video: video
            }
        }
        else {
            let fanObj = {
                name: name,
                username: username,
                focusNumber: focusNumber,
                fansNumber: fansNumber,
                likeNumber: likeNumber,
                BI: BI,
                urlExists: urlExists,
                url: url,
                uri: uri
            }
            return noSaveTag ?  fanObj : save(fanObj,false,saveUri);
        }
        } catch (e) {
        console.verbose("采集异常：", e)
    }
}

// 获取视频播放量，最多12个
function getVideoPlayerNumberInfo() {
    log("获取个人视频播放量信息")
    let videoInfo = [];
    for (let i = 0; i < 5; i++) {
        let videoList = className("androidx.recyclerview.widget.RecyclerView").boundsInside(0,1000, device.width,1600).findOne(200);
        if (videoList) {
            videoList = videoList.children();
            for (let i = 0; i < videoList.length; i++) {
                try{
                    videoInfo.push({
                        on: i + 1,
                        num: videoList[i].children()[2].children()[0].text()
                    })
                }catch(err){
                    console.verbose("视频信息异常！", err);
                }
            }
            break;
        }
        sleep(1000)
    }
    return videoInfo;
    
}

/**
 * 保存数据
 * @param {Object} obj 不保存到文件时，要保存的对象
 * @param {Boolean} savaToFile 保存到文件中
 */
function save(obj,savaToFile, saveUri) {
    if(savaToFile){
        log("将数据保存到文件")
        // 粉丝做成数组每一行一个粉丝数据，一般不需要读出来，聊天记录放另外一个文件，
        // 粉丝名字直接就是一个数组
        let fix = 路径.文件夹.粉丝 + accountInfo.envi;
        // fix.replace(/\//g,"斜杠")
        let fansNameListPath = fix+ "_粉丝账号列表.txt";
        let fansListPath = fix +"_粉丝列表.txt";
        let fansTaskListPath = fix +"_待处理列表.txt";
        // files.ensureDir(fansNameListPath);
        if(!files.isFile(fansNameListPath))
            files.create(fansNameListPath)
        if(!files.isFile(fansListPath))
            files.create(fansListPath)
        if(!files.isFile(fansTaskListPath))
            files.create(fansTaskListPath)

        // 备份文件数据
        files.copy(fansNameListPath, fansNameListPath+".bak");
        files.copy(fansListPath, fansListPath+".bak");
        let sb = new java.lang.StringBuilder();
        fansList.forEach(e=>{
            e.envi = fix;
            sb.append(JSON.stringify(e)).append("\n");
        })

        // 清空粉丝数组的数据
        fansList=[];
        log("本次保存数据大小：", sb.length())
        
        // 保存粉丝数据
        files.append(fansListPath,sb.toString());
        files.write(fansNameListPath,JSON.stringify(fansNameList))
        return true;
    }
    fansNameList.push(obj.username);
    fansList.push(obj);
{
/*  fans = { name: 'Fernanda Marques',
        username: 'feer_marquexxxxx',
        focusNumber: '402',
        fansNumber: '60',
        likeNumber: '40',
        BI: '100?😍🔛',
        urlExists: true,
        url: 'https://vt.tiktok.com/ZSn1nH6Q/',
        uri: 'ZSn1nH6Q' 
    } 
    {
        username: ceshi1
        isExceptoion: 0
        isInvalid: 0
        url: 
        name: 
        focus: 
        fans: 
        likes: 
        accountUsername: 
        device: 
        reservedA: 
        reservedB: 
    }

*/
}
    // 保存到服务器，采集时会导致账号为null从而导致上传异常
    let upFans = {
        username: obj.username,
        isExceptoion: 0,
        isInvalid: 0,
        url: obj.url,
        name: obj.name,
        focus: server.numberToString(obj.focusNumber),
        fans: server.numberToString(obj.fansNumber),
        likes: server.numberToString(obj.likeNumber),
        accountUsername: accountInfo.username,
        device: accountInfo.enviName,
        reservedB: obj.BI,
    }
    server.add(saveUri || "fans", server.excludeNull(upFans));
    return obj;
}

function mi6回复消息() {
    /*
     在inbox界面，获取当前的消息数量
     每一次发送完消息就数量减掉，当数量为0的时候将当前列表上的红色气泡处理完成
     在处理完当前的气泡之后返回上一页，也就是inbox页面
     再次获取当前是否还存在未处理的红色气泡
     在还没有处理完等量的消息之前就会进行翻页，除非翻页到底了

     1. 点击 inbox
     2. 获取当前的消息，如果消息数量为0则等待stopTime时间，如果时间到了那么就跳出，开始下一个号
     3. 如果存在消息则点击飞机进入 私信 列表界面
     4. 处理完当前界面的消息之后开始翻页，只要还存在消息(总消息 - 当前处理的消息)
     5. 在处理完成(界面上没有新消息，且数量和在外面拿到的一样时)之后返回上一页 inbox
     6. 将时间记录下来(开始计时)之后继续检测是否存在消息
    */
    let endTime = Date.now();
    let exce = 0;   // 异常次数
    let smallRedPointTag = -998;
    do {
        let inboxUO = text("Inbox").findOne(1000);
        // <1>. 确保在inbox页面
        if(inboxUO) {
            // 进入inbox页面
            inboxUO.parent().click();
            // <2>. 获取当前消息数量
            let newMsgCount = -1;
            let action = text("All activity").findOne(100);
            let parentUO;
            if(action) {
                parentUO = action.parent().parent();
                // 避免没有小红点控件的时候导致新消息为零
                newMsgCount = 0;
                parentUO.find(className("android.widget.TextView")).forEach(e=>{
                    let n = parseInt(e.text());
                    if(!isNaN(n)) {
                        newMsgCount = n;
                        return false;
                    }
                })
            }
            if(newMsgCount == 0) {
                // 没有新消息 
                exce = 0;
                
                // 加入小红点检测，如果有小红点的话就设置消息数量为 smallRedPointTag
                let redPointUOs;
                if(parentUO) {
                    redPointUOs = parentUO.find(
                        boundsInside(device.width*0.8, 0, device.width, device.height*0.2)
                        .className("android.widget.RelativeLayout").clickable(true)
                    )
                } else {
                    redPointUOs = boundsInside(device.width*0.8, 0, device.width, device.height*0.2)
                        .className("android.widget.RelativeLayout").clickable(true).find();
                }
                if(redPointUOs.length == 1 && 1 < redPointUOs[0].children().length) {
                    newMsgCount = smallRedPointTag;
                }
            }
            log("新消息总数量：", newMsgCount == smallRedPointTag? "小红点" : newMsgCount);
            if(newMsgCount == smallRedPointTag || 0 < newMsgCount) {
                // 存在新消息
                exce=0;
                try{
                    // 继续业务流程
                    // <3>. 点击小飞机进入私信，以后可以将三个弄成函数
                    if(lh_find(className("android.widget.RelativeLayout").clickable(true)
                        .boundsInside(device.width*0.85,0,device.width,device.height*0.1), "点击私信", 0)) {
                        // <4>. 获取列表，可以用于滚动
                        actionRecycler = id("cqg").className("androidx.recyclerview.widget.RecyclerView")
                                .boundsInside(0, 200, device.width, device.height)
                                .filter(function(uo){ return device.width*0.8 < uo.bounds().right - uo.bounds().left; })
                                .findOne(1000);
                        // 当失败次数等于3的时候就跳出 <跳出>
                        for (let i = 0; i < 20;) {
                            // 等待加载列表
                            sleep(500);
                            // 获取当前界面的红色气泡
                            //TODO 可能会造成inbox 界面是小红点，点击进去之后进行消息发送一次，返回值假设是 1（有人发送了一条消息过来），
                            //TODO 然后 newMsgCount != smallRedPointTag 条件成立，导致直接返回，又是小红点，又点进去，一直循环到没有小红点
                            let sendList = mi6GetNewMsgList();
                            if(sendList.length > 0){
                                // 回复消息
                                newMsgCount -= replySendlist(sendList);
                            } else {
                                i++;
                            }
                            // 当前消息处理数量超过在外部获取的数量时跳出 <跳出>
                            if(newMsgCount < 1 && newMsgCount != smallRedPointTag) {
                                break;
                            }
                            // 向后翻页
                            if(!actionRecycler.scrollForward()){
                                sleep(100);
                                console.verbose("重新获取列表控件")
                                actionRecycler = id("cqg").className("androidx.recyclerview.widget.RecyclerView")
                                                .boundsInside(0, 200, device.width, device.height)
                                                .filter(function(uo) { return device.width*0.8 < uo.bounds().right - uo.bounds().left; })
                                                .findOne(1000);
                                if(!actionRecycler.scrollForward()){
                                    i++;
                                }
                            } else {
                                log("翻页")
                            }
                            
                        }
                    }
                }catch(e){
                    console.log(e)
                    smenDetection()
                }
                // 重置时间
                endTime = Date.now();
            } else {
                // 获取控件异常
                if(3 < exce++) {
                    // 连续3次获取控件异常则退出
                    console.error("连续三次获取控件失败");
                    exit()
                }
            }
            
        } else 返回首页();

        // <5>. 等待时间
        if(endTime+tempSave.endTime < Date.now()) {
            log("时间到");
            break;
        }
        console.verbose("剩余时间(ms)：" + (tempSave.endTime  - (Date.now() - endTime))); 
        sleep(1000);
    } while (true)

    log("回复消息结束")
    {
   /*
    log("测试中...")
    // 1. 进入信息界面
    text("Inbox").findOne(1000).parent().click()
    sleep(500)
    等待加载()
    // 2. 进入私信界面 这里获取总共几条新消息
    let newMsgCount = 0;
    let action = text("All activity").findOne(100).parent().parent()
    // 获取新消息总数
    action.find(className("android.widget.TextView")).forEach(e=>{
        let n = parseInt(e.text());
        if(!isNaN(n)) {
            newMsgCount = n;
            return false;
        }
    })
    log("新消息总数量：", newMsgCount)
    // 根据条件选择是否进入私信界面
    if(newMsgCount>0) {
    // 以界面是否存在红色气泡做跳出条件
        // 进行下一步，可选没有新消息就直接开始下一个
        if(lh_find(className("android.widget.RelativeLayout").clickable(true)
            .boundsInside(device.width*0.85,0,device.width,device.height*0.1), "点击私信", 0)) {
            // 2.5. 获取列表，可以用于滚动
            actionRecycler = className("androidx.recyclerview.widget.RecyclerView")
                    .boundsInside(0, 200, device.width, device.height)
                    .findOne(1000);
            //调试不能下滑时 console.info(actionRecycler)
            // 当失败次数等于3的时候就跳出
            for (let i = 0; i < 3;) {
                // 等待加载列表
                sleep(500);
                // 获取当前界面的红色气泡
                let sendList = mi6GetNewMsgList();
                if(sendList.length > 0){
                    newMsgCount -= replySendlist(sendList);
                } else {
                    i++;
                }
                if(newMsgCount < 1) {
                    break;
                }
                // 向后翻页
                if(!actionRecycler.scrollForward()){
                    sleep(100);
                    actionRecycler = className("androidx.recyclerview.widget.RecyclerView")
                                    .boundsInside(0, 200, device.width, device.height)
                                    .findOne(1000);
                    if(!actionRecycler.scrollForward()){
                        i++;
                    }
                }
                log("翻页")
            }
            
            if(0 < newMsgCount) {
                console.warn("可能还剩余", newMsgCount, "条消息未被处理");
            }
        } else {
            log("点击失败")
        }
    } else {
        log("没有新消息")
    }
    log("回复消息结束")
    */
    }
}

function 发送消息() {
    返回首页()

    // 获取用户链接
    let fans;
    do{
        fans = 拿一个有链接的粉丝信息();
        if(fans) {
            // 打开链接
            openUrlAndSleep3s(fans.url);

            var 打开方式 = text("TikTok").visibleToUser().findOne(3000)
            if (打开方式) {
                log("选择TikTok", 打开方式.parent().parent().click())
                sleep(1500)
            }
            var 始终 = text("始终").visibleToUser().findOne(3000)
            if (始终) {
                log("始终 " + 始终.click())
            }

            // 打开粉丝信息，在里面进行保存
            let re = sayHello(fans, getHelloMessage())
            if(re){
                log("结果:", re.status)
            } else {
                log("用户似乎不存在")
                files.append(路径.文件夹.私信 + accountInfo.envi + "_打招呼失败_用户似乎不存在.txt", fans);
            }
        } else break;
    }while(true)
    log("当前队列处理结束");
}


function 拿一个有链接的粉丝信息() {
    let fans = server.get("fans/urlexist?username=" + accountInfo.username);
    return fans || false;
    do{
        // 1、拿一条粉丝数据
        fans = 拿一条粉丝数据();
        if(fans){
            console.verbose(fans)
            // 将字符串转成对象
            fans = JSON.parse(fans);
            // 2、检测粉丝是否有链接
            if(5 < fans.url.length){
                // 3、有链接：返回粉丝信息
                return fans
            } else {
                log("粉丝没有链接");
                // 5、没有链接：将数据保存到 无链接.txt中
                files.append(路径.文件夹.私信 + accountInfo.envi+"_没有链接.txt", fans);
            }
        }
    } while(fans)   // String：粉丝对象数据 null：缓存数据不存在 false：数据被使用完
    console.warn("粉丝数据被使用完毕")
    return false
}

/**
 * 从文件或缓存中拿到第一条粉丝数据
 * @returns {String|null|false} 
 *          String：粉丝对象数据
 *          null：缓存数据不存在
 *          false：数据被使用完
 */ 
function 拿一条粉丝数据() {
    // 先从缓存中查是否文件名对上，缓存必须存在，且缓存中账号名字与环境名字需要匹配上
    // 条件： 不存在缓存，缓存中的文件名不存在，只要满足任意一点都读取文件
    if(!cache) var cache = {};
    if( !cache.fansFile || !cache.fileData
        // 文件名不存在的判断条件是：不满足名字 或 环境名
        || (cache.fansFile.indexOf(accountInfo.enviName) < 0
            && cache.fansFile.indexOf(accountInfo.username) < 0)
    ){
        // 1、拿到当前文件的数据
        // 拿到当前的环境名字
        let envi = accountInfo.enviName;
        // 拿到当前账号的名字
        let name = accountInfo.username;
        // 拿到当前文件列表
        let fansFile,filesByName;
        // 挑出当前 环境名字 账号名字 对应的文件列表
        let filesByEnvi = files.listDir(路径.文件夹.粉丝, function (n) {
            return n.indexOf(envi) > -1 && n.substring(n.length - "_待处理列表.txt".length) == "_待处理列表.txt";
        })
        console.verbose("通过环境获取到的文件数量：", filesByEnvi.length)
        if(filesByEnvi.length != 1){
            // 优先环境，如果一个都没有则查账号
            filesByName = files.listDir(路径.文件夹.粉丝, function (n) {
                return n.indexOf(name) > -1 && n.substring(n.length - "_待处理列表.txt".length) == "_待处理列表.txt";
            })
            console.verbose("通过名字获取到的文件数量：", filesByEnvi.length)
            if(filesByEnvi.length > 1){
                log(filesByEnvi)
                // 使用排除，第一个找到的文件
                filesByEnvi.forEach(n=>{
                    if(filesByName.indexOf(n) > -1){
                        fansFile = n;
                        return false;
                    }
                })
            } else if (filesByEnvi.length == 1){
                // 从名字获取到的列表中拿
                fansFile = filesByName[0];
            } else {
                // 没有获取到文件数据
                fansFile = null;
            }
        }else{
            // 只有一个文件 
            fansFile = filesByEnvi[0];
        }

        console.verbose("最终获取到的文件名：", fansFile);
        // 2、拿当前文件中的数据
        let fileData;
        if(fansFile){
            // 拿到文件数据
            fileData = files.read(路径.文件夹.粉丝 + fansFile).split("\n");
        } else {
            // 没有文件
            fileData = null;
        }

        console.verbose("最终获取到的文件数据长度：", fileData.length);

        // 3、备份文件
        files.copy(路径.文件夹.粉丝 + fansFile, 路径.文件夹.备份
        + fansFile + new Date().toLocaleTimeString())
        console.verbose("粉丝数据文件已备份");

        // 4、将数据缓存起来，文件与文件名
        cache.fileData = fileData;
        cache.fansFile = fansFile;
        log("粉丝数据已缓存");
        
    }

    // 从缓存中拿数据，存在缓存，存在文件路径缓存，存在文件数据缓存
    if(cache && cache.fansFile && cache.fileData){
        if(cache.fileData.length < 1){
            console.error("文件数据已被使用完毕！");
            return false;
        }
        // 拿到缓存中的第一个数据，直接从里面弹出来
        let fans = cache.fileData.shift();
        // 将粉丝数据写到中间文件备份
        files.write(路径.文件夹.粉丝 + cache.fansFile
            .substring(0, cache.fansFile.indexOf("_待处理列表.txt")) + "_中间.txt", JSON.stringify(fans));
        // 将缓存中的数据写到原文件中
        files.write(路径.文件夹.粉丝 + cache.fansFile, cache.fileData.join("\n"));
        return fans;
    } else {
        console.error("文件中没有数据！可能已使用完毕");
        // 缓存中没有数据
        return null;
    }
}
// 从 打招呼消息.txt  颜文字.txt 中拿到两句话并整合返回
function getHelloMessage() {
    // 从服务器拿一条消息
    let msg = server.get("hello/massage").message;
    if(!msg){
        // 确保缓存存在
        if(!cache) var cache = {};
        // 确保缓存中存在打招呼消息
        let helloMessage = [
            "Hi ~",
            "Nice to meet you.",
            "Greet to see you.",
            "How are you feeling today?",
            "Howdy!",
            "Good to see you!"
        ]
        // 确保缓存中存在表情
        let emojiMessage = [
            "o(*≧▽≦)ツ",
            "(*^▽^*)",
            "(๑¯∀¯๑)",
            "(/≧▽≦)/",
            "(　ﾟ∀ﾟ) ﾉ♡",
            "o(^▽^)o",
            "(＾－＾)V"
        ]
        // 将两句话整合后返回
        msg = helloMessage[random(0, helloMessage.length-1)] 
            + " " + emojiMessage[random(0, emojiMessage.length-1)];
    }
    console.verbose("最终消息：", msg);
    return msg;
}

/**
 * 需要在粉丝页面
 * 需要一个消息
 * @param {Object} f fans对象
 * @param {String} msg 消息
 * @returns {Object} 不在粉丝信息页面返回false 返回值 {status:状态, sender:发送者名字, msg:消息, perfix:前缀, suffix:后缀, code:编码(子控件数量集)}
 */
function sayHello(f, msg){
    f = f || {};
    msg = (msg=="undefined"||msg=="undefined") ? "hello":msg;
    等待加载()
    let action,score;
    for (let i = 0; i < 3; i++) {
        log("检测中...")

        score = 0 ;
        // 检测发送消息
        action = text("Message").findOne(4000);
        // 找到发送消息（需要判断是否可以发送消息）
        if(action) {    // 找到消息按钮
            score++;
            if(action.click()){
                log("正在进入消息界面");
            } else {
                log("进入消息界面失败");
            }
        }
        action = text("OK").findOne(50);
        if(action){
            action.click()
            back()
            sleep(100)
            break;
        }

        // 检测未关注
        action = text("Follow").findOne(100);
        if(action) {    // 关注
            score++;
            return {
                status: false,
                msg: msg,
                exc: "未关注对方"
            }
        }
        // 检测禁止私信
        action = text("Requested").findOne(100);
        if(action) {    // 关注
            score++;
            return {
                status: false,
                msg: msg,
                exc: "对方拒绝私信"
            }
        }
        // 检测回关
        action = text("Follow back").findOne(100);
        if(action) {    // 互相关注
            score++;
            console.warn("未互相关注，关注对方", action.click());
        }

        // 检测消息页面（需要判断是否存在输入框）
        action = text("Send a message...").findOne(1000);
        if(action) {
            score++;
            break;
        }
    }

    if(score < 1){
        // 当前不在粉丝页面
        log("当前不在粉丝页面");
       return false;
    }

    // 发送消息
    re = sendMsg(msg, "sayHello");
    if(re) {
        f.sayHello++;
        if(!f.reservedA) f.reservedA = "";
        if(re.status){
            smenReset()
            f.reservedA += "打招呼成功。";
            // 4、将数据保存到 已打招呼.txt中
            // 发送完之后保存到文件中
            console.info("打招呼成功", re.msg)
            f.sayHello = re.msg;
            f.sayHelloException = re.exc;
            files.append(路径.文件夹.私信 + accountInfo.envi + "_已打招呼.txt", f);
        } else {
            f.reservedA += "打招呼失败。";
            // 消息发送失败
            // 保存到发送失败文件中
            console.warn("打招呼失败")
            f.sayHello = re.msg;
            f.sayHelloException = re.exc;
            files.append(路径.文件夹.私信 + accountInfo.envi + "_打招呼失败.txt", f);
            // 失败计数，在计数完成之后进行检测
            sendMessagesExceptionNumber++;
            smenDetection()
        }
        // 将本次打招呼信息提交到服务器
        // 保存已打招呼的粉丝信息
        // @Deprecated
        // server.get("fans/sayhello?username="+f.username);
        /*
            msg: 消息内容
            prefix: 消息前缀：
            suffix: 消息后缀：
            accountUsername: tiktok账号：
            sender: 发送人：
            code: 类型代码：
            fansUsername: 粉丝的账号：
            status: 0
            device: 设备
            reservedA: 保留字段a
            reservedB: 保留字段b：
        */
        // 保存本次的聊天记录结果
        if(typeof re.status != "number") {
            re.status = re.status? 0 : 1;
        }
        re.accountUsername = accountInfo.username;
        re.fansUsername = f.username;
        log("保存消息")
        if(!re.fansUsername) re.fansUsername = fans.username||"-";
        threads.start(function(){
            server.add("record", server.excludeNull(re));
        })
        return re;
    }
}

// 在聊天界面发送消息
function sendMsg(msg, sayHelloTag, breakNum, emoji) {
    if(sayHelloTag) {
        // 检测是否自己发送过消息
        let msgs = 获取消息();
        // 检测是否存在自己发送的消息，或者对方的消息过多
        if(3 < msgs.length) {
            return false;
        } else {
            try{
                // 先拿到第一个名字
                let temp, sender;
                // 如果消息全部拿完则继续发送
                while((temp == msgs.pop())) {
                    if(!sender) {
                        sender = temp.sender;
                    }
                    // 如果有一个发送人不同，且消息为有效，则跳出，不进行发送消息
                    if(temp.status && sender != temp.sender) {
                        return false;
                    }
                }
            }catch(err) {
                log(err)
                console.verbose(msgs)
            }
        }
    }

    log("发送消息：", emoji ? emoji+"\n"+msg : msg)
    for (let j = 0; j < 5; j++) {
        // 检测消息页面（需要判断是否存在输入框）
        action = text("Send a message...").findOne(1000);
        if(action) {
            log("消息输入框")
            if(emoji) {
                action.setText(emoji + "\n" + msg);
            } else {
                action.setText(msg);
            }
        }
        // 3. 发送消息  发送按钮 950,1700, 1100,1950
        action = className("android.widget.ImageView")
            .boundsInside(device.width*0.8, device.height*0.8, device.width,device.height)
            .clickable(true).find();
        if(0 < action.length) {
            // 当按钮数量大于0个时点击最后一个
            if(action.pop().click()) {
                log("发送消息");
                break;
            } else {
                log("点击发送按钮失败")
            }
        }
        sleep(1000)
    }

    // 银行卡检测 DECLINE LINK
    action = text("DECLINE").findOne(1000)
    if(action){
        console.error("未绑卡")
        action.click();
    }

    action = text("Resend").clickable(true).findOne(300)  
    if(action) action.click()

    sleep(2000);
    // 切换到最底部，避免获取消息异常
    let msgAction = className("androidx.recyclerview.widget.RecyclerView").findOne(2000);
    if(msgAction){
        while(msgAction.scrollForward()){
            sleep(100)
        }
    }

    // 检测消息发送异常
    detectionMsgStatus();
    try{
        sleep(500)
        // 4. 检测是否发送成功 
        // TODO
        let msgList = 获取消息();
        log(msgList)
        log("========测试日志========")
        for (let m in msgList) {
            m = msgList[m];
            log(m)
            if(msg == m.msg) {
                // if(temp.status && sender != temp.sender) {
                // 发送成功
                if(temp.status) {
                    return m;
                }
            }
        }
        log("-------测试日志-------")
        if(typeof breakNum != "number") breakNum = 0;
        if(breakNum < 2) {
            return sendMsg(msg, sayHelloTag, ++breakNum, emojiData[random(0, emojiData.length-1)]);
        } else {
            msgList[0].she="sayHelloException:默认第一个";
            return msgList[0];
        }
    }catch(err){
        log("获取消息异常",err)
        return {
            status: false,
            msg: msg,
            she: "sayHelloException:出现异常！"+err
        }
    }
}

// 检测到整句话则提示用户
function detectionMsgStatus() {
    let uo = text("This message violated our Community Guidelines. We restrict certain content and actions to protect our community. If you believe this was a mistake, tap Feedback to let us know.")
            .findOne(100);
    if(uo) {
        feedback(uo);
        // if(autoConfirm(5000, false, "手动反馈？")){
        //     let pauseJS = true;
        //     let f = floaty.rawWindow(<frame><button id="runJS">继续运行</button></frame>)
        //     f.runJS.click(()=>{pauseJS=false})
        //     while(pauseJS) sleep(1000);
        //     log("继续运行");
        // } else {
        //     feedback();
        // }
    }
}

function detectionMsgStatusBackup(msg) {
    log("=====   消息处理    ======")
    log(msg)
    try{
        if(0 < msg.suffix.indexOf("Feeback")){
            if(autoConfirm(5000, false, "手动处理？")){
                let pauseJS = true;
                let f = floaty.rawWindow(<frame><button id="runJS">继续运行</button></frame>)
                f.runJS.click(()=>{pauseJS=false})
                while(pauseJS) sleep(1000);
            } else {
                feedback();
            }
        }
    }catch(e){
        console.verbose("消息状态检测时发生异常：", e);
    }
}
// 在聊天界面发送消息
function sendMsgBackup(msg){
    
    for (let j = 0; j < 5; j++) {

        // 检测消息页面（需要判断是否存在输入框）
        action = text("Send a message...").findOne(1000);
        if(action) {
            log("消息输入框")
            action.setText(msg);
        }

        // 3. 发送消息 中间部分
        action = className("android.widget.ImageView").boundsInside(device.width*0.8, device.height*0.4, device.width,device.height).clickable(true).findOne(1000);
        if(action){
            log("发送消息");
            action.click()
            break;
        }

         // 3. 发送消息，下面部分  发送按钮 950,1700, 1100,1950
         action = className("android.widget.ImageView")
         .boundsInside(device.width*0.8, device.height*0.8, device.width,device.height)
         .clickable(true).find();
     if(0 < action.length) {
         // 当按钮数量大于0个时点击最后一个
         if(action.pop().click()) {
             log("发送消息");
             break;
         } else {
             log("点击发送按钮失败")
         }
     }
    }

    log("等待2秒消息发送")
    sleep(2000);
    // if(action) action.click()
    // 4. 检测是否发送成功
    let msgList = 获取消息();
    for (let m in msgList) {
        m = msgList[m]
        if(msg == m.msg){
            return m;
        }
    }

    return {
        status:false,
        msg:msg
    }
}

/**
 * 聊天界面
 * 获取当前界面的消息。
 * @returns {Array} 返回值 [消息,消息...] 消息格式：{status:状态, sender:发送者名字, msg:消息, perfix:前缀, suffix:后缀, code:编码(子控件)}
 */
function 获取消息(){
    function tryRun(uo, usStr) {
        try {
            return eval("(uo" + usStr + ")");
        } catch (err) {
            console.verbose(usStr, "获取失败", err)
        }
    }
    // 如果存在按钮x则优先点击
    if(lh_find(id("a0_"),"关闭打招呼提示",0,1000)){
        sleep(300);
    }
    let msgList = [];
    let msgListUO;
    for (let i = 0; i < 5; i++) {
        msgListUO = className("androidx.recyclerview.widget.RecyclerView").findOne(3000);
        if(msgListUO) break;  
    }
    if(msgListUO){
        // 拿到消息列表
        msgListUO = msgListUO.children()
        // 自下而上保存信息到数组
        for (let i = msgListUO.length-1; i >= 0; i--) {
            let m = msgListUO[i].children();
            let status,msg,prefix="",suffix="",code,sender;

            // 拿到编码，一般来说，只有几种可能 010 011 110 111 020(对方消息) 
            code = "" + tryRun(m[0], ".children().length") + tryRun(m[1], ".children().length") + tryRun(m[2], ".children().length");
            if(code[0]!="0") {
                try{
                    let actionPerfix = m[0].findOne(className("android.widget.TextView"))
                    if(actionPerfix){
                        prefix = actionPerfix.text();
                    }
                } catch (err) {}
            }
            // 拿到消息体
            if(code[1]!="0"){
                try{
                    let msgBox =  m[1].children()
                    // status = !(msgBox.findOne(className("android.widget.ImageView")));
                    // 拿到 RelatlveLayout 下的[0]个 LinearLayout 的子节点 children() 
                    // 所以就相当于是：RelatlveLayout[LinearLayout].children() 再判断第一个是不是图片即可
                    status = true;
                    try{
                        status = (msgBox[0].children()[0].className() != "android.widget.ImageView");
                    }catch(e){
                        // 对方发送的消息获取不到 className ，所以有className，并且为 "android.widget.ImageView"的就是发送失败 false。
                    }
                    // 找到发送人名字
                    sender = msgBox.findOne(className("com.bytedance.ies.dmt.ui.widget.DmtTextView")).desc();
                    msg = "";
                    // 如果是自己发送的则进行账号携带
                    if(sender == accountInfo.username || sender == accountInfo.name) {
                        // 将发送人换成自己的账号及名字
                        sender = accountInfo.username+"<->"+sender == accountInfo.name;
                    }
                    // 判断是否发送失败，并且追加当前消息
                    msg = (status ? "" : "[消息发送失败] " )+ msgBox.findOne(className("android.widget.TextView")).text();
                }catch(err){
                    log("获取消息异常，异常信息：", err)
                }
            }
            if(code[2]!="0"){
                try{
                    let actionSuffix = m[2].findOne(className("android.widget.TextView"))
                    if(actionSuffix){
                        suffix = actionSuffix.text();
                    }
                } catch (err) {}
            }

            msgList.push(
                server.excludeNull({
                    msg: msg,
                    prefix: prefix,
                    suffix: suffix,
                    accountUsername: accountInfo.username,
                    sender: sender,
                    code: code,
                    // fansUsername: null, // 放到上传消息的地方去进行赋值
                    status: status,
                    device: accountInfo.device,
                    reservedA: null,
                    reservedB: null,
                })
            )
        }
    }
    return msgList;
}

function mi6GetNewMsgList() {
    // let sendlist = boundsInside(900, 200, device.width, device.height).className("TextView").filter(function(uo){
    //     let t = uo.text();
    //     return t.indexOf(":") < 0 && t.indexOf("-") < 0 && !isNaN(parseInt(t));
    // }).find();
    // 气泡的上一级的id
    let sendlist = id("bfk").filter(function(uo){
        return 0 < uo.children().length
    }).find();
    // Say in 的同级别控件 使用 indexOf 进行去重
    if(ui.replaySayIn.checked) {
        id("bfc").filter(function(uo){
            // 如果文字是以 Say hi to 开始的则添加
            if(uo.text().indexOf("Say hi to") == 0) {
                // bfc的上面第4层向下找bfk
                let bfkUO = uo.parent().parent().parent().parent().findOne(id("bfk"));
                if(bfkUO && (sendlist.indexOf(bfkUO) < 0)) {
                    sendlist.push(bfkUO);
                }
            }
            return false;
        }).find();
    }
    return sendlist;
}
{/* function mi6GetNewMsgList() {
    // let sendlist = boundsInside(900, 200, device.width, device.height).className("TextView").filter(function(uo){
    //     let t = uo.text();
    //     return t.indexOf(":") < 0 && t.indexOf("-") < 0 && !isNaN(parseInt(t));
    // }).find();
    // 气泡的上一级的id
    let sendlist = id("bfk").filter(function(uo){
        return 0 < uo.children().length
    }).find();
    return sendlist;
} */}

/**
 * 私信界面
 * 获取存在红色气泡的信息列表
 * @returns {Array} 红色气泡列表
 */
function getNewMsgList() {
    // 3. 获取所有有红气泡数量的好友
    let action = className("androidx.recyclerview.widget.RecyclerView").boundsContains(0, 201, 1440, 2434).findOne(1000);
    
    list = boundsInside(900, 200, device.width, device.height).className("TextView").filter(function(uo){
        return uo.text().indexOf(":") < 0;
    }).find();
    let sendlist = [];
    if(action){
        // 拿到气泡内容
        action.children().forEach((uo,i)=>{
            let msgNum = uo.findOne(
                // 需要在指定的范围内 
                // 限制在右边的一部分范围
                boundsInside(1300, 0, 1400, device.height)
                // 是文本控件
                .className("android.widget.TextView")
                .filter(function(u){
                    u = u.text();
                    // 不能是时间 
                    if(!(isNaN(parseInt(u))) && (u.indexOf("-") < 0)){
                            return true;
                    }
                    return false;
            }))
            // 存在气泡则进行选择，否则不选
            if(msgNum){
                // 存在消息
                sendlist.push(uo);
            }
            // 不存在消息
        })
    }
    return sendlist;
}

/**
 * 私信界面
 * 对每一个回复了私信的人进行回复
 * !! 不每次使用最新获取的气泡列表，避免造成实时出现新消息时导致的计数大，从而提前退出
 * 
 * 
 * @param {Array} sendlist 红色气泡列表
 * @returns {Number}    本次共处理的消息数量
 */
function replySendlist(sendlist) {
    let reNum = 0;
    // 对每一个回复了私信的人进行回复
    console.info(sendlist.length)
    // 处理当前列表
    for (let i = 0; i < sendlist.length; i++) {
        reNum += parseInt(sendlist[i].text());
        // 4. 进入聊天界面
        if(clickOn(sendlist[i])) {
            // 备用方案
            let rect = sendlist[i].bounds();
            for (let j = 0; j < 5; j++) {
                // 点击的X轴进行偏移
                click(rect.left - device.width*0.1, rect.centerY())
                sleep(2000);
                // 拿当前页面的红色气泡列表，通过数量来判断之前的点击是否无效，加上输入框检测
                let newMsgListLength = mi6GetNewMsgList().length;
                if(newMsgListLength != sendlist.length) {
                    if(text("Send a message...").findOne(1000)) {
                        break;
                    }
                }
                log("似乎未进入聊天界面");
            }
        }
        let whileTag = true;
        do{
            // 回复消息
            mi6ReplyMsg();
            // 如果上一条消息是自己发送的则跳出，不是则再继续聊天
            whileTag = 上一条消息是否为自己发送的(true);
        }while(!whileTag && whileTag != null)
        
        // 7. 返回上一级
        for (let i = 0; i < 5; i++) {
            back();
            if(text("Direct messages").findOne(2000)) 
                break;
        }
    }
    return reNum;
    /* 
    for (let f in sendlist) {
        // 4. 进入聊天界面
        f = sendlist[f];
        f.click();
        // 避免点击到私信界面右上角的＋号
        sleep(2000);    
        // 检测消息并回复
        replyMsg();
        // 7. 返回上一级
        for (let i = 0; i < 5; i++) {
            back();
            if(text("Direct messages").findOne(2000)) 
                break;
        }
    } */
}
/**
 * 
 * @param {Boolean} tag 不检查是否发送成功的标记
 * @returns null 未获取到， undefine 不是自己， true 是自己
 */
function 上一条消息是否为自己发送的(tag) {
    let 新消息列表 = 获取消息();
    if(0 < 新消息列表.length) {
        log("最新一条消息的发送人：", 新消息列表[0].sender)
        if(新消息列表[0].sender == accountInfo.name || 新消息列表[0].sender == accountInfo.username) {
            if(tag || 新消息列表[0].status) {
                // 如果是自己发送的则返回 true
                return true;
            }else {
                // ------- 可以顺便处理 -------
                // log("处理发送失败", resend(), feedback());
            }
        } else if(!新消息列表[0].sender){
            return null;
        }
    }
}
/**
 * 聊天界面
 * 回复消息
 */
function mi6ReplyMsg() {
    // 判断是否是聊天界面
    if(!text("Send a message...").findOne(1000)) {
        return false;
    }
    // 如果上一条消息是自己发送的则跳出
    if(上一条消息是否为自己发送的()) {
        log("最新消息是自己发送的，取消本次的消息发送")
        return false;
    }

    // 获取到对方名字并去查粉丝数据
    log("正在获取粉丝数据")
    // 拿顶部的用户名字,数据库中没有信息则进入右上角拿对方账号信息
    let fans;

    {
        let tempUO = className("android.widget.TextView").clickable(true)
                    .boundsInside(0,0,device.width*0.9,device.height*0.1)
                    .findOne(3000);
        if(tempUO) {
            let fansName = tempUO.text();
            fans = server.get("fans/name?name=" + fansName + "&accountUsername=" + accountInfo.username)
        }
    }

    if(!fans) {
        // log("通过名字获取对方信息失败！正在尝试通过账号获取")
        log("尝试通过账号获取或创建")
        fans = getFansInfoByFansMsgView();
    }
    // 通过粉丝账号找聊天记录
    fans.messages = server.get("record/doubleusername?fansUsername=" + fans.username
                +"&accountUsername="+fans.accountUsername) || [];

    log("开始获取消息并回复")
    // 5. 获取双方聊天信息（不翻页）
    let 总消息=[],新消息=[];
    try{
        // 从服务器通过粉丝名字拿到聊天记录
        // 拿到粉丝总的消息记录，可能回异常
        总消息 = fans.messages||[];
    } catch (err) {
        log("获取聊天记录异常：", err)
    }
    let 新消息列表 = 获取消息();
    
    /*
    [ 
        { 
            status: false,
            sender: 'prettyboi.malik',
            msg: '[消息发送失败]prettyboi.malik',
            perfix: '2020-12-23 18:58',
            suffix: '',
            code: '120' 
        },
        { 
            status: false,
            sender: 'prettyboi.malik',
            msg: '[消息发送失败]prettyboi.malik',
            perfix: '2020-12-23 12:29',
            suffix: '',
            code: '120' 
        } 
    ]
     */
    // 对当前的消息做去重处理
    if(总消息.length == 0){
        总消息 = 总消息.concat(新消息列表);
        新消息 = 新消息列表;
    } else {
        // 将总消息的msg遍历出来
        let totalMsg = [], index;
        总消息.forEach(e=>{totalMsg.push(e.msg)})
        // 遍历当前消息
        新消息列表.forEach(消=>{
            // log(消.msg);
            // 设置保存标记
            let saveTag = true;
            let m = 消.msg;
            // 遍历完全部消息
            for (let i = 0; i < totalMsg.length; i++) {
                if(m == totalMsg[i]){
                    // 消息内容相同时
                    // 以下条件任意满足其一则设置(saveTag)为false并开始下一个
                    // true 跳过，false 继续
                    if(
                        // 存在code属性时，不和保存的一致
                        消["code"] == 总消息[i]["code"]
                        && 消["prefix"] == 总消息[i]["prefix"]
                        && 消["suffix"] == 总消息[i]["suffix"]
                    ) {
                        saveTag = false;
                        // 开始下一个
                        return true;
                    }
                    // if(消["code"] && 消["code"] == 总消息[i]["code"])
                }
            }
    
            if(saveTag) {
                总消息.push(消);
                新消息.push(消);
            }
    
        })
    }

    // 6. 进行消息处理，返回false则不回复消息
    let 回消息 = 消息处理(fans,新消息);
    let sm;
    if(回消息){
        // 输入消息并发送
        log("回复消息")
        sm = sendMsg(回消息);
        总消息.push(sm);
        新消息.push(sm);
    }

    threads.start(function() {
        console.info("即将上传聊天记录数：" + 新消息.length);
        // 将当前信息进行保存
        // 向服务器保存最新的聊天数据  只保存新的数据
        // 按照时间是倒序的，所以倒着向后台传
        for (let i = 新消息.length-1; 0 <= i; i--) {
            try{
                if(typeof 新消息[i].status != "number") {
                    新消息[i].status = 新消息[i].status? 0 : 1;
                }
                if(!新消息[i].fansUsername) 新消息[i].fansUsername = fans.username || fans.name || "-";
                server.add("record", server.excludeNull(新消息[i]));
            } catch(e) {
                log(e);
                log("上传新消息失败！");
            }
        }
    })

    if(sm && !sm.status) {
        // 失败计数，在计数完成之后进行检测
        sendMessagesExceptionNumber++;
        smenDetection();
    }

    // 聊天记录和标签都是重新查的,所以不需要再重新保存粉丝信息
    // 将粉丝信息进行保存
    // fans.messages = [];
    // log("保存当前粉丝信息")
    // server.add("fans", server.excludeNull(fans));
}

/**
 * 聊天界面
 * 回复消息
 */
function replyMsg() {
    // 获取到对方名字并去查粉丝数据
    log("正在获取粉丝数据")
    fans = getFansInfoByFansMsgView()
    log("开始获取消息并回复")
    // 5. 获取双方聊天信息（可能需要翻页）
    let 总消息=[],新消息=[],sendTag=true;
    try{
        // 从服务器通过粉丝名字拿到聊天记录
        // 拿到粉丝总的消息记录，可能回异常
        总消息 = fans.messages||[];
    } catch (err) {
        log("获取聊天记录异常：", err)
    }
    // 拿到当前聊天界面的控件，方便之后进行翻页
    let msgAction = className("androidx.recyclerview.widget.RecyclerView").findOne(2000);

    while (true) {
        sleep(300)
        log("获取当前页的消息")
        // 将本次的消息添加到总消息中，需要去重
        // 去重规则，弱规则，以后可以修改
        let saveNum=0;
        let 新消息列表 = 获取消息();
        
        if(总消息.length == 0){
            总消息 = 总消息.concat(新消息列表);
            saveNum = 新消息列表.length;
        } else {
            for (let 消 in 新消息列表) {
                消 = 新消息列表[消];
                // 拿到一条消息，拿去跟之前的消息做比对
                // 保存的标记
                let tag = false;
                for (let 息 in 总消息) {
                    息 = 总消息[息];
                    // 存在则跳过
                    // 不存在则保存

                    /// 消息内容相等的时候才进行比对
                    if(消.msg == 息.msg){
                        // 所有属性均相等
                        let letTag = true;
                        for (let k in 消) {
                            if(消[k] != 息[k]) {
                                // 不相等，有一个属性不相等则跳出进行保存
                                letTag = false;
                                break;
                            }
                        }
    
                        if(!letTag) {
                            // 存在一个消息一样的，全相等的，则直接跳出循环，且设置不保存
                            tag = false;
                            break;
                        }
                    }
                    // 不相等则将保存标记设置成true
                    tag = true;
                    break;
                }
    
                if(tag) {
                    总消息.push(消);
                    新消息.push(消);
                    // console.verbose("保存", 息);
                    saveNum++;
                }
            }
        }
        if(saveNum == 0){
            // 第一次检测到无新消息时不跳出
            if (sendTag) sendTag = false;
            else break;
        }
        log("翻页，保存信息数：", saveNum)
        // 向上翻页
        if(!msgAction.scrollBackward()){
            log("已经达到消息顶部");
            break;
        }
    }

    // 6. 进行消息处理，返回false则不回复消息
    let 回消息 = 消息处理(fans,新消息);
    if(回消息){
        // 输入消息并发送
        let sm = sendMsg(回消息)
        总消息.push(sm);
        新消息.push(sm);
    }
    // 将当前信息进行保存
    // 向服务器保存最新的聊天数据  只保存新的数据
    // 按照时间是倒序的
    for (let i = 新消息.length; 0 <= i; i--) {
        // 避免因为空对象导致失败
        新消息[i].params = null;
        /* {
            message: re.msg,
            perfix: re.perfix,
            suffix: re.suffix,
            status: re.status?0:1,
            accountUsername: accountInfo.username,
            fansUsername: f.username,
        } */
        try{
            if(typeof 新消息[i].status != "number") {
                新消息[i].status = 新消息[i].status? 0 : 1;
            }
            console.verbose(新消息[i]);
            if(!新消息[i].fansUsername) 新消息[i].fansUsername = fans.username||"-";
            server.add("record", server.excludeNull(新消息[i]));
        } catch(e){
            log(e);
            log("上传新消息失败！");
        }
    }
    addFans(fans,Fans)
}

/**
 * 聊天界面
 * 获取粉丝账号，然后从文件中获取粉丝信息
 * @returns {Object} 粉丝对象
 */
function getFansInfoByFansMsgView() {
    // 点击右上角的按钮
    desc("More").findOne(1000).click()
    // 拿到头像控件
    let fans,username,name;
    for (let index = 0; index < 5; index++) {
        sleep(1000)
        let action = className("com.bytedance.ies.dmt.ui.widget.DmtTextView").findOne(2000);
        if(action){
            let textUO = action.parent().parent().find(className("android.widget.TextView"));
            // 拿到账号与用户名
            try{
                username = textUO[0].text();
                name = textUO[1].text();
                // 拿粉丝数据
                // 从服务器拿到粉丝的信息 包含聊天记录  msg = server.get("record/
                // 通过粉丝账号以及tiktok账号找粉丝信息http://localhost:8081/tiktokjs/fans/username/ivethgrijalva9?accountUsername=kwepixzr76675
                fans = server.get("fans/username?username=" + username + "&accountUsername=" + accountInfo.username)
                break;
            } catch (err) {
                console.verbose("获取对方账号异常", err)
            }
        }
        if(fans) break;
        sleep(500)
    }
    // 如果获取失败则创建一个粉丝信息
    if(!fans || !fans.username) {
        console.warn("无粉丝对象，创建一个粉丝对象")
        fans = {
            username: username,
            name: name,
            accountUsername: accountInfo.username,
            device: "聊天界面创建"
        }
        // 将当前粉丝信息保存到服务器
        console.verbose("保存新增的粉丝信息");
        server.add("fans", server.excludeNull(fans));
    }
    // 返回上一级，聊天界面
    back();
    sleep(2000);
    return fans;
}


/**
 * 通过用户账号获取一个粉丝数据
 * @param {String} username 用户账号
 * @param {String} name 用户名
 */
function getFansInfoByData(username, name) {
    log("获取粉丝信息中")
    // 拿到粉丝信息
    try {
        if (Fans.list.length < 1) throw "无数据"
    } catch (err) {
        Fans.list = readFansFile(Fans.path);
    }
    console.verbose("当前账号：", username, "粉丝数量", Fans.list.length)
    // 如果有数据未进行保存则进行保存
    saveFans()
    // 获取一个粉丝信息
    let fans = getFans(username, Fans.list)
    Fans.temp = fans;
    return fans;
}
/**
 * 读取粉丝文件
 * @param {String} path 粉丝文件路径
 */
function readFansFile(path) {
    // 读取文件
    let file = files.read(path);
    // 使用 \n 分割
    let arr = file.split("\n");
    // 使用完毕数据就对数据进行保存
    return arr;
}
/**
 * 保存粉丝数据
 * @param {String} path 保存路径
 * @param {Array} arr 数组
 */
function saveFansFile(path, arr) {
    // 创建数据
    let data = arr.join("\n")
    files.write(path,data);
}
/**
 * 获取一个粉丝数据
 * @param {String} username 粉丝账号
 * @param {Array} arr 粉丝字符串数组
 * @returns {Object} 如果找到则返回粉丝对象，找不到则返回null
 */
function getFans(username,arr) {
    for (let i = 0; i < arr.length; i++) {
        // ��判断字符串(序列化的对象数据)中是否存在这个字符串
        if(-1 < arr[i].indexOf(username)){
            // 将字符串转成对象再次进行对比
            let fans = JSON.parse(arr[i]);
            if(fans.username == username){
                arr.splice(i,1);
                return fans;
            }
        }
    }
    return null;
}
/**
 * 对临时保存的粉丝数据进行保存
 * @param {Object} F 总的粉丝对象
 * @param {Object} fans 粉丝对象
 */
function saveFans(F,fans) {
    F = F||Fans;
    if(fans){
        addFans(fans, F.list)
        return true
    }
    if(F.temp){
        addFans(F.temp, F.list)
        F.temp = null
        return true;
    }
    return false;
}
/**
 * 更新粉丝数据
 * @param {Object} obj 对象
 * @param {Array} arr 数组
 * @returns {Object|false} 返回是否存在异常。失败 返回异常信息。成功 返回false
 */
function addFans(obj,arr) {
    if(!(arr instanceof Array)){
        if(obj instanceof Array){
            // 如果 arr不是数组，obj是数组，那么互换位置
            let temp = arr;
            arr = obj;
            obj = temp;
        }
    }
    try{
        arr.push(JSON.stringify(obj))
        saveFansFile(arr.path, arr.list)
    } catch (err){
        log("保存失败", err)
        return err;
    }
    return false;
}

/**
 * 处理消息
 * 依赖外部变量 RequiredLabels 格式：[{ labelName:"标签名"（标签）, words: "关键词,关键词,..."（关键字） 
 *                          ask: ["询问语句1","询问语句2"]（信息） reply: ["触发时回复","触发时回复2"]（信息）}]
 * @param {UIObject} fans  保存的粉丝的信息
 * @param {Array} newMsgList 新的聊天记录
 */
function 消息处理(fans, newMsgList) {

    // log("==== 粉丝信息以及新消息 ====")
    // console.verbose(fans);
    // console.verbose(newMsgList);

    // 0. 将自己的消息排除掉
    console.verbose(newMsgList)
    {
        let temp = []
        newMsgList.forEach((e)=>{
            if(e.sender != accountInfo.name && e.sender != accountInfo.username) {
                temp.push(e);
            } else {
                console.verbose("排除", e);
            }
        })
        newMsgList = temp;
    }
    // 1. 分析新消息单词数组
    let words = [];
    for (let m in newMsgList) {
        m = newMsgList[m];
        if(m.sender != accountInfo.name && m.sender != accountInfo.username){
            // 对方的消息
            let newWords = m.msg.split(/[\s,.，。]/)
            for (let w in newWords) {
                // 排除前缀
                w = newWords[w].replace("[消息发送失败]", "");
                // 如果当前单词不为空则保存到单词数组中
                if(w!="") words.push(w);
            }
        }
    }

    // console.verbose("单词组：", words)
    // 拿到粉丝当前标签内容,粉丝标签信息 {"标签1": ["触发词1", "触发词2"],"标签2": ["触发词1", "触发词2"],"标签3": ["触发词1", "触发词2"]}
    let fansLabel = {};
    try{
        if(fans.username) fansLabel = server.get("fansLabel/getlabel?username=" + fans.username).label;
    }catch(err) {
        log(err)
        log("获取粉丝标签失败！");
    }

    log("=== 已存标签 ===")
    log(fansLabel)
    // console.verbose(fans)

    // 触发词优先回复
    let nowMsg=[];
    // 全字匹配标记，第一次可以触发，之后不会触发
    let allWord = true;
    // 使用单词去匹配词库并保存
    for (let w in words) {
        // 拿到当前单词，并将当前单词转成小写
        w = words[w].toLowerCase();
        // 拿到当前标签内容 包括 label（标签） words（关键字） info（信息）
        for (let tag in tempSave.RequiredLabels) {
            tag = tempSave.RequiredLabels[tag];

            // {labelName: "国家", words: ["usa","en"](已经处理为小写), ask: ["where are you from?"], reply: ["where are you from?"]}

            // 没有全字匹配（没有关键字 * ）时继续执行  或者有全字，但是 allWord 标记为允许（true）
            let star = tag.words.indexOf("*");
            let allow = true;
            if(-1 < star) {         // 存在通配符
                if(allWord) {       // 如果是第一次通过则将标记关闭
                    allWord = false;
                } else {
                    allow = false;  // 第二次及以后都不通过
                }
            }
            if(allow) {
                // 没有全字匹配时
                // 如果当前单词存在于标签中，则进行保存，将其转换成小写，这里的indexOf是在字符串中找
                // 当前标签中存在这个关键词或者存在“*” 
                if(-1 < tag.words.indexOf(w) || -1 < star){
                    log(w, tag.words.indexOf(w))
                    log("+===========")
                    // 判断是否存在当前标签，没有就创建
                    if(!fansLabel[tag.labelName]) {
                        fansLabel[tag.labelName]=[];
                        // 第一次创建将进行消息回复
                        try{
                            if(0 < tag.reply.length) {
                                // 存在触发词则保存触发词
                                // nowMsg.push(tag.reply[random(0, tag.reply.length-1)]);

                                // 消息动态获取
                                // let appendMsg = server.get("labelInfo/randomIssue?labelName=" + r.labelName, {resouce: true}).body.string();
                                // let appendMsg = server.post("labelInfo/list", {labelName: r.labelName, type: "reply"}).json().rows;
                                let replyes = server.post("labelInfo/list", {labelName: tag.labelName, type: "reply"}).json().rows;
                                // console.verbose(replyes)
                                if(0 < replyes.length) {
                                    if(typeof tempSave.replyesLength != "number") {
                                        tempSave.replyesLength = 0;
                                    }
                                    nowMsg.push(
                                        replyes[
                                        // random(0, replyes.length-1)
                                            // random(0, replyes.length-1)
                                            parseInt(tempSave.replyesLength%replyes.length)
                                        ].body);
                                    console.info("选择的消息下标：", parseInt(tempSave.replyesLength%replyes.length))
                                    tempSave.replyesLength++;
                                }
                            }
                        }catch(e){
                            console.info(e)
                        }
                    }
                    // 判断是否已经存在当前标签的这个关键词,如果没有则进行保存，这里的indexOf是在数组中找
                    if(fansLabel[tag.labelName].indexOf(w) < 0) {
                        fansLabel[tag.labelName].push(w);
                        /* 进行粉丝标签保存
                        {
                            username: 用户账号
                            labelName: 标签名字：
                            labelBody: 触发内容：
                        }
                        */
                        // console.warn("标签保存")
                        server.add("fansLabel", {
                            username: fans.username,
                            labelName: tag.labelName,
                            labelBody: w
                        })
                    }
                }
            
            } else {
                // console.verbose("当前不被允许进入判断")
            }
           
        }
    }

    // 要回复的消息
    let reMsg = "";

    // log("=== 优先回复消息 ===")
    // log(nowMsg)
    // log("最新用户标签数据")
    // log(fansLabel)
    // 如果有标签消息则进行标签消息回复，没有则不进行回复
    if(0 < nowMsg.length) {
        reMsg = nowMsg.join("\n");
        console.verbose("回复消息长度：", reMsg.length);
        // 直接跳出，不需要继续打招呼
        return reMsg;
    }

    let issue = true;
    if(reMsg!="") {
        // reMsg+="\n\n\n";
        issue = false;
    }

    console.verbose("issue:", issue);
    // 查找剩余标签内容，执行相应的询问（顺序），会追加日常的询问语句
    for (let i = 0; i < tempSave.RequiredLabels.length; i++) {
        /*
            [
                { label: "国家", words: "usa", ask: ["where are you from?"], reply: ["where are you from?"] }
                { label: "国家1", words: "usa", ask: ["where are you from?"], reply: ["where are you from?"]  }
            ]
        */
        r = tempSave.RequiredLabels[i];

        // console.verbose(r.labelName.indexOf("携带问题"), r.labelName);
        // 由于粉丝的标签是字符串，所以继续使用标签暂存对象来进行判断
        if(r.labelName != "携带问题" && !fansLabel[r.labelName]) {
        // 开头不能是 "携带问题"
        // if("携带问题".length < r.labelName.indexOf("携带问题")  && !fansLabel[r.labelName]) {
            let appendMsg = r.ask[random(0, r.ask.length-1)];
            console.verbose(appendMsg);
            if(appendMsg) {
                console.verbose(reMsg," ==之前== ",appendMsg)
                reMsg +=  appendMsg;
                if(issue) {
                    try{
                        // 拿到当前用户的所有标签
                        let labels = [];
                        for (let k in fansLabel) {
                            labels.push(k)
                        }
                        // 问题动态获取
                        let iss = getIssue(labels);
                        // iss = server.get("labelInfo/randomIssue?labelName=携带问题", {resouce: true}).body.string();
                        if(iss) reMsg += "\n\n\n" + iss;

                        console.info("新消息：", reMsg);
                        return reMsg;

                    }catch(e){
                        console.warn("携带问题失败", e)
                    }
                }
            } else {
                log(r.labelName,"标签的询问消息为空!");
            }
        }
{
/*
            // let reMsg = Date.now().toString().substring(10) +"> "+ r.info[random(0,r.info.length-1)];
             let appendMsg = r.ask[random(0, r.ask.length-1)];
            if(appendMsg) {
                console.verbose(reMsg," ==之前== ",appendMsg)
                reMsg +=  appendMsg;
                if(issue) {
                    // 发送 日常+问题 ，连带着 问题可连续性 例子：hi \n where are you from?
                    let iss = tempSave.issue[random(0, tempSave.issue.length-1)];
                    if(!iss) log("没有要携带的问题！", tempSave.issue)
                    log("问题：", iss);
                    if(iss) {
                        reMsg += "\n\n\n";
                    }
                    reMsg += iss || "";
                    // try{
                        // iss = server.get("labelInfo/randomIssue?labelName=携带问题", {resouce: true}).body.string();
                        // if(iss) reMsg += "\n\n\n" + iss;
                    // }catch(e){
                    //     log("携带问题失败", e)
                    // }
                }
                console.info("新消息：", reMsg);
                return reMsg;
            } else {
                log(r.labelName,"标签的询问消息为空!");
            }
        }
*/
}
    }
    console.verbose(reMsg);
    console.info("不发送新消息");
    // 不发送新消息
    return false;

    if(reMsg=="") {
        console.info("不发送新消息")
        // 不发送新消息
        return false;
    }
    // 没有新标签的时候会走这里
    return reMsg;
}

/**
 * 从文件中读取标签对象
 * @param {String} path 文件路径
 * @returns {Object}
 */
function readRequiredLabelsFile(path){
    // 没有 tempSave.LabelsData 数组或者长度为0，都将从服务器获取数据
    if(!tempSave.LabelsData || tempSave.LabelsData.length < 1) {
        // 从服务器拿到标签集合
        let ls = server.get("label/list").rows;
        tempSave.LabelsData = [];
        // 将每一个标签转成对象储存
        for (let i = 0; i < ls.length; i++) {
            console.verbose(ls[i].label)
            tempSave.LabelsData.push(JSON.parse(ls[i].label));
        }
    }
    return tempSave.LabelsData;
    [
        {
            label: "国家",
            words: "china,CN",
            info: ["where are you from?"]
        },
        {
            label: "性别",
            words: "man,woman,boy,girl",
            info: ["What's your gender?"]
        }
    ]
    let data = [];
    // 读取文件 文件数据使用 \n\n 分割
    // 数据格式 标签:关键字1,关键字2\n消息体1,消息体2
    let sourceData = files.read(path).split("\n\n");
    for (let e in sourceData) {
        e = sourceData[e];
        try{
            let si = 0;
            let ei = e.indexOf(":");
            let label = e.substring(si, ei);
            si = e.indexOf("\n");
            let words = e.substring(ei + 1/* 从这个下标开始，会包含":"，所以＋1 */, si);
            let info = e.substring(si, e.length);
            data.push({
                label: label,
                words: words.split(","),
                info: info.split(",")
            })
        } catch (err) {
            console.verbose("标签数据解析失败")
        }
    }
    return data
}

function getIssue(labelNameList){
    log("获取问题标签")
    console.verbose(labelNameList)
    let labelNamesExcludes = "";
    try {
        labelNameList.forEach((e) => {
            labelNamesExcludes += "&labelNamesExclude=" + e.toString();
        });
    } catch(e) {
        // 携带问题异常，可以不用管
    }
    // 获取所有的问题标签
    // let issues = server.get("labelInfo/randomIssue?labelName=携带问题", {resouce: true}).body.string();
    // 获取一个问题标签
    let issue = server.get("labelInfo/issue?labelName=携带问题" + labelNamesExcludes, {resouce: true});
    issue = issue.body.string();
    console.verbose("获取到的问题数据：", issue)
    if(1 < issue.length) {
        try{
            issue = JSON.parse(issue);
            if(issue.ask) {
                akss = issue.ask.split(",");
                issue = akss[random(0, akss.length-1)];
                log("随机抽取到的一个问题：", issue);
            } else {
                log(issue)
                console.warn("没有问题数据！询问消息设置为空");
                issue = "";
            }
        }catch(e){
            console.warn("问题转对象失败！")
            console.verbose(e)
        }
    }
    return issue;
{
    /* // 原来的是获取到全部的问题标签
    let reList = [];
    let rows = server.post("labelInfo/list?labelName=携带问题").json().rows;
    for (let i = 0; i < rows.length; i++) {
        // 是否是询问消息
        if(rows[i].type=="ask") {
            reList.push(rows[i].body);
        }
    }
    return reList;
    */
}
}
/**
 * 从后台拿到所有的标签
 */
function getLabelList() {
    /*
    [
        { "labelName": "国家", "words": "jp,cn,usa", "ask": "where are you from?", "reply": "oh" }, 
        { "labelName": "测试", "words": "123", "ask": null, "reply": null }, 
        { "labelName": "标签", "words": "asjdgahjs", "ask": "are you ok?,are you ok ?,123", "reply": "hahahah" },
        { "labelName": "性别", "words": "man,woman", "ask": null, "reply": null }
    ]
     */
    let reList = [];
    // 没有 tempSave.LabelsData 数组或者长度为0，都将从服务器获取数据
    if(!tempSave.LabelsData || tempSave.LabelsData.length < 1) {
        // 从服务器拿到标签集合 /tiktokjs/labelInfo/labellist
        tempSave.LabelsData = server.get("labelInfo/labellist");
        for (let i = 0; i < tempSave.LabelsData.length; i++) {
            // if(tempSave.LabelsData[i].words == null) tempSave.LabelsData[i].words ="";
            if(tempSave.LabelsData[i].words != null) {
                if(tempSave.LabelsData[i].ask == null) tempSave.LabelsData[i].ask ="";
                if(tempSave.LabelsData[i].reply == null) tempSave.LabelsData[i].reply ="";
                // 将大写转成小写，并且也切割成单词组
                tempSave.LabelsData[i].words = tempSave.LabelsData[i].words.toLowerCase().split(",");
                // 切割消息
                if(tempSave.LabelsData[i].ask) tempSave.LabelsData[i].ask = tempSave.LabelsData[i].ask.split(",");
                if(tempSave.LabelsData[i].reply) tempSave.LabelsData[i].reply = tempSave.LabelsData[i].reply.split(",");
                reList.push(tempSave.LabelsData[i]);
            }
        }
    }
    return reList;
}
/**
 * 从文件中随机获取到一条消息
 */
function 获取一条消息(path) {
    let msgs = files.read(path).split("\n")
    return msgs[random(0,msgs.length-1)];
}

/**
 * 在主页使用
 * 通过搜索str进入tab列表点击第num条数据
 * @param {String} str 选择的分类,默认 "test"
 * @param {String} tab 选择的分类,默认 "USERS"
 * @param {Number} num 第几个,从0开始,默认 0
 */
function 搜索进入(str,tab,num){
    let result;
    let 操作 = [
        {
            标题: "返回首页",
            uo: null,
            检测: function() {
                this.uo = !text("Me").visibleToUser().exists();
                return this.uo
            },
            执行: function() {
                返回首页();
            }
        },
        {
            标题: "切换到搜索页",
            uo: null,
            检测: function() {
                this.uo = text("Discover").findOne(1000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.parent().click();
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "点击搜索框",
            uo: null,
            检测: function() {
                this.uo = text("Search").findOne(1000)
                return this.uo
            },
            执行: function() {
                let re = click(this.uo.bounds().right-5, this.uo.bounds().centerY());
                log("点击" + this.标题, re)
                if (re) {
                    log("设置文字")
                    this.uo.setText(str||"test")
                }
            }
        },
        {
            标题: "点击搜索",
            uo: null,
            检测: function() {
                this.uo = text("Search").findOne(1000)
                return this.uo
            },
            执行: function() {
                let r = this.uo.bounds();
                let re = click(r.centerX(), r.centerY());
                log("点击" + this.标题, re)
                if (re) {
                    
                }
            }
        },
        {
            标题: "点击用户/其它",
            uo: null,
            检测: function() {
                this.uo = text(tab||"USERS").findOne(1000)
                return this.uo
            },
            执行: function() {
                let handleRe;

                循环执行([
                    {
                        标题: "点击标题",
                        uo: null,
                        检测: function() {
                            this.uo = text(tab||"USERS").findOne(1000)
                            return this.uo
                        },
                        执行: function() {
                            let re = this.uo.parent().click();
                            log("点击" + this.标题, re)
                            if (re) {
                                等待加载();
                            }
                        }
                    },
                    {
                        uo: null,
                        检测: function() {
                            this.uo = text(tab||"USERS").findOne(1000).parent().selected()
                            return this.uo
                        },
                        执行: function() {
                            let re = this.uo;
                            log("点击第一个");
                            let i = 0;
                            for (; i < 5; i++) {
                                let a = className("androidx.recyclerview.widget.RecyclerView").boundsContains(100,400,100,100).findOne(2000)
                                if(a) {
                                    try{
                                        a.children()[num||0].click()
                                        break;
                                    } catch (err) {
                                        log("点击指定第"+num+"条数据失败");
                                        try{
                                            a.children()[0].click()
                                            break;
                                        } catch (errr){
                                            console.error("点击第一条数据失败",errr);
                                        }
                                    }
                                }
                            }
                            handleRe = true;
                            result = i < 5;
                            return "跳出循环执行";
                        }
                    },
                ])
                if(handleRe) return "跳出循环执行";
                log("进入失败，回退")
            }
        },
    ]
    循环执行(操作)
    return result;
}

/**
 * 在主页使用
 * 通过搜索str进入tab列表点击第num条数据
 * @param {String} str 选择的分类,默认 "test"
 * @param {String} tab 选择的分类,默认 "USERS"
 * @param {Number} num 第几个,从0开始,默认 0
 */
function 搜索进入1(str,tab,num){
    // 1. 进入搜索页面
    let action = text("Discover").findOne(1000)
    log(action)
    if(action) action.parent().click();
    // 2. 点击搜索框
    action = text("Search").findOne(1000)
    if(action) click(action.bounds().right-5, action.bounds().centerY())
    // 设置文字
    action.setText(str||"test")
    // 3. 点击搜索
    action = text("Search").findOne(1000)
    log(action)
    if(action) {
        let r = action.bounds();
        click(r.centerX(), r.centerY())
    }
    // 4. 点击用户/其它
    sleep(1000)
    action = text(tab||"USERS").findOne(1000)
    if(action) action.parent().click()
    // 稍等加载
    sleep(1000)
    等待加载()
    // 5. 点击第一个
    let i = 0;
    for (; i < 5; i++) {
        let a = className("androidx.recyclerview.widget.RecyclerView").boundsContains(100,400,100,100).findOne(2000)
        if(a) {
            try{
                a.children()[num||0].click()
                break;
            } catch (err) {
                log("点击指定第"+num+"条数据失败");
                try{
                    a.children()[0].click()
                    break;
                } catch (errr){
                    console.error("点击第一条数据失败",errr);
                }
            }
        }
    }
    return i<5
}
/**
 * 通过搜索的模式
 */
function 通过搜索打招呼() {
    返回首页();
    // 拿到粉丝的名字
    let fans = 获取一条无链接的粉丝信息();
    let username = fans.username;
    // 通过搜索打开粉丝信息
    搜索进入(username, "USERS", 0);
    // 尝试获取他的链接
    // let nowFans = getFansInfo()
    // 发送一条消息
    let re = sayHello(getHelloMessage())
    if(re){
        log("结果:", re.status)
    } else {
        log("用户似乎不存在")
        files.append(路径.文件夹.私信 + accountInfo.envi + "_打招呼失败_用户似乎不存在.txt", fans);
    }
}
/////////////////////////////////////////////////////////////////////



function 还原环境() {
    for (var i = 0; i < 2; i++) {
        try {
            if (!packageName("com.yztc.studio.plugin").exists()) {
                log("APP异常消失了,重新启动")
                app.launchApp("抹机王")
                var 一键新机 = text("一键抹机/一键新机").findOne(120000)
                if (一键新机) {

                }
            }
            var 路径 = 路径.文件夹.XX环境 + 序号
            var 还远 = http.get("http://127.0.0.1:8181/api?reqCode=7002&configDir=" + 路径)
            if (还远) {
                var res = 还远.body.string()
                log(res)
                if (/成功/.test(res)) {
                    res = JSON.parse(res)
                    while (1) {
                        sleep(5000)
                        var api查询 = http.get("http://127.0.0.1:8181/api?reqCode=7011&taskId=" + res['Data']['TaskId']).body.string()
                        log(api查询)

                        if (/任务异常/.test(api查询)) {
                            log("任务异常,切换下个环境")
                            序号 = 取环境()
                            break
                        }
                        if (/一键还原成功/.test(api查询)) {
                            log("一键还原成功")
                            return true
                        }

                        // if (/任务正在运行/.test(api查询)) {
                        //     log("任务正在运行")
                        //     break
                        // }
                        if (/失败/.test(api查询) || /-异常/.test(api查询)) {
                            log("失败或者-异常")
                            break
                        } else {
                            var w = JSON.parse(api查询)
                            if (w['Data']['WarningMsg'] && w['Data']['WarningMsg'].length > 0) {
                                log(w['Data']['WarningMsg'])
                                break
                            }
                            if (/成功/.test(api查询)) {
                                log("成功")
                                return true
                            }
                        }
                        if (!packageName("com.yztc.studio.plugin").exists()) {
                            log("APP异常消失了,重新启动")
                            app.launchApp("抹机王")
                            var 一键新机 = text("一键抹机/一键新机").findOne(120000)
                            if (一键新机) {

                            }
                            break
                        }
                    }
                }
            }
        } catch (error) {
            log(error)
        }

    }
}


function 写入环境() {
    if (!files.exists(路径.环境)) {
        var arr = files.listDir(路径.文件夹.XX环境);
        log("环境数量 " + arr.length);
        if (arr.length > 0) {
            var newtext = arr.join('\n');
            files.write(路径.环境, newtext)
        }
    }
}



function 取环境() {
    if (!files.exists(路径.环境)) {
        alert("没有找到",路径.环境)
        exit()
    }
    var 读取 = files.read(路径.环境)
    if (读取) {
        var 分割 = 读取.split("\n")
        var 环境 = 分割[0]
        log("删除数据 " + 分割.splice(0, 1))
        var newtext = 分割.join('\n');
        files.write(路径.环境, newtext);
        return 环境
    } else {
        log("没环境了,重新写入 " + files.removeDir(路径.环境))
        删除失败()
        写入环境()
    }
}

function 删除失败() {
    if (!files.exists(路径.文件夹.XX环境)) {
        log("环境路径出错了.请检查")
        return false
    }
    if (!files.exists(路径.失败环境)) {
        log("没失败环境删除,跳过")
        return false
    }
    var 读取 = files.read(路径.失败环境)
    console.error(读取)
    if (读取) {
        files.removeDir(路径.失败环境)  // 删除记录文件
        读取 = 读取.split("\n")
        for (let i = 0; i < 读取.length; i++) {
            if (读取[i]) {
                if (files.exists(路径.文件夹.XX环境 + 读取[i])) {
                    if(cancelDelete("假参数")) {
                        server.exce("account",{
                            name: 读取[i]
                        });
                        log("移动无账号环境 " + 读取[i], files.move(files.join(路径.文件夹.XX环境, 读取[i]), files.join(路径.文件夹.回收站, 读取[i])));
                    }
                    sleep(100)
                }
            }
            
        }
    } else {
        log("没有需要删除的环境")
    }
}

/////////////////////////////////////////////////



function 单注册模式() {
    while (1) {
        if(清除数据()){
            if(打开抖音()){
                抖音分身注册()
            } else {
                // 序号 = xx("获取当前环境名称")
                // cancelDelete(序号)
                // console.error("将当前环境加入失败待删除列表：", 序号)
                // files.write(路径.失败环境, 序号)
                // 是否删除 = 1
            }
        }
    }
}

function mi6注册模式(closeAccountDetection) {
    // 打开tiktok
    打开抖音()
    // 进入账号界面
        // 跳过第一屏s
    /* let tag=0;
    while(text("Sign up").find().length<1 && 5>tag++){
        新环境();
    } */
    // 注册
    for (let index = 0; index < 5; index++) {
        if(!textContains("Use phone or email").findOne(100)) {
            返回首页(300);
        }
        if(false && !lh_find(text("Sign up").clickable(true), "Sign up", 0)){
            try{
                for (; i < 3;) {
                    lh_find(id("title"), "顶部账号栏", 0, 500)
                    if(lh_find(text("Add account"), "Add account", 0, 500)) {
                        i++;
                    } else { 
                        // 查询是否已经存在了三个账号
                        getAccountList();
                        log("账号数量：", accounts.list.length)
                        if(accounts.list.length == 3) {
                            log("未找到添加账号按钮且存在三个账号，判定为已经注册完毕")
                            i = accounts.list.length;
                            break;
                        }
                    }
                    action = textContains("existing").findOne(100);
                    if(action) {
                        action.parent().click();
                    }
                    // 出现注册/登录页面则跳出
                    if(textContains("Continue with").findOne(100)) {
                        i--
                        break;
                    }
                    scrollView.scrollForward();
                }
            }catch(e){}
            if(i>=3){
                log("账号已满，无需继续注册 " + i);
                tempSave.continue = false;
                return false;
            }
        }
        for (let i = 0; i < 5; i++) {
            lh_find(text("Sign up").clickable(true), "Sign up", 0, 300)
            lh_find(id("title"), "顶部账号栏", 0, 200)
            if(!lh_find(text("Add account"), "添加账号", 0, 500) && !closeAccountDetection) { 
                // 查询是否已经存在了三个账号
                getAccountList();
                if(0 < accounts.list.length) {
                    log("未找到添加账号按钮，当前账号数量：", accounts.list.length)
                    tempSave.continue = false;
                    return false;
                }
            }
            lh_find(textContains("existing"), "Add existing account", 0, 100);
            if(text("Use phone or email").findOne(1000)){
                if(text("Use phone or email").findOne(1000).bounds().right < 0){
                    // 如果这个控件没有在当前屏幕上的话就点击一次下方的按钮，在点击后等待1秒
                    let action = textContains("Already have").findOne(1000)
                    if(action) {
                        action.click()
                        sleep(1000)
                    }
                }
                if(text("Use phone or email").findOne(1000).bounds().right > 0){
                    // 如果这个控件在当前屏幕上则直接跳出
                    break;
                }
            } else {
                let action = textContains("Already have").findOne(1000)
                if(action) action.click()
                else lh_find(text("Sign up").clickable(true), "Sign up", 0)
                sleep(1000)
            }
        }
        
        // 正式流程
        if (lh_find(text("Use phone or email"), "Use phone or email", 0)) {
        // if (clickOn(text("Use phone or email"))) {
            index = 10; // 防止不能跳出
            var 生日 = text("When’s your birthday?").visibleToUser().findOne(2000)
            if (生日) {
                console.hide()
                log("开始滑动");
                for (var ii = 1; ii < 3; ii++) {
                    var 年 = filter(function(uo){
                            return uo.depth() == 8 || uo.depth() == 9;
                        }).drawingOrder((ii + 1)).classNameEndsWith("view.View").findOne(1000)
                    if (年) {
                        var 坐标 = 年.bounds()
                        for (var i = 0; i < random(3, 4); i++) {
                            swipe(坐标.centerX(), 坐标.centerY(), 坐标.centerX(), device.height, 500)
                            sleep(1000)
                        }
                    }
                }
                console.show()
                if (lh_find(text("Next"), "Next", 0)) {

                }
            }
            if (lh_find(text("Email").id("android:id/text1"), "Email", 0, 15000)) {
                sleep(2000)
                //随机账号 = lh_randomStr(10, 15) + "@qq.com"
                随机账号 = 取注册()
                log(随机账号 + " " + setText(随机账号))
                sleep(500)
                if (lh_find(text("Next"), "Next")) {
                    // sleep(4000, 5000)
                    log("暂未处理异常检测，例如频繁")
                    while (1) {
                        // 加入频繁检测'
                        var 等待 = 
                            // depth(11).  // 如果出现异常再重新打开
                        drawingOrder(2).classNameEndsWith("view.View").visibleToUser().findOne(500)
                        if (等待) {
                            console.verbose("等待")
                        } else {
                            break
                        }
                        sleep(1500)
                    }
                    let 打码标记 = true;
                    // 开启线程来进行注册打码
                    if(ui.autoValidation.checked) {
                        threads.start(function(){
                            if (注册查看滑块()) {
                                while (打码标记 && !注册打码("关闭后续")) {
                                    console.verbose("打码失败！");
                                }
                                console.verbose("打码结束");
                            }
                        })
                    }
                    log("正在等待手动过验证码")
                    while(true){
                        if(!text("Refresh").findOne(1000)
                            && (text("Create password").findOne(500) 
                            || text("Log in").findOne(500))
                        ) {
                            // 当不存在刷新文字，且存在Next文字时判断为已经手动滑动;
                            log("验证码结束")
                            break;
                        }
                        sleep(500);
                    }
                    打码标记 = false;
                    function 过验证码后() {
                        var 设置密码 = text("Create password").visibleToUser().findOne(2000)
                        if (设置密码) {
                            log("设置密码 " + setText(ui.szmm.text()))
                            sleep(2000)
                            //You are visiting our service too frequently.
                            for (let wait = 0; wait < 4; wait++) {
                                var Next = text("Next").visibleToUser().findOne(1000)
                                if (Next) {
                                    log("Next " + Next.parent().parent().click())
                                    // 等待转圈
                                    while (1) {
                                        var 等待 = depth(8).drawingOrder(2).classNameEndsWith("view.View").visibleToUser().findOne(500)
                                        if (等待) {
                                            console.verbose("等待")
                                        } else {
                                            sleep(500);
                                            break;
                                        }
                                        sleep(1500);
                                    }

                                    var 频繁 = textContains("You are visiting our service too frequently").findOne(1000)
                                    if (频繁) {
                                        files.append(路径.注册频繁号, 随机账号 + "\n")
                                        stopScript("频繁了")
                                        return false
                                    }
                                    
                                    var 需要验证 = textContains("Enter 6-digit code").visibleToUser().findOne(1000)
                                    if (需要验证) {
                                        wait--;
                                        log("1需要验证邮箱6位验证码，等待输入验证码")
                                        while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                            sleep(3000)
                                        }
                                        log("离开验证码界面")
                                    }

                                    if (lh_find(text("Skip").clickable(true), "skip", 0)) {
                                        saveReg(随机账号, ui.szmm.text());
                                        log("注册成功了")
                                        return true
                                    }

                                    var 成功 = text("Sign up").visibleToUser().findOne(1000)
                                    if (成功) {
                                        if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lh", 0)) {
                                            saveReg(随机账号, ui.szmm.text());
                                            return true
                                        }
                                    }

                                }
                            }
                        } else {
                            log("找不到 Create password");
                        }
                        var 登录失败 = text("Login failed").visibleToUser().findOne(1000)
                        if (登录失败) {
                            log("登录失败,")
                            return false
                        }
                        var 访问频繁 = text("You are visiting our service too frequently.").visibleToUser().findOne(1000)
                        if (访问频繁) {
                            log("访问频繁,")
                            return false
                        }
                        var 成功 = text("Sign up").visibleToUser().findOne(1200)
                        if (成功) {
                            if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lha", 0, 2000)) {
                                return true
                            }
                        }
                    }

                    log("验证码已过")
                    // 失败返回false，在true的时候会跳出注册模式
                    tempSave.continue = 过验证码后();
                    log("注册结果：", tempSave.continue?"成功":"失败");
                }
            }
        }
        sleep(1000)
    }
    // 如果没有账号则直接注册，有账号则进入设置查看当前是否可以继续添加账号
}

function 注册7模式() {

    while (1) {
        if(清除数据()){
            // 打开TikTok
            // app.launchApp(appName)
            app.launch(appPackage)
            for (let j = 0; j < 5; j++) {
                // 检测登录文字
                let action = textContains("Sign up").findOne(2000)
                if(action) {
                    action.click();
                    break;
                }
                // 10秒内没有打开TikTok则重新打开
                if(!packageName(appPackage).findOnce(10000)){
                    // app.launchApp(appName)
                    app.launch(appPackage)
                }
            }
            // 注册
            for (let index = 0; index < 5; index++) {
                lh_find(text("Sign up").clickable(true), "Sign up", 0)
                let tag;
                for (let i = 0; i < 5; i++) {
                    lh_find(textContains("existing"), "Add existing account", 0);
                    // lh_find(text("Use phone or email"), "Use phone or email", 0)
                    if(text("Use phone or email").findOne(1000)){
                        if(text("Use phone or email").findOne(1000).bounds().right < 0){
                            // 如果这个控件没有在当前屏幕上的话就点击一次下方的按钮，在点击后等待1秒
                            let action = textContains("Already have").findOne(1000)
                            if(action) {
                                action.click()
                                sleep(1000)
                            }
                        }
                        if(text("Use phone or email").findOne(1000).bounds().right > 0){
                            // 如果这个控件在当前屏幕上则直接跳出
                            break;
                        }
                    } else {
                        let action = textContains("Already have").findOne(1000)
                        if(action) action.click()
                        else lh_find(text("Sign up").clickable(true), "Sign up", 0)
                        sleep(1000)
                    }
                }
                if (lh_find(text("Use phone or email"), "Use phone or email", 0)) {
                    index = 10; // 防止不能跳出
                    var 生日 = text("When’s your birthday?").visibleToUser().findOne(2000)
                    if (生日) {
                        console.hide()
                        for (var ii = 1; ii < 3; ii++) {
                            var 年 = depth(8).drawingOrder((ii + 1)).classNameEndsWith("view.View").findOne(1000)
                            if (年) {
                                var 坐标 = 年.bounds()
                                for (var i = 0; i < random(3, 4); i++) {
                                    swipe(坐标.centerX(), 坐标.centerY(), 坐标.centerX(), device.height, 500)
                                    sleep(1000)
                                }
                            }
                        }
                        console.show()
                        if (lh_find(text("Next"), "Next", 0)) {

                        }
                    }
                    if (lh_find(text("Email").id("android:id/text1"), "Email", 0, 15000)) {
                        sleep(2000)
                        //随机账号 = lh_randomStr(10, 15) + "@qq.com"
                        随机账号 = 取注册()
                        log(随机账号 + " " + setText(随机账号))
                        sleep(500)
                        if (lh_find(depth(11).text("Next"), "Next")) {
                            sleep(4000, 5000)
                            log("暂未处理异常检测，例如频繁")
                            while (1) {
                                // 加入频繁检测'
                                sleep(1500)
                                var 等待 = depth(11).drawingOrder(2).classNameEndsWith("view.View").visibleToUser().findOne(500)
                                if (等待) {
                                    console.verbose("等待")
                                } else {
                                    break
                                }
                            }
                            // if (注册查看滑块()) {
                            //     if (注册打码()) {
                            //     } else {
                            //         log("注册失败！")
                            //     }
                            // }
                            log("正在等待手动过验证码")
                            while(true){
                                if(!text("Refresh").findOne(1000)
                                    && (text("Create password").findOne(500) 
                                    || text("Log in").findOne(500))
                                ) {
                                    // 当不存在刷新文字，且存在Next文字时判断为已经手动滑动;
                                    log("验证码结束")
                                    break;
                                }
                                sleep(500);
                            }

                            function 过验证码后() {
                                var 设置密码 = text("Create password").visibleToUser().findOne(2000)
                                if (设置密码) {
                                    log("设置密码 " + setText(ui.szmm.text()))
                                    sleep(2000)
                                    //You are visiting our service too frequently.
                                    var Next = text("Next").visibleToUser().findOne(1000)
                                    if (Next) {
                                        log("Next " + Next.parent().parent().click())
                                        sleep(5000)
                                        var 频繁 = textContains("You are visiting our service too frequently").findOne(1000)
                                        if (频繁) {
                                            files.append(路径.注册频繁号, 随机账号 + "\n")
                                            stopScript("频繁了")
                                            return false
                                        }
        
                                        var 需要验证 = textContains("Enter 6-digit code").visibleToUser().findOne(1000)
                                        // if (需要验证) {
                                        //     stopScript("需要验证邮箱6位验证码")
                                        //     return false
                                        // }
                                        if (需要验证) {
                                            log("2需要验证邮箱6位验证码，等待输入验证码")
                                            while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                                sleep(3000)
                                            }
                                            log("离开验证码界面")
                                        }
        
                                        //text = Login failedtext = Sign up
                                        sleep(5000)
                                        var 成功 = text("Sign up").visibleToUser().findOne(1200)
                                        if (成功) {
                                            if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lh", 0, 5000)) {
                                                sleep(6000)
                                                return true
                                            }
                                        }
                                        if (lh_find(text("Skip").clickable(true), "skip", 0, 5000)) {
                                            if (text("Me").visibleToUser().findOne(5000)) {
                                            }
                                            log("注册成功了")
                                            return true
                                        }
        
                                        var 需要验证 = textContains("Enter 6-digit code").visibleToUser().findOne(1000)
                                        if (需要验证) {
                                            log("3需要验证邮箱6位验证码，等待输入验证码")
                                            while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                                sleep(3000)
                                            }
                                            log("离开验证码界面")
                                        }
                                        
                                        if (lh_find(text("Skip").clickable(true), "skip", 0)) {
                                            saveReg(随机账号, ui.szmm.text());
                                            log("注册成功了")
                                            return true
                                        }

                                        var 成功 = text("Sign up").visibleToUser().findOne(1000)
                                        if (成功) {
                                            if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lh", 0)) {
                                                saveReg(随机账号, ui.szmm.text());
                                                return true
                                            }
                                        }
                                    }
                                } else {
                                    log("找不到 Create password");
                                }
                                var 登录失败 = text("Login failed").visibleToUser().findOne(1000)
                                if (登录失败) {
                                    log("登录失败,")
                                    return false
                                }
                                var 访问频繁 = text("You are visiting our service too frequently.").visibleToUser().findOne(1000)
                                if (访问频繁) {
                                    log("访问频繁,")
                                    return false
                                }
                                var 成功 = text("Sign up").visibleToUser().findOne(1200)
                                if (成功) {
                                    if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lha", 0, 2000)) {
                                        
                                        return true
                                    }
                                }
                            }

                            log("验证码已过")
                            log("注册结果：", 过验证码后()?"成功":"失败");
                        }
                    }
                }
                sleep(1000)
            }
            // 循环结束位置
        }
    }
}
function saveReg(账号,密码) {
    let acc = 账号+','+密码;
    console.info("账号保存", acc);
    files.append(路径.注册完成号, "\n"+acc);
    threads.start(function(){
        server.add("register", {
            username: 账号,
            password: 密码
        });
    })
}
function 注册前往登录() {
    for (var i = 0; i < 2; i++) {
        var me = text("Me").visibleToUser().findOne(1000)
        if (me) {
            log("ok" + me.parent().click())
            sleep(1500)
        }

        if (lh_find(text("Sign up").clickable(true), "Sign up", 0)) {
            if (lh_find(text("Use phone or email"), "Use phone or email", 0)) {
                // sleep(2000) // 关闭看看有没有问题
                var 生日 = text("When’s your birthday?").visibleToUser().findOne(2000)
                if (生日) {
                    console.hide()
                    for (var ii = 1; ii < 3; ii++) {
                        var 年 = depth(8).drawingOrder((ii + 1)).classNameEndsWith("view.View").findOne(1000)
                        if (年) {
                            var 坐标 = 年.bounds()
                            for (var i = 0; i < random(3, 4); i++) {
                                swipe(坐标.centerX(), 坐标.centerY(), 坐标.centerX(), device.height, 500)
                                sleep(1000)
                            }
                        }
                    }
                    console.show()
                    if (lh_find(text("Next"), "Next", 0)) {

                    }
                }
                if (lh_find(text("Email").id("android:id/text1"), "Email", 0, 15000)) {
                    sleep(2000)
                    //随机账号 = lh_randomStr(10, 15) + "@qq.com"
                    随机账号 = 取注册()
                    log(随机账号 + " " + setText(随机账号))
                    sleep(1000)
                    if (lh_find(depth(11).text("Next"), "Next")) {
                        sleep(4000, 5000)
                        log("暂未处理异常检测")
                        while (1) {
                            // 加入频繁检测'
                            sleep(1500)
                            var 等待 = depth(11).drawingOrder(2).classNameEndsWith("view.View").visibleToUser().findOne(500)
                            if (等待) {
                                console.verbose("等待")
                            } else {
                                break
                            }
                        }
                        return true
                    }
                }
            }
        } else {
            log("已有用户登录了")
            break
        }
    }
}

function 注册查看滑块() {

    for (var i = 0; i < 60; i++) {
        console.verbose("等待验证码...")
        sleep(1500)
        // if (text("Refresh").clickable(true).exists()) {
        if (desc("Refresh").exists() || text("Refresh").exists()) {
            log("加载图片中")
            sleep(2000)
            break
        }
        if (text("Me").visibleToUser().exists()) {
            log("直接登录成功了")
            return true
        }
        var 没网络 = textContains("No network connection").findOne(500)
        if (没网络) {
            alert("没网络,脚本停止")
            exit()
        }
        var 没网络 = textContains("error").findOne(500)
        if (没网络) {
            click("FeedBack")
            sleep(2000)
            lh_find(depth(11).text("Next"), "Next")
        }
    }
    sleep(2000)
    log("验证码加载完成")
    return true;
    if (lh_find(desc("Refresh"), "刷新", 1)) {
        log("先等待出现日志'检测中...手动打码'之后再进行手动打码")
        sleep(5000)
        for (var i = 0; i < 60; i++) {
            
            // 点击到第二个按钮的时候就会出现弹窗 Report a problem
            let action = text("Submit").findOne(1000)
            if(action) className("android.widget.Image").find()[0].parent().click()
            
            sleep(2000)
            if (text("Loading...").exists()) {
                log("加载图片中")
            }
            if (text("Network issue. Please try again.").exists()) {
                lh_find(desc("Refresh"), "重新刷新", 1)
                sleep(3000)
            }
            if (text("Network issue. Please try again.").exists() && text("Loading...").exists()) {

            } else {
                log("完成")
                return true
            }
        }
    }
}

// 标记 tag 是用于安卓7循环使用
function 注册打码(tag) {
try{
    for (var ii = 0; ii < 3; ii++) {
        if (text("Me").visibleToUser().exists()) {
            saveReg(随机账号, ui.szmm.text());
            log("注册成功了");
            return true
        }
        //var 滑块范围 = indexInParent(2).depth(6).classNameEndsWith("view.View").findOne(2000)
    var 滑块范围 = depth(8).packageName(appPackage).className("android.view.View")
                .filter(function (uo) { 
                    let rect = uo.bounds();
                    if(
                        (uo.indexInParent() == 0 || uo.indexInParent() == 1)
                        && device.width * 0.5 < rect.right - rect.left
                        && device.height * 0.4 < rect.bottom - rect.top
                    ) {
                        return true;
                    }
                    return false; 
                }).findOne(2000)

        if (滑块范围) {
            var 坐标 = 滑块范围.bounds()
            var clip = images.clip(captureScreen(), 坐标.left, 坐标.top, 坐标.right - 坐标.left, 坐标.bottom - 坐标.top);
            log("截图打码——注册");
            var 返回 = 联众打码("lbh886633", "Libinhao886633", clip)
            if (返回) {
                if(返回!="end"){
                    返回 = Number(返回.split(",")[0]) + 坐标.left - 20
                    var 起点 = depth(13).packageName(appPackage).className("android.widget.Image").findOne(1000);
                }else{
                    起点 = 返回
                }
                if (起点) {
                    if(起点!="end"){
                        log("正在滑动——注册")
                        var 起点坐标 = 起点.parent().parent().bounds()
                        // swipe(起点坐标.centerX(), 起点坐标.centerY(), 返回 + (起点坐标.centerX() - 起点坐标.left), 起点坐标.centerY(), 1000)
                        if(swipe(起点坐标.centerX(), 起点坐标.centerY(), 返回 + (起点坐标.centerX() - 起点坐标.left), 起点坐标.centerY(), 2000)) {
                            sleep(500);
                            swipe(起点坐标.centerX(), 起点坐标.centerY(), 返回 + (起点坐标.centerX() - 起点坐标.left), 起点坐标.centerY(), 1000);
                        }
                        sleep(5000)
                    }
                    var 还在 = desc("Refresh").findOne(1500)
                    var 还在a = text("Refresh").findOne(300)
                    if (还在 || 还在a) {
                        log("刷新继续打码 " + 还在.click())
                        sleep(3000)
                        for (var i = 0; i < 60; i++) {
                            sleep(2000)
                            if (text("Loading...").exists()) {
                                log("加载图片中")
                            }
                            if (text("Network issue. Please try again.").exists()) {
                                lh_find(desc("Refresh"), "重新刷新", 1)
                                sleep(3000)
                            }
                            if (text("Network issue. Please try again.").exists() && text("Loading...").exists()) {

                            } else {
                                log("完成")
                                break
                            }
                        }
                    } else {
                        // 不需要继续流程，提前退出
                        if(tag) return true;
                        var 设置密码 = text("Create password").visibleToUser().findOne(2000)
                        if (设置密码) {
                            log("设置密码 " + setText(ui.szmm.text()))
                            sleep(2000)
                            //You are visiting our service too frequently.
                            var Next = text("Next").visibleToUser().findOne(1000)
                            if (Next) {
                                log("Next " + Next.parent().parent().click())
                                
                                // 等待转圈
                                while (1) {
                                    sleep(1500)
                                    var 等待 = text("Next").findOne(2000).parent().findOne(className("android.view.View"))
                                    if (等待) {
                                        console.verbose("等待")
                                    } else {
                                        sleep(1000)
                                        break
                                    }
                                }

                                var 频繁 = textContains("You are visiting our service too frequently").findOne(1000)
                                if (频繁) {
                                    files.append(路径.注册频繁号, 随机账号 + "\n")
                                    stopScript("频繁了")
                                    return false
                                }

                                var 需要验证 = textContains("Enter 6-digit code").visibleToUser().findOne(1000)
                                if (需要验证) {
                                    log("4需要验证邮箱6位验证码，等待输入验证码")
                                    while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                        sleep(3000)
                                    }
                                    log("离开验证码界面")
                                }

                                //text = Login failedtext = Sign up
                                sleep(5000)
                                var 成功 = text("Sign up").visibleToUser().findOne(1200)
                                if (成功) {
                                    saveReg(随机账号, ui.szmm.text());
                                    if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lh", 0, 5000)) {
                                        sleep(6000)
                                        return true
                                    }
                                }
                                if (lh_find(text("Skip").clickable(true), "skip", 0, 5000)) {
                                    if (text("Me").visibleToUser().findOne(5000)) {
                                    }
                                    saveReg(随机账号, ui.szmm.text());
                                    log("注册成功了")
                                    return true
                                }

                                var 需要验证 = textContains("Enter 6-digit code").visibleToUser().findOne(1000)
                                /* if (需要验证) {
                                    stopScript("需要验证邮箱6位验证码")
                                    return false
                                } */
                                if (需要验证) {
                                    log("5需要验证邮箱6位验证码，等待输入验证码")
                                    while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                        sleep(3000)
                                    }
                                    log("离开验证码界面")
                                }
                                
                                if (lh_find(text("Skip").clickable(true), "skip", 0)) {
                                    saveReg(随机账号, ui.szmm.text());
                                    log("注册成功了")
                                    return true
                                }

                                var 成功 = text("Sign up").visibleToUser().findOne(1000)
                                if (成功) {
                                    if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lh", 0)) {
                                        saveReg(随机账号, ui.szmm.text());
                                        return true
                                    }
                                }
                            }
                        } else {
                            log("找不到 Create password");
                        }
                        var 登录失败 = text("Login failed").visibleToUser().findOne(1000)
                        if (登录失败) {
                            log("登录失败,")
                            return false
                        }
                        var 访问频繁 = text("You are visiting our service too frequently.").visibleToUser().findOne(1000)
                        if (访问频繁) {
                            log("访问频繁,")
                            return false
                        }
                        var 成功 = text("Sign up").visibleToUser().findOne(1200)
                        if (成功) {
                            if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lha", 0, 5000)) {
                                sleep(6000)
                                return true
                            }
                        }
                    }
                }
            }
        } else {
            log("没有找到需要打码的控件范围")
        }
    }
}catch(err){
    console.error("重试打码：", err)
    sleep(1000);
    注册打码()
}
}

function 取注册() {
    if (!files.exists(路径.zhuce)) {
        alert("没有找到", 路径.zhuce)
        exit()
    }
    var 读取 = files.read(路径.zhuce)
    if (读取) {
        var 分割 = 读取.split("\n")
        var 账号a = 分割[0].split("，")
        账号 = 账号a[0]
        密码 = 账号a[1]
        log(账号a[0])
        log(账号a[1])
        log("删除数据 " + 分割.splice(0, 1))
        newtext = 分割.join('\n');
        files.write(路径.zhuce, newtext);
        return 账号a[0]
    } else {
        alert("没号了,脚本停止")
        exit()
    }
}

function lh_randomStr(mix, max) {
    var seed = new Array('abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0123456789');
    var idx, i;
    var result = '';
    for (i = 0; i < random(mix, max); i++) {
        idx = Math.floor(Math.random() * 3);
        result += seed[idx].substr(Math.floor(Math.random() * (seed[idx].length)), 1);
    }
    return result;
}

// if(起点!="end") 返回end则为已经打码
function 联众打码(username, password, img) {
    let result;
    threads.start(function () {
        if(tempSave.自动打码) result = 联众打码_原版(username, password, img);
    });
    log("检测中...请手动打码");
    while(!result){
        if(!text("Refresh").findOne(1000)
            && (text("Create password").findOne(500) 
            || text("Log in").findOne(500))
        ) {
            // 当不存在刷新文字，且存在Next文字时判断为已经手动滑动;
            result = "end";
            break;
        }
        let uo = text("Next").findOne(1000);
        if(uo) uo.click()
        sleep(1000);
    }
    // 可能会长时间无响应，'800,200'是超时的假数据，'400,200'是其他异常
    if(result == "end"){
        console.info("已手动过验证码");
    } else if (result == '800,200') {
        console.error("超时！");
    } else if (result == '400,200') {
        console.warn("其它异常！");
    }
    return result;
}
function 联众打码_原版(username, password, img) {
    //1318
    http.__okhttp__.setTimeout(3e4);
    var r = images.toBase64(img, format = "png"),
        i = device.release,
        c = device.model,
        s = device.buildId;
    try {
        log("发出请求")
        var n = http.postJson("https://v2-api.jsdama.com/upload", {
            softwareId: 20856,
            softwareSecret: "01ZiVevmC6iDQsccEcrMI5ZwcjNLuTh0OWG8JGN9",
            username: username,
            password: password,
            captchaData: r,
            captchaType: 1318,
            captchaMinLength: 1,
            captchaMaxLength: 1,
            workerTipsId: 0
        }, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android " + i + "; " + c + " Build/" + s + "; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 Mobile Safari/537.36",
            }
        });
        log("请求结束")
    } catch (e) {
        log("请求异常")
        console.verbose(e)
        // 假数据
        return "800,200";
        return {
            code: "-1",
            msg: "网络链接超时...",
            data: {}
        };
    }

    var d = n.body.json(),
        p = d.code,
        m = d.message;

    if ("0" == p) {
        return d.data.recognition
        // return {
        //     code: p,
        //     msg: m,
        //     data: {
        //         res: d.data.recognition
        //     }
        // };
    }
    log("响应码：", p, "   消息：",m,"   数据如下：");
    log(d);
    if("10106009" == p){
        console.error("结束脚本", m);
        exit();
    }
    // 假数据
    return "400,200";
    if ("10079009" == p) return {
        code: p,
        msg: m,
        data: {}
    };
    if ("10142006" == p) return {
        code: p,
        msg: m,
        data: {}
    };
    if ("10142004" == p) return {
        code: p,
        msg: m,
        data: {}
    };
    if ("10142005" == p) return {
        code: p,
        msg: m,
        data: {}
    };
    if ("10079006" == p) return {
        code: p,
        msg: m,
        data: {}
    };
    return d;
}

// cmd 命令  tag 沉默执行
function xx(cmd,tag) {
    tempSave.firstEnvi++
    // 剩余时间不足或者连接数不够了
    if (!tag && !packageName(app.getPackageName("xx抹机神器")).exists()) {
        app.launchApp("xx抹机神器")
        sleep(random(5000, 6000))
    }
    files.write("/data/data/zpp.wjy.xxsq/share/cmd.txt", cmd)
    sleep(1000)
    while (1) {
        var result = files.read("/data/data/zpp.wjy.xxsq/share/cmd_return.txt")
        log(result + " " + cmd)
        if (/正在处理/.test(result)) {

        } else if (/没有环境了/.test(result)) {
            if(tempSave.firstEnvi<4){
                tempSave.firstEnvi++    // 避免只有一个环境时一直切换失败
                // 前两次就切换失败时启用切换到第一个环境
                if(firstEnvi()) continue;
            }
            if(!isNaN(parseInt(tempSave.没环境))) {
                if(5 < tempSave.没环境++) {
                    log("结束脚本", tempSave.没环境)
                    exit()
                }
            } else tempSave.没环境=0;
            
            // 如果是从头开始则不继续切换环境
            if(ui.first_start.checked || ui.nofor.checked) {
                log("遍历结束")
                return false
            }

            if (切换类型 == "切换到下一个环境") {
                切换类型 = "切换到上一个环境"
                cmd = 切换类型
                files.write("/data/data/zpp.wjy.xxsq/share/cmd.txt", 切换类型)
                sleep(2000)
            } else {
                if (切换类型 == "切换到上一个环境") {
                    切换类型 = "切换到下一个环境"
                    cmd = 切换类型
                    files.write("/data/data/zpp.wjy.xxsq/share/cmd.txt", 切换类型)
                    sleep(2000)
                }
            }
        } else if (/剩余时间不足或者连接数不够了/.test(result)) {
            console.error(result);
            exit()
        } else {
            return result
        }
        sleep(3000)
    }
}

// 将from文件夹下的随机一个文件 复制 到to文件夹中，rt 标记删除原文件
function 移动文件(from,to,rt) {
    let file = files.listDir(from);
    if (file.length > 0) {
        // 清空 1 文件夹
        files.listDir(to).forEach(n=>{
            console.verbose(
                "删除文件 " + n,
                files.remove(files.join(to,n))
            )
        });
        // 随机抽取一个文件
        file = file[random(0, file.length)];
        let toPath = files.join(to, file);
        let fromPath = files.join(from, file);
        log("复制文件：\n从：  " + fromPath + "\n到：  " + toPath)
        files.copy(fromPath, toPath);
        // media.scanFile(from);
        media.scanFile(toPath);
        if(rt) {
            log("移动原文件到回收站，原文件：", fromPath, files.move(fromPath, files.join(路径.文件夹.回收站, file)))
        }
    } else {
        alert(from + "路径没有文件了，脚本停止");
        exit()
    }
}

function back移动文件(路径一, 路径二) {
    var 路径a = 路径二
    var 文件集a = files.listDir(路径a)
    if (文件集a.length > 0) {
        for (let index = 0; index < 文件集a.length; index++) {
            files.remove(路径a + 文件集a[index])
            media.scanFile(路径a + 文件集a[index]);
        }
    }
    var 路径 = 路径一
    var 文件集 = files.listDir(路径)
    log(文件集.length)
    if (文件集.length > 0) {
        var 文件路径 = 路径 + 文件集[random(0, 文件集.length - 1)]
        var 移动路径 = 路径a + 文件集[random(0, 文件集.length - 1)]
        log("移动文件 ", files.move(文件路径, 移动路径))
        media.scanFile(文件路径);
        media.scanFile(移动路径);
    } else {
        alert("图片或者视频没了,脚本停止")
        exit()
    }
}


// --------------------------------------------

function cancelDelete(num) {
    errorEnvi.push(num)                         // 保存当前失败环境
    files.append(路径.失败环境列表,"//"+num)     // 写入到文件中
    return true;
}

// 切换到第一个环境
function firstEnvi(name, package) {
    home();
    sleep(200);
    // 打开xx抹机
    if (!app.launchApp(name || "xx抹机神器")) {
        toastLog("程序打开失败！");
        return false;
    }

    sleep(3000)
    let leftTopBut, enviListStr;
    try{
        for (let LLL = 0; LLL < 5; LLL++) {
            console.verbose("正在获取环境列表");
            // 不在xx神器中，跳出
            if( 2<LLL && !packageName(package || "zpp.wjy.xxsq").findOne(300)){
                log("不在xx神器中");
                break;
            }

            // 获取环境列表
            enviListStr = text("环境列表").filter(function(uo){
                uo = uo.bounds()
                return uo.right>0
            }).findOne(1000);
            // enviList = id("recycler_envs").findOne(1000);
            if(!enviListStr){
                // 获取失败时打开左侧
                leftTopBut = id("iv_envlist").findOne(1000);
                log("打开侧边栏");
                if(leftTopBut) {
                    sleep(1000);
                    leftTopBut.click();
                }
            }
            
            if (enviListStr) {
                let childList
                for (let KKK = 0; KKK < 3; KKK++) {
                    // 如果为0，则重试重新获取
                    // 拿到环境列表
                    childList = id("recycler_envs").findOne(1000).children();
                    log("当前获取到的环境列表数量：", childList.length);
                    if(childList.length<1) log("重新获取中...本次获取到的数量：",childList.length);
                    else break;
                }
                if (childList.length > 0) {
                    // 下滑
                    let previous = [], now = [];
                    do {
                        if(now.length > 0){
                            swipe(2, device.height*0.4,2,device.height*0.8, 300)
                        }
                        previous = now;
                        now = [];
                        id("recycler_envs").findOne(1000).find(className("android.widget.TextView").filter(function(u){
                            let t = u.text();
                            if(t.indexOf(":") < 0){
                                now.push(t)
                            }
                            return false;
                        }));
                    }while(now.sort().toString() != previous.sort().toString())
                    
                    // 点击第一个环境
                    if(click(2, childList[0].bounds().centerY())/* swipe(2, y, 100, y, 100) */){
                        // 点击切换
                        try{
                            sleep(500)
                            text("切换").findOne(2000).parent().click()
                            sleep(1000)
                            try{ text("继续切换").findOne(200).click() }catch(e){ console.verbose("没有 继续切换 文字 ") }
                            let tagI = 0;
                            for (let i = 0; i < 50; i++) {

                                if(text("结束应用进程").find().length==0
                                && text("恢复应用数据").find().length==0
                                && text("自动保存应用数据").find().length==0
                                ) 
                                    break
                                if(++tagI%4 == 0) console.verbose("等待加载中...");
                                sleep(300)
                            }
                            break;
                        }catch(e){console.warn(e)}
                    }
                } else {
                    toastLog("环境列表为空，结束脚本");
                    exit();
                    return false;
                }
            }

            sleep(1000)
        } 
    }catch(e){
        home();
        log("异常，回到桌面后重试", e)
    }
    if(!packageName(package || "zpp.wjy.xxsq").findOne(50)) {
        log("当前不在xx抹机神器内，尝试重新打开");
        firstEnvi(name, package);
    }
    return true;
}

function 切换环境(cmd) {
    // 停止xx神器
    // log("脚本将在4秒后继续运行，xx神器停止状态码："+shell("am force-stop zpp.wjy.xxsq", true).code)
    // sleep(4000)
    // 确保当前已经进入xx
    let sleepTag = true
    log("等待进入xx主界面")
    do{ 
        // 似乎没用
        try{text("继续切换").findOne(200).click()}catch(e){console.verbose("没有 继续切换 文字 ")}
        if(textContains("剩余时间不足或者连接数不够了").findOne(100)) {
            console.error("停止脚本\n剩余时间不足或者连接数不够了！")
            exit();
        }
        // 判断当前是否是xx主界面
        if(id("main_center").packageName(app.getPackageName("xx抹机神器")).findOne(1000)) break
        else {
            // 判断是否是xx助手内
            if (packageName(app.getPackageName("xx抹机神器")).exists()) {
                if(sleepTag){
                    // 等待2秒
                    sleep(2000)
                    sleepTag = false
                }else{
                    // 返回桌面
                    home()
                    sleepTag=true
                }
            }else{
                // 不在xx内，启动xx
                app.launchApp("xx抹机神器")
                sleep(random(5000, 6000))
            }
        }
    }while(true)

    // xx(cmd) 返回值 true
    let tag = xx("获取当前环境名称"), re;       // A环境 (814) 获取当前环境名称
    do{
        re = xx(cmd);   // 执行失败: 没有环境了 切换到下一个环境 true 切换到上一个环境
        let newTag = xx("获取当前环境名称");    // B环境 (113) 获取当前环境名称
        if(tag != newTag)       // 是否成功切换
            if(!是否是失败环境())// 是否是正常环境
                break;          // 都通过后跳出
        sleep(1000)
    } while (cmd == "切换到下一个环境" || cmd == "切换到上一个环境")   // 命令是切换环境，但是环境是失败环境时
    return re;
}

// 中间的红蓝球加载动画
function 等待加载(s,num) {
    if(!(num>1)) num = 100
    let i = 0
    sleep(s||2000)
    for (; i < num; i++) {
        if(!className("android.widget.ProgressBar")
        .boundsInside(device.width*0.4,device.height*0.4,device.width*0.6,device.height*0.6)
        .findOnce())
            if(id("ca_").boundsInside(0,0, device.width,device.height).find().length==0) 
                break
        if(i%5==0) console.verbose("等待加载中")
        sleep(300)
    }
    return i < num
}

function 是否是失败环境() {
    let nowEnvi = xx("获取当前环境名称")
    for (let envi in errorEnvi) {
        envi = errorEnvi[envi];
        if(nowEnvi==envi){
            log("当前环境在失败列表中")
            return true;  // 失败环境
        }
    }
    log("当前环境未在失败列表")
    return false;   // 未加入失败环境列表
}

function 初始化() {

    // files.ensureDir(路径.失败环境列表.substring(0,路径.失败环境列表.lastIndexOf("/")));
    try{
        // 文件不存在则创建文件
        if(!files.exists(路径.失败环境列表)) 
            files.create(路径.失败环境列表,"");
        // 从文件中读取
        let data = files.read(路径.失败环境列表).split("//")
        try{
            errorEnvi = JSON.parse(data[0]);
        }catch(e){
            console.warn("失败环境列表读取失败！")
            files.copy(路径.失败环境列表,
                路径.失败环境列表.substring(0,
                    路径.失败环境列表.lastIndexOf("/"))
                    +"失败环境备份"
                    +new Date().toLocaleTimeString()
                    +".txt"
            )
        }
        for (let i = 1; i < data.length; i++) 
            errorEnvi.push(data[i]);
        
        // 去重并重新写回文件中
        let t={}
        for (let name in errorEnvi){
            name = errorEnvi[name]; 
            t[name]=0;
        }
        errorEnvi = [];
        for (let k in t) {
            errorEnvi.push(k);
        }
        files.write(路径.失败环境列表,JSON.stringify(errorEnvi));

        /* 
        threads.start(function () {
            let path;
            for (let name in errorEnvi) {
                name = errorEnvi[name];
                path = files.join(路径.文件夹.XX环境, name);
                if(files.isDir(path)){
                    // 移动文件
                    files.move(path, files.join(路径.文件夹.回收站, name));
                }
            }
        })
 */
    }catch(e){
        console.verbose(e);
    }
}


function detectionStateDialog() {
    if(text("Account Status").find().length>0)
        if(text("OK").findOne(100).click()){
            sleep(1000);
            return true;
        }
    let uo = text("Skip").findOne(100)
    if(uo) uo.click();
    uo = textContains("Swipe up for more").findOne(100)
    if(uo) 随机滑动()
    return false;
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

/**
 * 
 * @param {*} getActionFun 控件选择器   .packageName(pack).findOne(s)
 * @param {*} s 每一次等待时间          500
 * @param {*} ds 找到控件后多久才点击   0
 * @param {*} pack 当前报名包名
 */
function clickAction(getActionFun, s, ds,pack) {
    if(typeof getActionFun != "function"){
        if (getActionFun.getClass() == selector().getClass()) {
            if (!(s >= 0)) s = 500;
            let us = getActionFun;
            getActionFun = function() {
                if(pack)
                return us.packageName(pack).findOne(s)
                return us.findOne(s)
            };
        }
    } else return;
    let i = 0;
    do {
        let action = getActionFun();
        if (action) {
            sleep(ds||0);
            if (action.click())
                break;
            else {
                let rect = action.bounds();
                if (click(rect.centerX(), rect.centerY()))
                    break;
            }
            console.verbose("点击失败！已找到控件，并且控件点击与坐标点击均失败");
        }
    } while (++i < 50)
    if (i >= 50) {
        log("点击控件超时！")
        return false;
    }
    return true;
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
 * 打开TikTok并进入个人信息界面
 * @param {*} run 任意值，传入则代表 主页检测
 * @param {*} tag 自己递归计算次数使用
 */
function runTikTok(run,tag) {
    // if(!run) app.launchApp(appName);
    app.launch(appPackage)
    let tagI = 0;
    let limit = 50;
    let countTagI = tag||tagI;

    if(countTagI>=limit*4) {
        console.error("多次启动失败！")
        return false;
    }
    
    let info={};
    // 没有获取到个人信息，或者 (tagI<5 并且 数据为0)
    while (true) {

        log("账号信息检测")
        try{
            // 点击个人信息，没有点击的情况下不会去尝试获取信息
            if(text("Me").findOne(2000).parent().click()) {
                if(!tempSave.daily && ui.mi6_reg.checked){
                    log("注册模式")
                    return false;
                }
                // 获取到个人信息s
                info = getFansInfo("个人信息", true);
            }
            // 跳过刚开始时的默认值 0 ，在次数达到3次之后0也是有效值
            if (!((info.focusNumber <= 0) && (info.fansNumber <= 0) && (info.likeNumber <= 0)) 
                || 3 < tagI)
                break;
        }catch(err){
            console.verbose("获取账号信息异常", err)
        }

        // 检测弹窗
        popupDetection(500);
        
        // 超时
        if(tagI>=limit) {
            log("本轮检测超时")
            break;
        }

        // 检测无账号
        if(text("Sign up").clickable(true).findOne(200)){
            console.verbose("无账号");
            info = null;
            break;
        }

        // 检测是否是登录界面
        if(detectionLoginView()) back();
        // 检测不在首页的情况
        if( 1 < tagI) 返回首页();
        // 标记自增
        tagI++;
        // log提示语句
        console.verbose("等待" + appName + "启动中..." + tagI);
    }

    if(!info || (-1 == info.focusNumber) && (-1 == info.fansNumber) && (-1 == info.likeNumber)){
        console.warn("无账号");
        // 账号异常
        // let path = 路径.文件夹.账号 + xx("获取当前环境名称", true) + ".log"
        // files.append(path, new Date().toLocaleTimeString() +",账号失效！\n");
        return false;
    }

    if(tagI>=limit) {
        countTagI += tagI;
        // 停止抖音
        强行停止();
        return runTikTok(false,countTagI);
    }else log(appName + "启动完成");
    // 账号数据
    // info.enviName = xx("获取当前环境名称", true);
    info.enviName = "SMN5_" + device.getAndroidId();
    accountInfo = info;
    accountInfo.envi = accountInfo.username+"@"+accountInfo.enviName;
    let path = 路径.文件夹.账号 + info.enviName + ".log"
    // 格式： 时间,对象\n 
    files.append(path,new Date().toLocaleDateString()+" "+ new Date().toLocaleTimeString() +","+ JSON.stringify(accountInfo)+"\n");
    console.info("账号信息获取并保存完成");

    return info;
}

function 添加并打开分身(name) {
    // 打开app 
    if(!app.launchApp("应用多开-64bit")) {
        toastLog("程序未安装：应用多开-64bit");
        return false;
    }
    clickAction(text("添加应用"),300,100,app.getPackageName("应用多开-64bit"));
    let endUO;
    while(text("添加应用").findOne(1000)){
        sleep(1000);
        let appUO = text(name).findOne(100)
        if(appUO) {
            if(appUO.parent().parent().click())
                break;
        }
        else {
            swipe(10,device.height*0.8,10,device.height*0.2,100)
        }
        
        let childs = className("android.widget.ListView").findOne(10).children();
        if(endUO == childs[childs.length-1]){
            log("未找到要分身的app",name);
        }else {
            endUO = childs[childs.length-1];
        }
    }
    text("打开").findOne(1000).click();
}

function 抖音分身注册() {
    // 关闭xx函数
    let xxBackup = xx;
    xx = function(){}
    // 跳过第一屏s
    let tag=0;
    while(text("Sign up").find().length<1 && 5>tag++){
        新环境();
    }
    if(text("Me").findOne(2000).parent().click() ||i<50 ) {
       // 注册
        if (注册前往登录()) {

            // 在输入完账号，点击下一步的附近可能会出现弹窗，关闭弹窗 Report a problem
            let action = text("Submit").findOnce()
            if(action) className("android.widget.Image").find()[0].parent().click()            
            
            if (注册查看滑块()) {
                if (注册打码()) {

                } else {
                    log("注册失败！")
                }
            }
        }
    }
    // 恢复xx函数
    xx = xxBackup;
}
// 新环境检测
function 新环境(s) {
    if(!(s>0)) s = 30;
    for (let i = 0; i < s; i++) {

        let action = text("Skip").findOne(100);
        if(action) action.click();
        
        action = text("Start watching").findOne(100);
        if(action) action.click(); 
        
        action = text("Swipe up for more").findOne(100);
        if(action) 随机滑动(); 
        
        if( text("Me").findOne(100) ) {
                break;
        }
        sleep(500);
    }
}
function sm停止TikTok() {
    log("停止TikTok");

    let settingPackage = "com.android.settings";
    let clickNum = 0;
    let 操作 = [
        step(
            "打开应用界面"
            , function() { return !(packageName(settingPackage).findOne(1000)) }
            , function() {
                // 打开抖音应用详情页面
                app.startActivity({
                    packageName: settingPackage,
                    className: "com.android.settings.applications.InstalledAppDetails",
                    data: "package:" + appPackage
                })
            }
        )
        , step(
            "OK"
            , function(){ return (this.uo = text("OK").packageName(settingPackage).findOne(200) 
                                         || text("确定").packageName(settingPackage).findOne(200)) }
        )
        , step(
            "FORCE STOP"
            , function(){ return (this.uo = text("FORCE STOP").packageName(settingPackage).findOne(200) 
                                         || text("强制停止").packageName(settingPackage).findOne(200)) }
            , null
            , function(){
                // 点击成功进行等待并且计数
                if(3 <= clickNum++) return "跳出循环执行";
                sleep(300)
            }
        )
        /* 
        , step(
            "FORCE STOP"
            , function(){ return (this.uo = text("FORCE STOP").packageName(settingPackage).findOne(200) 
                                         || textContains("强制停止").packageName(settingPackage).findOne(200))
                                    && !(text("CANCEL").packageName(settingPackage).findOne(200) 
                                        || text("取消").packageName(settingPackage).findOne(200))
                         }
        )
        
        // , step(
        //     "FORCE STOP"
        //     , function(){ return (this.uo = text("FORCE STOP").packageName(settingPackage).filter(function(uo){
        //                             let rect = uo.bounds();
        //                             return device.height*0.5 < rect.centerX() && rect.centerX() < device.height*0.7
        //                         }).findOne(200) 
        //                     || textContains("强制停止").packageName(settingPackage).filter(function(uo){
        //                         let rect = uo.bounds();
        //                         return device.height*0.5 < rect.centerX() && rect.centerX() < device.height*0.7
        //                     }).findOne(200)) 
        //                 && (text("CANCEL").packageName(settingPackage).findOne(200) 
        //                     || text("取消").packageName(settingPackage).findOne(200))
        //                 }
        // )
        , step(
            "FORCE STOP1"
            , function(){ return (this.uo = text("FORCE STOP").packageName(settingPackage).findOne(200) 
                                         || textContains("强制停止").packageName(settingPackage).findOne(200))}
        )
        , step(
            "FORCE STOP2"
            , function(){ return (this.uo = text("FORCE STOP").packageName(settingPackage).findOne(200) 
                                         || textContains("强制停止").packageName(settingPackage).findOne(200))}
        )
        , step(
            "FORCE STOP3"
            , function(){ return (this.uo = text("FORCE STOP").packageName(settingPackage).findOne(200) 
                                         || textContains("强制停止").packageName(settingPackage).findOne(200))}
        )
        , step(
            "FORCE STOP4"
            , function(){ return (this.uo = text("FORCE STOP").packageName(settingPackage).findOne(200) 
                                         || textContains("强制停止").packageName(settingPackage).findOne(200))}
        ) */
    ]

    循环执行(操作);
    return true;
}
function sm清除数据() {
    log("清除数据");

    let settingPackage = "com.android.settings";
    let 操作 = [
        step(
            "打开应用界面"
            , function() { return !(packageName(settingPackage).findOne(1000)) }
            , function() {
                // 打开抖音应用详情页面
                app.startActivity({
                    packageName: settingPackage,
                    className: "com.android.settings.applications.InstalledAppDetails",
                    data: "package:" + appPackage
                })
            }
        )
        , step(
            "Storage"
            , function(){ return (this.uo = textContains("Storage").packageName(settingPackage).findOne(200) 
                                         || textContains("存储").packageName(settingPackage).findOne(200)) }
        )
        , step(
            "CLEAR DATA"
            , function(){ return (this.uo = text("CLEAR DATA").packageName(settingPackage).findOne(100) 
                                         || text("清除数据").packageName(settingPackage).findOne(100))}
        )
        , step(
            "DELETE"
            , function(){ return (this.uo = text("DELETE").packageName(settingPackage).findOne(200) 
                                         || text("删除").packageName(settingPackage).findOne(200))}
        )
        , step(
            "0B"
            , function(){ 
                this.uo = text("0B").packageName(settingPackage).find();
                if(this.uo.length == 2) return this.uo;
                return (this.uo = text("0 B").packageName(settingPackage).find())
            }
            , function(){ if(this.uo.length == 2) return "跳出循环执行" }
        )
    ]
    循环执行(操作)

    log("清除完成。 ");
    return true;
}

function 清除数据() {
    log("取消清除数据")
    return false;
    log("清除数据");
    let settingPackage = "com.android.settings";
    log("打开应用详情界面");
    do{
        // 打开抖音应用详情页面
        app.startActivity({
            packageName: settingPackage,
            className: "com.android.settings.applications.InstalledAppDetails",
            data: "package:" + getPackageName("TikTok")
        })

        if(packageName(settingPackage).exists()) {
            back();
        }
    } while (!text("Data usage").packageName(settingPackage).findOne(1000)
        && !text("流量使用情况").packageName(settingPackage).findOne(1000))
        
    log("清除数据中...");
    let i=0;
    while(++i < 20){
        let action = [];
        // 清除数据
        try{
            action = textContains("Storage").packageName(settingPackage).findOne(200)
            if(action) action.parent().parent().click();
            action = textContains("used in internal storage").packageName(settingPackage).findOne(200)
            if(action) action.parent().parent().click();
            action = textContains("内部存储空间已使用").packageName(settingPackage).findOne(200)
            if(action) action.parent().parent().click();

            action = text("CLEAR DATA").findOne(100);
            if(action) action.click();
            action = text("Clear storage").findOne(100);
            if(action) action.click();
            action = text("清除存储空间").findOne(100);
            if(action) action.click();
            action = text("清除数据").findOne(100);
            if(action) action.click();

            action = text("OK").findOne(200);
            if(action) action.click();
            action = text("确定").findOne(200);
            if(action) action.click();

            action = text("0B").find();
            if(action.length==2) break;
            action = text("0 B").find();
            if(action.length==2) break;
        } catch(err){
            console.verbose("清除异常", err)
        }
    }
    log("清除结束。 ", i);
    return i < 20;
}

function 强行停止() {
    let code = -1;
    log("强行停止");
    let settingPackage = "com.android.settings";
    log("打开应用详情界面");
    while (!text("Data usage").packageName(settingPackage).findOne(1000)
        && !text("流量使用情况").packageName(settingPackage).findOne(1000)) {
        if(packageName(settingPackage).exists()) back();
        // 打开抖音应用详情页面
        app.startActivity({
            packageName: settingPackage,
            className: "com.android.settings.applications.InstalledAppDetails",
            data: "package:" + getPackageName("TikTok")
        })
    }
    log("强行停止中...");
    try{
        let action = text("FORCE STOP").findOne(500);
        if(!action) action = text("强行停止").findOne(500);

        if(action.click()) {
                action = text("OK").findOne(1000);
                if(!action) action=text("确定").findOne(1000);
                if(!action.click()) {
                    throw "点击确定失败";
                }else {
                    code = 0;
                }
        }else throw "点击强行停止";
    }catch(err){
        console.verbose(err)
        code = shell(getPackageName("TikTok"), true).code;
        // 使用shell命令停止
        log("TikTok停止状态码：" + code);
    }
    log("稍等");
    sleep(1000)
    return code;
}
function stopScript(msg){
    toastLog(msg);
    console.error("脚本结束");
    exit();
}

// 弹窗检测
function popupDetection(time, exceptionLog) {
    time = time || 3000;
    let action=[];
    let funList = [
        function (t) {  // Okay 按钮
            action = text("Okay").findOnce()
            if (action) action.click();
        },
        function (t) {  // OK   按钮
            action = text("OK").findOnce()
            if (action) action.click();
        },
        function (t) {   // 邮箱输入完，滑动验证码可能会点击到第二个按钮出现弹窗 Report a problem
            let action = text("Submit").findOnce()
            if (action) className("android.widget.Image").find()[0].parent().click()
        },

        function (t) {  // Swipe up for more
            action = text("Swipe up for more").findOne(t);
            if (action) 随机滑动();
        },
        function (t) {  // Account Status
            action = text("Account Status").findOne(t);
            if (action) text("OK").findOne(t).click();
        },
        function (t) {  // Update username
            action = text("Update username").findOne(t)
            if (action) {
                action = className("android.widget.ImageView")
                        .filter(function (u) { return (u.bounds().left > device.width * 0.5); })
                        .findOne(10);
                if (action) action.click();
            }
        },
        function (t) {  // Skip 按钮
            action = text("Skip").find();
            if (action.length > 0) action[0].click();
        },
        function (t) {  // Start watching
            action = text("Start watching").findOne(t);
            if (action) action.click();
        },
        function (t) {   // ALLOW  Allow  允许 系统授权
            action = text("ALLOW").findOne(t*0.4);
            if (action) action.click();
            action = text("Allow").findOne(t*0.4);
            if (action) action.click();
            lh_find(text("允许"),null,0,t*0.4)
        },
        function (t) {   // CANCEL 取消弹窗，一般是账号不存在
            action = packageName(appPackage).text("CANCEL").findOne(t)
            if (action) {
                action.click();
                sleep(500);
            }
        },
        function (t) {   // 通知权限被关闭时，取消选择  Later
            action = packageName(appPackage).text("Later").findOne(t)
            if (action/*  && textContains("Notifications keep").findOne(500) */)
                action.click();
        },
        function (t) {   // Agree and continue 同意并继续
            action = packageName(appPackage).text("Agree and continue").findOne(t)
            if (action)
                action.click();
        },
/*         function (t) {   // xx神器 登录网络异常
            if (packageName("zpp.wjy.xxsq").text("网络连接失败").findOne(t*0.2)
                || packageName("zpp.wjy.xxsq").text("网络访问超时").findOne(t*0.2)
                || 1 < packageName("zpp.wjy.xxsq").text("登录").find().length) {
                text("xx神器登录 - 网络异常");
                back();
            }
        }, */

        function (t) {  // 米6 更新账号 Update username 
            let action = boundsInside(100, 100, 1000, 1500).text("Update username").findOne(t)
            if (action) {
                action = className("ImageView").boundsInside(800, 500, 1000, 700).findOne(10);
                if (action) action.click()
            }
        },
        function(t) {
            let action = text("When’s your birthday?").visibleToUser().findOne(t)
            if (action) {
                consoleDisplay(false)
                for (var ii = 1; ii < 3; ii++) {
                    var year = depth(8).drawingOrder((ii + 1)).classNameEndsWith("view.View").findOne(1000)
                    if (year) {
                        var point = year.bounds()
                        for (var i = 0; i < random(3, 4); i++) {
                            swipe(point.centerX(), point.centerY(), point.centerX(), device.height, 500)
                            sleep(1000)
                        }
                    }
                }
                consoleDisplay(true)
                if (lh_find(text("Next"), "Next", 0)) {}
            }
        }
    ]
    try{
        for (let i = 0; i < funList.length; i++) {
            funList[i](parseInt(time/funList.length));
        }
    }catch(err){
        // 极低概率会出现控件消失或者就是脚本被关闭了，所以不用处理
        if(!exceptionLog) console.info("3");
    }
}

// 登录界面检测
function detectionLoginView() {
    let score = 0;
    if(text("Sign up for TikTok").find().length>0) score++;
    if(text("Use phone / email / username").find().length>0) score++;
    if(text("Continue with Facebook").find().length>0) score++;
    if(text("Continue with Google").find().length>0) score++;
    if(text("Continue with Twitter").find().length>0) score++;

    if(score>2) {
        log("登录界面")
        return true;
    }
    return false;
}

function objToUri(obj) {
    let uri = "?"
    for (let key in obj) {
        uri += "&" + key + "=" + obj[key];
    }
    return uri
}

function nextAccount() {
    返回首页(300)

    // 账号不完整的时候进行检测
    if(accounts.list.length < 8) {
        getAccountList();
    }
    while (accounts.list.length < 1) {
        log("账号列表为空！正在重新获取");
        返回首页();
        var 我 = text("Me").findOne(1000)
        if (我) {
            log("Me " + 我.parent().click())
            sleep(random(1000, 1500))
        }
        getAccountList();
    }

    // 当前进度
    switchAccountName = null;
    let localAccountList = accountList;
    accounts.list.forEach((name)=>{
        if(localAccountList.indexOf(name) < 0) {
            // 选择账号
            switchAccountName = name;
            return false;
        }
    })

    let 操作 = [
        step(
            "账号列表"
            , function(){ return (this.uo = id("title").findOne(200))}
        )
        , step(
            "选择账号 " + switchAccountName
            , function(){ return (this.uo = text("Switch account").find(300))}
            , function(){
                // 选择账号
                let accUO = text(switchAccountName).findOne(2000);
                if(accUO) {
                    if(clickOn(accUO)){
                        log("已切换账号");
                        // 跳出
                        return "跳出循环执行";
                    } else {
                        console.error("点击切换账号失败！");
                    }
                } else log( switchAccountName + " 文字的控件不存在");

                // 换另外一个账号
                switchAccountName = null;
                console.error("未找到账号：", switchAccountName)
                // 将当前账号保存到局部账号进度中
                localAccountList.push(switchAccountName);
                // 选择新的账号
                accounts.list.forEach((name)=>{
                    if(localAccountList.indexOf(name) < 0) {
                        // 选择账号
                        switchAccountName = name;
                        return false;
                    }
                })
                console.info("选择账号：", switchAccountName)

                // 账号为空，跳出
                if(!switchAccountName) return "跳出循环执行";
            }
        )
        , step(
            "账号真实性检测"
            , function(){ 
                if(!switchAccountName) {
                    // 选择新的账号
                    accounts.list.forEach((name)=>{
                        if(localAccountList.indexOf(name) < 0) {
                            // 选择账号
                            switchAccountName = name;
                            return false;
                        }
                    })
                    console.info("选择账号：", switchAccountName)
                }
                return !switchAccountName;
            }
            , function(){ return switchAccountName ? switchAccountName : "跳出循环执行"}
        )
    ]

    if(switchAccountName) {
        // 进行账号选择
        循环执行(操作);
    } else {
        // 不进行账号选择
        if(confirm("是否结束运行？\n当前账号列表已经全部切换完毕：\n" + accountList.join("\n"))){
            // 结束脚本
            exit();
        } else {
            // 重新开始，清除当前列表，并且重新执行当前的函数
            accountList = [];
            nextAccount();
        }
    }

{
    /* 
    // 进度提高
    accounts.progress++;
    for (let i = 0; i < 5; i++) {
        try{
            // 账号不完整的时候进行检测
            if(accounts.list.length < 8) {
                getAccountList();
            }
            while (accounts.list.length < 1) {
                log("账号列表为空！正在重新获取");
                返回首页();
                var 我 = text("Me").findOne(1000)
                if (我) {
                    log("Me " + 我.parent().click())
                    sleep(random(1000, 1500))
                }
                getAccountList();
            }

            log("第" + i + "次切换账号");
            let action = id("title").findOne(1000);
            if(action) {
                action.click()
            }
            log(accounts.list, accounts.progress)
            let un = accounts.list[accounts.progress % accounts.list.length];

            if(lh_find(text(un),  "切换账号到" + un, 0)) {
                clickOn(text(un));
                log("切换中...进度：",accounts.list.length,"  ===  ",accounts.progress);
                if(accounts.list.length <= accounts.progress) {
                    console.info("已经完成一轮操作！")
                    exit()
                }
                sleep(10000);
                break;
            }
        }catch(err){
            log("切换账号异常")
            log(err);
        }
    }
    log("账号切换结束")
     */
}
}

function getAccountList(reTag) {
    let nowAccountList = [];
    for (let i = 0; i < 5; i++) {
        try{
            // 点击
            let action = id("title").boundsInside(0,0,device.width,device.height*0.3).findOne(300);
            if(action) {
                action.click()
            }
            // 开局拿到所有账号
            className("android.view.ViewGroup").find().forEach(e => {
                // let text = e.find(className("TextView"));
                // if(1 < text.length && text[0].text() != "Switch account") {
                //     accounts.list.push(text[0].text());
                // }
                let r = e.bounds();
                // 占满x坐标 y坐标200
                if(r.right - r.left == device.width
                    && 
                    ( (r.bottom - r.top < device.height*0.13
                        && r.bottom - r.top > device.height*0.07)
                    || (r.bottom - r.top < 220
                        && r.bottom - r.top > 180)
                    )
                ) {
                    let text = e.find(className("TextView"));
                    if(1 < text.length) {
                        nowAccountList.push(text[1].text());
                    }
                }
            });
            // 获取到的账号列表小于1个时提示是否重新获取
            if(nowAccountList.length < 1) {
                if(autoConfirm(2000,true,"是否重新获取？当前获取到的账号列表如下：",nowAccountList.join("\n"))){
                    // 跳过本次，重新获取
                    nowAccountList=[];
                    continue;
                }
            }
            // 跳出
            break;
        }catch(e){}
    }
    // 如果存在标记则直接返回本次拿到的数据
    if(reTag) return nowAccountList;

    // 重新获取一次账号并判断两次哪次的多
/*     sleep(1000)
    let reAccountList = getAccountList("重新获取账号列表");
    if(accountList.length < reAccountList.length) accountList = reAccountList; */

    // 赋值账号列表
    accounts.list = nowAccountList;
    console.verbose(accounts.list)
    log("数量：",accounts.list.length)
    return accounts.list;
}


function 任务发送指定消息() {
    //TODO 获取用户链接
    let fans;
    do{
        fans = null;
        fans = server.get("taskFans/urlexist?username=" + accountInfo.username);
        log(fans)
        if(fans) {
            if(5 < fans.url.length){
                log("通过链接发消息")
            // 打开链接
            openUrlAndSleep3s(fans.url);
        } else {
            log("用户没有链接！");
            continue;
            log("通过搜索名字发消息")
            // 通过搜索进入
            搜索进入(fans.username, "USERS", 0);
        }
        sleep(1000);
        // 发送一条消息
            let re = sayHello(fans, fans.sendMsg)
            if(re){
                //TODO 待测试，这里需要上传本次是否成功的数据追加到粉丝的冗余字段2中
                log("消息体")
                log(re)
                // 上传本次的结果
                server.post("taskFansLog/add/" + fans.username, server.excludeNull({
                    fans: JSON.stringify(fans),
                    sendMsg: fans.sendMsg,
                    result: JSON.stringify(re)
                }))
                // 如果消息成功发送则修改粉丝指定状态，有个坑，false/0 为发送失败，true/1为成功。但是服务器相反！但是服务器相反！但是服务器相反！
                if(re.status==1) {
                    // /tiktokjs/fans/setStatus?username=粉丝账号&accountUsername=tiktok账号&status=1（状态）
                    server.get("/fans/setStatus?username="+fans.username+"&accountUsername="+accountInfo.username+"&status=0");
                }
            }
        } else break;
    }while(true)
    log("当前队列处理结束");
}
/**
 * 循环执行数组中的单元，当运行完"执行"函数后返回 "跳出循环执行" 时跳出循环执行
 * @param {ArrAy} 单元数组中必须保存对象，格式 {标题: String, 检测: Function, 执行: Function}
 * @param {*} 等待时间 
 */
function 循环执行(数组, 等待时间) {
    let 进度 = 0;
    let 等待 = 等待时间 || 100;
    let 下标;
    if(!数组) throw "操作参数为空！";
    while (-1 < 进度) {
        下标 = 进度%数组.length;
        if(typeof 数组[下标] == "object") {
            // 这里写true是可以查看日志
            if(true && 数组[下标].标题) console.verbose("当前操作步骤：", 数组[下标].标题);
            if(数组[下标].检测()) 进度 = 数组[下标].执行() != "跳出循环执行" ? 进度 : -2;
            sleep(0<等待?等待:0);
        }
 
        进度++;
    }
}
function openUrlAndSleep3s(url, user) {
    // 如果是id sec_id 的话就使用另外一个模式
    if(ui.urlId.checked) {
        if(user && user.id) {
            // 通过user对象进行打开
            console.info("当前用户的地区：", user.area);
            url = "https://" + (appPackage.indexOf("zhiliaoapp") > -1 ? "m":"t") + ".tiktok.com/i18n/share/user/"
                + user.id
                + '/?_d=dg4l9kja494c8j&language=cn&sec_uid='
                + user.secId.replace("\r","")
                + '&timestamp=1610242123&user_id="+uid+"&sec_user_id="+sec_uid+"&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_app_name=tiktok&share_link_id=49d25c5e-8370-4f3e-b0e5-69ebb77d265a&belong=trill&persist=1&os_api=22&device_type=VOG-AL10&ssmix=a&manifest_version_code=160703&dpi=320&uoo=0&carrier_region=TW&region=TW&uuid=866174010207138&carrier_region_v2=460&app_skin=white&app_name=trill&version_name=16.7.3&timezone_offset=28800&ts=1610242127&ab_version=16.7.3&residence=TW&pass-route=1&cpu_support64=false&pass-region=1&current_region=CN&storage_type=0&ac2=wifi&app_type=normal&ac=wifi&host_abi=armeabi-v7a&update_version_code=160703&channel=googleplay&_rticket=1610242129641&device_platform=android&build_number=16.7.3&locale=cn&op_region=TW&version_code=160703&mac_address=02:00:00:00:00:00&timezone_name=Asia/Shanghai&sys_region=TW&app_language=en&resolution=900*1600&os_version=5.1.1&language=zh-Hant&device_brand=HUAWEI&aid=1180&mcc_mnc=46007';
        }  else {
            console.error("用户信息不正确！请检查是否误勾选ID用户模式。")
        }
    } else {
        let ch = url.substring(url.indexOf("//")+2, url.indexOf(".com"));
        let mapKey;
        var map = {
            "app-va.tiktokv.com": "",
            "m.tiktok": "t.tiktok",
            "vm.tiktok": "vt.tiktok",
            "app-va.tiktok": "www.tiktokv",
            "www.tiktok": "www.tiktok"
        }
        if(!map[ch]) {
            // re 为key
            for (let k in map) {
                if(map[k] == ch) {
                    mapKey = k;
                    break;
                }
            }
        } else {
            mapKey = ch;
        }
        if(appPackage.indexOf("zhiliaoapp") > -1) {
            if(mapKey != ch) {
                // 当前url不合适当前版本，进行切换
                url = url.replace(ch,mapKey)
            }
        } else {
        if(mapKey == ch) {
                url = url.replace(ch,map[mapKey])
        }
        }
    }
    if(!url) {
        console.warn("无链接！", url);
        return false;
    }
    console.verbose("打开链接", url);
    app.startActivity({ 
        action: "android.intent.action.VIEW", 
        data: url, 
        packageName: appPackage, 
    });


    // 在打开链接之后等待加载出来用户信息界面
    let words = ["Follow","Message","Requested"];
    function dfs(wait) {
        for (let i = 0; wait && i < 50; i++) {
            // 不知道要不要注释掉
            等待加载()
            let follow = className("android.widget.TextView")
                .clickable(true).drawingOrder(1).filter(function(uo){
                    return -1 < words.indexOf(uo.text());
                }).find()
            if (follow.length == 0) {
                follow = className("android.widget.Button")
                .clickable(true).filter(function(uo){
                    return -1 < words.indexOf(uo.text());
                }).find()
            }
            if (follow.length == 1) {
                return follow[0];
            } else {
                console.verbose("等待加载：", follow.length);
            }
            // 打开方式
            try{
                // Open App
                if(lh_find(text("Open App"), "Open App", 0, 250, true)) {
                    等待加载()
                    let 打开方式 = text("TikTok").visibleToUser().findOne(1000)
                    if (打开方式) {
                        log("选择TikTok", 打开方式.parent().parent().click())
                        sleep(1500)
                    }
                    let 始终 = text("始终").visibleToUser().findOne(1000)
                    if (始终) {
                        log("始终 " + 始终.click())
                    }
                }
            }catch(err) {
                console.error("选择打开方式失败！")
                console.verbose(err)
                console.verbose(err.stack)
            }
            sleep(100)
        }
    // 声明完后调用
    };
    dfs(true);
    // sleep(1000)
}
function tlog() {
    if(testLog) console.verbose("测试日志：", arguments)
}
function getUrlByUserId() {
    // 从后台获取id   areaList：限制国家
    tempSave.area = tempSave.area || ui.areaCode.text().split(/[.,，。]/g).join("&areaList=");
    let user;
    try{
        while (1) {
            user = server.get("idList/gain" + (tempSave.area ? "?areaList="+tempSave.area : ""));
            tlog(user)
            // 如果当前的user对象有id属性则跳出
            if(user.id) break;
        }
    }catch(e){
        console.warn(e, "可能已经没有当前地区["
            + ui.areaCode.text().split(/[.,，。]/g).join(",") 
            + "]的用户");
    }
    // 没有数据的时候没有返回值
    return user
}

function autoConfirm(num, choose, title, content, callback) {
    threads.start(function(){
        let arr=[];
        if(choose) arr= ["确定","OK"];
        else arr = ["取消","CANCEL"];
        try{
            sleep(num||3000)
        }catch(e){
            console.error(e)
            sleep(3000)
        }
        let action;
        for (let i = 0; i < 5; i++) {
            arr.forEach((t)=>{
                action = text(t).findOne(500)
                if(action && action.click()) {
                    log("点击成功");
                    return;
                }
            })
        }
        // toastLog("点击失败！");
    })
    return confirm(title, content, callback);
}

function switchAccount(sin, sup) {
    返回首页();
    if(1 < getAccountList().list.length) {
        if(accountInfo.username) {
            log("记录账号进度")
            // files.append(路径.账号进度, "\n"+accountInfo.username);
            // 这样的话在切换账号时就会向 accountList 中添加账号，但是只会在下一次切换账号时才会进行保存
            files.write(路径.账号进度, accountList.join("\n"));
        }
        if(!sup && !tempSave.firstAccount) {
            signUp();
        }
    }
    sleep(100)
    if(!sin) {
        if(!tempSave.firstAccount) {
            signIn();
        } else { 
            tempSave.firstAccount = false;
            返回首页()
        }
    }
}

// 需要全局参数 accountList
// let accountList = ["15zhanghao","3zhanghao","17zhanghao","16zhanghao","14zhanghao","13zhanghao","12zhanghao","5zhanghao"]; // 本次脚本执行时已使用的所有账号列表
function signIn() {
    返回首页();
    // 账号控件
    let accountName;
    // 账号名
    let account;
    let 操作 = [
        {
            标题: "标题",
            uo: null,
            检测: function() {
                this.uo = id("title").findOne(100)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {

                }
            }
        },
        {
            标题: "添加账号",
            uo: null,
            检测: function() {
                this.uo = text("Add account").findOne(100)
                if(!this.uo) {
                    // 检测是否是账号已经满了
                    if(1 < getAccountList().list.length) {
                        // 进行账号退出
                        if(autoConfirm(3000, true, "账号已满，是否退出一个账号？")) {
                            log("退出一个账号");
                            signUp();
                        }
                    }
                }
                return this.uo
            },
            执行: function() {
                let re = this.uo.parent().parent().click();
                log("点击" + this.标题, re)
                if (re) {

                }
            }
        },
        {
            标题: "选择账号",
            uo: null,
            检测: function() {
                this.uo = text("Select account").findOne(100);
                return this.uo
            },
            执行: function() {
                log("进行账号选择")
                try{
                    let listUO = className("androidx.recyclerview.widget.RecyclerView").findOne(1000);
                    // 回到头顶
                    while(listUO.scrollBackward()){sleep(200)}
                    // 遍历当前的账号列表
                    do{
                        sleep(1000)
                        let vgs = className("android.view.ViewGroup").find();

                        for (let i = 0; i < vgs.length; i++) {
                            let e = vgs[i];
                            let r = e.bounds();
                            // 占满x坐标 y坐标200
                            if((r.right - r.left == 912 
                                || (r.right - r.left < device.width*0.9
                                    && r.right - r.left > device.width*0.8)
                                )&& 
                                ( (r.bottom - r.top < device.height*0.1
                                    && r.bottom - r.top > device.height*0.07)
                                || (r.bottom - r.top < 190
                                    && r.bottom - r.top > 160)
                                )
                            ) {
                                let text = e.find(className("TextView"));
                                if(text && 0 < text.length) {
                                    accountName = text[0].text();
                                    console.verbose(accountName)
                                    // 判断当前账号是否已经被使用过，如果没有被使用过则将其当作要被使用的账号
                                    if(accountList.indexOf(accountName) < 0) {
                                        accountList.push(accountName);
                                        account = e;
                                        // 跳出当前的foreach循环
                                        break;
                                    }
                                }
                            }
                        }
                        // 如果已经获取到账号则跳出循环
                    }while (!account && listUO.scrollForward())
                    if(account.click()) log("账号切换到：", accountName)
                    else log("账号切换失败")
                }catch(e){
                    log(e)
                    files.write(路径.账号进度, "");
                    if(confirm("似乎当前所有账号已全部执行完毕,是否结束执行？", "本地进度记录已清空！\n已经执行"+accountList.length+"个账号。\n"+e)) {
                        exit();
                    }
                    if(autoConfirm("是否清空当前账号列表？","已执行账号列表：\n"+accountList.join("\n"))){
                        accountList = [];
                    }
                    
                }
                等待加载()
            }
        },
        {
            检测: function () {
                return 等待加载() && false;
            }
        },
        {
            标题: "输入密码",
            uo: null,
            检测: function() {
                this.uo = text("Forgot password?").findOne(100)
                return this.uo
            },
            执行: function() {
                // 获取密码输入框,设置密码
                for (let i = 0; i < 2; i++) {
                    let ins = className("android.widget.EditText").find();
                    if(1 < ins.length){
                        ins.pop().setText(ui.szmm.text())
                        // 点击下一步
                        let next = text("Log in").find();
                        if(1 < next.length) {
                            if(next.pop().parent().parent().click())
                                break;
                        }
                    }
                    sleep(1000)
                }
            }
        },
        {
            标题: "检测生日",
            uo: null,
            检测: function() {
                this.uo = text("When’s your birthday?").visibleToUser().findOne(200)
                return this.uo
            },
            执行: function() {
                console.hide()
                for (var ii = 1; ii < 3; ii++) {
                    var year = depth(8).drawingOrder((ii + 1)).classNameEndsWith("view.View").findOne(1000)
                    if (year) {
                        var point = year.bounds()
                        for (var i = 0; i < random(3, 4); i++) {
                            swipe(point.centerX(), point.centerY(), point.centerX(), device.height, 500)
                            sleep(1000)
                        }
                    }
                }
                console.show()
                if (lh_find(text("Next"), "Next", 0)) {
                }
            }
        },
        {
            标题: "首页",
            uo: null,
            检测: function() {
                this.uo = text("Me").boundsInside(device.width*0.8, device.height*0.8, device.width, device.height).findOne(100)
                return this.uo
            },
            执行: function() {
                log("账号已切换")
                return "跳出循环执行"
            }
        },
        
    ]
    循环执行(操作)
}

function signUp() {
    返回首页();
    let 操作 = [
        {
            标题: "设置",
            uo: null,
            检测: function() {
                this.uo = classNameEndsWith("RelativeLayout").drawingOrder(7).clickable(true).findOne(2000)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click();
                log("点击" + this.标题, re)
                if (re) {

                }
            }
        },
        {
            标题: "退出登录",
            uo: null,
            检测: function() {
                this.uo = text("Log out").findOne(100)
                return this.uo
            },
            执行: function() {
                let re = this.uo.click() || this.uo.parent().click() || this.uo.parent().parent().click();
                log("点击" + this.标题, re)
                if (re) {
                    循环执行([
                        {
                            标题: "保存账号",
                            uo: null,
                            检测: function() {
                                this.uo = text("Save").depth(10).findOne(100)
                                return this.uo
                            },
                            执行: function() {
                                let re = this.uo.click();
                                log("点击" + this.标题, re)
                            }
                        },
                        {
                            标题: "退出登录",
                            uo: null,
                            检测: function() {
                                this.uo = text("Log out").findOne(100) || text("Continue with Google").findOne(100)
                                return this.uo
                            },
                            执行: function() {
                                let re = this.uo.click();
                                log("点击" + this.标题, re)
                            }
                        },
                        {
                            标题: "检测是否已退出",
                            uo: null,
                            检测: function() {
                                this.uo = 1
                                return this.uo
                            },
                            执行: function() {
                                let action ;
                                for (let i = 0; i < 5; i++) {
                                    action = text("Me").boundsInside(device.width*0.8, device.height*0.8, device.width, device.height).findOne(100)
                                    if(action){
                                        log("账号已退出");
                                        return "跳出循环执行";
                                    } 
                                    log("等待中..." + i);
                                    if(!等待加载()) {
                                        log("账号退出异常");
                                        switchAccount(true);
                                        return "跳出循环执行";
                                    }
                                    sleep(1000);
                                }
                            }
                        },
                    ]);
                    return "跳出循环执行";
                } 
                // else {
                    // if(!this.uo.parent().click()){
                    //     this.uo.parent().parent().click()
                    // }
                   /*  // 向下滑动
                    scrollable(true).find().forEach(e=>{
                        log("滑动 ", e.scrollForward());
                    }) */
                // }
            }
        },
    ]
    循环执行(操作)
}