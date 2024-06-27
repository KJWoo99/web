var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

var diagnosticPara = document.querySelector('.output');

function sendSpeech() {
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'ko-KR';
  recognition.interimResults = false; // 중간 결과를 반환할 필요가 없으면 false로 설정
  recognition.continuous = false; // 한 번만 인식하도록 설정
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    var speechResult = event.results[0][0].transcript.toLowerCase();
    console.log('Confidence: ' + event.results[0][0].confidence);
    console.log('Speech Result: ' + speechResult);
    diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
  }
}

// 마이크 권한 요청 함수
function requestMicrophoneAccess() {
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

// 마이크 권한 요청 실패 처리 함수
function handleMicrophoneAccessError(err) {
  console.error('마이크 권한을 받을 수 없습니다:', err);
  alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
}
