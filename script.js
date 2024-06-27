// script.js 파일

// 음성 인식 API 초기화
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// 결과 표시할 요소 선택
const resultContainer = document.getElementById('resultContainer');
let finalTranscript = '';

// MediaRecorder 설정
let mediaRecorder;
let recordedChunks = [];
let recordedBlob; // 녹음된 Blob을 저장할 변수

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

// MediaRecorder 초기화
function initRecorder() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.onstop = handleStop;
            recordedChunks = [];
            mediaRecorder.start();
        })
        .catch(err => {
            console.error('녹음을 위한 권한을 받지 못했습니다:', err);
        });
}

// 마이크 권한 요청 함수
function requestMicrophoneAccess() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                stream.getTracks().forEach(track => track.stop()); // 권한 확인 후 트랙 중지
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
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
    }
    clearListeningMessage(); // "AI 면접관이 듣고 있습니다" 메시지 삭제
}

// 음성 인식 재시작 함수
function resumeRecognition() {
    recognition.start();
    if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
    }
    displayListeningMessage(); // "AI 면접관이 듣고 있습니다" 메시지 표시
}

// 음성 인식 시작 함수
function startRecognition() {
    finalTranscript = ''; // 이전 결과 초기화
    displayListeningMessage(); // "AI 면접관이 듣고 있습니다" 메시지 표시

    recognition.start();
    console.log('음성 인식 시작');
    startStopButton.classList.add('active'); // 버튼 활성화

    initRecorder(); // 녹음을 위한 MediaRecorder 초기화
    resetSilenceTimer(); // Silence 타이머 시작
}

// 음성 인식 멈춤 함수
function stopRecognition() {
    recognition.stop();
    console.log('음성 인식 멈춤');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop(); // 녹음 중지
    }

    startStopButton.classList.remove('active'); // 버튼 비활성화
    displayFinalTranscript(finalTranscript); // 최종 결과 표시
    saveResultToLocal(finalTranscript); // 결과 저장
    clearTimeout(silenceTimer); // Silence 타이머 초기화
}

// MediaRecorder 데이터 처리
function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

// MediaRecorder 멈춤 처리
function handleStop(event) {
    recordedBlob = new Blob(recordedChunks, { type: 'audio/wav' });
    console.log('녹음된 Blob:', recordedBlob);
}

// 음성 인식 중 에러 처리
recognition.onerror = (event) => {
    console.error('음성 인식 에러:', event.error);
};
