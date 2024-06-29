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




// localStorage 지원 여부 확인
function isLocalStorageSupported() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch(e) {
        return false;
    }
}


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
}

// 모달 버튼 클릭 이벤트 핸들러 - 예 버튼
confirmButton.addEventListener('click', () => {
    hideModal();
    window.location.href = 'my.html';
});

// 모달 버튼 클릭 이벤트 핸들러 - 아니요 버튼
cancelButton.addEventListener('click', () => {
    hideModal();
    resumeRecognition(); // 음성 인식 재개
});

// 음성 인식 시작/멈춤 토글 함수
function toggleRecognition() {
    if (startStopButton.classList.contains('active')) {
        pauseRecognition();
        showModal(); 
    } else {
        startRecognition();
    }
}

// 음성 인식 일시정지 함수
function pauseRecognition() {
    recognition.stop();
    clearListeningMessage(); // "AI 면접관이 듣고 있습니다" 메시지 삭제
    console.log('음성 인식 일시 정지');
}

// 음성 인식 재개 함수
function resumeRecognition() {
    recognition.start();
    displayListeningMessage(); // "AI 면접관이 듣고 있습니다" 메시지 표시
    console.log('음성 인식 재개');
    resetSilenceTimer(); // Silence 타이머 재시작
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
    startStopButton.classList.remove('active');
    displayFinalTranscript(finalTranscript);
    saveResultToLocal(finalTranscript); // 여기에서 결과 저장
    clearTimeout(silenceTimer);
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
        // 여기에 대체 저장 방법을 구현할 수 있습니다.
    }
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
    return navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop()); // 권한 확인 후 트랙 중지
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

// 일주일 동안 모달창을 보지 않기 기능
document.addEventListener('DOMContentLoaded', function () {
    const newModal = document.getElementById('newModal');
    const closeModalButton = document.getElementById('closeNewModal');

    // 모달을 숨기는 함수
    function hideModal() {
        newModal.style.display = 'none'; // 모달 숨기기
    }

    // 닫기 버튼 클릭 시 모달 숨기고 마이크 권한만 요청
    closeModalButton.addEventListener('click', function() {
        hideModal();
        requestMicrophoneAccess()
            .then(() => {
                console.log('마이크 권한이 허용되었습니다.');
                // 여기서 음성 인식을 시작하지 않습니다.
            })
            .catch(handleMicrophoneAccessError);
    });

    // 페이지 로드 시 모달 보여주기 결정
    function showModalBasedOnPreference() {
        const hideUntil = localStorage.getItem('hideModalUntil');
        if (!hideUntil || Date.now() > parseInt(hideUntil, 10)) {
            newModal.style.display = 'block'; // 일주일이 지나거나 설정이 없는 경우 모달 보이기
        } else {
            hideModal(); // 아직 일주일이 지나지 않은 경우 모달 숨기기
        }
    }

    showModalBasedOnPreference(); // 페이지 로드 시 모달 보여주기 결정
});
