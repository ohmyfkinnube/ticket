// ==UserScript==
// @name         拓元售票
// @namespace    http://tampermonkey.net/
// @version      2025-03-18_v3
// @description  try to take over the world!
// @author       You
// @match        https://tixcraft.com/activity/detail/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tixcraft.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let fuckoff = document.createElement('style');
    fuckoff.innerHTML = '.masthead-wrap{display:none !important;}';
    document.body.appendChild(fuckoff);

    //alert(document.getElementsByClassName('buy').length);
    let buy = document.getElementsByClassName('buy')[0];
    buy.querySelector('a')?.click();
    buy.parentNode.parentNode.removeChild(buy.parentNode);
    let FIND = false;
    let FINDCOUNT = 0;
    let findInterval = setInterval(function(){
        if(FINDCOUNT>300 || FIND){
           clearInterval(findInterval);
            return;
        }else{
           FINDCOUNT++;
        }
        let buts = document.getElementsByTagName('button');
        let ary = [];
        for(let i=0;i<buts.length;i++){
            if(buts[i].innerHTML == '立即訂購'){
                //
                let url = buts[i].getAttribute('data-href');
                //alert('GOT YOU='+url);
                //buts[i].parentNode.innerHTML = '<a href="'+url+'">衝阿買下去</>';
                ary.push(buts[i]);
                FIND = true;
            }
        }
        /*if(FIND){
            for(let i=0;i<ary.length;i++){
                let url = ary[i].getAttribute('data-href');
                //alert('GOT YOU='+url);
                ary[i].parentNode.innerHTML = '<a href="'+url+'">衝阿買下去</>';
            }
        }*/
        if(FIND){
            window.fetchUrl = function(_ele,_url,_expansive){
                let eventId = _url.split('/').pop();
                if(_ele.CheckFlag){
                    return;
                }
                _ele.CheckFlag = true;
                _ele.style.backgroundColor = "gray";
                fetch(_url)
                    .then(response => response.text())
                    .then(html => {
                    //document.body.innerHTML = html; // 插入到網頁
                    //console.log(html);
                    let NeedTicket = parseInt(document.getElementById('TicketCount').value) || 2;
                    localStorage.setItem("TicketCount",NeedTicket);
                    let keyWord = 'areaUrlList = ';
                    let start = html.indexOf(keyWord);
                    let spl = html.substring(start,start+3000);
                    let end = spl.indexOf(';');
                    spl = spl.substring(keyWord.length,end);
                    let areaUrlList = JSON.parse(spl);
                    //console.log(areaUrlList);
                    //alert(areaUrlList);
                    let fakeDiv = (function(_html){
                        let keyWord = 'zone area-list">';
                        let start = _html.indexOf(keyWord);
                        let end = _html.indexOf('<!-- end: Area Select -->');
                        let spl = _html.substring(start+keyWord.length,end);
                        //console.log('spl',spl);
                        //spl = spl.substring(keyWord.length,end);
                        //let areaUrlList = JSON.parse(spl);
                        //console.log(spl);
                        let parser = new DOMParser();
                        return parser.parseFromString(spl, "text/html");
                    })(html);
                    let getRemindTickets = function(_id){
                        //console.log('fakeDiv',_id,fakeDiv);
                        let stillTicket = fakeDiv.getElementById(_id);
                        let remainingText = stillTicket.querySelector("font").textContent.trim();
                        //console.log('remainingText=',remainingText);
                        let ht = stillTicket.innerHTML;
                        if(remainingText == '已售完' || ht.indexOf('身障')>=0 || ht.indexOf('視線不良')>=0 || ht.indexOf('站')>=0 || ht.indexOf('輪椅')>=0 || ht.indexOf('陪同')>=0){
                            return -1;
                        }else if(remainingText == '熱賣中'){
                            return 99;
                        }else{
                            let remainingTicket = remainingText.match(/\d+/)[0]; // 提取數字部分
                            //console.log(remainingTicket);
                            return remainingTicket;
                        }
                    };
                    let myTargetAry = (function(){
                        if (fakeDiv) {
                            // 找到所有 id 為 "group_X" (X: 0-10) 的 <ul>
                            //let groupLists = fakeDiv.querySelectorAll('ul[id^="group_"]');
                            let RobFirstArea = document.getElementById('RobFirstArea').checked;
                            let groupLists = Array.from(fakeDiv.querySelectorAll('ul[id^="group_"]'));
                            // 不執行搶搖滾區邏輯 排序，讓 group_0 放到最後，其餘順序保持不變
                            if(_expansive && RobFirstArea == false){
                                //console.log('不執行搶搖滾區邏輯');
                                groupLists.sort((a, b) => {
                                    let idA = a.id.match(/\d+/) ? parseInt(a.id.match(/\d+/)[0]) : 0;
                                    let idB = b.id.match(/\d+/) ? parseInt(b.id.match(/\d+/)[0]) : 0;

                                    // 如果 idA 是 0，讓它排到最後
                                    if (idA === 0) return 1;
                                    if (idB === 0) return -1;

                                    return 0; // 其餘維持原順序
                                });
                            }
                            let eventLinks = []; // 存放所有 <a> 的 id
                            let matchReg = 'a[id^="'+eventId+'_"]';
                            groupLists.forEach(group => {
                                // 找到 group_X 內所有 id 為 "event_X" 的 <a>
                                let events = group.querySelectorAll(matchReg);

                                events.forEach(event => {
                                    eventLinks.push(event.id); // 取得 id
                                });
                            });
                            return eventLinks;
                        }
                    })();
                    //console.log('myTargetAry',myTargetAry); // 印出所有匹配的 event_X id
                    if(_expansive == false){
                        myTargetAry.reverse();
                    }
                    //console.log(myTargetAry);
                    //return;
                    for(let i=0;i<myTargetAry.length;i++){
                        let key = myTargetAry[i];
                        if(typeof(areaUrlList[key]) != 'undefined'){
                            let remainingTicket = getRemindTickets(key);

                            if(remainingTicket >= NeedTicket){
                                console.log('要買的票=',NeedTicket,'剩餘票數=',remainingTicket,'成功 往下一步頁面=',areaUrlList[key]);
                                location.href = areaUrlList[key];
                                break;
                            }else{
                                console.log('要買的票=',NeedTicket,'剩餘票數=',remainingTicket,'失敗 往下一步頁面=',areaUrlList[key]);
                            }
                        }
                    }
                    if(_expansive){
                        _ele.style.backgroundColor = "antiquewhite";
                    }else{
                        _ele.style.backgroundColor = "aliceblue";
                    }
                    _ele.CheckFlag = false;
                });
            };
            for(let i=0;i<ary.length;i++){
                let url = ary[i].getAttribute('data-href');
                //alert('GOT YOU='+url);
                ary[i].parentNode.innerHTML = '<div style="cursor:pointer;border:2px solid red;background-color:antiquewhite;padding:5px;" onclick="fetchUrl(this,\''+url+'\',true)">貴的買下去</div><br/><div style="cursor:pointer;border:2px solid lightgreen;background-color:aliceblue;padding:5px;" onclick="fetchUrl(this,\''+url+'\',false)">便宜的買下去</div><br/><a href="'+url+'">原始</a>';
            }
            (function(){
                // 找到 class 包含 "search-field" 的 div
                let searchFieldDiv = document.querySelector('div[class*="search-field"]');

                if (searchFieldDiv) {
                    //控制第一區的checkbox
                    let container = document.getElementById("checkboxContainer");

                    // 建立 checkbox
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = "RobFirstArea";
                    // 讀取 localStorage，設定 checkbox 狀態
                    checkbox.checked = localStorage.getItem("RobFirstArea") === "true";

                    // 監聽 checkbox 點擊事件，儲存變更
                    checkbox.addEventListener("change", function () {
                        localStorage.setItem("RobFirstArea", this.checked);
                    });

                    // 建立 label
                    let label = document.createElement("label");
                    label.style.width = '100px';
                    label.htmlFor = "dynamicCheckbox";
                    label.textContent = " 搶搖滾區";

                    // 將 checkbox 和 label 插入
                    searchFieldDiv.insertAdjacentElement("afterend", label);
                    label.insertAdjacentElement("afterend", checkbox);

                    // 建立新的 div
                    let newDiv = document.createElement("div");
                    newDiv.style.width = '50px';
                    // 建立輸入框
                    let input = document.createElement("input");
                    input.type = "number";
                    let TicketCount = localStorage.getItem("TicketCount") || 2;
                    input.value = TicketCount;
                    input.id = 'TicketCount';

                    input.placeholder = "想要買的票數"; // 設定 placeholder

                    // 將 input 放入 newDiv
                    newDiv.appendChild(input);

                    // 在 searchFieldDiv 後面插入 newDiv
                    let tickSpan = document.createElement("span");
                    tickSpan.innerHTML = '票數：';
                    tickSpan.style.width = '80px';
                    checkbox.insertAdjacentElement("afterend", tickSpan);
                    tickSpan.insertAdjacentElement("afterend", newDiv);
                }
            })();
        }
        //alert('ready to replace'+buts.length);
    },10);
})();
