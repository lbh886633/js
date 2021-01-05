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

var user = {req: true};
var number = 0;
var lastCustomerTime;
var lastCustomerId;
var customerWaitCommit={};
var customers={};
var urlDomain = "http://utopia.utopia.utopia";
var mTime = {
  today: new Date(new Date().toDateString()),
  oneday: 24*60*60*1000
}
mTime.yesterday = mTime.today - mTime.oneday;

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
    getAll: function(storeName, callback) {
      var reList = [];
      var objectStore = this.db.transaction(storeName).objectStore(storeName);
      objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
            if (cursor) {
                if(cursor.value) {
                    reList.push(cursor.value);
                }
                cursor.continue();
            } else {
              if (typeof callback === "function"){
                callback.call(this, reList);
              }
            }
        };
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
indexDB.init("__counter", [
    {
        name: "customer_data",
        keyPath: "id",
        index: [
            {name: "customer_id", key: "customer_id", property: {unique: true}},
            {name: "last_time", key: "last_time", property: {unique: false}},
            {name: "user_id", key: "user_id"}
        ]
    },
    {
        name: "user_data",
        keyPath: "id",
        index: [
            {name: "user_id", key: "user_id"}
        ]
    }
]);
var ec;
var mainInte = setInterval(() => {
  try{
    if(1 < document.querySelector("#app").children[0].children.length) {
      var userInte = setInterval(()=>{
        let startDetection = false;
        if(user.status){
          try{
          calcNumber(function(){
            console.log("customer conut:",customerWaitCommit.length)
            startDetection = true;
          })
          var detectionCustomerInte = setInterval(()=>{
            let mr = document.querySelectorAll(".ManuallyRefresh");
            if(0 < mr.length) {
              console.log("manually refresh user data!");
              calcNumber();
              mr.forEach(e=>e.remove());
            }
            if(startDetection){
              let msgArr = document.querySelector('[aria-label="消息列表。在消息中点击向右箭头即可打开消息上下文菜单。"]').children;
              let customerId = msgArr[msgArr.length-1].getAttribute("data-id");
              if(customerId != lastCustomerId) {
                getCustomer(customerId);
              }
              if(30 < number++) {
                try{
                  commitCustomer();
                } catch (e) {}
              }
            }
          },1000);
        } catch(e){console.log(e)}
          clearInterval(userInte);
        } else if(user.req){
          getUser();
          calcNumber();
        }
      }, 1000);
      clearInterval(mainInte)
    }
  } catch (err) {
    console.log(err);
  }
}, 1000);

function calcNumber(fun) {
  upUi("刷新数据")
  indexDB.getAll("customer_data", 
    function (data) {
      customerWaitCommit = data;
      let t = {
        yesterday: new Date(),
        totalNumber: user.totalNumber,
        todayNumber: user.todayNumber,
        total: 0,
        today: 0,
        tempArr: []
      }
      customerWaitCommit.forEach(e => {
        if(user.id == e.user_id) {
          t.total++;
          if(mTime.today <= e.update_time && mTime.yesterday <= e.last_time) {
            t.today++;
          }
        }
      });

      user.totalNumber = user.totalNumber - t.totalNumber + t.total;
      user.todayNumber = user.todayNumber - t.todayNumber + t.today;
      indexDB.updateDataByKey("user_data", user.id, user);
      upUi("数据已刷新");
      if(typeof fun == "function") {
        fun()
      }
    }
  );
}
function saveData() {
  customers.forEach(c=>indexDB.addData("user_data", [c]));
  customerWaitCommit.forEach(c=>indexDB.addData("customer_data", [c]));
}

function getCustomer(customerId) {
  if(-1 < customerId.indexOf("@c.us")) {
    let customerTimeSource = document.querySelector('[aria-label="消息列表。在消息中点击向右箭头即可打开消息上下文菜单。"]').children[0].children[0].children[0].innerText;
    let customerTime =anyTime(customerTimeSource);
    if(user.updateTime <= customerTime) {
      console.log("current customer: ", customerId.substring(0, customerId.indexOf("@")).substring(customerId.indexOf("_")+1));
      if(!customers[customerId] && !customerWaitCommit[customerId]){
        customerWaitCommit[customerId] = {
          id: customerId,
          customer_id: customerId,
          user_id: user.id,
          last_time: customerTime,
          last_time_source: customerTimeSource,
          update_time: new Date()
        };
        indexDB.getDataByKey("customer_data", customerId, function (customer) {
          if(!customer) {
            indexDB.addData("customer_data", [customerWaitCommit[customerId]]);
            console.log("%c save end" + customerId,'color:#E81224');
            if(!user.totalNumber) user.totalNumber = 0;
            user.totalNumber++;
            if(!user.todayNumber) user.todayNumber = 0;
            user.todayNumber++;
            indexDB.updateDataByKey("user_data", user.id, user);
            upUi("新客户:" + customerId.substring(0, customerId.indexOf("@")).substring(customerId.indexOf("_")+1));
            lastCustomerTime = customerTime;
            lastCustomerId = customerId;
          }
        });
      }
    }
  }
}

