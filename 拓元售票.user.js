// ==UserScript==
// @name         拓元售票
// @namespace    http://tampermonkey.net/
// @version      2025-03-18_v2
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
                        console.log('spl',spl);
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
                    let myTargetAry = [];
                    if(_expansive){
                        for(let i=2;i<50;i++){
                            myTargetAry.push(eventId+'_'+i);
                        }
                        myTargetAry.push(eventId+'_1');
                    }else{
                        for(let i=50;i>0;i--){
                            myTargetAry.push(eventId+'_'+i);
                        }
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
                    // 建立新的 div
                    let newDiv = document.createElement("div");
                    newDiv.style.width = '10%';
                    // 建立輸入框
                    let input = document.createElement("input");
                    input.type = "text";
                    let TicketCount = localStorage.getItem("TicketCount") || 2;
                    input.value = TicketCount;
                    input.id = 'TicketCount';

                    input.placeholder = "想要買的票數"; // 設定 placeholder

                    // 將 input 放入 newDiv
                    newDiv.appendChild(input);

                    // 在 searchFieldDiv 後面插入 newDiv
                    let newDiv2 = document.createElement("span");
                    newDiv2.innerHTML = '票數：';
                    newDiv2.style.width = '10%';
                    searchFieldDiv.insertAdjacentElement("afterend", newDiv2);
                    newDiv2.insertAdjacentElement("afterend", newDiv);
                }
            })();
        }
        //alert('ready to replace'+buts.length);
    },10);
})();
