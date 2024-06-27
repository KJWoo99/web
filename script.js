// speechRecognition.js

var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

var diagnosticPara = document.querySelector('.output');

function sendSpeech() {
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    var speechResult = event.results[0][0].transcript.toLowerCase();
    console.log('Confidence: ' + event.results[0][0].confidence);
    console.log('Speech Result: ' + speechResult);
    diagnosticPara.textContent = '음성 인식 결과: ' + speechResult + '.';
  }
}

function requestMicrophoneAccess() {
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

function handleMicrophoneAccessError(err) {
  console.error('마이크 권한을 받을 수 없습니다:', err);
  alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
}
