// ==UserScript==
// @name         拓元售票
// @namespace    http://tampermonkey.net/
// @version      2025-03-17
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
                    let keyWord = 'areaUrlList = ';
                    let start = html.indexOf(keyWord);
                    let spl = html.substring(start,start+3000);
                    let end = spl.indexOf(';');
                    spl = spl.substring(keyWord.length,end);
                    let areaUrlList = JSON.parse(spl);
                    console.log(areaUrlList);
                    //alert(areaUrlList);
                    let myTargetAry = [];
                    if(_expansive){
                        for(let i=2;i<30;i++){
                            myTargetAry.push(eventId+'_'+i);
                        }
                        myTargetAry.push(eventId+'_1');
                    }else{
                        for(let i=30;i>0;i--){
                            myTargetAry.push(eventId+'_'+i);
                        }
                    }
                    //console.log(myTargetAry);
                    //return;
                    for(let i=0;i<myTargetAry.length;i++){
                        let key = myTargetAry[i];
                        if(typeof(areaUrlList[key]) != 'undefined'){
                            console.log('trt to by='+areaUrlList[key]);
                            location.href = areaUrlList[key];
                            break;
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
        }
        //alert('ready to replace'+buts.length);
    },10);
})();