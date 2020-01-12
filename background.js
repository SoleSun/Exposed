// Copyright 2018 TJZ. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

var local = (function(){
    var setData = function(key,obj){
        var values = JSON.stringify(obj);
        window.localStorage.setItem(key,values);
    }

    var getData = function(key){
        if(window.localStorage.getItem(key) != null){
            return JSON.parse(window.localStorage.getItem(key));
        }else{
            return false;
        }
    }

    var updateData = function(key, newData){
        if(window.localStorage.getItem(key) != null){
            var oldData = JSON.parse(window.localStorage.getItem(key));
            for(var keyObj in newData){
                oldData[keyObj] = newData[keyObj];
            }
            var values = JSON.stringify(oldData);
            window.localStorage.setItem(key,values);
        } else{
            return false;
        }
    }

    return {set:setData,get:getData,update:updateData}
})();

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

        let info = {email : false, address : false, payment : false, phone : false};
        let key, keys = [];
        const empty = JSON.stringify([""]);
        for (key in post_data) {
            let value = JSON.stringify(post_data[key]);
            if (/email/.test(key) && !/use/.test(key) && value != empty) {
                console.log(key);
                info.email = true;
                keys.push(key);
            }
            if(/address/.test(key) && value != empty) {
                console.log(key);
                info.address = true;
                keys.push(key);
            }
            if(/cc.*number/.test(key) && value != empty) {
                console.log(key);
                info.payment = true;
                keys.push(key);
            }
            if(/phone/.test(key) && value != empty) {
                console.log(key);
                info.phone = true;
                keys.push(key);
            }
        }

        // Grab the fields being sent to the person via the request
        if (keys.length !== 0) {
            var give = window.confirm("Are you sure you want to give this info?");
            if (give) {
                local.set(initiator, info);
                let data = local.get(initiator);
                console.log(data.email);
                console.log(data.address);
                console.log(data.payment);
                console.log(data.phone);
            }
            console.log("Cancelling POST request: " + !give);
            return {cancel : !give};
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

