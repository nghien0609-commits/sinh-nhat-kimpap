
const countdownScreen = document.getElementById("countdownScreen");
const wishScreen = document.getElementById("wishScreen");
const cakeScreen = document.getElementById("cakeScreen");

const countdown = document.getElementById("countdown");
const wishText = document.getElementById("wishText");
const nextWishBtn = document.getElementById("nextWishBtn");
const wishDots = document.getElementById("wishDots");

const blowBtn = document.getElementById("blowBtn");
const micBtn = document.getElementById("micBtn");
const againBtn = document.getElementById("againBtn");
const cakeMessage = document.getElementById("cakeMessage");
const micStatus = document.getElementById("micStatus");

let currentWish = 0;
let candlesOut = false;
let audioContext = null;
let microphoneStream = null;
let microphoneSource = null;
let analyser = null;
let micFrame = null;

const wishes = [
    "Chúc mừng sinh nhật Lộc chan! 💗 Chúc anh luôn vui vẻ, mạnh khỏe và gặp thật nhiều may mắn nhé bbi",
    "Mong tuổi mới của anh sẽ có thật nhiều niềm vui, luôn làm được những điều mình thích và gặp những người thật tốt. 🌷",
    "Đặc biệt chúc anh ngày càng đẹp trai, học hành tấn tới, tiền vào như nước, vận may đỏ như son, đánh game thì bách chiến bách thắng, leo rank vèo vèo, không còn gặp mấy quả đồng đội báo đời nữa 🎮🔥 ✨",
    "Chúc Florentino của anh múa hoa không trượt nhịp, Ryoma chém đâu trúng đó, Elsu bắn đâu headshot đó, Eland'orr lướt đâu đối thủ rén đó 😎⚔️ Mong anh mãi là một con quái vật Liên Quân, khiến team bạn nhìn thấy tên đã muốn bấm đầu hàng 🤡💥 🎂💖",
    "Cuối cùng, chúc Lộc chan sinh nhật thật vui vẻ, tuổi mới rực rỡ, cuộc đời toàn highlight, sự nghiệp Liên Quân ngày càng huy hoàng! 🎂🎁",
    "Chúc gia đình mình sớm ngày đông đủ thành viên ✨ I LOVE UUUUU 💖"
];

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(function(item) {
        item.classList.remove("active");
    });

    screen.classList.add("active");
}

function startCountdown() {
    let number = 3;
    countdown.textContent = number;

    const timer = setInterval(function() {
        number--;

        if (number > 0) {
            countdown.textContent = number;
            countdown.style.animation = "none";
            void countdown.offsetWidth;
            countdown.style.animation = "";
        } else {
            clearInterval(timer);
            showScreen(wishScreen);
        }
    }, 1000);
}

// Các ngôi sao nhỏ trên nền
const stars = document.getElementById("stars");

for (let i = 0; i < 45; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = Math.random() > 0.5 ? "✦" : "·";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.fontSize = (10 + Math.random() * 18) + "px";
    star.style.animationDelay = Math.random() * 2 + "s";
    stars.appendChild(star);
}

// Chuyển lời chúc
nextWishBtn.addEventListener("click", function() {
    currentWish++;

    if (currentWish < wishes.length) {
        wishText.textContent = wishes[currentWish];
        wishDots.textContent = "♡ ".repeat(currentWish + 1);

        if (currentWish === wishes.length - 1) {
            nextWishBtn.textContent = "Đến lúc thổi nến! 🎂";
        }
    } else {
        showScreen(cakeScreen);
    }
});

// Hiệu ứng pháo giấy
function celebrate() {
    const confetti = document.getElementById("confetti");
    const colors = ["#ff9bcf", "#ffe6a9", "#c99bff", "#ffffff", "#ff709f"];

    for (let i = 0; i < 90; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.textContent = Math.random() > 0.5 ? "♥" : "✦";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.color = colors[Math.floor(Math.random() * colors.length)];
        piece.style.fontSize = (10 + Math.random() * 14) + "px";
        piece.style.animationDelay = Math.random() * 1.5 + "s";
        confetti.appendChild(piece);

        setTimeout(function() {
            piece.remove();
        }, 5000);
    }
}

