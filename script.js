// speechRecognition.js

var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var diagnosticPara = document.querySelector('.output');
var listeningMessage = document.querySelector('.listening-message'); // Element to show the listening message

function sendSpeech() {
  var recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.continuous = true; // Allow continuous recognition
  recognition.maxAlternatives = 1;

  var silenceTimer;

  recognition.start();
  listeningMessage.textContent = "AI 면접관이 듣고 있습니다";

  recognition.onresult = function(event) {
    clearTimeout(silenceTimer); // Reset the silence timer on result
    var speechResult = event.results[0][0].transcript.toLowerCase();
    console.log('Confidence: ' + event.results[0][0].confidence);
    console.log('Speech Result: ' + speechResult);
    diagnosticPara.textContent = speechResult + '.';
    localStorage.setItem('speechResult', speechResult);
    listeningMessage.textContent = ""; // Hide the listening message
    recognition.stop(); // Stop recognition after result
  };

  recognition.onspeechend = function() {
    clearTimeout(silenceTimer); // Clear the silence timer
    silenceTimer = setTimeout(() => {
      recognition.stop();
    }, 5000); // Set the timer to stop recognition after 5 seconds of silence
  };

  recognition.onend = function() {
    listeningMessage.textContent = ""; // Hide the listening message
  };

  recognition.onerror = function(event) {
    clearTimeout(silenceTimer); // Clear the silence timer
    listeningMessage.textContent = ""; // Hide the listening message
    console.error('Speech recognition error:', event.error);
  };
}

function requestMicrophoneAccess() {
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

function handleMicrophoneAccessError(err) {
  console.error('마이크 권한을 받을 수 없습니다:', err);
  alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
}
