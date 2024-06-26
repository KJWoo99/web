document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    const resultDiv = document.getElementById('result');

    // Web Speech API를 사용할 수 있는지 확인
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        resultDiv.textContent = "이 브라우저는 음성 인식을 지원하지 않습니다.";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR'; // 한국어 설정
    recognition.interimResults = false; // 중간 결과 표시 여부
    recognition.maxAlternatives = 1; // 최대 대안 수

    recognition.onstart = function() {
        resultDiv.textContent = "음성 인식이 시작되었습니다. 말해보세요...";
        startButton.disabled = true;
        stopButton.disabled = false;
    };

    recognition.onspeechend = function() {
        recognition.stop();
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        resultDiv.textContent = `인식된 텍스트: ${transcript}`;
    };

    recognition.onerror = function(event) {
        resultDiv.textContent = `오류 발생: ${event.error}`;
        startButton.disabled = false;
        stopButton.disabled = true;
    };

    recognition.onend = function() {
        startButton.disabled = false;
        stopButton.disabled = true;
    };

    startButton.addEventListener('click', function() {
        // 마이크 권한 요청
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                recognition.start();
            })
            .catch(function(err) {
                resultDiv.textContent = `마이크 권한이 필요합니다: ${err}`;
            });
    });

    stopButton.addEventListener('click', function() {
        recognition.stop();
    });
});
