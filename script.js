// 음성 인식 API 초기화
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
let finalTranscript = '';
let processResults = true;
let silenceTimer;

// 결과 표시할 요소 선택
const resultContainer = document.getElementById('resultContainer');

// 모달 요소 선택
const modal = document.getElementById('modal');
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');

// 시작/멈춤 버튼 선택
const startStopButton = document.getElementById('startStopButton');
startStopButton.onclick = toggleRecognition;

// 음성 인식 결과 처리
recognition.onresult = (event) => {
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

// 모달창 보여주는 함수
function toggleModal(show) {
    if (show) {
        pauseRecognition();
        modal.style.display = 'block';
        processResults = false;
    } else {
        modal.style.display = 'none';
        processResults = true;
        if (!startStopButton.classList.contains('active')) {
            startRecognition();
        }
    }
}

// 모달 버튼 클릭 이벤트 핸들러 - 예 버튼
confirmButton.onclick = () => {
    toggleModal(false);
    window.location.href = 'my.html';
};

// 모달 버튼 클릭 이벤트 핸들러 - 아니요 버튼
cancelButton.onclick = () => {
    toggleModal(false);
    startRecognition();
};

// 음성 인식 시작/멈춤 토글 함수
function toggleRecognition() {
    if (startStopButton.classList.contains('active')) {
        toggleModal(true);
    } else {
        requestMicrophoneAccess().then(startRecognition).catch(handleMicrophoneAccessError);
    }
}

// 음성 인식 일시정지 함수
function pauseRecognition() {
    recognition.stop();
    clearListeningMessage();
}

// 음성 인식 시작 함수
function startRecognition() {
    finalTranscript = '';
    displayListeningMessage();
    recognition.start();
    startStopButton.classList.add('active');
    resetSilenceTimer();
}

// 음성 인식 멈춤 함수
function stopRecognition() {
    recognition.stop();
    startStopButton.classList.remove('active');
    displayFinalTranscript(finalTranscript);
    saveResultToLocal(finalTranscript);
    clearTimeout(silenceTimer);
}

// 음성 인식 타이머
const SILENCE_TIMEOUT = 5000;

function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(stopRecognition, SILENCE_TIMEOUT);
}

// "AI 면접관이 듣고 있습니다" 메시지 관련 함수들
function displayListeningMessage() {
    displayMessage('AI 면접관이 듣고 있습니다', 'listening-message');
}

function clearListeningMessage() {
    removeMessage('listening-message');
}

function displayMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(className);
    messageElement.textContent = message;
    resultContainer.appendChild(messageElement);
}

function removeMessage(className) {
    const messageElement = document.querySelector('.' + className);
    if (messageElement) {
        messageElement.remove();
    }
}

// 결과를 로컬 스토리지에 저장하는 함수
function saveResultToLocal(result) {
    localStorage.setItem('recordedVoice', result);
}

// 페이지 로드 시 모달 보여주기 결정
document.addEventListener('DOMContentLoaded', () => {
    const newModal = document.getElementById('newModal');
    const dontShowForAWeekButton = document.getElementById('dontShowForAWeek');

    document.getElementById('closeNewModal').onclick = () => {
        newModal.style.display = 'none';
    };

    dontShowForAWeekButton.onclick = () => {
        newModal.style.display = 'none';
        localStorage.setItem('hideModalUntil', new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
    };

    const hideUntil = localStorage.getItem('hideModalUntil');
    if (!hideUntil || new Date().getTime() > parseInt(hideUntil, 10)) {
        newModal.style.display = 'block';
    } else {
        newModal.style.display = 'none';
    }
});
