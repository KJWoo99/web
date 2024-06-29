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
let isRecognitionActive = false;
let silenceTimer;
const SILENCE_TIMEOUT = 5000;



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

recognition.onend = () => {
    if (isRecognitionActive) {
        recognition.start();
    }
};

// 모달창 보여주는 함수
function showModal() {
    pauseRecognition();
    modal.style.display = 'block';
}

// 모달창 숨기는 함수
function hideModal() {
    modal.style.display = 'none';
    if (isRecognitionActive) {
        resumeRecognition();
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
});

// 음성 인식 시작/멈춤 토글 함수
function toggleRecognition() {
    if (isRecognitionActive) {
        stopRecognition();
        showModal();
    } else {
        startRecognition();
    }
}

// 음성 인식 일시정지 함수
function pauseRecognition() {
    recognition.stop();
    clearListeningMessage();
    console.log('음성 인식 일시 정지');
}

// 음성 인식 재개 함수
function resumeRecognition() {
    recognition.start();
    displayListeningMessage();
    console.log('음성 인식 재개');
    resetSilenceTimer();
}

// 음성 인식 시작 함수
function startRecognition() {
    finalTranscript = '';
    isRecognitionActive = true;
    recognition.start();
    displayListeningMessage();
    console.log('음성 인식 시작');
    startStopButton.classList.add('active');
    resetSilenceTimer();
}

// 음성 인식 멈춤 함수
function stopRecognition() {
    isRecognitionActive = false;
    recognition.stop();
    clearTimeout(silenceTimer);
    console.log('음성 인식 종료');
    startStopButton.classList.remove('active');
    displayFinalTranscript(finalTranscript);
    saveResultToLocal(finalTranscript);
}

// 음성 인식 중 에러 처리
recognition.onerror = (event) => {
    console.error('음성 인식 에러:', event.error);
};

// 사용자가 말을 멈춰도 계속 인식하도록 설정
recognition.continuous = false;
recognition.interimResults = true;
recognition.maxAlternatives = 5000;

// 결과를 로컬 스토리지에 저장하는 함수
function saveResultToLocal(result) {
    if (isLocalStorageSupported()) {
        localStorage.setItem('recordedVoice', result);
    } else {
        console.log("localStorage is not supported");
    }
}

// 화면에 최종 텍스트를 표시하는 함수
function displayFinalTranscript(text) {
    clearListeningMessage();
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.textContent = text.trim();
    resultContainer.innerHTML = '';
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
function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        if (isRecognitionActive) {
            stopRecognition();
        }
    }, SILENCE_TIMEOUT);
}

// 마이크 권한 요청 함수
function requestMicrophoneAccess() {
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
}

// 마이크 접근 오류 처리 함수
function handleMicrophoneAccessError(error) {
    console.error('마이크 접근 오류:', error);
    alert('마이크 권한을 얻지 못했습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
}

// 모달창 보기
document.addEventListener('DOMContentLoaded', function () {
    const newModal = document.getElementById('newModal');
    const closeModalButton = document.getElementById('closeNewModal');

    // 모달을 숨기는 함수
    function hideModal() {
        newModal.style.display = 'none';
    }

    // 닫기 버튼 클릭 시 모달 숨기고 마이크 권한만 요청
    closeModalButton.addEventListener('click', function() {
        hideModal();
        requestMicrophoneAccess()
            .then(() => {
                console.log('마이크 권한이 허용되었습니다.');
            })
            .catch(handleMicrophoneAccessError);
    });

    // 페이지 로드 시 항상 모달 보여주기
    function showModal() {
        newModal.style.display = 'block';
    }

    showModal();
});
