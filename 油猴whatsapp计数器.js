// ==UserScript==
// @name        whatsapp计数器
// @namespace   Violentmonkey Scripts
// @match       https://web.whatsapp.com/
// @grant       none
// @version     1.0
// @author      -
// @description 2021/1/1 下午8:17:31
// @require https://code.jquery.com/jquery-2.1.4.min.js
// ==/UserScript==

var user = {};
var number = 0;
var lastCustomerTime;
var lastCustomerId;
var customerWaitCommit={};
var customers={};
var urlDomain = "http://localhost:8082";
var indexDB = {
    db: null,
    dbName: "",
    objectStoreList: [],
    init: function (dbName, objectStoreList) {
        this.dbName = dbName;
        this.objectStoreList = objectStoreList.slice(0);
        this.openDB(dbName);
    },
    openDB: function (name, version) {
        var _this = this;
        version = version ? version : 1;
        var request = window.indexedDB.open(name, version);
        request.onerror = function (e) {
            console.log(e.currentTarget.error.message);
        }
        request.onsuccess = function (e) {
            _this.db = e.target.result;
            console.log("DB " + name + " created");
        }
        request.onupgradeneeded = function (e) {
            var db = e.target.result;
            if (_this.objectStoreList.length != 0){
                for(var i = 0; i < _this.objectStoreList.length; i++){
                    var item = _this.objectStoreList[i];
                    if (!db.objectStoreNames.contains(item.name)) {
                        var store = db.createObjectStore(item.name, { keyPath: item.keyPath });
                        if (item.index && item.index.length !== 0){
                            for (var j = 0; j < item.index.length; j++){
                                var innerItem = item.index[j];
                                console.log(innerItem);
                                store.createIndex(innerItem.name, innerItem.key, innerItem.property);
                            }
                        }
                    }
                }
            }
            
            console.log('DB version changed to ' + version);
        }
    },
    closeDB: function () {
        if (this.db){
            this.db.close();
        }
    },
    deleteDB: function (){
        if (this.dbName){
            window.indexedDB.deleteDatabase(this.dbName);
        }
        else{
            console.log("no such DB");
        }
    },
    
    clearObjectStore: function(storeName) {
        var transaction = this.db.transaction(storeName, 'readwrite');
        var store = transaction.objectStore(storeName);
        store.clear();
    },
    deleteObjectStore: function (storeName){
        if (db.objectStoreNames.contains(storeName)) {
            db.deleteObjectStore(storeName);
        }
    },
    addData: function (storeName, data) {
        if (!Array.isArray(data)){
            console.error("data must be array");
            return;
        }
        var transaction = this.db.transaction(storeName, 'readwrite');
        var store = transaction.objectStore(storeName);
        var status = [];
        for (var i = 0; i < data.length; i++) {
            status.push(store.add(data[i]));
        }
        console.log("inserted!");
        return status;
    },
    getAll: function(storeName) {
        var reList = [];
        var objectStore = this.db.transaction(storeName).objectStore(storeName);
        objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                if(cursor.value) {
                    reList.push(cursor.value);
                }
                cursor.continue();
            }
        };
        return reList;
    },
    getDataByKey: function(storeName, key, callback) {
        var transaction = this.db.transaction(storeName, 'readwrite');
        var store = transaction.objectStore(storeName);
        var request = store.get(key);
        var _this = this;
        request.onsuccess = function (e) {
            var result = e.target.result;
            if (typeof callback === "function"){
                callback.call(_this, result);
            }
        };
    },
    updateDataByKey: function(storeName, key, data) {
        var transaction = this.db.transaction(storeName, 'readwrite');
        var store = transaction.objectStore(storeName);
        var _this = this;
        var request = store.get(key);
        var _this = this;
        request.onsuccess = function (e) {
            var result = e.target.result;
            result = Object.assign(result, data);
            store.put(result);
        }
        console.log("updated!");
    },
    deleteDataByKey: function (storeName, key) {
        var transaction = this.db.transaction(storeName, 'readwrite');
        var store = transaction.objectStore(storeName);
        store.delete(key);
    },
    getDataByIndex: function (storeName, indexName, value, callback) {
        var transaction = this.db.transaction(storeName);
        var store = transaction.objectStore(storeName);
        var index = store.index(indexName);
        var _this = this;
        index.get(value).onsuccess = function (e) {
            var result = e.target.result;
            if (typeof callback === "function"){
                callback.call(_this, result);
            }
        }
    },
    getMultipleDataByIndex(storeName, indexName, value, callback) {
        var transaction = this.db.transaction(storeName);
        var store = transaction.objectStore(storeName);
        var index = store.index(indexName);
        var request = index.openCursor(IDBKeyRange.only(value))
        var values = [], _this = this;
        request.onsuccess = function (e) {
            var cursor = e.target.result;
            if (cursor) {
                var value = cursor.value;
                values.push(value);
                cursor.continue();
            }
            else{
                if (typeof callback === "function") {
                    callback.call(_this, values);
                }
            }
        }
    }
}
indexDB.init("counter", [
    {
        name: "未提交客户数据",
        keyPath: "id",
        index: [
            {name: "客户id", key: "customer_id", property: {unique: true}},
            {name: "上一次聊天时间", key: "last_time", property: {unique: false}},
            {name: "用户id", key: "user_id"}
        ]
    },
    {
        name: "已提交客户数据",
        keyPath: "id",
        index: [
            {name: "客户id", key: "customer_id", property: {unique: true}},
            {name: "上一次聊天时间", key: "last_time", property: {unique: false}},
            {name: "用户id", key: "user_id"}
        ]
    }
]);

