"ui";
// https://lbh886633.github.io/js/script.js

var tempSave = {
    firstEnvi: 0,
    privacy: 30,
    NUMBER: 0,
    自动打码: false,
    version: "10",
    downloadUrl: "http://192.168.137.1:8081/tiktokjs/",
    // 直接发送的消息
    getSayMessage: "Hi",
};

var server = {
    serverUrl: "http://3617233570.picp.vip/tiktokjs/",
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
    get: function (uri) {
        try {
            console.info(this.serverUrl + uri);
            let re = http.get(this.serverUrl + uri);
            if (re.statusCode != 200) {
                throw "请求失败，状态码：" + re.statusCode;
            }
            return JSON.parse(re.body.string());
        } catch (err) {
            log("请求失败", err);
        }
    },
    // 排除对象中的null数据
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
    post: function (uri, o) {
        try {
            console.verbose(p)
            return http.post(this.serverUrl + uri, p, {}).body;
        } catch (err) {
            log("POST上传出错", err)
        }
    },
    /**
     * 给服务器发送数据
     * @param {String} url uri 例子"account/add"
     * @param {Object|String} o 
     */
    sendData: function (url, o) {
        try {
            console.verbose(url, o);
            log(http.post(url, o, {}).body.string());
        } catch (err) {
            log("上传出错", err)
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
var errorEnvi = [];
var appName = "TikTok";
var pack = app.getPackageName(appName);
var color = "#fb2f2d";
var survive = true;
var Exit = exit;
var accountInfo = {};
var Fans = {
    path: null,
    list: null,
    temp: null
};
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
    { 失败环境: "失败环境" }
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
路径.注册完成号="/sdcard/DCIM/邮箱.txt";
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
    let i = 0;
    while(survive){
        if(i==0) {
            popupDetection();
        } else {
            action = text("Okay").findOne(30);
            if(action) action.click();
            
            if(30 < i) i = 0;
        }
        sleep(100);
    }
})

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

                            <linear padding="5 0 0 0">
                                <Switch id="autoService" textColor="red" text="无障碍服务（注意！必须开启才能正常运行脚本）" checked="{{auto.service != null}}" />
                            </linear>
                            

                            <vertical  bg="#404EC9A2">
                                <linear padding="5 0 0 0">
                                    <text textColor="black" textSize="20" text="模式设置" />
                                </linear>
                                <radiogroup orientation="horizontal">
                                    <radio id="mi6_reg" text="注册" />
                                    <radio id="mi6_dat" text="资料" />
                                    <radio id="mi6_vid" text="视频" />
                                    <radio id="mi6_foc" text="关注" />
                                    <radio id="mi6_fan" text="粉丝" />
                                    <radio id="mi6_rep" checked="true" text="回复" />
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
                                    <checkbox id="createAccount" text="生成邮箱" />
                            </linear>


                            <linear padding="5 0 0 0" marginBottom="40dp">
                                <button id="ok" w="*" h="auto" layout_gravity="bottom" style="Widget.AppCompat.Button.Colored" text="启动" />
                            </linear>

                            <vertical id="loginmodel">
                                <linear padding="5 0 0 0">
                                    <text textColor="black" textSize="20" text="登号设置（注册）" />
                                </linear>
                                <linear padding="5 0 0 0" >
                                    <text textColor="black" text="新密码: " />
                                    <input lines="1" id="szmm" w="auto" text="lbh886633" />
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
                                    <input lines="1" id="gzjg" w="auto" text="800" />
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
                                    <input id="htbt" w="*" text="click the link to find more lingerie fashion" />
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
                                <linear h="{{tempSave.privacy||0}}">
                                    <checkbox id="replymsg" text="回复消息" />
                                    <checkbox id="sayhellobyurl" text="链接问候" />
                                    <checkbox id="sayhellobysearch" text="搜索问候" />
                                    <checkbox id="getsay" text="采集发送" />
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
survive=false
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
    if (!checked && auto.service != null) {
        auto.service.disableSelf();
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
        qd = 0;
        toastLog("脚本已经启动了，再次点击可再次启动");
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

function 主程序() {
    log("当前版本：",tempSave.version)
    let dec = true;
    threads.start(function () {
        while(dec){
            action = text("Start now").findOne(30);
            if(action) action.click();
            action = text("立即开始").findOne(30);
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

    if(ui.createAccount.checked){
        log("邮箱生成");
        邮箱生成();
    }

    


    if(runTikTok()) {
        log("账号正常，还原成功")
        // 开启一个新线程来保存账号
        threads.start(function () {
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

        if (ui.mi6_reg.checked) {
            log("注册模式")
            tempSave.login = true;
            tempSave.continue = true;
            while (tempSave.continue) {
                mi6注册模式();
                if(tempSave.continue){
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
            }
        }

        if (ui.mi6_dat.checked) {
            log("修改资料")
            修改资料()
            更换头像()
        }

        if (ui.mi6_vid.checked) {
            log("上传视频")
            上传视频();
        }

        if (ui.mi6_foc.checked) {
            log("关注模式")
            限制 = random(Number(ui.gzsl.text()), Number(ui.gzsl1.text()))
            mi6关注操作()
        }

        if (ui.mi6_fan.checked) {
            log("打招呼")
            采集粉丝信息()
        }
        if (ui.mi6_rep.checked) {
            log("回复")
            tempSave.RequiredLabels = readRequiredLabelsFile();
            mi6回复消息()
        }
    }
    toastLog("结束")

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
                if(!text("Me").packageName(pack).findOne(500)) {
                    console.verbose("没在首页")
                    i--;
                }else{
                    text("Me").packageName(pack).findOne(500).parent().click();
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




function 打开抖音() {
    if(tempSave.login){
        log("登录/注册模式")
        for (let i = 0; i < 5; i++) {
            // 检测是否打开抖音
            if (packageName(pack).findOne(2000)){
                // 连续检测5次弹窗，如果已经到了主页，出现Me控件则跳出
                for (let j = 0; j < 5; j++) {
                    // 检测弹窗
                    popupDetection();
                    sleep(600)
                    if(text("Me").findOnce()){
                       break; 
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
                app.launchApp(appName);
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
    var 滑块范围 = indexInParent(1).depth(8).classNameEndsWith("view.View").findOne(2000)
    if (滑块范围) {
        var 坐标 = 滑块范围.bounds()
        var clip = images.clip(captureScreen(), 坐标.left, 坐标.top, 坐标.right - 坐标.left, 坐标.bottom - 坐标.top);
        log("截图打码")
        var 返回 = 联众打码("lbh886633", "Libinhao886633", clip)
        if (返回) {
            if(返回!="end"){
                返回 = Number(返回.split(",")[0]) + 坐标.left - 20
                log(返回)
                var 起点 = depth(12).classNameEndsWith("Image").findOne(1000);
            }
            if (起点) {
                if(起点!="end"){
                    log("正在滑动")
                    var 起点坐标 = 起点.bounds()
                    swipe(起点坐标.centerX(), 起点坐标.centerY(), 返回 + (起点坐标.right - 起点坐标.left), 起点坐标.centerY(), 1000)
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


function lh_find(obj, msg, dj, time) {
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
            console.log("没找到 " + msg)
        } else {
            console.log("没找到 ")
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

    let 新链接 = 取链接()
    app.openUrl(新链接)
    sleep(1000)
    for (let index = 0; index < 10; index++) {
        var 打开方式 = textContains("TikTok").visibleToUser().findOne(2000)
        if (打开方式) {
            log("选择抖音 " + 打开方式.parent().parent().click())
            sleep(1000)
        }
        var 始终 = text("始终").visibleToUser().findOne(1000)
        if(!始终) 始终 = text("ALWAYS").visibleToUser().findOne(2000)
        if (始终) {
            log("始终 " + 始终.click())
        }
        let action = text("Open App").findOne(1000);
        if(action) action.click();
    
        if(packageName(pack).findOne(10)) break;
    }

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
                if(计数 >= 限制 || 计数标志 >= 限制 ) {
                    log("跳出循环", 计数, 计数标志)
                    break
                }
                var 封号了 = textContains("Your account was logged out. Try logging in again.").findOne(200)
                if (封号了) {
                    log("号被封了!")
                    return false
                }

                sleep(1000)
                var 滑动 = depth(9).visibleToUser().scrollForward()
                if (滑动) {
                    log("到底了,换个链接")
                    if(detectionLoginView()) {
                        toastLog("号被封了！");
                        return false;
                    }
                    let re = 关注操作(计数);
                    log("到底后换链接并且关注完成");
                    return re;
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
                关注操作(计数);
                log("重取链接后关注操作完成")
            }
            else {
                console.error("进入粉丝列表失败！")
                tempSave.inFansListError = 0;
            }
        }
        计数 = 0
        return true
    }
    log("===","结束")
}
function 关注操作(num) {
    计数 = num || 0;
    try{
        let cancel = text("CANCEL").findOne(1000)
        if(cancel){
            cancel.click()
            let name = xx("获取当前环境名称");
            console.error(name+"环境没有账号，可能需要确认");
            cancelDelete(name);
            throw "账号不存在";
        }

        try {
            if (typeof 上一个链接 != "object") throw "需创建对象";
        } catch (e) {
            var 上一个链接 = { 链接: "", 次数: 0 }
        }
        
        let 新链接 = 取链接()
        //返回首页()
        app.openUrl(新链接)
        if (新链接 == 上一个链接.链接) {
            if (5 <= 上一个链接.次数++) {
                log("连续取出的链接相同", 上一个链接.次数)
                return false
            }
        } else {
            上一个链接.链接 = 新链接
            上一个链接.次数 = 0
        }
        //app.openUrl("https://vt.tiktok.com/ZSmpxv1W/")
        sleep(1000)
        var 打卡方式 = textContains("TikTok").visibleToUser().findOne(2000)
        if (打卡方式) {
            log("选择抖音 " + 打卡方式.parent().parent().click())
            sleep(1500)
        }
        var 始终 = text("始终").visibleToUser().findOne(1000)
        if(!始终) 始终 = text("ALWAYS").visibleToUser().findOne(2000)
        if (始终) {
            log("始终 " + 始终.click())
        }
        sleep(random(5000, 6000))
        var 粉絲 = text("Followers").drawingOrder(2).visibleToUser().findOne(2000)
        if (粉絲) {
            sleep(random(3000, 4000))
            // sleep(random(5000, 6000))
            log("进入粉丝 " + 粉絲.parent().click())
            // sleep(random(4000, 5000))
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
                    if(计数 >= 限制 || 计数标志 >= 限制 ) {
                        log("跳出循环", 计数, 计数标志)
                        break
                    }
                    var 封号了 = textContains("Your account was logged out. Try logging in again.").findOne(200)
                    if (封号了) {
                        log("号被封了!")
                        return false
                    }
/*                  关注上限检测
                    var 新的关注列表 = text("Follow").visibleToUser().find()
                    if(关注.length > 2 && 关注.length == 新的关注列表.length){
                        log("关注已到上限")
                        return false
                    } */
                    sleep(1000)
                    var 滑动 = depth(9).visibleToUser().scrollForward()
                    if (滑动) {
                        log("到底了,换个链接")
                        if(detectionLoginView()) {
                            let enviName = xx("获取当前环境名称")
                            log("将当前环境添加进失败列表：", enviName)
                            files.append(路径.失败环境列表,"//" + enviName);
                            return false;
                        }
                        let re = 关注操作(计数);
                        log("到底后换链接操作完成");
                        return re;
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
                    关注操作(计数);
                    log("重取链接后关注操作完成")
                }
                else {
                    console.error("进入粉丝列表失败！")
                    tempSave.inFansListError = 0;
                }
            }
            计数 = 0
            return true
        }
    }catch(e){
        log("异常", e);
        return false;
    }
    log("===","结束")
}

function 取链接() {
    let r = server.get("url/low").url;
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
        if (packageName(pack).visibleToUser().exists()) {
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
            app.launch(pack)
            sleep(1000)
        }
    }
}

///////////////////////////

function 上传视频() {
    var 话题内容 = ui.htbt.text()
    var at = ui.atyh.text()
    var 上传次数 = Number(ui.scsl.text())
    for (var i = 0; i < 上传次数; i++) {
        返回首页()
        sleep(1000)
        var 拍摄 = classNameEndsWith("FrameLayout").clickable(true).depth(8).drawingOrder(3).findOne(30000)
        if (拍摄) {
            移动文件(路径.文件夹.视频列表, 路径.文件夹.视频)
            sleep(random(2000, 3000))
            log("拍摄 " + 拍摄.click())
            sleep(random(2000, 3000))
            var 允許 = text("允许").clickable(true).findOne(1000)
            if(!允許) 允許 = text("ALLOW").findOne(100);
            if(!允許) 允許 = text("Allow").findOne(50);
            if (允許) {
                log("允許 " + 允許.click())
                sleep(random(1000, 1500))
                var 允許 = text("允许").clickable(true).findOne(1000)
                if(!允許) 允許 = text("ALLOW").findOne(100);
                if(!允許) 允許 = text("Allow").findOne(50);
                if (允許) {
                    log("允許 " + 允許.click())
                    sleep(random(1000, 1500))
                    var 允許 = text("允许").clickable(true).findOne(1000)
                    if(!允許) 允許 = text("ALLOW").findOne(100);
                    if(!允許) 允許 = text("Allow").findOne(50);
                    if (允許) {
                        log("允許 " + 允許.click())
                        sleep(random(1000, 1500))
                    }
                }
            }
            // 
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
                    var 下一步 = text("Next").visibleToUser().clickable(true).findOne(5000)
                    if (下一步) {
                        log("下一步 " + 下一步.click())
                        sleep(random(5000, 7000))
                        var 下一步 = text("Next").visibleToUser().clickable(true).findOne(60000)
                        if (下一步) {
                            log("下一步 " + 下一步.click())
                            sleep(random(2000, 3000))
                            var Voiceover = text("Voiceover").visibleToUser().findOne(60000)
                            if (Voiceover) {
                                sleep(random(2000, 3000))
                                var 下一步 = text("Next").visibleToUser().clickable(true).findOne(3000)
                                if (下一步) {
                                    log("下一步 " + 下一步.click())
                                    sleep(random(3000, 4000))
                                }
                            }
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
                    log("没找到视频序号,放弃本次上床")
                    exit()
                }
            }
        }
    }
}

function 修改资料() {
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
                    下一步 = text("Business").packageName(pack).findOne(3000)
                    if(下一步) {
                        log("已进入切换页面");
                        break;
                    }
                    if(text("Me").packageName(pack).findOne(3000)){
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
                    var 購物 = textContains("Shopping/").packageName(pack).findOne(1500)
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
    if (用户账号) {
        返回首页();
        // 重新检查当前用户名
        runTikTok();
        server.get("account/update/" + nowUsername +"?newUsername=" + accountInfo.username);
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
    clickAction(text("Me"), 50)
    // 3. 点击粉丝
    // text("Followers").boundsInside(520, 670, 920, 730).find().length
    // clickAction(function () { return text("Followers").boundsContains(523, 679, 916, 720).findOne(200).parent() }, 500, 600)
    // 谷歌手机的分辨率
    // clickAction(function () { return text("Followers").boundsInside(520, 670, 920, 730).findOne(200).parent() }, 500, 600)
    clickAction(function () { return text("Followers").boundsInside(400, 750, 700, 850).findOne(200).parent() }, 500, 600)
    // 4. 采集粉丝信息
    fansNameList = server.get("fans/list/username?accountUsername="+accountInfo.username);
    log("已采集粉丝数量：", fansNameList.length)
    getFansList(fansNameList, fansList)
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
    let i=0, tempList = [], tempSave = [], closeTag;
    while(true){
        等待加载()
        // 获取粉丝列表父控件
        let FollowerParent = className("androidx.recyclerview.widget.RecyclerView").packageName(pack).filter(function(uo){
                            if(uo.bounds().right>device.width*0.5) 
                                return true;
                            return false;
                        }).findOne(3000)
        
        if(!textContains("FOLLOWERS").findOne(500) || !FollowerParent) {
            log("未获取到粉丝列表！如果脚本卡住，请手动进入粉丝列表")
            sleep(3000);
            continue;
        }

        // 获取粉丝列表，每一个都是粉丝控件
        let FollowerList = FollowerParent.children();
        // 分数
        let score = 0;

        // 处理当前列表
        for (let f in FollowerList) {
            f = FollowerList[f];
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
                        let fans = getFansInfo(username);

                        //  发送私信
                        // if(ui.getsay.checked){
                            if(isNaN(tempSave.NUMBER)) tempSave.NUMBER = 1;
                            let newMsg = Date.now().toString().substring(10) + "> " + (tempSave.getSayMessage||"Hi~");
                            let re = sayHello(fans, newMsg);
                            if(re){
                                console.info("消息发送状态", re.status);
                            } else {
                                log("发送失败")
                            }
                            log(re)
                        // }

                        // 返回粉丝列表
                        for (var i = 0; i < 5; i++) {
                            sleep(1000)
                            let fansList  = className("androidx.recyclerview.widget.RecyclerView").packageName(pack).filter(function(uo){
                                if(uo.bounds().right>device.width*0.5) 
                                    return true;
                                return false;
                            }).findOne(2000)

                            if (FollowerList.length-3 < fansList.children().length
                                || FollowerList.length == fansList.children().length
                            ) break
                            else back()
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
            }
        }

        console.info("保存数量：", score,"当前进展：", getFansNum, "总进展：", countGetFansNum)
        if(score == 0){
            if(!all) {
                log("当前粉丝均已保存，停止继续遍历");
                break;
            }
            // 判断本次列表是否和上次相同
            let similar = 0;
            tempList.forEach(e=>{
                if(tempSave.indexOf(e)>-1)
                    similar++;
            })
            // 当相似性超过一半时跳出循环
            if(similar > tempList.length*0.5 && 5 < closeTag++){
                console.warn("到底了")
                break;
            }
        }
        // 将本次暂存数据保存起来用于下次对比
        tempSave = tempList;
        // 清空暂存数据
        tempList = [];

        save({},true)
        // 滑到下一页
        let scrollDown = depth(9).visibleToUser().scrollForward();
        log("滑动", scrollDown)

    }
    log("遍历结束");
    return fansNameList;

}

// 获取信息的函数，需要在用户信息的界面
function getFansInfo(usernameP,mainTag) {
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
        else return save({
            name: name,
            username: username,
            focusNumber: focusNumber,
            fansNumber: fansNumber,
            likeNumber: likeNumber,
            BI: BI,
            urlExists: urlExists,
            url: url,
            uri: uri
        });
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
function save(obj,savaToFile) {
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
// 保存到服务器
    server.add("fans", {
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
    });
    return obj;
}


function mi6回复消息() {
    log("测试中...")
    // 1. 进入信息界面
    text("Inbox").findOne(1000).parent().click()
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
        // 进行下一步，可选没有新消息就直接开始下一个
        lh_find(className("android.widget.ImageView").clickable(true), "点击私信", 0)
        // 2.5. 获取列表，可以用于滚动
        actionRecycler = className("androidx.recyclerview.widget.RecyclerView")
                .boundsInside(0, 200, device.width, device.height)
                .findOne(1000);
        console.info(actionRecycler)
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
            // 向后翻页
            if(!actionRecycler.scrollForward()){
                sleep(100);
                actionRecycler = className("androidx.recyclerview.widget.RecyclerView")
                .boundsInside(0, 200, device.width, device.height)
                .findOne(1000);
                if(!actionRecycler.scrollForward()){
                    // 一般不会走这里，到了这里就等于需要重写上面的逻辑
                    console.error("翻页失败！")
                }
            }
            log("翻页")
        }
        
        if(0 < newMsgCount) {
            console.warn("可能还剩余", newMsgCount, "条消息未被处理");
        }
    } else {
        log("没有新消息")
    }
    log("回复消息结束")
}

function 回复消息() {
    返回首页()
    log("测试中...")
    // 初始化数据
    Fans={
        // 用来读取文件的
        path: 路径.文件夹.粉丝 + accountInfo.envi + "_粉丝列表.txt"
    };

    // 1. 进入信息界面
    text("Inbox").findOne(1000).parent().click()
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
    log("新消息数量：", newMsgCount)
    // 根据条件选择是否进入私信界面
    if(newMsgCount>0){
        // 进行下一步，可选没有新消息就直接开始下一个
        let biu = action.findOne(className("android.widget.ImageView").clickable(true))
        biu.click()
        // 3. 获取所有有红气泡数量的好友
        action = className("androidx.recyclerview.widget.RecyclerView").boundsContains(0, 201, 1440, 2434).findOne(1000);
        for (let i = 0; i < 6; i++) {
            sleep(500)
            // 最多循环查看6次，本次没有新消息，那么循环次数就减2，也就是没有发现新消息则只查看2、3次
            let sendList = getNewMsgList();
            if(sendList.length > 0){
                // 对当前页面上的红色气泡进行回复
                // 4. 进入聊天界面
                // 5. 获取双方聊天信息（可能需要翻页）
                // 6. 进行消息处理，返回false则不回复消息
                replySendlist(sendList)
            } else {
                i+=2
            }
            // 向后翻页
            action.scrollForward()
        }
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
            app.openUrl(fans.url);

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
 * @returns {Object} 不在粉丝信息页面返回fasle 返回值 {status:状态, sender:发送者名字, msg:消息, perfix:前缀, suffix:后缀, code:编码(子控件数量集)}
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
       return false;
    }

    // 发送消息
    re = sendMsg(msg);
    f.sayHello++;
    if(!f.reservedA) f.reservedA = "";
    if(re.status){
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
    }
    // 将本次打招呼信息提交到服务器
    // 保存已打招呼的粉丝信息
    server.get("fans/sayhello?username="+f.username);
    /*
        message: 测试
        perfix: 123
        suffix: 124
        accountUsername: 124
        fansUsername: 1245
        device: 125
        reservedA: 
        reservedB: 
    */
    // 保存本次的聊天记录结果
    server.add("record", {
        message: re.msg,
        perfix: re.perfix,
        suffix: re.suffix,
        accountUsername: accountInfo.username,
        fansUsername: f.username,
    });
    return re;
}

// 在聊天界面发送消息
function sendMsg(msg){
    log("发送消息：", msg)
    for (let j = 0; j < 5; j++) {
        // 检测消息页面（需要判断是否存在输入框）
        action = text("Send a message...").findOne(1000);
        if(action) {
            log("消息输入框")
            action.setText(msg);
            break;
        }
    }
    // 3. 发送消息  发送按钮 950,1700, 1100,1950
    action = className("android.widget.ImageView").boundsInside(950,1700, 1100,1950).clickable(true).findOne(1000);
    if(action){
        log("发送消息", action.click());
    }
    // 3.1. 发送消息（按钮在中间部分时）  发送按钮 950,1700, 1100,1950
    action = className("android.widget.ImageView").boundsInside(950,800, 1100,1950).clickable(true).find();
    if(action){
        // 点击最后一个
        log("发送消息(中)", action[action.length-1].click());
    }
    // 银行卡检测 DECLINE LINK
    action = text("DECLINE").findOne(1000)
    if(action){
        console.error("未绑卡")
        action.click();
    } else {
        // 防止发送失败
        action = className("android.widget.ImageView").boundsContains(950,1700, 1100,1950).clickable(true).findOne(1000);
        if(action){
            log("再次点击发送消息按钮", action.click());
        }
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
    try{
        sleep(500)
        // 4. 检测是否发送成功
        let msgList = 获取消息();
        for (let m in msgList) {
            m = msgList[m];
            if(msg == m.msg){
                return m;
            }
        }
        
        msgList[0].she="sayHelloException:默认第一个";
        return msgList[0];
    }catch(err){
        log("获取消息异常",err)
        return {
            status: false,
            msg: msg,
            she: "sayHelloException:出现异常！"+err
        }
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

        // 3. 发送消息
        action = className("android.widget.ImageView").boundsInside(1345,1400,1440,2434).clickable(true).findOne(1000);
        if(action){
            log("发送消息");
            action.click()
            break;
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
            let status,msg,perfix="",suffix="",code,sender;

            // 拿到编码，一般来说，只有几种可能 010 011 110 111 020(对方消息) 
            code = "" + tryRun(m[0], ".children().length") + tryRun(m[1], ".children().length") + tryRun(m[2], ".children().length");
            if(code[0]!="0") {
                try{
                    let actionPerfix = m[0].findOne(className("android.widget.TextView"))
                    if(actionPerfix){
                        perfix = actionPerfix.text();
                    }
                } catch (err) {}
            }
            // 拿到消息体
            if(code[1]!="0"){
                try{
                    let msgBox =  m[1].children()
                    status = !(msgBox.findOne(className("android.widget.ImageView")));
                    msg = (status ? "" : "[消息发送失败]")
                        + msgBox.findOne(className("android.widget.TextView")).text();
                    sender = msgBox.findOne(className("com.bytedance.ies.dmt.ui.widget.DmtTextView")).desc();
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
            
            msgList.push({
                status: status, 
                sender: sender,
                msg: msg, 
                perfix: perfix, 
                suffix: suffix, 
                code: code
            })
        }
    }
    return msgList;
}

function mi6GetNewMsgList() {
    let sendlist = boundsInside(900, 200, device.width, device.height).className("TextView").filter(function(uo){
        let t = uo.text();
        return t.indexOf(":") < 0 && t.indexOf("-") < 0 && !isNaN(parseInt(t));
    }).find();
    return sendlist;
}

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
        let rect = sendlist[i].bounds();
        for (let j = 0; j < 5; j++) {
            // 点击的X轴进行偏移
            click(rect.left - device.width*0.1, rect.centerY())
            sleep(2000);
            // 拿当前页面的红色气泡列表，通过数量来判断之前的点击是否无效
            let newMsgListLength = mi6GetNewMsgList().length;
            if(newMsgListLength != sendlist.length){
                break;
            }
            log("暂未进入聊天界面");
        }
        mi6ReplyMsg();
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
 * 聊天界面
 * 回复消息
 */
function mi6ReplyMsg() {
    // 获取到对方名字并去查粉丝数据
    log("正在获取粉丝数据")
    // 拿顶部的用户名字,数据库中没有信息则进入右上角拿对方账号信息
    // ## 通过id拿
    let fans;
    try {
        let fansName = className("TextView").boundsInside(100,110,device.width-100,182).findOne(3000).text();
        fans = server.get("fans/name/" + fansName + "?accountUsername=" + accountInfo.username)
    }catch(e) {}

    if(!fans) {
        log("通过名字获取对方信息失败！正在尝试通过账号获取")
        fans = getFansInfoByFansMsgView();
    }

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
    [ { status: false,
    sender: 'prettyboi.malik',
    msg: '[消息发送失败]prettyboi.malik',
    perfix: '2020-12-23 18:58',
    suffix: '',
    code: '120' },
  { status: false,
    sender: 'prettyboi.malik',
    msg: '[消息发送失败]prettyboi.malik',
    perfix: '2020-12-23 12:29',
    suffix: '',
    code: '120' } ]
     */
    // 对当前的消息做去重处理
    if(总消息.length == 0){
        总消息 = 总消息.concat(新消息列表);
        新消息 = 新消息列表;
    } else {
        for (let 消 in 新消息列表) {
            log(消)
            消 = 新消息列表[消];
            // 是否保存的标记
            let tag = false;

            for (let 息 in 总消息) {
                息 = 总消息[息];
                /// 消息内容相等的时候才进行比对
                if(消.msg == 息.msg){
                    log("消息体相同")
                    let letTag = true;
                    // 只匹配必要的信息 code perfix suffix msg 
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
            }
        }
    }
    ///###
    console.warn("新消息：")
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
        // 避免因为空对象导致异常
        if(!新消息[i]) break;

        // 避免因为空对象导致失败
        新消息[i].params = null;

        try{
            console.verbose(新消息[i]);
            server.add("record", server.excludeNull(新消息[i]));
        } catch(e){
            log(e);
            log("上传新消息失败！");
        }
    }
    // 将粉丝信息进行保存
    server.add("fans", server.excludeNull(fans));
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
            console.verbose(新消息[i]);
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
                fans = server.get("fans/username/" + username + "?accountUsername=" + accountInfo.username)
                break;
            } catch (err) {
                console.verbose("获取对方账号异常", err)
            }
        }
        if(fans) break;
        sleep(500)
    }
    // 如果获取失败则创建一个粉丝信息
    if(!fans) {
        console.warn("无粉丝对象，创建一个粉丝对象")
        fans = {
            username: username,
            name: name,
            accountUsername: accountInfo.username
        }
    } else {
        // 通过粉丝数据找聊天记录
        fans.messages = server.get("record/doubleusername?fansUsername=" + fans.username+"&accountUsername="+fans.accountUsername);
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
        // 先判断字符串(序列化的对象数据)中是否存在这个字符串
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
 * 依赖外部变量 RequiredLabels 格式：[{ label:"标签名"（标签）, words: "关键词,关键词,..."（关键字） info: ["询问语句1","询问语句2"]（信息）}]
 * @param {UIObject} fans  保存的粉丝的信息
 * @param {Array} newMsgList 新的聊天记录
 */
function 消息处理(fans,newMsgList){

    if(!fans.label) fans.label = {};
    // 1. 分析新消息单词数组
    let words = [];
    for (let m in newMsgList) {
        m = newMsgList[m];
        if(m.sender != accountInfo.name){
            // 对方的消息
            let newWords = m.msg.split(/\s/)
            for (let w in newWords) {
                w = newWords[w];
                // 如果当前单词不为空则保存到单词数组中
                if(w!="") words.push(w);
            }
        }
    }

    console.verbose("单词组：", words)

    let fansLabel;
    try{
        fansLabel = JSON.parse(fans.label);
    } catch(e){}
    if(!fansLabel){
        fansLabel = {};
    }
    // 使用单词去匹配词库并保存
    for (let w in words) {  // 拿到当前单词
        w = words[w];
        for (let tag in tempSave.RequiredLabels) {   // 拿到当前标签内容 包括 label（标签） words（关键字） info（信息）
            tag = tempSave.RequiredLabels[tag].label;
            // label: '{"label": "国家","words": "usa", "info": ["where are you from?"]}'
            tag = JSON.parse(tag);
            // 如果当前单词存在于标签中，则进行保存
            if(-1 < tag.words.indexOf(w)){
                // 判断是否存在当前标签，没有就创建
                if(!fansLabel[tag.label]) {
                    fansLabel[tag.label]=[];
                }
                // 判断是否已经存在当前标签,如果没有则进行保存
                if(fansLabel[tag.label].indexOf(w) < 0) {
                    fansLabel[tag.label].push(w);
                }
            }
        }
    }

    log("最新标签内容")
    log(fansLabel)
    fans.label = JSON.stringify(fansLabel);

    for (let r in tempSave.RequiredLabels) {
        /*
            [ { searchValue: null,
            createBy: null,
            createTime: null,
            updateBy: null,
            updateTime: null,
            remark: null,
            params: {},
            num: 1,
            isDelete: 0,
            label: '{ label: "国家", words: "usa", info: ["where are you from?"] }',
            reservedA: '',
            reservedB: '' } ]
        */
        // 拿到标签体 label 是字符串 需要序列化
        r = JSON.parse(tempSave.RequiredLabels[r].label);
        // 由于粉丝的标签是字符串，所以继续使用标签暂存对象来进行判断
        if(!fansLabel[r.label]){
            let reMsg = Date.now().toString().substring(10) +"> "+ r.info[random(0,r.info.length-1)];
            console.info("新消息：", reMsg);
            return reMsg;
        }
    }

    console.info("不发送新消息")
    // 不发送新消息
    return false;
}

/**
 * 从文件中读取标签对象
 * @param {String} path 文件路径
 * @returns {Object}
 */
function readRequiredLabelsFile(path){
    // 没有 tempSave.LabelsData 数组或者长度为0，都将从服务器获取数据
    if(!tempSave.LabelsData || tempSave.LabelsData.length < 1) {
        try{
            tempSave.LabelsData = server.get("label/list").rows;
        } catch(err){
            tempSave.LabelsData = [];
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
 * 通过搜索打招呼的模式
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
                序号 = xx("获取当前环境名称")
                cancelDelete(序号)
                console.error("将当前环境加入失败待删除列表：", 序号)
                files.write(路径.失败环境, 序号)
                是否删除 = 1
            }
        }
    }
}

function mi6注册模式() {
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
        返回首页(1000);
        if(!lh_find(text("Sign up").clickable(true), "Sign up", 0)){
            // !!!!!!!!!!!!!ＴＯＤＯ　TODO 忘了
            if(lh_find(boundsInside(970,114,1042,186).className("ImageView"), "设置", 0)) {
                let scrollView = className("ScrollView").findOne(1000);
                let i = 0;
                try{
                    for (; i < 3;) {
                        if(lh_find(text("Add account"), "添加账号", 0, 500)) {
                            i++;
                        }
                        let action = textContains("existing").findOne(100);
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
                    log("已有三个账号，无需继续注册");
                    tempSave.continue = false;
                    return false;
                }
            }
        }
        let tag;
        for (let i = 0; i < 5; i++) {
            lh_find(textContains("existing"), "Add existing account", 0, 100);
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
                    // sleep(4000, 5000)
                    log("暂未处理异常检测，例如频繁")
                    while (1) {
                        // 加入频繁检测'
                        var 等待 = depth(11).drawingOrder(2).classNameEndsWith("view.View").visibleToUser().findOne(500)
                        if (等待) {
                            console.verbose("等待")
                        } else {
                            break
                        }
                        sleep(1500)
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
                                            break;
                                        }
                                        sleep(1500)
                                    }

                                    var 频繁 = textContains("You are visiting our service too frequently").findOne(1000)
                                    if (频繁) {
                                        files.append(路径.注册频繁号, 随机账号 + "\n")
                                        stopScript("频繁了")
                                        return false
                                    }
                                    
                                    var 需要验证 = textContains("Enter 6-digit code").visibleToUser().findOne(1000)
                                    if (需要验证) {
                                        stopScript("需要验证邮箱6位验证码")
                                        return false
                                    }

                                    if (lh_find(text("Skip").clickable(true), "skip", 0, 1000)) {
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
                    // 失败返回fasle，在true的时候会跳出注册模式
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
            app.launchApp(appName)
            for (let j = 0; j < 5; j++) {
                // 检测登录文字
                let action = textContains("Sign up").findOne(2000)
                if(action) {
                    action.click();
                    break;
                }
                // 10秒内没有打开TikTok则重新打开
                if(!packageName(pack).findOnce(10000)){
                    app.launchApp(appName)
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
                                        if (需要验证) {
                                            stopScript("需要验证邮箱6位验证码")
                                            return false
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
                                            stopScript("需要验证邮箱6位验证码")
                                            return false
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
    let acc = 账号+'，'+密码;
    console.info("账号保存", acc);
    files.append(路径.注册完成号, acc);
    server.add("register", {
        username: 账号,
        password: 密码
    });
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
function 注册打码() {
try{
    for (var ii = 0; ii < 3; ii++) {
        if (text("Me").visibleToUser().exists()) {
            saveReg(随机账号, ui.szmm.text());
            log("注册成功了");
            return true
        }
        //var 滑块范围 = indexInParent(2).depth(6).classNameEndsWith("view.View").findOne(2000)
        var 滑块范围 = indexInParent(1).depth(8).classNameEndsWith("view.View").findOne(2000)

        if (滑块范围) {
            var 坐标 = 滑块范围.bounds()
            var clip = images.clip(captureScreen(), 坐标.left, 坐标.top, 坐标.right - 坐标.left, 坐标.bottom - 坐标.top);
            log("截图打码——注册");
            var 返回 = 联众打码("lbh886633", "Libinhao886633", clip)
            if (返回) {
                if(返回!="end"){
                    返回 = Number(返回.split(",")[0]) + 坐标.left - 20
                    var 起点 = depth(12).classNameEndsWith("Image").findOne(1000);
                }else{
                    起点 = 返回
                }
                if (起点) {
                    if(起点!="end"){
                        log("正在滑动——注册")
                        var 起点坐标 = 起点.parent().parent().bounds()
                        swipe(起点坐标.centerX(), 起点坐标.centerY(), 返回 + (起点坐标.centerX() - 起点坐标.left), 起点坐标.centerY(), 1000)
                        sleep(6000)
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
                                    stopScript("需要验证邮箱6位验证码")
                                    return false
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
                                if (需要验证) {
                                    stopScript("需要验证邮箱6位验证码")
                                    return false
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
        log("发起请求")
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
function 等待加载(s,num){
    if(!(num>1)) num = 100
    let i = 0
    sleep(s||2000)
    for (; i < num; i++) {
        if(id("ac2").find().length==0) break
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
    uo = text("Swipe up for more").findOne(100)
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
            accLen = 11,
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
 * 打开TikTok并进入个人信息界面
 * @param {*} run 任意值，传入则代表 主页检测
 * @param {*} tag 自己递归计算次数使用
 */
function runTikTok(run,tag) {
    if(!run) app.launchApp(appName);
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
            if(text("Me").findOne(2000).parent().click())
                // 获取到个人信息s
                info = getFansInfo("个人信息", true);
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
        // 标记自增
        tagI++;
        // log提示语句
        console.verbose("等待" + appName + "启动中..." + tagI);
    }

    if(!info || (-1 == info.focusNumber) && (-1 == info.fansNumber) && (-1 == info.likeNumber)){
        log("无账号");
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
    info.enviName = "Mi6_" + device.getAndroidId();
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

function 清除数据() {
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
function popupDetection(time) {
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
            action = text("允许").findOne(t*0.4);
            if (action) action.click();
        },
        function (t) {   // CANCEL 取消弹窗，一般是账号不存在
            action = packageName(pack).text("CANCEL").findOne(t)
            if (action) {
                action.click();
                sleep(500);
            }
        },
        function (t) {   // 通知权限被关闭时，取消选择  Later
            action = packageName(pack).text("Open").findOne(t)
            if (action && textContains("Notifications keep").findOne(500))
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
        }
    ]
    try{
        for (let i = 0; i < funList.length; i++) {
            funList[i](parseInt(time/funList.length));
        }
    }catch(err){
        // 极低概率会出现控件消失或者就是脚本被关闭了，所以不用处理
        console.info("3");
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

