// 상수 정의
const SILENCE_TIMEOUT = 5000;
const LOCAL_STORAGE_KEY = 'recordedVoice';

// DOM 요소 선택
const elements = {
    resultContainer: document.getElementById('resultContainer'),
    modal: document.getElementById('modal'),
    confirmButton: document.getElementById('confirmButton'),
    cancelButton: document.getElementById('cancelButton'),
    startStopButton: document.getElementById('startStopButton'),
    newModal: document.getElementById('newModal'),
    closeModalButton: document.getElementById('closeNewModal')
};

// 음성 인식 설정
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;
recognition.maxAlternatives = 5000;

let finalTranscript = '';
let processResults = true;
let silenceTimer;

// 유틸리티 함수
const isLocalStorageSupported = () => {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch(e) {
        return false;
    }
};

const saveResultToLocal = (result) => {
    if (isLocalStorageSupported()) {
        localStorage.setItem(LOCAL_STORAGE_KEY, result);
    } else {
        console.log("localStorage is not supported");
    }
};

const resetSilenceTimer = () => {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(stopRecognition, SILENCE_TIMEOUT);
};

// DOM 조작 함수
const toggleElement = (element, show) => {
    element.style.display = show ? 'block' : 'none';
};

const createAndAppendElement = (parent, className, text) => {
    const element = document.createElement('div');
    element.classList.add(className);
    element.textContent = text;
    parent.appendChild(element);
    return element;
};

const removeElementByClass = (className) => {
    const element = document.querySelector(`.${className}`);
    if (element) element.remove();
};

// 음성 인식 관련 함수
const handleRecognitionResult = (event) => {
    if (!processResults) return;
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }
    resetSilenceTimer();
};

const startRecognition = () => {
    finalTranscript = '';
    createAndAppendElement(elements.resultContainer, 'listening-message', 'AI 면접관이 듣고 있습니다');
    recognition.start();
    console.log('음성 인식 시작');
    elements.startStopButton.classList.add('active');
    resetSilenceTimer();
};

const stopRecognition = () => {
    recognition.stop();
    console.log('음성 인식 멈춤');
    elements.startStopButton.classList.remove('active');
    displayFinalTranscript(finalTranscript);
    saveResultToLocal(finalTranscript);
    clearTimeout(silenceTimer);
};

const pauseRecognition = () => {
    recognition.stop();
    removeElementByClass('listening-message');
    console.log('음성 인식 일시 정지');
};

const resumeRecognition = () => {
    recognition.start();
    createAndAppendElement(elements.resultContainer, 'listening-message', 'AI 면접관이 듣고 있습니다');
    console.log('음성 인식 재개');
    resetSilenceTimer();
};

const toggleRecognition = () => {
    if (elements.startStopButton.classList.contains('active')) {
        pauseRecognition();
        toggleElement(elements.modal, true);
    } else {
        startRecognition();
    }
};

const displayFinalTranscript = (text) => {
    removeElementByClass('listening-message');
    removeElementByClass('interim-item');
    createAndAppendElement(elements.resultContainer, 'result-item', text);
};

// 마이크 관련 함수
const requestMicrophoneAccess = () => {
    return navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
            console.log('마이크 권한이 허용되었습니다.');
        })
        .catch(err => {
            console.error('마이크 권한을 받을 수 없습니다:', err);
            alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
            throw err;
        });
};

// 이벤트 리스너
recognition.onresult = handleRecognitionResult;
recognition.onerror = (event) => console.error('음성 인식 에러:', event.error);

elements.startStopButton.addEventListener('click', toggleRecognition);
elements.confirmButton.addEventListener('click', () => {
    toggleElement(elements.modal, false);
    window.location.href = 'my.html';
});
elements.cancelButton.addEventListener('click', () => {
    toggleElement(elements.modal, false);
    resumeRecognition();
});

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    elements.closeModalButton.addEventListener('click', () => {
        toggleElement(elements.newModal, false);
        requestMicrophoneAccess()
            .then(() => console.log('마이크 권한이 허용되었습니다.'))
            .catch(err => console.error('마이크 접근 오류:', err));
    });

    // 페이지 로드 시 새 모달 표시
    toggleElement(elements.newModal, true);
});