var mainInte = setInterval(() => {
  try{
    if(1 < document.querySelector("#app").children[0].children.length) {
      var userInte = setInterval(()=>{
        if(user.status){
          customerWaitCommit = indexDB.getAll("未提交客户数据");
          customers = indexDB.getAll("已提交客户数据");
          console.log(customerWaitCommit)
          console.log(customerWaitCommit.length+" ↑未提交数据，已提交数据↓ "+customers.length)
          console.log(customers)
          upUi();

          var detectionCustomerInte = setInterval(()=>{
            let msgArr = document.querySelector('[aria-label="消息列表。在消息中点击向右箭头即可打开消息上下文菜单。"]').children;
            let customerId = msgArr[msgArr.length-1].getAttribute("data-id");
            if(customerId != lastCustomerId) {
              getCustomer(customerId);
            }
            if(30 < number++) {
              commitCustomer()
              customerWaitCommit = indexDB.getAll("未提交客户数据");
              customers = indexDB.getAll("已提交客户数据");
            }
          },1000);
          clearInterval(userInte);
        } else {
          getUser();
          indexDB.getDataByKey("已提交客户数据", user.id, function (data) {
            if(data) {
              console.log("时间", data.updateTime, user.updateTime)
              user.updateTime = data.updateTime < user.updateTime? data.updateTime : user.updateTime;
              console.log("最终选择", user.updateTime)
            } else {
              user.updateTime = user.updateTime.getTime();
              user.totalNumber = 0;
              user.todayNumber = 0;
              console.log(user);
              indexDB.addData("已提交客户数据", [user]);
            }
          })
        }
      }, 1000);
      clearInterval(mainInte)
    }
  } catch (err) {
    console.log(err);
  }
}, 1000);

function saveData() {
  customers.forEach(c=>indexDB.addData("已提交客户数据", [c]));
  customerWaitCommit.forEach(c=>indexDB.addData("未提交客户数据", [c]));
}

function getCustomer(customerId) {
  if(-1 < customerId.indexOf("@c.us")) {
    let customerTime = anyTime(document.querySelector('[aria-label="消息列表。在消息中点击向右箭头即可打开消息上下文菜单。"]').children[0].children[0].children[0].innerText);
    if(user.updateTime <= customerTime) {
      console.log("当前客户id信息：", customerId);
      if(!customers[customerId] && !customerWaitCommit[customerId]){
        customerWaitCommit[customerId] = {
          id: customerId,
          customer_id: customerId,
          user_id: user.id,
          last_time: anyTime(customerTime),
          last_time_source: customerTime,
          
        };
        indexDB.addData("未提交客户数据", [customerWaitCommit[customerId]]);
        console.log("保存结束", customerId);
        
        if(!user.totalNumber) user.totalNumber = 0;
        user.totalNumber++;
        if(!user.todayNumber) user.todayNumber = 0;
        user.todayNumber++;
        indexDB.updateDataByKey("已提交客户数据", user.id, user);
        upUi("新客户:"+customerId);
        lastCustomerTime = customerTime;
        lastCustomerId = customerId;
      }
    } else {
      console.log('%c 判定为不是一个新增的客户：' + customerId,'color:#9DE1FE');
    }
  }
}

