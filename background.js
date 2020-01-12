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

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
    if (details.method == "POST" && tabs[0] && details.tabId == tabs[0].id) {
        var initiator = details.initiator;
        if (!("requestBody" in details)) {
            return;
        }

        // Debugging
        console.log(details);
        console.log(details.requestBody);
        console.log(details.requestBody.formData);
        console.log(details.requestBody.formData.username);
        console.log(details.requestBody.formData.email);

        var info = [];
        if ("email" in details.requestBody.formData)
            info.push("email");
        if ("address" in details.requestBody.formData)
            info.push("address");
        if ("payment" in details.requestBody.formData)
            info.push("payment");
        if ("phone" in details.requestBody.formData)
            info.push("phone");

        // Grab the fields being sent to the person via the request
        if (info.length != 0) {
            console.log("Not empty");
            console.log(info);
            let give = window.confirm("Are you sure you want to give this info?");
            if (give) {
                chrome.storage.local.set({initiator, info}, function() {
                    console.log("Saved" + initiator);
                });
            }
            showAll();
        }
    }
  });
},
{urls: ["<all_urls>"]},
["requestBody"]);

//TODO figure out how to block http requests after sending

chrome.browserAction.onClicked.addListener( function () {
  chrome.tabs.create({'url': "chrome://newtab"});
}
);