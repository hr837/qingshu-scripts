



const ACTIVE_CLASS = 'option-label-preview-active'

function fixAnswerClick() {
    const page = document.querySelector('.paper-container');
    page.removeChild(document.querySelector('.question-controller-wrapper'));

    const list = document.querySelectorAll('.question-detail-container');
    list.forEach(fixElAnswer);
}



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

