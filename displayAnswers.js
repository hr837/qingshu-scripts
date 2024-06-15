// ==UserScript==
// @name         石油-青书学堂答案提取
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  自用的青书学堂答案打印成文本或者自行打印成PDF
// @author       Duang
// @match        https://degree.qingshuxuetang.com/xsyu/Student/ViewQuiz?quizId=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=qingshuxuetang.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var _a;
    function analyzeChoice(el) {
        var _a, _b;
        var answer = (_a = el.querySelector('.question-detail-choice-solution')) === null || _a === void 0 ? void 0 : _a.innerText;
        var question = (_b = el.querySelector('.detail-description-content')) === null || _b === void 0 ? void 0 : _b.innerText;
        if (!answer || !question) {
            return null;
        }
        var answerOptions = el.querySelectorAll('.question-detail-option');
        var answerList = [];
        answerOptions.forEach(function (aEl) {
            var _a, _b, _c, _d;
            var aValue = (_b = (_a = aEl.firstElementChild) === null || _a === void 0 ? void 0 : _a.innerHTML) !== null && _b !== void 0 ? _b : '';
            var aValueText = (_d = (_c = aEl.lastElementChild) === null || _c === void 0 ? void 0 : _c.innerHTML) !== null && _d !== void 0 ? _d : '';
            if (answer.includes(aValue)) {
                answerList.push(aValueText);
            }
        });
        return {
            question: question,
            answerList: answerList
        };
    }
    function analyzeDecide(el) {
        var _a;
        var question = (_a = el.querySelector('.detail-description-content')) === null || _a === void 0 ? void 0 : _a.innerText;
        if (!question) {
            return null;
        }
        var solutionList = el.querySelectorAll('.question-detail-solution');
        var solutionDiv = solutionList[0];
        if (solutionList.length > 1) {
            var lastIndex = solutionList.length - 1;
            solutionDiv = solutionList[lastIndex];
        }
        var answerList = [];
        var answer = solutionDiv.querySelector('.question-detail-answer');
        if (answer) {
            answerList.push(answer.innerText);
        }
        return {
            question: question,
            answerList: answerList
        };
    }
    function analyzeInput(el) {
        var _a;
        var question = (_a = el.querySelector('.detail-description-content')) === null || _a === void 0 ? void 0 : _a.innerText;
        if (!question) {
            return null;
        }
        var solutionList = el.querySelectorAll('.question-detail-solution');
        var solutionDiv = solutionList[0];
        if (solutionList.length > 1) {
            var lastIndex = solutionList.length - 1;
            solutionDiv = solutionList[lastIndex];
        }
        var answerDivList = solutionDiv.querySelectorAll('.question-detail-solution-completion-text');
        var answerList = [];
        if (answerDivList.length > 0) {
            answerDivList.forEach(function (aEl) {
                answerList.push(aEl.innerText);
            });
        }
        else {
            var answer = solutionDiv.querySelector('.question-detail-solution-text');
            if (answer) {
                answerList.push(answer.innerText);
            }
        }
        return {
            question: question,
            answerList: answerList
        };
    }
    function analyzeItem(el) {
        var span = el.querySelector('.question-detail-type-desc');
        if (!span) {
            return null;
        }
        var typeInfo = span.innerText;
        if (['填空', '问答'].some(function (k) { return typeInfo.includes(k); })) {
            return analyzeInput(el);
        }
        else if (typeInfo.includes('判断')) {
            return analyzeDecide(el);
        }
        else {
            return analyzeChoice(el);
        }
    }
    function getFileContent() {
        var BREAK_TAG = '\r\n';
        var contentList = [];
        var list = document.querySelectorAll('.question-detail-container');
        list.forEach(function (el, index) {
            var result = analyzeItem(el);
            if (result) {
                var question = index + 1 + '、' + result.question + BREAK_TAG;
                contentList.push(question);
                result.answerList.forEach(function (al) {
                    contentList.push(al + BREAK_TAG);
                });
            }
            contentList.push(BREAK_TAG);
        });
        return contentList;
    }
    function printAnswer() {
        var fileName = window.prompt("请输入要下载的文件名", "答案");
        if (!fileName) {
            return;
        }
        var contentList = getFileContent();
        var file = new Blob(contentList, { type: 'text/plain' });
        var url = URL.createObjectURL(file);
        var linkA = document.createElement('a');
        linkA.download = fileName + '.txt';
        linkA.href = url;
        linkA.click();
        URL.revokeObjectURL(url);
    }

    const ACTIVE_CLASS = 'option-label-preview-active'
    function fixElAnswer(el) {
        el.style.display = '';
        const rightWrap = el.querySelector('.question-detail-type .question-header-right');

        const correctValue = rightWrap.querySelector('.question-detail-choice-solution').innerText
        for (let index = 1; index < rightWrap.childElementCount; index++) {
            rightWrap.removeChild(rightWrap.children[1])
        }

        const options = el.querySelectorAll('.question-detail-option')

        options.forEach(op => {
            if (op.firstElementChild.innerText === correctValue) {
                op.firstElementChild.classList.add(ACTIVE_CLASS);
            } else {
                op.firstElementChild.classList.remove(ACTIVE_CLASS);
            }
        });
    }

    function fixAnswerClick() {
        const page = document.querySelector('.paper-container');
        page.removeChild(document.querySelector('.question-controller-wrapper'));

        const list = document.querySelectorAll('.question-detail-container');
        list.forEach(fixElAnswer);
    }

    function createPrintBtn() {
        var printBtn = document.createElement("button");
        printBtn.type = "button";
        printBtn.innerText = "下载";
        printBtn.style.width = '120px';
        printBtn.style.height = '36px';
        printBtn.style.background = '#4CC443';
        printBtn.style.color = '#fff';
        printBtn.style.fontSize = '15px';
        printBtn.style.border = 'none';
        printBtn.style.borderRadius = '2px';
        printBtn.style.position = 'fixed';
        printBtn.style.right = '50px';
        printBtn.style.top = '60px';
        printBtn.onclick = printAnswer;

        var fixAnswerBtn = document.createElement("button");
        fixAnswerBtn.type = "button";
        fixAnswerBtn.innerText = "修正答案";
        fixAnswerBtn.style.width = '120px';
        fixAnswerBtn.style.height = '36px';
        fixAnswerBtn.style.background = '#4CC443';
        fixAnswerBtn.style.color = '#fff';
        fixAnswerBtn.style.fontSize = '15px';
        fixAnswerBtn.style.border = 'none';
        fixAnswerBtn.style.borderRadius = '2px';
        fixAnswerBtn.style.position = 'fixed';
        fixAnswerBtn.style.right = '50px';
        fixAnswerBtn.style.top = '120px';
        fixAnswerBtn.onclick = fixAnswerClick;

        var div = document.createElement('div');
        div.appendChild(printBtn);
        div.appendChild(fixAnswerBtn)

        return div
    }
    (_a = document.querySelector(".wrapper")) === null || _a === void 0 ? void 0 : _a.appendChild(createPrintBtn());

})();