var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var diagnosticPara = document.querySelector('.output');
var listeningMessage = document.querySelector('.listening-message');
var mediaRecorder;
var chunks = [];
var recordedBlob = null;

function sendSpeech() {
  var recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;

  var stream = navigator.mediaDevices.getUserMedia({ audio: true });
  stream.then(function(audioStream) {
    mediaRecorder = new MediaRecorder(audioStream);
    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    };
    mediaRecorder.start();

    // MediaRecorder 객체가 생성된 후에 onstop 이벤트 설정
    mediaRecorder.onstop = function(e) {
      recordedBlob = new Blob(chunks, { 'type' : 'audio/wav; codecs=MS_PCM' });
      chunks = [];

      // Blob URL 생성
      var blobUrl = URL.createObjectURL(recordedBlob);

      // Blob URL을 localStorage에 저장
      localStorage.setItem('recordedBlobUrl', blobUrl);
    };
  }).catch(function(err) {
    handleMicrophoneAccessError(err);
  });

  var silenceTimer;

  recognition.start();
  listeningMessage.textContent = "AI 면접관이 듣고 있습니다";

  recognition.onresult = function(event) {
    clearTimeout(silenceTimer);
    var speechResult = event.results[0][0].transcript.toLowerCase();
    console.log('Confidence: ' + event.results[0][0].confidence);
    console.log('Speech Result: ' + speechResult);
    diagnosticPara.textContent = speechResult + '.';
    localStorage.setItem('speechResult', speechResult);
    listeningMessage.textContent = "";
    recognition.stop();
    mediaRecorder.stop();
    document.getElementById('playButton').style.display = 'inline-block'; // 녹음 파일 재생 버튼 표시
  };

  recognition.onend = function() {
    listeningMessage.textContent = "";
  };

  recognition.onerror = function(event) {
    clearTimeout(silenceTimer);
    listeningMessage.textContent = "";
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

document.getElementById('startButton').addEventListener('click', function() {
  requestMicrophoneAccess().then(function() {
    sendSpeech();
  }).catch(function(err) {
    handleMicrophoneAccessError(err);
  });
});

document.getElementById('playButton').addEventListener('click', function() {
  var blobUrl = localStorage.getItem('recordedBlobUrl');
  if (blobUrl) {
    var audio = new Audio(blobUrl);
    audio.play();
  } else {
    console.error('저장된 녹음 파일이 없습니다.');
    alert('저장된 녹음 파일이 없습니다.');
  }
});
