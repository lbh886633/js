// ==UserScript==
// @name        New script - whatsapp.com
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
var timeChar = "-";
var urlDomain = "http://localhost:8082";
var userInte = setInterval(()=>{
  if(user.status) {
    clearInterval(userInte);
  } else {
    getUser();
  }
}, 100);

var detectionCustomerInte = setInterval(()=>{
  let customerTime = document.querySelector('[aria-label="消息列表。在消息中点击向右箭头即可打开消息上下文菜单。"]').children[0].children[0].children[0].innerText;
  if(customerTime != lastCustomerTime) {
    getCustomer(customerTime);
  }
  if(100 < number++) {
    commitCustomer()
    localStorage.setItem("customerWaitCommit", customerWaitCommit);
    localStorage.setItem("customers", customers);
  }
},30);

function getCustomer(customerTime) {
  let msgArr = document.querySelector('[aria-label="消息列表。在消息中点击向右箭头即可打开消息上下文菜单。"]').children;
  let customerId = msgArr[msgArr.length-1].getAttribute("data-id");
  if(-1 < customerId.indexOf("@c.us")) {
    console.log("当前客户id信息：", customerId);
    if(!customer[customerId]){
      customerWaitCommit[customerId] = customerWaitCommit[customerId] || {
        time: customerTime,
        id: customerId
      };
      
      localStorage.setItem("customerWaitCommit", customerWaitCommit);
      lastCustomerTime = customerTime;
      lastCustomerId = customerId;
    }
  } else {
    console.log('%c 判定为不是一个有效的账号：' + customerId,'color:red');
  }
}

function getUser() {
  user.id = localStorage.getItem("last-wid");
  $.get(
    urlDomain + "/whatsapp/user/",
    user.id,
    function(data) {
      if(data == ""){
        console.log("用户不存在");
        alert("检测为新用户");
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
          user.updateTime = Date.now()-24*60*60*1000;
          alert("出现异常了！请联系管理员！");
        }
      }
      user.updateTime = new Date(user.updateTime.toLocaleDateString())
      alert("时间将从  "+new Date(user.updateTime).toLocaleString()+"  开始计算");
    }
  ).fail(
    function(data) {
      user.status = false;
      console.log("连接失败！");
      alert("连接失败！将会导致无法记录！请检查后台地址是否正确！");
      user.updateTime = Date.now()-24*60*60*1000;
      user.updateTime = new Date(user.updateTime.toLocaleDateString())
      alert("本地保存，时间将从  "+new Date(user.updateTime).toLocaleString()+"  开始计算");
    }
  )
}

function commitCustomer() {
  for(let c in customerWaitCommit) {
    let customerTime = customerWaitCommit[c].time.replace(/年|月|日/g, timeChar);
    if(customerTime[0] == timeChar) {
      customerTime = customerTime.substring(1);
    }
    if(customerTime[customerTime.length-1] == timeChar) {
      customerTime = customerTime.substring(customerTime.length-1);
    }
    if(user.updateTime < customerTime) {
      let customer = {
        customerId: customerWaitCommit[c].id,
        userId: user.id
      }
      $.post(
        urlDomain + "/whatsapp/customer/add",
        customer,
        function(data) {
          if(200 == data.code) {
            customers[c] = customerWaitCommit[c];
            delete customerWaitCommit[c];
          } else {
            console.log('%c 上传客户信息失败！' + customerWaitCommit[c].id,'color:red');
            console.log(data);
          }
        }
      ).fail(
        function(data) {
          console.log('%c 上传客户信息失败！' + customerWaitCommit[c].id,'color:red');
        }
      )
    } else {
      delete customerWaitCommit[c];
    }
  }
}