// speechRecognition.js

var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var diagnosticPara = document.querySelector('.output');
var listeningMessage = document.querySelector('.listening-message'); // Element to show the listening message
var recognition = new SpeechRecognition();
var silenceTimer; // Timer variable for silence detection

recognition.lang = 'ko-KR';
recognition.interimResults = false;
recognition.continuous = true; // Allow continuous recognition
recognition.maxAlternatives = 1;

recognition.onstart = function() {
  console.log('Speech recognition started');
  listeningMessage.textContent = "AI 면접관이 듣고 있습니다";
  // Reset the silence timer on start
  resetSilenceTimer();
};

recognition.onresult = function(event) {
  var speechResult = event.results[0][0].transcript.toLowerCase();
  console.log('Confidence: ' + event.results[0][0].confidence);
  console.log('Speech Result: ' + speechResult);
  diagnosticPara.textContent = speechResult + '.';
  localStorage.setItem('speechResult', speechResult);
  // Reset the silence timer on result
  resetSilenceTimer();
};

recognition.onspeechend = function() {
  console.log('Speech recognition ended');
  // Start the silence timer after speech ends
  startSilenceTimer();
};

recognition.onend = function() {
  console.log('Speech recognition end event');
  clearTimeout(silenceTimer); // Clear the silence timer
  listeningMessage.textContent = ""; // Hide the listening message
};

recognition.onerror = function(event) {
  console.error('Speech recognition error:', event.error);
  clearTimeout(silenceTimer); // Clear the silence timer
  listeningMessage.textContent = ""; // Hide the listening message
};

function startSpeechRecognition() {
  recognition.start();
}

function resetSilenceTimer() {
  clearTimeout(silenceTimer);
  silenceTimer = setTimeout(function() {
    recognition.stop();
  }, 5000); // Set the timer to stop recognition after 5 seconds of silence
}

function startSilenceTimer() {
  silenceTimer = setTimeout(function() {
    recognition.stop();
  }, 5000); // Set the timer to stop recognition after 5 seconds of silence
}

function requestMicrophoneAccess() {
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

function handleMicrophoneAccessError(err) {
  console.error('마이크 권한을 받을 수 없습니다:', err);
  alert('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
}
