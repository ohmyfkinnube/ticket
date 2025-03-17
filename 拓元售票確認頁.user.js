// ==UserScript==
// @name         拓元售票確認頁
// @namespace    http://tampermonkey.net/
// @version      2025-03-17_v1
// @description  try to take over the world!
// @author       You
// @match        https://tixcraft.com/ticket/ticket/*/*/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tixcraft.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let goCount = 0;
    let goCheck = false;
    let goInterval = setInterval(function(){
        goCount++;
        if(goCheck || goCount>500){
            clearInterval(goInterval);
            return;
        }
        let selects = document.querySelectorAll('[class*="mobile-select"]');
        if(selects.length>=1){
            
            for(let i=0;i<selects.length;i++){
                if(selects[i].id.indexOf('TicketForm')==0){
                    //console.log('GOT YOU!');
                    goCheck = true;
                    selects[i].selectedIndex = 2;
                    break;
                }
            }
            document.querySelector('label[for="TicketForm_agree"]').click();
        }
    },10);

     //let selects = document.getElementsByTagName('select');
    //alert(selects.length);
})();
