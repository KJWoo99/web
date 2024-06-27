var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
var SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
var diagnosticPara = document.querySelector('.output');

function sendSpeech() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
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
        diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
      }

      recognition.onaudiostart = function(event) {
        console.log('SpeechRecognition.onaudiostart');
      }

      recognition.onaudioend = function(event) {
        console.log('SpeechRecognition.onaudioend');
      }

      recognition.onend = function(event) {
        console.log('SpeechRecognition.onend');
      }

      recognition.onnomatch = function(event) {
        console.log('SpeechRecognition.onnomatch');
      }

      recognition.onsoundstart = function(event) {
        console.log('SpeechRecognition.onsoundstart');
      }

      recognition.onsoundend = function(event) {
        console.log('SpeechRecognition.onsoundend');
      }

      recognition.onspeechstart = function(event) {
        console.log('SpeechRecognition.onspeechstart');
      }

      recognition.onstart = function(event) {
        console.log('SpeechRecognition.onstart');
      }

      // Handle errors
      recognition.onerror = function(event) {
        console.error('Speech recognition error detected: ' + event.error);
      }

      // Connect the media stream to the recognition object to enable audio input
      recognition.stream = stream;
    })
    .catch(function(err) {
      console.error('Error accessing microphone:', err);
    });
}
