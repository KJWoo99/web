// 음성 인식 API 초기화
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// 결과 표시할 요소 선택
const resultContainer = document.getElementById('resultContainer');
let finalTranscript = '';

// 모달 요소 선택
const modal = document.getElementById('modal');
const newModal = document.getElementById('newModal');
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');
const closeNewModalButton = document.getElementById('closeNewModal');
const dontShowForAWeekButton = document.getElementById('dontShowForAWeek');

// 시작/멈춤 버튼 선택
const startStopButton = document.getElementById('startStopButton');
startStopButton.addEventListener('click', toggleRecognition);

// 결과 처리를 위한 플래그
let processResults = true;

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

    // Reset silence timer on receiving a result
    resetSilenceTimer();
};

// 모달 버튼 클릭 이벤트 핸들러 - 예 버튼
confirmButton.addEventListener('click', () => {
    hideModal();
    window.location.href = 'my.html';
});

// 모달 버튼 클릭 이벤트 핸들러 - 아니요 버튼
cancelButton.addEventListener('click', () => {
    hideModal();
    startRecognition();
});

// 닫기 버튼 클릭 시 모달 숨기기
closeNewModalButton.addEventListener('click', hideModal);

// "일주일 동안 보지 않기" 버튼 클릭 시 모달 숨기고 설정 저장
dontShowForAWeekButton.addEventListener('click', () => {
    hideModal();
    localStorage.setItem('hideModalUntil', Date.now() + 7 * 24 * 60 * 60 * 1000); // 현재 시간 기준으로 일주일 뒤의 타임스탬프 저장
});

// 음성 인식 시작/멈춤 토글 함수
function toggleRecognition() {
    if (startStopButton.classList.toggle('active')) {
        showModal();
    } else {
        requestMicrophoneAccess().then(startRecognition).catch(handleMicrophoneAccessError);
    }
}

// 음성 인식 일시정지 함수
function pauseRecognition() {
    recognition.stop();
    clearListeningMessage(); // "AI 면접관이 듣고 있습니다" 메시지 삭제
}

// 음성 인식 시작 함수
function startRecognition() {
    finalTranscript = ''; // 이전 결과 초기화
    displayListeningMessage(); // "AI 면접관이 듣고 있습니다" 메시지 표시

    recognition.start();
    console.log('음성 인식 시작');

    resetSilenceTimer(); // Silence 타이머 시작
}

// 음성 인식 멈춤 함수
function stopRecognition() {
    recognition.stop();
    console.log('음성 인식 멈춤');

    startStopButton.classList.remove('active'); // 버튼 비활성화
    displayFinalTranscript(finalTranscript); // 최종 결과 표시
    clearTimeout(silenceTimer); // Silence 타이머 초기화
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
    clearListeningMessage(); // "AI 면접관이 듣고 있습니다" 메시지 삭제
    const interimItem = document.querySelector('.interim-item');
    if (interimItem) {
        interimItem.remove(); // 임시 텍스트 요소 삭제
    }
    const resultItem = document.createElement('div'); // 새로운 결과 추가
    resultItem.classList.add('result-item');
    resultItem.textContent = text;
    resultContainer.appendChild(resultItem);
}

// "AI 면접관이 듣고 있습니다" 메시지 표시 함수
function displayListeningMessage() {
    const listeningMessage = document.createElement('div');
    listeningMessage.classList.add('listening-message');
    listeningMessage.textContent = 'AI 면접관이 듣고 있습니다';
    resultContainer.appendChild(listeningMessage);
}

// "AI 면접관이 듣고 있습니다" 메시지 삭제 함수
function clearListeningMessage() {
    const listeningMessage = document.querySelector('.listening-message');
    if (listeningMessage) {
        listeningMessage.remove();
    }
}

// 음성 인식 타이머
let silenceTimer;
const SILENCE_TIMEOUT = 5000;

function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(stopRecognition, SILENCE_TIMEOUT);
}

// 마이크 권한 요청 함수
function requestMicrophoneAccess() {
    return navigator.mediaDevices.getUserMedia({ audio: true });
}

// 페이지 로드 시 모달 보여주기 결정
document.addEventListener('DOMContentLoaded', () => {
    const hideUntil = localStorage.getItem('hideModalUntil');
    if (!hideUntil || Date.now() > parseInt(hideUntil, 10)) {
        newModal.style.display = 'block'; // 일주일이 지나거나 설정이 없는 경우 모달 보이기
    } else {
        hideModal(); // 아직 일주일이 지나지 않은 경우 모달 숨기기
    }
});
