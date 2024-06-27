var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

var diagnosticPara = document.querySelector('.output');
var statusMessage = document.getElementById('statusMessage');
var startButton = document.getElementById('startButton');
var playButton = document.getElementById('playButton');
var recordedAudioChunks = [];

var recognition;
var mediaRecorder;

function startSpeechRecognition() {
  // 음성 인식 객체 초기화
  recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'ko-KR';
  recognition.interimResults = false; // 중간 결과를 반환할 필요가 없으면 false로 설정
  recognition.continuous = false; // 한 번만 인식하도록 설정
  recognition.maxAlternatives = 1;

  // 음성 인식 시작 메시지 표시
  statusMessage.textContent = 'AI 면접관이 듣고 있습니다';

  recognition.start();

  recognition.onresult = function(event) {
    var speechResult = event.results[0][0].transcript.toLowerCase();
    console.log('Confidence: ' + event.results[0][0].confidence);
    console.log('Speech Result: ' + speechResult);
    diagnosticPara.textContent = '음성 인식 결과: ' + speechResult + '.';

    // 로컬 스토리지에 인식 결과 저장
    localStorage.setItem('latestSpeechResult', speechResult);

    // 음성 인식 종료 메시지 제거
    statusMessage.textContent = '';

    // 녹음된 오디오를 변수에 저장
    recordedAudioChunks.push(event.results[0][0].blob);
    playButton.disabled = false; // 재생 버튼 활성화
  };

  recognition.onaudiostart = function(event) {
    console.log('Audio capturing started');
  };

  recognition.onaudioend = function(event) {
    console.log('Audio capturing ended');
  };

  recognition.onerror = function(event) {
    console.error('Error occurred in recognition: ' + event.error);
  };

  recognition.onend = function() {
    console.log('Speech recognition service disconnected');
    statusMessage.textContent = ''; // 음성 인식 종료 메시지 제거
  };

  // 마이크 권한 요청 및 처리
  requestMicrophoneAccess().then(function(stream) {
    console.log('Microphone access granted');
  }).catch(handleMicrophoneAccessError);
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

// 녹음된 오디오를 재생하는 함수
function playRecordedAudio() {
  if (recordedAudioChunks.length > 0) {
    var combinedBlob = new Blob(recordedAudioChunks, { type: 'audio/wav' });
    var audioUrl = URL.createObjectURL(combinedBlob);
    var audio = new Audio(audioUrl);
    audio.play();
  } else {
    alert('녹음된 음성이 없습니다.');
  }
}
