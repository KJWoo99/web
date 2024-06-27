// 음성 인식 API 초기화
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// 결과 표시할 요소 선택
const resultContainer = document.getElementById('resultContainer');
let finalTranscript = '';

// 모달 요소 선택
const modal = document.getElementById('modal');
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');

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

    // 중복 결과 처리 방지를 위해 최종 결과만 처리
    if (finalTranscript.trim() !== '') {
        displayFinalTranscript(finalTranscript);
        saveResultToLocal(finalTranscript); // 결과를 로컬 스토리지에 저장
        finalTranscript = ''; // 결과 초기화
    }

    resetSilenceTimer();
};

// 모달창 보여주는 함수
function showModal() {
    pauseRecognition();
    modal.style.display = 'block';
    processResults = false; // 결과 처리 중지
}

// 모달창 숨기는 함수
function hideModal() {
    modal.style.display = 'none';
    processResults = true; // 결과 처리 다시 시작
    if (!startStopButton.classList.contains('active')) {
        startRecognition();
    }
}

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

// 음성 인식 시작/멈춤 토글 함수
function toggleRecognition() {
    if (startStopButton.classList.contains('active')) {
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
    startStopButton.classList.add('active'); // 버튼 활성화

    resetSilenceTimer(); // Silence 타이머 시작
}

// 음성 인식 멈춤 함수
function stopRecognition() {
    recognition.stop();
    console.log('음성 인식 멈춤');

    startStopButton.classList.remove('active'); // 버튼 비활성화
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
    return navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop()); // 권한 확인 후 트랙 중지
        })
        .catch(err => {
            console.error('마이크 권한을 받을 수 없습니다:', err);
            alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
            throw err;
        });
}
