// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log('The color is green.');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

var local = (function(){
    var setData = function(key,obj){
        var values = JSON.stringify(obj);
        localStorage.setItem(key,values);
    }

    var getData = function(key){
        if(localStorage.getItem(key) != null){
            return JSON.parse(localStorage.getItem(key));
        }else{
            return false;
        }
    }

    var updateData = function(key, newData){
        if(localStorage.getItem(key) != null){
            var oldData = JSON.parse(localStorage.getItem(key));
            for(var keyObj in newData){
                oldData[keyObj] = newData[keyObj];
            }
            var values = JSON.stringify(oldData);
            localStorage.setItem(key,values);
        } else{
            return false;
        }
    }

    return {set:setData,get:getData,update:updateData}
})();

var showAll = function(){
    for (var i = 0; i < localStorage.length; i++)
        localStorage.getItem(localStorage.key(i));
};

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (details.method == "POST" && tabs[0] && details.tabId == tabs[0].id) {
        if (!("requestBody" in details && "formData" in details.requestBody)) {
            return;
        }

        let initiator = details.initiator;

        // Debugging
        console.log(details);
        console.log(details.requestBody);
        console.log(details.requestBody.formData);
        let post_data = details.requestBody.formData;

        let key, info = [], empty = JSON.stringify([""]);
        for (key in post_data) {
            let value = JSON.stringify(post_data[key]);
            if (/email/.test(key) && value != empty) {
                console.log(key);
                if (info.indexOf("email") === -1)
                    info.push("email");
            }
            if(/address/.test(key) && value != empty) {
                console.log(key);
                if (info.indexOf("address") === -1)
                    info.push("address");
            }
            if(/cc.*number/.test(key) && value != empty) {
                console.log(key);
                if (info.indexOf("payment") === -1)
                info.push("payment");
            }
            if(/phone/.test(key) && value != empty) {
                console.log(key);
                if (info.indexOf("phone") === -1)
                    info.push("phone");
            }
        }

        // Grab the fields being sent to the person via the request
        if (info.length != 0) {
            console.log("Not empty");
            console.log("Info being given: " + info);
            var give = window.confirm("Are you sure you want to give this info?");
            if (give) {
                let dataObj = {};
                dataObj[initiator] = info;
                console.log("Initiator is type of " + typeof(initiator));
                console.log("Saving " + dataObj);
                local.set(initiator, info);
                // chrome.storage.local.set(dataObj, function() {
                //     console.log("Saved " + initiator);
                // });
            }
            console.log("Should cancel " + !give);
        }
    }

  return {cancel: !give};
  });
},
{urls: ["<all_urls>"]},
["blocking", "requestBody"]);
