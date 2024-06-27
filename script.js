var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var diagnosticPara = document.querySelector('.output');

// Button reference
var startBtn = document.getElementById('startBtn');

// Function to handle speech recognition
function sendSpeech() {
  // Request microphone access
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      var recognition = new SpeechRecognition();
      var speechRecognitionList = new SpeechGrammarList();
      recognition.grammars = speechRecognitionList;
      recognition.lang = 'ko-KR'; // Language for recognition (Korean)
      recognition.interimResults = false; // Set to true for interim results
      recognition.continuous = false; // Set to true for continuous recognition
      recognition.maxAlternatives = 1;

      recognition.start();

      recognition.onresult = function(event) {
        var speechResult = event.results[0][0].transcript.toLowerCase();
        console.log('Confidence: ' + event.results[0][0].confidence);
        console.log('Speech Result: ' + speechResult);
        diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
      };

      recognition.onaudiostart = function() {
        console.log('Audio capturing started.');
      };

      recognition.onaudioend = function() {
        console.log('Audio capturing ended.');
      };

      recognition.onerror = function(event) {
        console.log('Error occurred in recognition: ' + event.error);
        diagnosticPara.textContent = 'Error occurred in recognition: ' + event.error + '.';
      };
    })
    .catch(function(err) {
      console.log('The following getUserMedia error occurred: ' + err);
      diagnosticPara.textContent = 'The following getUserMedia error occurred: ' + err + '.';
    });
}

// Event listener for the button click
startBtn.addEventListener('click', function() {
  // Check if SpeechRecognition is supported
  if (SpeechRecognition) {
    // Call sendSpeech function on button click
    sendSpeech();
  } else {
    // SpeechRecognition is not supported
    diagnosticPara.textContent = 'Speech recognition is not supported in your browser.';
  }
});
