var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var diagnosticPara = document.querySelector('.output');

var mediaRecorder;
var recordedChunks = [];
var recordedBlob;

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
        diagnosticPara.textContent = 'Speech received: ' + speechResult + '.';
    };

    recognition.onend = function(event) {
        console.log('SpeechRecognition.onend');
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop(); // 음성 인식이 끝날 때 녹음을 멈춤
        }
    };

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.onstop = handleStop;
            recordedChunks = [];
            mediaRecorder.start();
        })
        .catch(err => {
            console.error('녹음을 위한 권한을 받지 못했습니다:', err);
        });
}

function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

function handleStop(event) {
    recordedBlob = new Blob(recordedChunks, { type: 'audio/wav' });
    console.log('녹음된 Blob:', recordedBlob);
}

function playRecordedAudio() {
    if (recordedBlob) {
        const audioUrl = URL.createObjectURL(recordedBlob);
        const audio = new Audio(audioUrl);
        audio.play()
            .then(() => {
                console.log('녹음된 오디오 재생 시작');
            })
            .catch((error) => {
                console.error('녹음된 오디오 재생 실패:', error);
            });
    } else {
        console.log('녹음된 오디오가 없습니다.');
    }
}

document.getElementById('startButton').addEventListener('click', sendSpeech);
document.getElementById('playButton').addEventListener('click', playRecordedAudio);
