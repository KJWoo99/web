var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var diagnosticPara = document.querySelector('.output');

function sendSpeech() {
  // 마이크 사용 권한 요청
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      var recognition = new SpeechRecognition();
      var speechRecognitionList = new SpeechGrammarList();
      recognition.grammars = speechRecognitionList;
      recognition.lang = 'ko-KR';
      recognition.interimResults = false; // true: 중간 결과를 반환, false: 최종 결과만 반환
      recognition.continuous = false; // true: 음성인식을 계속해서 수행, false: 음성인식을 한번만 수행
      recognition.maxAlternatives = 1;

      recognition.start();

      recognition.onresult = function(event) {
        var speechResult = event.results[0][0].transcript.toLowerCase();
        console.log('Confidence: ' + event.results[0][0].confidence);
        console.log('Speech Result: ' + speechResult);
        diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
      }

      recognition.onaudiostart = function() {
        console.log('Audio capturing started.');
      }

      recognition.onaudioend = function() {
        console.log('Audio capturing ended.');
      }

      recognition.onerror = function(event) {
        console.log('Error occurred in recognition: ' + event.error);
        diagnosticPara.textContent = 'Error occurred in recognition: ' + event.error + '.';
      }
    })
    .catch(function(err) {
      console.log('The following getUserMedia error occurred: ' + err);
      diagnosticPara.textContent = 'The following getUserMedia error occurred: ' + err + '.';
    });
}
