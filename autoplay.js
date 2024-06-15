// ==UserScript==
// @name         石油-青书学堂-自动播放
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  青书学堂的自动播放
// @author       You
// @match        https://degree.qingshuxuetang.com/xsyu/Student/Course/CourseStudy?*
// @match        https://degree.qingshuxuetang.com/xsyu/Student/Course/CourseShow?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=qingshuxuetang.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /**
   * 创建一个提示
   * @param {string} msg 
   * @param {Function?} fn 
   * @returns {number} 计时器ID
   */
  function message(msg,fn){
    const msgEl = document.createElement('div')
    msgEl.style.padding = '12px';
    msgEl.style.fontSize = '14px';
    msgEl.style.width = '220px';
    msgEl.style.borderRadius = '4px';
    msgEl.style.background = '#000';
    msgEl.style.color = '#FFF';
    msgEl.style.position = 'fixed';
    msgEl.style.top = '100px';
    msgEl.style.left = 'calc(50% - 110px)';
    msgEl.style.textAlign = 'center';
    msgEl.innerText = msg
    
    document.body.appendChild(msgEl);
    return setTimeout(() => {
      document.body.removeChild(msgEl);
      fn&&fn()
    }, 1000);
  }

  /**
   * 跳转下一课程
   */
  function goToNextCourse() {
    const courses = document.querySelectorAll('.level-root a[id^="course"')
    for (const node of courses) {
      const text = node.innerText;
      if (!text.includes('已经学习')) {
        message('即将跳转下一课',() => node.click());
        break;
      }
    }
  }

  /**
   * 创建一个button
   * @returns {HTMLButtonElement}
   */
  function createButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.style.width = '120px';
    btn.style.height = '36px';
    btn.style.background = '#4CC443';
    btn.style.color = '#fff';
    btn.style.fontSize = '15px';
    btn.style.border = 'none';
    btn.style.borderRadius = '2px';
    btn.style.position = 'fixed';
    btn.style.right = '50px';
    btn.style.top = '60px';
    return btn
  }

  /**
   * 准备播放
   */
  function readyPlay() {
    const video = document.querySelector('video.vjs-tech')

    // 播放按钮
    const playBtn = createButton();
    playBtn.id = 'QS_BTN_PLAY'
    playBtn.innerText = "播放";
    playBtn.style.top = '90px';
    playBtn.onclick = () => video.play()
    document.body.appendChild(playBtn)

    // 停止按钮
    const stopBtn = createButton();
    stopBtn.id = 'QS_BTN_STOP'
    stopBtn.style.top = '130px'
    stopBtn.innerText = "停止";
    stopBtn.onclick = () => video.pause()
    document.body.appendChild(stopBtn)

    // 自动播放
    video.muted = true;
    video.volume = 0;
    video.autoplay = true;
    video.play()
    message('开始自动播放')

    // 播完后返回
    video.addEventListener('ended', () => {
      const back = document.querySelector('a.back-link')
      if(back){
        message('即将返回课程列表',() => back.click())
      }
    })
  }

  if (location.href.includes('CourseStudy')) {
    // 视频列表页面
    onReady(goToNextCourse)
  }

  if (location.href.includes('CourseShow')) {
    // 视频详情页
    onReady(readyPlay)
  }

  /**
   * dom ready
   * @param {Function} fn 
   */
  function onReady(fn) {
    document.addEventListener("readystatechange", () => {
      if(document.readyState === 'complete'){
        setTimeout(fn, 2000);
      }
    });
  }
})();