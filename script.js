// 음성 인식 API 초기화
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// 결과 표시할 요소 선택
const resultContainer = document.getElementById('resultContainer');
let finalTranscript = '';

// 시작/멈춤 버튼 선택
const startStopButton = document.getElementById('startStopButton');
startStopButton.addEventListener('click', toggleRecognition);

// 음성 인식 결과 처리
recognition.onresult = (event) => {
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

// 음성 인식 시작/멈춤 토글 함수
function toggleRecognition() {
    if (startStopButton.classList.contains('active')) {
        stopRecognition();
    } else {
        startRecognition();
    }
}

// 음성 인식 시작 함수
function startRecognition() {
    finalTranscript = '';
    recognition.start();
    console.log('음성 인식 시작');
    startStopButton.classList.add('active');
    resetSilenceTimer();
}

// 음성 인식 멈춤 함수
function stopRecognition() {
    recognition.stop();
    console.log('음성 인식 멈춤');
    startStopButton.classList.remove('active');
    displayFinalTranscript(finalTranscript);
    saveResultToLocal(finalTranscript);
    clearTimeout(silenceTimer);
}

// 음성 인식 중 에러 처리
recognition.onerror = (event) => {
    console.error('음성 인식 에러:', event.error);
};

// 사용자가 말을 멈춰도 계속 인식하도록 설정
recognition.continuous = true;
recognition.interimResults = true;

// 결과를 로컬 스토리지에 저장하는 함수
function saveResultToLocal(result) {
    localStorage.setItem('recordedVoice', result);
}

// 화면에 최종 텍스트를 표시하는 함수
function displayFinalTranscript(text) {
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.textContent = text;
    resultContainer.appendChild(resultItem);
}

// 음성 인식 타이머
let silenceTimer;
const SILENCE_TIMEOUT = 5000;

function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        stopRecognition();
    }, SILENCE_TIMEOUT);
}

// 마이크 권한 요청 함수
function requestMicrophoneAccess() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                stream.getTracks().forEach(track => track.stop());
                resolve();
            })
            .catch(err => {
                reject(err);
            });
    });
}

// 마이크 권한 요청 실패 처리 함수
function handleMicrophoneAccessError(err) {
    console.error('마이크 권한을 받을 수 없습니다:', err);
    alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
}
