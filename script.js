var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var diagnosticPara = document.querySelector('.output');

function sendSpeech() {
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'ko-KR';
  recognition.interimResults = false; // true: 중간 결과를 반환, false: 최종 결과만 반환
  recognition.continious = false; // true: 음성인식을 계속해서 수행, false: 음성인식을 한번만 수행
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    var speechResult = event.results[0][0].transcript.toLowerCase();
    console.log('Confidence: ' + event.results[0][0].confidence);
    console.log('Speech Result: ' + speechResult);
    diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
  }

  recognition.onaudiostart = function(event) {
      // 사용자 에이전트가 오디오 캡처를 시작했을 때 발생
      console.log('SpeechRecognition.onaudiostart');
  }

  recognition.onaudioend = function(event) {
      // 사용자 에이전트가 오디오 캡처를 완료했을 때 발생
      console.log('SpeechRecognition.onaudioend');
  }

  recognition.onend = function(event) {
      // 음성 인식 서비스가 연결을 끊었을 때 발생
      console.log('SpeechRecognition.onend');
  }

  recognition.onnomatch = function(event) {
      // 음성 인식 서비스가 의미있는 인식을 하지 못한 최종 결과를 반환했을 때 발생
      console.log('SpeechRecognition.onnomatch');
  }

  recognition.onsoundstart = function(event) {
      // 인식 가능한 음성 여부와 관계없이 어떤 소리든 감지되었을 때 발생
      console.log('SpeechRecognition.onsoundstart');
  }

  recognition.onsoundend = function(event) {
      // 인식 가능한 음성 여부와 관계없이 어떤 소리든 감지가 중지되었을 때 발생
      console.log('SpeechRecognition.onsoundend');
  }

  recognition.onspeechstart = function (event) {
      // 음성 인식 서비스가 음성을 감지했을 때 발생
      console.log('SpeechRecognition.onspeechstart');
  }
  recognition.onstart = function(event) {
      // 음성 인식 서비스가 현재 SpeechRecognition과 연관된 문법을 인식할 의도로 들어오는 오디오를 듣기 시작했을 때 발생
      console.log('SpeechRecognition.onstart');
  }
}