function anyTime(timeStr) {
  let timeChar = "-";
  let re;
  if(timeStr == "今天") {
    re = mTime.today;
  }
  if(timeStr == "昨天") {
    re = mTime.yesterday;
  }
  if(!re && -1 < timeStr.indexOf("月")) {
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
      re = new Date(new Date(Date.now() - (jetLag*mTime.oneday)).toDateString());
    } catch (err) {
      re = null;
    }
  }
  if(!re && -1 < timeStr.indexOf(":")) {
    re = new Date (new Date().toDateString()+" "+timeStr);
  }
  if(re == null) {
    console.log('%c 时间类型转换失败！' + timeStr,'color:red;font-size:200%');
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
  user.req = false;
  $.get(
    urlDomain + "/whatsapp/user/" + user.id,
    {},
    function(data) {
      user.req = true;
      log(data)
      if(data == "" || data.id == "-1"){
        console.log("the user does not exist");
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
          user.updateTime = new Date(Date.now() - mTime.oneday);
          alert("出现异常了！请联系管理员！");
        }
      }
      user.updateTime = new Date(user.updateTime.toLocaleDateString())

      indexDB.getDataByKey("user_data", user.id, function (data) {
        if(data) {
          user.totalNumber = user.totalNumber || data.totalNumber;
          user.todayNumber = user.todayNumber || data.todayNumber;
          user.updateTime = user.updateTime || new Date();
          console.log("time 1", data.updateTime, user.updateTime)
          user.updateTime = data.updateTime < user.updateTime? data.updateTime : user.updateTime;
          console.log("final choice", user.updateTime)
        } else {
          user.updateTime = user.updateTime.getTime();
          user.totalNumber = 0;
          user.todayNumber = 0;
          console.log(user);
          indexDB.addData("user_data", [user]);
        }
        upUi("时间将从  "+new Date(user.updateTime).toLocaleString()+"  开始计算");
      })
    }
  ).fail(
    function(data) {
      user.req = true;
      user.status = true;
      console.log("Connection failed!", data);
      user.updateTime = new Date(new Date(Date.now()- mTime.oneday).toLocaleDateString())

      indexDB.getDataByKey("user_data", user.id, function (data) {
        if(data) {
          user.totalNumber = user.totalNumber || data.totalNumber;
          user.todayNumber = user.todayNumber || data.todayNumber;
          user.updateTime = user.updateTime || new Date();
          console.log("time 2", data.updateTime, user.updateTime)
          user.updateTime = data.updateTime < user.updateTime? data.updateTime : user.updateTime;
        } else {
          user.updateTime = user.updateTime.getTime();
          user.totalNumber = 0;
          user.todayNumber = 0;
          console.log(user);
          indexDB.addData("user_data", [user]);
        }
        upUi("本地保存，时间将从  "+new Date(user.updateTime).toLocaleString()+"  开始计算");
      })
    }
  )
}

function commitCustomer() {
  $.post(
    urlDomain + "/whatsapp/user/add",
    user,
    function(data) {
      if(200 == data.code) {
      } else {
        console.log('%c failed to upload user information!' + customers[c].customer_id,'color:red');
        console.log(data);
      }
    }
  )
  $.post(
    urlDomain + "/whatsapp/customer/add",
    customerWaitCommit,
    function(data) {
      if(200 == data.code) {
      } else {
        console.log('%c failed to upload customer information!' + customers[c].customer_id,'color:red');
        console.log(data);
      }
    }
  )
}

function upUi(msg) {
  if(!ec) {
    ec = document.querySelector("entertainCustomers");
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
  try{
    ec.innerHTML = "<button onclick='let r=document.createElement(\"div\");r.className=\"ManuallyRefresh\";document.body.appendChild(r);' style='color:#9CDCFE'>手动刷新</button>";
    ec.innerHTML += "<br>请勿狂换客户，避免造成记录异常";
    ec.innerHTML += "<br>当前用户：" + user.id;
    ec.innerHTML += "<br>检测时间：" + new Date(user.updateTime).toLocaleString();
    if(!user.totalNumber) user.totalNumber = 0;
    if(!user.todayNumber) user.todayNumber = 0;
    ec.innerHTML += "<br>今日客户：" + user.todayNumber;
    ec.innerHTML += "<br>累计客户：" + user.totalNumber;
  } catch (err) {}
  if(msg) {
    let newDiv = document.createElement("div");
    newDiv.innerHTML = msg;
    ec.appendChild(newDiv);
    setTimeout(() => newDiv.remove(), 3000);
  }
}