// Tắt nến
function extinguishCandles() {
    if (candlesOut) return;

    candlesOut = true;

    document.querySelectorAll(".flame").forEach(function(flame) {
        flame.style.display = "none";
    });

    cakeMessage.textContent =
        "Yayyy! Chúc Lộc chan mọi điều ước đều thành sự thật! 💖🎉";

    blowBtn.classList.add("hidden");
    micBtn.classList.add("hidden");
    againBtn.classList.remove("hidden");

    stopMicrophone();
    celebrate();
}

// Bấm nút để thổi nến
blowBtn.addEventListener("click", extinguishCandles);

// Thổi nến bằng micro
micBtn.addEventListener("click", async function() {
    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia) {
        micStatus.textContent =
            "Micro cần website chạy trên localhost hoặc HTTPS.";
        return;
    }

    try {
        micBtn.disabled = true;
        micStatus.textContent = "Đang xin quyền sử dụng micro...";

        microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        audioContext = new AudioContextClass();
        await audioContext.resume();

        microphoneSource =
            audioContext.createMediaStreamSource(microphoneStream);

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        microphoneSource.connect(analyser);

        const data = new Uint8Array(analyser.fftSize);
        let baseline = 0;
        let samples = 0;
        let loudFrames = 0;

        micStatus.textContent =
            "Micro đã bật! Hãy thổi về phía micro nhé! 🌬️";

        function listen() {
            if (candlesOut || !analyser) return;

            analyser.getByteTimeDomainData(data);

            let sum = 0;

            for (let i = 0; i < data.length; i++) {
                const value = (data[i] - 128) / 128;
                sum += value * value;
            }

            const volume = Math.sqrt(sum / data.length);

            // Đo âm thanh nền trong khoảng 1 giây đầu
            if (samples < 12) {
                baseline = Math.max(baseline, volume);
                samples++;
            } else {
                const threshold = Math.max(0.055, baseline * 2.8);

                if (volume > threshold) {
                    loudFrames++;
                } else {
                    loudFrames = Math.max(0, loudFrames - 1);
                }

                if (loudFrames >= 4) {
                    extinguishCandles();
                    return;
                }
            }

            micFrame = requestAnimationFrame(listen);
        }

        listen();
    } catch (error) {
        micStatus.textContent =
            "Không bật được micro. Bạn hãy cho phép truy cập micro hoặc dùng nút Thổi tắt nến nhé!";
        micBtn.disabled = false;
    }
});

function stopMicrophone() {
    if (micFrame !== null) {
        cancelAnimationFrame(micFrame);
        micFrame = null;
    }

    if (microphoneStream) {
        microphoneStream.getTracks().forEach(function(track) {
            track.stop();
        });
        microphoneStream = null;
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    analyser = null;
    microphoneSource = null;
}

// Xem lại từ đầu
againBtn.addEventListener("click", function() {
    stopMicrophone();

    candlesOut = false;
    currentWish = 0;

    wishText.textContent = wishes[0];
    wishDots.textContent = "♡ ♡ ♡";
    nextWishBtn.textContent = "Đọc tiếp 💌";

    document.querySelectorAll(".flame").forEach(function(flame) {
        flame.style.display = "block";
    });

    cakeMessage.textContent =
        "Nhắm mắt, ước một điều rồi thổi nến nha! 💕";

    blowBtn.classList.remove("hidden");
    micBtn.classList.remove("hidden");
    micBtn.disabled = false;
    againBtn.classList.add("hidden");
    micStatus.textContent = "";

    showScreen(countdownScreen);
    startCountdown();
});

// Bắt đầu website
startCountdown();
