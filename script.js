// speechRecognition.js

// 웹 브라우저에서 제공하는 SpeechRecognition API 사용을 위해
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var diagnosticPara = document.querySelector('.output');  // 결과를 출력할 요소
var listeningMessage = document.querySelector('.listening-message'); // 듣고 있는 메시지를 표시할 요소

// 음성 인식 시작 및 처리를 위한 함수
function sendSpeech() {
  var recognition = new SpeechRecognition();  // SpeechRecognition 객체 생성
  recognition.lang = 'ko-KR';  // 인식 언어 설정 (한국어)
  recognition.interimResults = false;  // 중간 결과 사용 안 함
  recognition.continuous = true; // 연속적으로 인식 가능하도록 설정
  recognition.maxAlternatives = 1; // 최대 대안 개수 설정

  var silenceTimer;

  recognition.start();  // 음성 인식 시작
  listeningMessage.textContent = "AI 면접관이 듣고 있습니다";  // 듣고 있는 메시지 표시

  recognition.onresult = function(event) {
    clearTimeout(silenceTimer); // 결과가 있으면 침묵 타이머 초기화
    var speechResult = event.results[0][0].transcript.toLowerCase();  // 인식된 텍스트 소문자로 변환
    console.log('Confidence: ' + event.results[0][0].confidence);  // 인식 확률 로깅
    console.log('Speech Result: ' + speechResult);  // 인식 결과 로깅
    diagnosticPara.textContent = speechResult + '.';  // 결과를 출력 요소에 표시
    localStorage.setItem('speechResult', speechResult);  // 인식 결과를 로컬 스토리지에 저장
    listeningMessage.textContent = ""; // 듣는 메시지 숨기기
    recognition.stop(); // 결과를 받은 후 음성 인식 멈춤
  };

  recognition.onend = function() {
    listeningMessage.textContent = ""; // 듣는 메시지 숨기기 (인식 종료 시)
  };

  recognition.onerror = function(event) {
    clearTimeout(silenceTimer); // 오류 발생 시 침묵 타이머 초기화
    listeningMessage.textContent = ""; // 듣는 메시지 숨기기
    console.error('Speech recognition error:', event.error);  // 오류 로깅
  };
}

// 마이크 접근 권한 요청을 위한 함수
function requestMicrophoneAccess() {
  return navigator.mediaDevices.getUserMedia({ audio: true });  // 오디오 접근 권한 요청
}

// 마이크 접근 권한 요청 시 오류 처리 함수
function handleMicrophoneAccessError(err) {
  console.error('마이크 권한을 받을 수 없습니다:', err);  // 오류 메시지 로깅
  alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');  // 사용자에게 알림
}
