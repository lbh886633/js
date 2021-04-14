"ui";

var tempSave = {
    firstEnvi: 0,
    privacy: 0,
    NUMBER: 0,
    自动打码: false,
    version: "10" + "优化注册7模式的流程",


};

var server = {
    serverUrl: "hh",
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
        if (-1 < str.indexOf(".")) {
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

    get: function (uri) {
        try {
            let re = http.get(this.serverUrl + uri);
            if (re.statusCode != 200) {
                throw "请求失败，状态码：" + re.statusCode;
            }
            return JSON.parse(re.body.string());
        } catch (err) {
            log("请求失败", err);
        }
    },

    excludeNull: function (o) {
        let p = {};
        for (let k in o) {
            if (o[k] != null) {
                p[k] = o[k];
            }
        }
        return p;
    },

    post: function (uri, o) {
        try {
            console.verbose(p)
            return http.post(this.serverUrl + uri, p, {}).body;
        } catch (err) {
            log("POST上传出错", err)
        }
    },

    sendData: function (url, o) {
        try {
            console.verbose(url, o);
            log(http.post(url, o, {}).body.string());
        } catch (err) {
            log("上传出错", err)
        }
    },

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

var fansNameList = [], fansList = [], countGetFansNum = 0, getFansNum = 0;
var modelIdList = ["devmodel", "loginmodel", "updatemodel", "getmodel"];
var 根路径 = "/sdcard/xxsq/";
var 路径 = {}

路径 = 创建路径(根路径, [
    { 失败环境列表: "失败环境列表" },
    { 失败环境: "失败环境" },
    { 登录频繁号: "登录频繁号" },
    { 注册频繁号: "注册频繁号" },
    { zhuce: "zhuce" },
    { 邮箱备份: "邮箱备份" },
    { 邮箱: "邮箱" },
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


{
/*     let d = new Date()
    console.setGlobalLogConfig({
        "file": 路径.文件夹.日志
            + d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() 
            + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
            + ".txt",
        maxFileSize: 256*1024*1024,
        filePattern: "【[%r] [%d{yyyy-MM-dd HH:mm:ss,SSS}]】[%p] %m%n"
    });
 */}
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
                            <input id="jihuoma" h="0" text="" />
                            <vertical h="0" id="devmodel">
                                <linear padding="5 0 0 0">
                                    <input id="devurl" w="*" text="" hint="这里输入测试环境的链接地址"/>
                                </linear>
                            </vertical>
                            <linear padding="5 0 0 0">
                                <Switch id="autoService" textColor="red" text="无障碍服务（注意！必须开启才能正常运行脚本）" checked="{{auto.service != null}}" />
                            </linear>

                            <vertical  bg="#404EC9A2">
                                <linear padding="5 0 0 0">
                                    <text textColor="black" textSize="20" text="模式设置" />
                                </linear>
                                <radiogroup orientation="horizontal">
                                    <radio id="dev" text="测试环境" />
                                    <radio id="ptxz" text="登号" />
                                    <radio id="ptxz1" text="采集" />
                                    <radio id="ptxz2" checked="true" text="还原" />
                                    <radio id="ptxz3" text="注册" />
                                    <radio id="ptxz5" text="单注册" />
                                    <radio id="ptxz6" text="注册_7" />
                                </radiogroup>
                            </vertical>

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
                                    <input id="wz" w="*" text="https://betterlove.online/collections/taste-vibrator" />
                                </linear>
                            
                                <linear>
                                    <checkbox id="gzyh" checked="true" text="关注用户" />
                                    <checkbox id="zlxg" text="资料修改" />
                                    <checkbox id="ghtx" text="更换头像" />
                                    <checkbox id="scsp" text="上传视频" />
                                    <checkbox id="fanslist" text="采集粉丝" />
                                </linear>
                                <linear h="{{tempSave.privacy||0}}">
                                    <checkbox id="replymsg" text="回复消息" />
                                    <checkbox id="sayhellobyurl" text="链接打招呼" />
                                    <checkbox id="sayhellobysearch" text="搜索打招呼" />
                                    <checkbox id="getsay" text="采集发送" />
                                </linear>
                                <linear padding="10 1 ">
                                    <img bg="#C3916A" w="*" h="1"/>
                                </linear>
                                <linear>
                                    <checkbox id="first_start" text="从头开始" />
                                    <checkbox id="continue" checked="true" text="现在继续" />
                                    <checkbox id="nofor" checked="true" text="关闭循环" />
                                    <checkbox id="createAccount" text="生成邮箱" />
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
                            </vertical>
                            <linear padding="5 0 0 0">
                                <button id="ok" w="*" h="auto" layout_gravity="bottom" style="Widget.AppCompat.Button.Colored" text="启动" />
                            </linear>
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

ui.dev.click(()=>{
    setBg("devmodel", "测试环境")
})
ui.ptxz.click(()=>{
    setBg("loginmodel", "登号")
})
ui.ptxz1.click(()=>{
    setBg("getmodel", "采集")
})
ui.ptxz2.click(()=>{
    setBg("updatemodel", "还原")
})
ui.ptxz3.click(()=>{
    setBg("loginmodel", "注册")
})
ui.ptxz5.click(()=>{
    setBg("loginmodel", "单注册")
})
ui.ptxz6.click(()=>{
    setBg("loginmodel", "注册_7")
})




ui.emitter.on("create_options_menu", menu => {
    menu.add("设置");
    menu.add("日志");
    menu.add("关于");
    menu.add("退出");
});

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

ui.viewpager.setTitles(["功能区"]);



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

ui.autoService.on("check", function (checked) {

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

    if (qd == 0) {
        qd = 1

        threads.start(主程序)
    } else {
        qd = 0;
        toastLog("脚本已经启动了，再次点击可再次启动");
    }
});

var 线, 线1
function 悬浮() {

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

    var x = 0, y = 0;

    var windowX, windowY;

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

                window.setPosition(windowX + (event.getRawX() - x),
                    windowY + (event.getRawY() - y));

                if (new Date().getTime() - downTime > 30000) {
                    exit();
                }
                return true;
            case event.ACTION_UP:

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

    console.show()
    console.setPosition(10,0)
    初始化()
    sleep(500)



    if (!requestScreenCapture()) {
        toast("请求截图失败");
        exit();
    }
    sleep(1000)

    if(ui.createAccount.checked){
        log("邮箱生成");
        邮箱生成();
    }
    if(ui.dev.checked){
        log("修改链接");
        let jsUrl = ui.devurl.text();
        if(jsUrl){
            log("[测试中]...")
            http.get(jsUrl, {}, function (res, err) {
                if (err) {
                    log("[修改失败]链接访问失败")
                    console.error(err);
                    return;
                }
                log("code = " + res.statusCode);
                files.write("/sdcard/.url.txt", jsUrl)
                log("[修改链接]", files.read("/sdcard/.url.txt"));
            });
        } else {
            log("[修改失败]", jsUrl)
        }
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

                threads.start(function () {

                    let saveAcc = {
                        username: accountInfo.username,
                        isExceptoion: 0,
                        isInvalid: 0,
                        url: accountInfo.url,
                        name: accountInfo.enviName,
                        focus: server.numberToString(accountInfo.focusNumber),
                        fans: server.numberToString(accountInfo.fansNumber),
                        likes: server.numberToString(accountInfo.likeNumber),
                    }
                    server.add("account", saveAcc);
                })


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


                if(accountInfo.url != ui.wz.text()){
                    log("修改链接")
                    let 编辑信息 = textContains("Edit ").visibleToUser().findOne(2000)
                    if(编辑信息){
                        编辑信息.click()

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








        }else if(r==false) break;
        sleep(3000)
    }
}

function 登号模式() {
    while (1) {
        切换环境("新建环境");
        sleep(500)
        if (打开抖音()) {

            for (let i = 0; i < 5; i++) {

                if(text("Sign up").find().length>0) break;


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


                    }
                }
            }
        }

    }
}




function 打开抖音() {
    if(tempSave.login){
        log("登录/注册模式")
        for (let i = 0; i < 5; i++) {

            if (packageName(pack).findOne(2000)){

                for (let j = 0; j < 5; j++) {

                    popupDetection();
                    sleep(600)
                    if(text("Me").findOnce()){
                       break; 
                    }
                }


                clickAction(text("Me"), 50, 500);

                if(text("Sign up").clickable(true).findOne(3000)){
                    return true;
                }
                if(text("Edit profile").findOnce()){
                    log("已经存在账号")
                    return false;
                }

                console.verbose("等待" + appName + "启动中..." + i);
            } else {
                app.launchApp(appName);
            }
        }
        console.verbose("进行最后一次个人信息页面检测")

        if(text("Sign up").clickable(true).findOne(3000))
            return true;
        else return false;

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
            是否删除 = 1;
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






function 采集模式() {

    for(let jlk=0; jlk<20; jlk++){
        if(jlk%2) toastLog("请手动进入TikTok视频页");
        log("正在等待可评论的视频页");
        var 新增評論 = text("Add comment...").visibleToUser().findOne(30000)
        if (新增評論) {

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

    firstEnvi()
    while(是否是失败环境()){

        let re = xx("切换到下一个环境");
        if(re!="true") {
            console.warn("环境切换出现异常！异常值：",re);
            xx("切换到上一个环境");
            break;
        }
    }
    sleep(1000)


    launchApp("TikTok")
    let tagI=0

    while(++tagI < 20 &&!text("Discover").findOne(2000))
        log("等待TikTok完成启动")
    if(tagI>=20) {
        log("启动失败")
        return false;
    }

    text("Discover").findOne(1000).parent().click()

    if(ui.labeltag.checked) {
        log("请手动进入视频页面")
        return true;
    }


    try{
        sleep(500)
        let str = ui.label.text();
        if(str) 搜索选择(str);
        else 滑动选择();
        等待加载()
        let videoList = className("androidx.recyclerview.widget.RecyclerView").findOne(3000).children()
        sleep(100)

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

                action.click();
                action.setText(str);

    
                for (let i = 0; i < 5 && (text("HASHTAGS").find().length < 1); i++) {
                    try{

                        let searchList = className("androidx.recyclerview.widget.RecyclerView").findOne(1000);
                        if(searchList.children().length)

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

            x = parseInt(device.width * 0.5)
            swipe(x, parseInt(device.height * 0.8 + random(0, 100)),
                x, parseInt(device.height * 0.3 + random(100, 200)),
                random(300, 700)
            )
            sleep(1000)
        }

        className("androidx.recyclerview.widget.RecyclerView").findOne(5000).children()[0].click()
    }
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
    if (!files.exists(路径.链接)) {
        alert("没有找到",路径.链接)
        exit()
    }

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

function 返回首页() {
    log("返回首页中..")
    for (var i = 0; i < 10; i++) {
        popupDetection();
        if (packageName(pack).visibleToUser().exists()) {
            sleep(1000)
            if (text("Home").visibleToUser().exists() && text("Me").visibleToUser().exists()) {
                break
            } else {
                back()
                sleep(500)
            }
            var 推出 = text("QUIT").visibleToUser().findOne(200)
            if (推出) {
                推出.click()
            }
        } else {
            log("启动app")
            sleep(2000)
            app.launch(getPackageName("TikTok"))
            sleep(5000)
        }
    }
}




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
                        sleep(random(15000, 20000))
                        while (1) {
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
    if(ui.yhm) var 用户名 = "不设置";
    if(ui.yhzh) {
        var 用户账号 = "不设置";
        nowUsername = accountInfo.username;
    }
    var 网站 = ui.wz.text()
    var 简介 = ui.jj.text()
    返回首页()
    var 我 = text("Me").findOne(30000)
    if (我) {
        log("Me " + 我.parent().click())
        sleep(random(1000, 1500))
    }
    var 右上角 = classNameEndsWith("RelativeLayout").drawingOrder(7).clickable(true).findOne(2000)
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



        function clickSC(textByUO, textByLog) {
            let uo = text(textByUO).visibleToUser().clickable(true).findOne(2000)
            if (uo) textByUO = uo.click();
            if (textByLog) console.verbose(textByLog, textByUO==true)
            return textByUO == true;
        }

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

        editInfo("Website", 网站)
        editInfo("Bio", 简介)

    }

    if (用户账号) {
        返回首页();

        runTikTok();
        server.get("account/update/" + nowUsername +"?newUsername=" + accountInfo.username);
    }
}

function 获取用户名(path) {
    if (files.isFile(path)) {
        if (!tempSave.getName) tempSave.getName = 0;

        let names = files.read(path).split("\n");
        while (names.length > 0) {
            if (testName(names[0])){

                files.write(path,names.join("\n"));
                return names[0];
            }

            names.shift();
        }
        console.warn("文件已被读取完毕", path);
    } else console.warn("文件不存在");
    return "不设置";

    function testName(name) {
        if (!/[\u4E00-\u9FFF]/.test(name)) {
            if (/^\w+$/.test(name))
                return true;

        }
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

            移动文件(路径.文件夹.头像列表, 路径.文件夹.头像, true)
            sleep(random(2000, 2500))
            log("头像 " + 照片.click())
            sleep(random(2000, 2500))
            var 從圖庫中選取 = text("Select from Gallery").findOne(2000)
            if (從圖庫中選取) {
                log("從圖庫中選取 " + 從圖庫中選取.click())
                sleep(random(1000, 1500))


                for (let i = 0; i < 10; i++) {
                    console.verbose("检测是否需要权限");

                    action = text("ALLOW").findOne(100);
                    if(action) action.click(); 
                    action = text("Allow").findOne(50);
                    if(action) action.click(); 
                    action = text("允许").findOne(50);
                    if(action) action.click(); 
                    
                    if(text("All media").findOne(100)) break;
                }

                

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

            }
        }
    }

}

function 采集粉丝信息() {

    返回首页()
    getFansNum = 0

    clickAction(text("Me"), 50)



    clickAction(function () { return text("Followers").boundsInside(520, 670, 920, 730).findOne(200).parent() }, 500, 600)

    fansNameList = server.get("fans/list/username?accountUsername="+accountInfo.username);
    getFansList(fansNameList, fansList)
}


function getFansList(fansNameList, fansList, all) {

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


        let FollowerList = FollowerParent.children();

        let score = 0;


        for (let f in FollowerList) {
            f = FollowerList[f];
            try{

                let username = f.children()[1].children()[0].children()[0].text();
                

                tempList.push(username);


                let follow = f.children()[2].children()[0].children()[0];
                if(follow.text() == "Follow back"){

                    console.info("互相关注：", follow.click())
                }


                if(fansNameList.indexOf(username)<0){


                    if(f.click()){

                        closeTag = 0;


                        getFansInfo(username);


                        if(ui.getsay.checked){
                            if(isNaN(tempSave.NUMBER)) tempSave.NUMBER = 1;
                            let newMsg = (++tempSave.NUMBER) + tempSave.getSayMessage;
                            let re = sayHello(newMsg);
                            if(re){
                                console.info("消息发送状态", re.status);
                            } else {
                                log("发送失败")
                            }
                            log(re)
                        }


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

            let similar = 0;
            tempList.forEach(e=>{
                if(tempSave.indexOf(e)>-1)
                    similar++;
            })

            if(similar > tempList.length*0.5 && 5 < closeTag++){
                console.warn("到底了")
                break;
            }
        }

        tempSave = tempList;

        tempList = [];

        save({},true)

        let scrollDown = depth(9).visibleToUser().scrollForward();
        log("滑动", scrollDown)

    }
    log("遍历结束");
    return fansNameList;

}


function getFansInfo(usernameP,mainTag) {
    function getNum(str){
        let uo = text(str).findOne(1000);
        if(uo) {
            let uos = uo.parent().children();
            for (let i in uos) {
                i = uos[i];
                if(!isNaN(parseInt(i.text())))

                    return i.text()
            }
        }else console.verbose(str,"获取控件失败！")

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
        ,video = {}
        ,BI = "-"
        ,myBI = "-"
        ,更多;

    try {
        log("尝试获取信息")

        let len = mainTag ? 0 : 5;

        for (let i = 0; i < len; i++) {

            更多 = classNameEndsWith("ImageView").drawingOrder(3).visibleToUser().findOne(500)
            if (更多) {
                log("更多", 更多.click())
                if(mainTag) {
                    log("获取自己的信息", i)
                    break;
                }
            }
            

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

                break;
            }


            let more = text("More").findOne(2000);
            if (more) {
                log("粉丝无链接信息")
                back();
                sleep(200);

                break;
            }
        }

        if(!mainTag){

            sleep(300);


            let temp = 更多.parent().children();
            temp.forEach(uo => {
                if (uo.id().indexOf("title") > -1) {

                    name = uo.text();

                    return false;
                }
            })
        }

        focusNumber = getNum("Following");
        fansNumber = getNum("Followers");

        if (!(focusNumber == -1 && fansNumber == -1)) {
            likeNumber = getNum("Likes");
            if (likeNumber == -1) likeNumber = getNum("Like");
        }

        let nodeUO = text("Following").findOne(1000) || text("Followers").findOne(1000) || text("Likes").findOne(1000);
        if (nodeUO) {

            nodeUO = nodeUO.parent().parent().parent().children();

            for (let e in nodeUO) {
                e = nodeUO[e];
                if(mainTag){


                    if(e.children().length>1){

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

                if(mainTag) myBI = nodeUO[nodeUO.length-2].text()

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

            if (!(focusNumber == -1 && fansNumber == -1 && username == usernameP)) {
                video = getVideoPlayerNumberInfo()
            }
            return {
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


function getVideoPlayerNumberInfo() {
    log("获取个人视频播放量信息")
    let videoInfo = [];
    for (let i = 0; i < 5; i++) {
        let videoList = className("androidx.recyclerview.widget.RecyclerView").boundsContains(0,1300,1440,0).findOne(200);
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

function save(obj,savaToFile) {
    if(savaToFile){
        log("将数据保存到文件")


        let fix = 路径.文件夹.粉丝 + accountInfo.envi;

        let fansNameListPath = fix+ "_粉丝账号列表.txt";
        let fansListPath = fix +"_粉丝列表.txt";
        let fansTaskListPath = fix +"_待处理列表.txt";

        if(!files.isFile(fansNameListPath))
            files.create(fansNameListPath)
        if(!files.isFile(fansListPath))
            files.create(fansListPath)
        if(!files.isFile(fansTaskListPath))
            files.create(fansTaskListPath)


        files.copy(fansNameListPath, fansNameListPath+".bak");
        files.copy(fansListPath, fansListPath+".bak");
        let sb = new java.lang.StringBuilder();
        fansList.forEach(e=>{
            e.envi = fix;
            sb.append(JSON.stringify(e)).append("\n");
        })


        fansList=[];
        log("本次保存数据大小：", sb.length())
        

        files.append(fansListPath,sb.toString());
        files.write(fansNameListPath,JSON.stringify(fansNameList))
        return true;
    }
    fansNameList.push(obj.username);
    fansList.push(obj);


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
        reservedB: obj.BI,
    });
    return obj;
}



function 回复消息() {
    返回首页()
    log("测试中...")

    Fans={

        path: 路径.文件夹.粉丝 + accountInfo.envi + "_粉丝列表.txt"
    };


    text("Inbox").findOne(1000).parent().click()

    let newMsgCount = 0;
    let action = text("All activity").findOne(100).parent().parent()

    action.find(className("android.widget.TextView")).forEach(e=>{
        let n = parseInt(e.text());
        if(!isNaN(n)) {
            newMsgCount = n;
            return false;
        }
    })
    log("新消息数量：", newMsgCount)

    if(newMsgCount>0){

        let biu = action.findOne(className("android.widget.ImageView").clickable(true))
        biu.click()

        action = className("androidx.recyclerview.widget.RecyclerView").boundsContains(0, 201, 1440, 2434).findOne(1000);
        for (let i = 0; i < 6; i++) {
            sleep(500)

            let sendList = getNewMsgList();
            if(sendList.length > 0){




                replySendlist(sendList)
            } else {
                i+=2
            }

            action.scrollForward()
        }
    }

}

function 发送消息() {
    返回首页()
    


    let fans;
    do{
        fans = 拿一个有链接的粉丝信息();
        if(fans) {

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

        fans = 拿一条粉丝数据();
        if(fans){
            console.verbose(fans)

            fans = JSON.parse(fans);

            if(5 < fans.url.length){

                return fans
            } else {
                log("粉丝没有链接");

                files.append(路径.文件夹.私信 + accountInfo.envi+"_没有链接.txt", fans);
            }
        }
    } while(fans)
    console.warn("粉丝数据被使用完毕")
    return false
}


function 拿一条粉丝数据() {


    if(!cache) var cache = {};
    if( !cache.fansFile || !cache.fileData

        || (cache.fansFile.indexOf(accountInfo.enviName) < 0
            && cache.fansFile.indexOf(accountInfo.username) < 0)
    ){


        let envi = accountInfo.enviName;

        let name = accountInfo.username;

        let fansFile,filesByName;

        let filesByEnvi = files.listDir(路径.文件夹.粉丝, function (n) {
            return n.indexOf(envi) > -1 && n.substring(n.length - "_待处理列表.txt".length) == "_待处理列表.txt";
        })
        console.verbose("通过环境获取到的文件数量：", filesByEnvi.length)
        if(filesByEnvi.length != 1){

            filesByName = files.listDir(路径.文件夹.粉丝, function (n) {
                return n.indexOf(name) > -1 && n.substring(n.length - "_待处理列表.txt".length) == "_待处理列表.txt";
            })
            console.verbose("通过名字获取到的文件数量：", filesByEnvi.length)
            if(filesByEnvi.length > 1){
                log(filesByEnvi)

                filesByEnvi.forEach(n=>{
                    if(filesByName.indexOf(n) > -1){
                        fansFile = n;
                        return false;
                    }
                })
            } else if (filesByEnvi.length == 1){

                fansFile = filesByName[0];
            } else {

                fansFile = null;
            }
        }else{

            fansFile = filesByEnvi[0];
        }

        console.verbose("最终获取到的文件名：", fansFile);

        let fileData;
        if(fansFile){

            fileData = files.read(路径.文件夹.粉丝 + fansFile).split("\n");
        } else {

            fileData = null;
        }

        console.verbose("最终获取到的文件数据长度：", fileData.length);


        files.copy(路径.文件夹.粉丝 + fansFile, 路径.文件夹.备份
        + fansFile + new Date().toLocaleTimeString())
        console.verbose("粉丝数据文件已备份");


        cache.fileData = fileData;
        cache.fansFile = fansFile;
        log("粉丝数据已缓存");
        
    }


    if(cache && cache.fansFile && cache.fileData){
        if(cache.fileData.length < 1){
            console.error("文件数据已被使用完毕！");
            return false;
        }

        let fans = cache.fileData.shift();

        files.write(路径.文件夹.粉丝 + cache.fansFile
            .substring(0, cache.fansFile.indexOf("_待处理列表.txt")) + "_中间.txt", JSON.stringify(fans));

        files.write(路径.文件夹.粉丝 + cache.fansFile, cache.fileData.join("\n"));
        return fans;
    } else {
        console.error("文件中没有数据！可能已使用完毕");

        return null;
    }
}

function getHelloMessage() {

    let msg = server.get("hello/massage").message;
    if(!msg){

        if(!cache) var cache = {};

        let helloMessage = [
            "Hi ~",
            "Nice to meet you.",
            "Greet to see you.",
            "How are you feeling today?",
            "Howdy!",
            "Good to see you!"
        ]

        let emojiMessage = [
            "o(*≧▽≦)ツ",
            "(*^▽^*)",
            "(๑¯∀¯๑)",
            "(/≧▽≦)/",
            "(　ﾟ∀ﾟ) ﾉ♡",
            "o(^▽^)o",
            "(＾－＾)V"
        ]

        msg = helloMessage[random(0, helloMessage.length-1)] 
            + " " + emojiMessage[random(0, emojiMessage.length-1)];
    }
    console.verbose("最终消息：", msg);
    return msg;
}


function sayHello(f, msg){
    f = f || {};
    msg = (msg=="undefined"||msg=="undefined") ? "hello":msg;
    等待加载()
    let action,score;
    for (let i = 0; i < 3; i++) {
        log("检测中...")

        score = 0 ;

        action = text("Message").findOne(4000);

        if(action) {
            score++;
            if(action.click()){
                log("正在进入消息界面");
            } else {
                log("进入消息界面失败");
            }
        }

        action = text("Follow").findOne(100);
        if(action) {
            score++;
            return {
                status: false,
                msg: msg,
                exc: "未关注对方"
            }
        }

        action = text("Requested").findOne(100);
        if(action) {
            score++;
            return {
                status: false,
                msg: msg,
                exc: "对方拒绝私信"
            }
        }

        action = text("Follow back").findOne(100);
        if(action) {
            score++;
            console.warn("未互相关注，关注对方", action.click());
        }


        action = text("Send a message...").findOne(1000);
        if(action) {
            score++;
            break;
        }
    }

    if(score < 1){

       return false;
    }


    re = sendMsg(msg);
    f.sayHello++;
    if(!f.reservedA) f.reservedA = "";
    if(re.status){
        f.reservedA += "打招呼成功。";


        console.info("打招呼成功", re.msg)
        f.sayHello = re.msg;
        f.sayHelloException = re.exc;
        files.append(路径.文件夹.私信 + accountInfo.envi + "_已打招呼.txt", f);
    } else {
        f.reservedA += "打招呼失败。";


        console.warn("打招呼失败")
        f.sayHello = re.msg;
        f.sayHelloException = re.exc;
        files.append(路径.文件夹.私信 + accountInfo.envi + "_打招呼失败.txt", f);
    }


    server.get("fans/sayhello?username="+f.username);


    server.add("record", {
        message: re.msg,
        perfix: re.perfix,
        suffix: re.suffix,
        accountUsername: accountInfo.username,
        fansUsername: f.username,
    });
    return re;
}


function sendMsg(msg){
    log("发送消息：", msg)
    for (let j = 0; j < 5; j++) {

        action = text("Send a message...").findOne(1000);
        if(action) {
            log("消息输入框")
            action.setText(msg);
            break;
        }
    }

    action = className("android.widget.ImageView").boundsContains(1345,2270,50,200).clickable(true).findOne(1000);
    if(action){
    log("发送消息", action.click());
    }

    action = className("android.widget.ImageView").boundsContains(1345,2270,50,200).clickable(true).findOne(1000);
    if(action){
        log("再次点击发送消息按钮", action.click());
    }
        
    action = text("Resend").clickable(true).findOne(300)
    if(action) action.click()

    sleep(2000);

    let msgAction = className("androidx.recyclerview.widget.RecyclerView").findOne(2000);
    if(msgAction){
        while(msgAction.scrollForward()){
            sleep(100)
        }
    }
    try{
        sleep(500)

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


function sendMsgBackup(msg){
    
    for (let j = 0; j < 5; j++) {


        action = text("Send a message...").findOne(1000);
        if(action) {
            log("消息输入框")
            action.setText(msg);
        }


        action = className("android.widget.ImageView").boundsInside(1345,1400,1440,2434).clickable(true).findOne(1000);
        if(action){
            log("发送消息");
            action.click()
            break;
        }
    }

    log("等待2秒消息发送")
    sleep(2000);


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

        msgListUO = msgListUO.children()

        for (let i = msgListUO.length-1; i >= 0; i--) {
            let m = msgListUO[i].children();
            let status,msg,perfix="",suffix="",code,sender;


            code = "" + tryRun(m[0], ".children().length") + tryRun(m[1], ".children().length") + tryRun(m[2], ".children().length");
            if(code[0]!="0") {
                try{
                    let actionPerfix = m[0].findOne(className("android.widget.TextView"))
                    if(actionPerfix){
                        perfix = actionPerfix.text();
                    }
                } catch (err) {}
            }

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


function getNewMsgList() {

    let action = className("androidx.recyclerview.widget.RecyclerView").boundsContains(0, 201, 1440, 2434).findOne(1000);
    let sendlist = [];
    if(action){

        action.children().forEach((uo,i)=>{
            let msgNum = uo.findOne(


                boundsInside(1300, 0, 1400, device.height)

                .className("android.widget.TextView")
                .filter(function(u){
                    u = u.text();

                    if(!(isNaN(parseInt(u))) && (u.indexOf("-") < 0)){
                            return true;
                    }
                    return false;
            }))

            if(msgNum){

                sendlist.push(uo);
            }

        })
    }
    return sendlist;
}


function replySendlist(sendlist) {

    for (let f in sendlist) {
        f = sendlist[f];

        f.click();

        sleep(2000);    

        replyMsg();

        for (let i = 0; i < 5; i++) {
            back();
            if(text("Direct messages").findOne(2000)) 
                break;
        }
    }
}


function replyMsg() {

    log("正在获取粉丝数据")
    fans = getFansInfoByFansMsgView()
    log("开始获取消息并回复")

    let 总消息=[],新消息=[],sendTag=true;
    try{


        总消息 = fans.messages||[];
    } catch (err) {
        log("获取聊天记录异常：", err)
    }

    let msgAction = className("androidx.recyclerview.widget.RecyclerView").findOne(2000);

    while (true) {
        sleep(300)
        log("获取当前页的消息")


        let saveNum=0;
        let 新消息列表 = 获取消息();
        
        if(总消息.length == 0){
            总消息 = 总消息.concat(新消息列表);
            saveNum = 新消息列表.length;
        } else {
            for (let 消 in 新消息列表) {
                消 = 新消息列表[消];


                let tag = false;
                for (let 息 in 总消息) {
                    息 = 总消息[息];




                    if(消.msg == 息.msg){

                        let letTag = true;
                        for (let k in 消) {
                            if(消[k] != 息[k]) {

                                letTag = false;
                                break;
                            }
                        }
    
                        if(!letTag) {

                            tag = false;
                            break;
                        }
                    }

                    tag = true;
                }
    
                if(tag) {
                    总消息.push(消);
                    新消息.push(消);

                    saveNum++;
                }
            }
        }
        if(saveNum == 0){

            if (sendTag) sendTag = false;
            else break;
        }
        log("翻页，保存信息数：", saveNum)

        if(!msgAction.scrollBackward()){
            log("已经达到消息顶部");
            break;
        }
    }


    let 回消息 = 消息处理(fans,新消息);
    if(回消息){

        let sm = sendMsg(回消息)
        总消息.push(sm);
        新消息.push(sm);
    }



    for (let i = 新消息.length; 0 <= i; i--) {

        新消息[i].params = null;
        server.add("record", server.excludeNull(新消息[i]));
    }
    addFans(fans,Fans)
}


function getFansInfoByFansMsgView() {

    desc("More").findOne().click()

    let fans,username,name;
    for (let index = 0; index < 5; index++) {
        sleep(1000)
        let action = className("com.bytedance.ies.dmt.ui.widget.DmtTextView").findOne(2000);
        if(action){
            let textUO = action.parent().parent().find(className("android.widget.TextView"));

            try{
                username = textUO[0].text();
                name = textUO[1].text();



                fans = server.get("fans/username/" + username + "?accountUsername=" + accountInfo.username)
                break;
            } catch (err) {
                console.verbose("获取对方账号异常", err)
            }
        }
        if(fans) break;
        sleep(500)
    }

    if(!fans) {
        console.warn("无粉丝对象，创建一个粉丝对象")
        fans = {
            username: username,
            name: name
        }
    } else {

        fans.messages = server.get("record/doubleusername?fansUsername=" + fans.username+"&accountUsername="+fans.accountUsername);
    }

    back();
    sleep(2000);
    return fans;
}



function getFansInfoByData(username, name) {
    log("获取粉丝信息中")

    try {
        if (Fans.list.length < 1) throw "无数据"
    } catch (err) {
        Fans.list = readFansFile(Fans.path);
    }
    console.verbose("当前账号：", username, "粉丝数量", Fans.list.length)

    saveFans()

    let fans = getFans(username, Fans.list)
    Fans.temp = fans;
    return fans;
}

function readFansFile(path) {

    let file = files.read(path);

    let arr = file.split("\n");

    return arr;
}

function saveFansFile(path, arr) {

    let data = arr.join("\n")
    files.write(path,data);
}

function getFans(username,arr) {
    for (let i = 0; i < arr.length; i++) {

        if(-1 < arr[i].indexOf(username)){

            let fans = JSON.parse(arr[i]);
            if(fans.username == username){
                arr.splice(i,1);
                return fans;
            }
        }
    }
    return null;
}

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

function addFans(obj,arr) {
    if(!(arr instanceof Array)){
        if(obj instanceof Array){

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


function 消息处理(fans,newMsgList){

    if(!fans.label) fans.label = {};

    let words = [];
    for (let m in newMsgList) {
        m = newMsgList[m];
        if(m.sender != accountInfo.name){

            let newWords = m.msg.split(/\s/)
            for (let w in newWords) {
                w = newWords[w];

                if(w!="") words.push(w);
            }
        }
    }
    console.verbose("单词组：", words)

    for (let w in words) {
        w = words[w];
        for (let tag in tempSave.RequiredLabels) {
            tag = tempSave.RequiredLabels[tag];

            if(-1 < tag.words.indexOf(w)){ 

                if(!fans.label[tag.label]) fans.label[tag.label]=[];
                fans.label[tag.label].push(w);
            }
        }
    }

    for (let r in tempSave.RequiredLabels) {
        r = tempSave.RequiredLabels[r];
        if(!fans.label[r.label]){
            let reMsg = r.info[random(0,r.info.length-1)];
            console.info("新消息：", reMsg);
            return reMsg;
        }
    }

    console.info("不发送新消息")

    return false;
}

function readRequiredLabelsFile(path){

    if(tempSave.LabelsData || tempSave.LabelsData.length < 1) {
        log("正在请求数据中。。。");
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


    let sourceData = files.read(path).split("\n\n");
    for (let e in sourceData) {
        e = sourceData[e];
        try{
            let si = 0;
            let ei = e.indexOf(":");
            let label = e.substring(si, ei);
            si = e.indexOf("\n");
            let words = e.substring(ei + 1, si);
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


function 获取一条消息(path) {
    let msgs = files.read(path).split("\n")
    return msgs[random(0,msgs.length-1)];
}


function 搜索进入(str,tab,num){

    let action = text("Discover").findOne(1000)
    log(action)
    if(action) action.parent().click();

    action = text("Search").findOne(1000)
    if(action) click(action.bounds().right-5, action.bounds().centerY())

    action.setText(str||"test")

    action = text("Search").findOne(1000)
    log(action)
    if(action) {
        let r = action.bounds();
        click(r.centerX(), r.centerY())
    }

    sleep(1000)
    action = text(tab||"USERS").findOne(1000)
    if(action) action.parent().click()

    sleep(1000)
    等待加载()

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
function 通过搜索打招呼() {
    返回首页();

    let fans = 获取一条无链接的粉丝信息();
    let username = fans.username;

    搜索进入(username, "USERS", 0);



    let re = sayHello(getHelloMessage())
    if(re){
        log("结果:", re.status)
    } else {
        log("用户似乎不存在")
        files.append(路径.文件夹.私信 + accountInfo.envi + "_打招呼失败_用户似乎不存在.txt", fans);
    }
}




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
        files.removeDir(路径.失败环境)
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

function 注册7模式() {

    while (1) {
        if(清除数据()){

            app.launchApp(appName)
            for (let j = 0; j < 5; j++) {
                
                if(!packageName(pack).findOnce(10000)){
                    app.launchApp(appName)
                }

                let action = textContains("Sign up").findOne(2000)
                if(action) {
                    action.click();
                    break;
                }

                popupDetection();
                sleep(600)
            }

            for (let index = 0; index < 5; index++) {
                lh_find(text("Sign up").clickable(true), "Sign up", 0)
                let tag;
                for (let i = 0; i < 5; i++) {

                    if(text("Use phone or email").findOne(1000)){
                        if(text("Use phone or email").findOne(1000).bounds().right < 0){

                            let action = textContains("Already have").findOne(1000)
                            if(action) {
                                action.click()
                                sleep(1000)
                            }
                        }
                        if(text("Use phone or email").findOne(1000).bounds().right > 0){

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
                    index = 10;
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

                        随机账号 = 取注册()
                        log(随机账号 + " " + setText(随机账号))
                        sleep(500)
                        if (lh_find(depth(11).text("Next"), "Next")) {
                            sleep(4000, 5000)
                            log("暂未处理异常检测，例如频繁")
                            while (1) {

                                sleep(1500)
                                var 等待 = depth(11).drawingOrder(2).classNameEndsWith("view.View").visibleToUser().findOne(500)
                                if (等待) {
                                    console.verbose("等待")
                                } else {
                                    break
                                }
                            }






                            log("正在等待手动过验证码")
                            while(true){
                                if(!text("Refresh").findOne(1000)
                                    && (text("Create password").findOne(500) 
                                    || text("Log in").findOne(500))
                                ) {

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
                                            log("需要验证邮箱6位验证码，等待输入验证码1")
                                            while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                                sleep(3000)
                                            }
                                            log("离开验证码界面")
                                        }
        

                                        sleep(5000)
                                        var 成功 = text("Sign up").visibleToUser().findOne(1200)
                                        if (成功) {
                                            saveReg(随机账号, ui.szmm.text())
                                            if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lh", 0, 5000)) {
                                                sleep(6000)
                                                return true
                                            }
                                        }
                                        if (lh_find(text("Skip").clickable(true), "skip", 0, 5000)) {
                                            if (text("Me").visibleToUser().findOne(5000)) {
                                            }
                                            saveReg(随机账号, ui.szmm.text())
                                            log("注册成功了")
                                            return true
                                        }
        
                                        var 需要验证 = textContains("Enter 6-digit code").visibleToUser().findOne(1000)
                                        if (需要验证) {
                                            log("需要验证邮箱6位验证码，等待输入验证码2")
                                            while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                                sleep(3000)
                                            }
                                            log("离开验证码界面")
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
                                        saveReg(随机账号, ui.szmm.text())
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

                    随机账号 = 取注册()
                    log(随机账号 + " " + setText(随机账号))
                    sleep(1000)
                    if (lh_find(depth(11).text("Next"), "Next")) {
                        sleep(4000, 5000)
                        log("暂未处理异常检测")
                        while (1) {

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


function 注册打码() {
try{
    for (var ii = 0; ii < 3; ii++) {
        if (text("Me").visibleToUser().exists()) {
            console.info("原保存账号 路径 /DCIM/zhuce.txt")
            let acc = 随机账号+'，'+ui.szmm.text()+'\n';
            log(acc);
            files.append("/sdcard/DCIM/zhuce.txt", acc);
            log("注册成功了");
            return true
        }

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

                            var Next = text("Next").visibleToUser().findOne(1000)
                            if (Next) {
                                log("Next " + Next.parent().parent().click())
                                

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
                                    log("需要验证邮箱6位验证码，等待输入验证码3")
                                    while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                        sleep(3000)
                                    }
                                    log("离开验证码界面")
                                }


                                sleep(5000)
                                var 成功 = text("Sign up").visibleToUser().findOne(1200)
                                if (成功) {
                                        saveReg(随机账号, ui.szmm.text())
                                        if (lh_find(text("Sign up").depth(8).visibleToUser(), "注册成功了lh", 0, 5000)) {
                                        sleep(6000)
                                        return true
                                    }
                                }
                                if (lh_find(text("Skip").clickable(true), "skip", 0, 5000)) {
                                    if (text("Me").visibleToUser().findOne(5000)) {
                                    }
                                    saveReg(随机账号, ui.szmm.text())
                                    log("注册成功了")
                                    return true
                                }

                                var 需要验证 = textContains("Enter 6-digit code").visibleToUser().findOne(1000)
                                if (需要验证) {
                                    log("需要验证邮箱6位验证码，等待输入验证码4")
                                    while (textContains("Enter 6-digit code").visibleToUser().findOne(1000)) {
                                        sleep(3000)
                                    }
                                    log("离开验证码界面")
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
                                saveReg(随机账号, ui.szmm.text())
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

            result = "end";
            break;
        }
        let uo = text("Next").findOne(1000);
        if(uo) uo.click()
        sleep(1000);
    }

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







    }
    log("响应码：", p, "   消息：",m,"   数据如下：");
    log(d);
    if("10106009" == p){
        console.error("结束脚本", m);
        exit();
    }

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


function xx(cmd,tag) {
    tempSave.firstEnvi++

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
                tempSave.firstEnvi++

                if(firstEnvi()) continue;
            }
            if(!isNaN(parseInt(tempSave.没环境))) {
                if(5 < tempSave.没环境++) {
                    log("结束脚本", tempSave.没环境)
                    exit()
                }
            } else tempSave.没环境=0;
            

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


function 移动文件(from,to,rt) {
    let file = files.listDir(from);
    if (file.length > 0) {

        files.listDir(to).forEach(n=>{
            console.verbose(
                "删除文件 " + n,
                files.remove(files.join(to,n))
            )
        });

        file = file[random(0, file.length)];
        let toPath = files.join(to, file);
        let fromPath = files.join(from, file);
        log("复制文件：\n从：  " + fromPath + "\n到：  " + toPath)
        files.copy(fromPath, toPath);

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




function cancelDelete(num) {
    errorEnvi.push(num)
    files.append(路径.失败环境列表,"//"+num)    
    return true;
}


function firstEnvi(name, package) {
    home();
    sleep(200);

    if (!app.launchApp(name || "xx抹机神器")) {
        toastLog("程序打开失败！");
        return false;
    }

    sleep(3000)
    let leftTopBut, enviListStr;
    try{
        for (let LLL = 0; LLL < 5; LLL++) {
            console.verbose("正在获取环境列表");

            if( 2<LLL && !packageName(package || "zpp.wjy.xxsq").findOne(300)){
                log("不在xx神器中");
                break;
            }


            enviListStr = text("环境列表").filter(function(uo){
                uo = uo.bounds()
                return uo.right>0
            }).findOne(1000);

            if(!enviListStr){

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


                    childList = id("recycler_envs").findOne(1000).children();
                    log("当前获取到的环境列表数量：", childList.length);
                    if(childList.length<1) log("重新获取中...本次获取到的数量：",childList.length);
                    else break;
                }
                if (childList.length > 0) {

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
                    

                    if(click(2, childList[0].bounds().centerY())){

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




    let sleepTag = true
    log("等待进入xx主界面")
    do{ 

        try{text("继续切换").findOne(200).click()}catch(e){console.verbose("没有 继续切换 文字 ")}
        if(textContains("剩余时间不足或者连接数不够了").findOne(100)) {
            console.error("停止脚本\n剩余时间不足或者连接数不够了！")
            exit();
        }

        if(id("main_center").packageName(app.getPackageName("xx抹机神器")).findOne(1000)) break
        else {

            if (packageName(app.getPackageName("xx抹机神器")).exists()) {
                if(sleepTag){

                    sleep(2000)
                    sleepTag = false
                }else{

                    home()
                    sleepTag=true
                }
            }else{

                app.launchApp("xx抹机神器")
                sleep(random(5000, 6000))
            }
        }
    }while(true)


    let tag = xx("获取当前环境名称"), re;
    do{
        re = xx(cmd);
        let newTag = xx("获取当前环境名称");
        if(tag != newTag)
            if(!是否是失败环境())
                break;
        sleep(1000)
    } while (cmd == "切换到下一个环境" || cmd == "切换到上一个环境")
    return re;
}


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
            return true;
        }
    }
    log("当前环境未在失败列表")
    return false;
}

function 初始化() {


    try{

        if(!files.exists(路径.失败环境列表)) 
            files.create(路径.失败环境列表,"");

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


function clickAction(getActionFun, s, ds,pack) {
    if(typeof getActionFun != "function")
    if (getActionFun.getClass() == selector().getClass()) {
        if (!(s >= 0)) s = 500;
        let us = getActionFun;
        getActionFun = function() {
            if(pack)
            return us.packageName(pack).findOne(s)
            return us.findOne(s)
        };
    }
    else return;
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

    while (true) {

        log("账号信息检测")
        try{

            if(text("Me").findOne(2000).parent().click())

                info = getFansInfo("个人信息", true);

            if (!((info.focusNumber <= 0) && (info.fansNumber <= 0) && (info.likeNumber <= 0)) || 5 < tagI)
                break;
        }catch(err){
            console.verbose("获取账号信息异常", err)
        }


        popupDetection();
        

        if(tagI>=limit) {
            log("本轮检测超时")
            break;
        }


        if(text("Sign up").clickable(true).findOne(200)){
            console.verbose("无账号");
            info = null;
            break;
        }


        if(detectionLoginView()) back();

        console.verbose("等待" + appName + "启动中..." + tagI);

        tagI++;
    }

    if(!info || (-1 == info.focusNumber) && (-1 == info.fansNumber) && (-1 == info.likeNumber)){
        log("无账号");

        let path = 路径.文件夹.账号 + xx("获取当前环境名称", true) + ".log"
        files.append(path, new Date().toLocaleTimeString() +",账号失效！\n");
        return false;
    }

    if(tagI>=limit) {
        countTagI += tagI;

        强行停止();
        return runTikTok(false,countTagI);
    }else log(appName + "启动完成");

    threads.start(function () {
        info.enviName = xx("获取当前环境名称", true);
        accountInfo = info;
        accountInfo.envi = accountInfo.username+"@"+accountInfo.enviName;
        let path = 路径.文件夹.账号 + info.enviName + ".log"

        files.append(path,new Date().toLocaleDateString()+" "+ new Date().toLocaleTimeString() +","+ JSON.stringify(accountInfo)+"\n");
        console.info("账号信息获取并保存完成");
    });
    return info;
}

function 添加并打开分身(name) {

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

    let xxBackup = xx;
    xx = function(){}

    let tag=0;
    while(text("Sign up").find().length<1 && 5>tag++){
        新环境();
    }
    if(text("Me").findOne(2000).parent().click() ||i<50 ) {

        if (注册前往登录()) {


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

    xx = xxBackup;
}

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


function popupDetection() {
    let action=[];
    try{
        action = text("Swipe up for more").findOne(50);
        if(action) 随机滑动();
        
        action = text("Account Status").findOne(50);
        if(action) text("OK").findOne(50).click();

        action = text("Okay").findOne(50);
        if(action) action.click();




        action = text("OK").findOnce()
        if(action) action.click();

        action = text("Update username").findOne(50)
        if(action){
            action = className("android.widget.ImageView").filter(function(u){ return (u.bounds().left > device.width*0.5);}).findOne(10);
            if(action) action.click();
        }

        action = text("Skip").find();
        if(action.length>0) action[0].click();;


        action = text("Start watching").findOne(50);
        if(action) action.click(); 


        action = text("ALLOW").findOne(50);
        if(action) action.click(); 
        action = text("Allow").findOne(25);
        if(action) action.click(); 
        action = text("允许").findOne(25);
        if(action) action.click(); 


        let action = text("Submit").findOnce()
        if(action) className("android.widget.Image").find()[0].parent().click()  


        action = packageName(pack).text("CANCEL").findOne(50)
        if(action){
            action.click();
            sleep(500);
        }
        

        action = packageName(pack).text("Open").findOne(50)
        if(action && textContains("Notifications keep").findOne(500))
            action.click();


        if( packageName("zpp.wjy.xxsq").text("网络连接失败").findOne(50)
            || packageName("zpp.wjy.xxsq").text("网络访问超时").findOne(50)
            || 1 < packageName("zpp.wjy.xxsq").text("登录").find().length) {
            text("xx神器登录 - 网络异常");
            back();
        }

    }catch(err){
        console.info("3");

    }


}


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