// x年x月x日 星期x
function anyTime(timeStr) {
  let timeChar = "-";
  let re;
  if(-1 < timeStr.indexOf("月")) {
    try {
      re = timeStr.replace(/年|月|日/g, timeChar);
      if(re[0] == timeChar) {
        re = re.substring(1);
      }
      if(re[re.length-1] == timeChar) {
        re = re.substring(0, re.length-1);
      }
      re = new Date(re);
    } catch (err){
      re = null;
    }
  }
  if(!re && -1 < timeStr.indexOf("星期")) {
    let dateMap = {
      "星期日": 0,
      "星期一": 1,
      "星期二": 2,
      "星期三": 3,
      "星期四": 4,
      "星期五": 5,
      "星期六": 6,
    };
    let today = new Date().getDay();
    try{
      let thatDay = dateMap[timeStr];
      if (today < thatDay){
        today += 6;
      }
      let jetLag = today - thatDay;
      re = new Date(new Date(Date.now() - (jetLag*24*60*60*1000)).toDateString());
    } catch (err) {
      re = null;
    }
  }
  if(re == null) {
    console.log('%c 时间类型转换失败！','color:red;font-size:200%');
    re = timeStr;
  }
  try{
    return re.getTime();
  } catch (err){
  }
  return re
}

function getUser() {
  user.id = localStorage.getItem("last-wid").replace(/\"/g,"");
  customerWaitCommit = JSON.parse(localStorage.getItem("customerWaitCommit"));
  customers = JSON.parse(localStorage.getItem("customers"));
  $.get(
    urlDomain + "/whatsapp/user/" + user.id,
    {},
    function(data) {
      log(data)
      if(data == "" || data.id == "-1"){
        console.log("用户不存在");
        alert("后台没有当前用户数据，检测为新用户");
        user.updateTime = Date.now();
        user.status = true;
      } else {
        try{
          user.updateTime = new Date(data.updateTime).getTime();
          user.status = true;
        } catch(err) {
          user.status = false;
          console.log('%c ' + err,'color:red;font-size:140%');
          console.error(err)
          user.updateTime = new Date(Date.now() - 24*60*60*1000);
          alert("出现异常了！请联系管理员！");
        }
      }
      user.updateTime = new Date(user.updateTime.toLocaleDateString())
      alert("时间将从  "+new Date(user.updateTime).toLocaleString()+"  开始计算");
    }
  ).fail(
    function(data) {
      user.status = true;
      console.log("连接失败！",data);
      alert("连接失败！将会导致无法记录！请检查后台地址是否正确！");
      user.updateTime = new Date(new Date(Date.now()- 24*60*60*1000).toLocaleDateString())
      alert("本地保存，时间将从  "+new Date(user.updateTime).toLocaleString()+"  开始计算");
    }
  )
}

function commitCustomer() {
  for(let c in customerWaitCommit) {
    try{
      customers[c] = customerWaitCommit[c];
      delete customerWaitCommit[c];
      // 插入另外一个
      indexDB.addData("已提交客户数据", [customers[c]]);
      // 删除数据库中的对象
      indexDB.deleteDataByKey("未提交客户数据", customers[c].id);
      if(user.updateTime <= c.last_time) {
        let customer = {
          customerId: customers[c].customer_id,
          userId: user.id
        }
        $.post(
          urlDomain + "/whatsapp/customer/add",
          customer,
          function(data) {
            if(200 == data.code) {
            } else {
              console.log('%c 上传客户信息失败！' + customers[c].customer_id,'color:red');
              console.log(data);
            }
          }
        ).fail(
          function(data) {
            console.log('%c 上传客户信息失败！' + customers[c].customer_id,'color:red');
          }
        )
      }
    } catch (err) {}
  }
}

function upUi(msg) {
  let ec = document.querySelector("entertainCustomers");
  if(!ec) {
    ec = document.createElement("div");
    ec.id = "entertainCustomers";
    ec.style.width = "15%";
    ec.style.height = "15%";
    ec.style.float = "left";
    ec.style.backgroundColor = "#1E1E1E";
    ec.style.color = "#FED859";
    ec.style.lineHeight = "130%";
    ec.style.margin = "10px";
    ec.style.padding = "10px";
    let f = document.querySelector('#app').firstChild.firstChild;
    f.parentNode.insertBefore(ec,f)
  }
  ec.innerHTML = "当前用户：" + user.id;
  ec.innerHTML += "<br>检测时间：" + user.updateTime.toLocaleString();
  if(!user.totalNumber) user.totalNumber = 0;
  if(!user.todayNumber) user.todayNumber = 0;
  ec.innerHTML += "<br>今日新客户：" + user.todayNumber;
  ec.innerHTML += "<br>总共新客户：" + user.totalNumber;
  if(msg){
    ec.innerHTML += "<br>" + msg;
  }
}