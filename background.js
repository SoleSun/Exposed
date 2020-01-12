// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

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

// var cur_tab_id;
// chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
//     if (tabs[0])
//         cur_tab_id = tabs[0].id;
// });
//
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (details.method === "POST" /*&& details.tabId === cur_tab_id*/) {
        console.log("Filtering");
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
        let keys = [];
        for (key in post_data) {
            let value = JSON.stringify(post_data[key]);
            if (/email/.test(key) && !/use/.test(key) && value != empty) {
                console.log(key);
                keys.push(key);
                if (info.indexOf("email") === -1)
                    info.push("email");
            }
            if(/address/.test(key) && value != empty) {
                console.log(key);
                keys.push(key);
                if (info.indexOf("address") === -1)
                    info.push("address");
            }
            if(/cc.*number/.test(key) && value != empty) {
                console.log(key);
                keys.push(key);
                if (info.indexOf("payment") === -1)
                info.push("payment");
            }
            if(/phone/.test(key) && value != empty) {
                console.log(key);
                keys.push(key);
                if (info.indexOf("phone") === -1)
                    info.push("phone");
            }
        }

        // Grab the fields being sent to the person via the request
        if (info.length !== 0) {
            console.log("Info being given: " + info);
            var give = window.confirm("Are you sure you want to give this info?");
            if (give) {
                local.set(initiator, info);
                // chrome.storage.local.set(dataObj, function() {
                //     console.log("Saved " + initiator);
                // });
            }
            return {cancel : !give};
            console.log("Cancelling POST request: " + give);
        }
    }

    return {cancel: false};
  // });
},
{urls: ["<all_urls>"]},
["blocking", "requestBody"]);

chrome.browserAction.onClicked.addListener( function () {
  chrome.tabs.create({'url': "chrome://newtab"});
}
);

