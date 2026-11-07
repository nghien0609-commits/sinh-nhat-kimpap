
// =====================================
// 1. CẤU HÌNH
// =====================================

// Đổi thành ngày sinh thật của bạn theo định dạng DD/MM
const correctBirthday = "06/09";

// =====================================
// 2. CHUYỂN MÀN HÌNH
// =====================================

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
    }
}

// =====================================
// 3. NHẬP NGÀY SINH BẰNG 4 Ô
// =====================================

const dateDigits = document.querySelectorAll(".date-digit");

dateDigits.forEach((input, index) => {
    input.addEventListener("input", function () {
        // Chỉ nhận số
        this.value = this.value.replace(/[^0-9]/g, "").slice(-1);

        // Tự chuyển sang ô kế tiếp
        if (this.value && index < dateDigits.length - 1) {
            dateDigits[index + 1].focus();
        }

        // Xóa thông báo cũ
        document.getElementById("quizMessage").textContent = "";
    });

    input.addEventListener("keydown", function (event) {
        // Nhấn Backspace khi ô trống thì quay lại
        if (
            event.key === "Backspace" &&
            this.value === "" &&
            index > 0
        ) {
            dateDigits[index - 1].focus();
        }

        // Nhấn Enter để kiểm tra
        if (event.key === "Enter") {
            checkAnswer();
        }

        // Di chuyển bằng phím mũi tên
        if (event.key === "ArrowLeft" && index > 0) {
            dateDigits[index - 1].focus();
        }

        if (event.key === "ArrowRight" && index < dateDigits.length - 1) {
            dateDigits[index + 1].focus();
        }
    });

    // Dán ngày sinh dạng DDMM vào các ô
    input.addEventListener("paste", function (event) {
        event.preventDefault();

        const pasted = (event.clipboardData || window.clipboardData)
            .getData("text")
            .replace(/[^0-9]/g, "")
            .slice(0, 4);

        pasted.split("").forEach((number, i) => {
            if (dateDigits[i]) {
                dateDigits[i].value = number;
            }
        });

        const nextIndex = Math.min(pasted.length, 3);
        dateDigits[nextIndex].focus();
    });
});

// Kiểm tra câu trả lời
function checkAnswer() {
    const answer = Array.from(dateDigits)
        .map(input => input.value)
        .join("");

    const correct = correctBirthday.replace("/", "");

    const message = document.getElementById("quizMessage");

    if (answer.length !== 4) {
        message.textContent = "Nhập đủ 4 chữ số nhé! ♡";
        message.style.color = "#d58a9b";
        return;
    }

    if (answer === correct) {
        message.textContent = "Chính xác rồi! Mở quà thôi ♡";
        message.style.color = "#8ca982";

        document.querySelector(".quiz-card button").disabled = true;

        setTimeout(() => {
            showScreen("countdownScreen");
            startCountdown();
        }, 900);

    } else {
        message.textContent = "Chưa đúng rồi, thử lại nhé! ♡";
        message.style.color = "#d58a9b";

        dateDigits.forEach(input => {
            input.value = "";
        });

        dateDigits[0].focus();
    }
}

// =====================================
// 4. ĐẾM NGƯỢC 3 - 2 - 1
// =====================================

let countdownTimer = null;

function startCountdown() {
    let number = 3;

    const display = document.getElementById("countdownNumber");

    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    display.textContent = number;
    display.style.animation = "none";
    void display.offsetWidth;
    display.style.animation = "numberPop 0.8s ease";

    countdownTimer = setInterval(() => {
        number--;

        if (number > 0) {
            display.textContent = number;

            display.style.animation = "none";
            void display.offsetWidth;
            display.style.animation = "numberPop 0.8s ease";

        } else {
            clearInterval(countdownTimer);
            countdownTimer = null;

            display.textContent = "♡";

            setTimeout(() => {
                showScreen("memoryScreen");
            }, 1000);
        }
    }, 1000);
}

// =====================================
// 5. MỞ PHONG THƯ
// =====================================

function openEnvelope() {
    const envelope = document.getElementById("envelope");
    const photos = document.getElementById("photos");
    const hint = document.getElementById("clickHint");
    const nextButton = document.getElementById("nextMemory");

    if (envelope.classList.contains("open")) {
        return;
    }

    envelope.classList.add("open");

    setTimeout(() => {
        photos.classList.add("open");
    }, 400);

    setTimeout(() => {
        nextButton.classList.remove("hidden");
    }, 1900);
}

// =====================================
// 6. PHÓNG TO ẢNH KỶ NIỆM
// =====================================

const memoryImages = [
    "images/ky niem 1.jpg",
    "images/ky niem 2.jpg",
    "images/ky niem 3.jpg",
    "images/ky niem 4.jpg",
    "images/ky niem 5.jpg",
    "images/ky niem 6.jpg"
];

function showPhoto(index) {
    if (!memoryImages[index]) {
        return;
    }

    const modal = document.getElementById("photoModal");
    const image = document.getElementById("modalImage");

    image.src = memoryImages[index];
    modal.classList.add("show");
}

function closePhoto() {
    document.getElementById("photoModal").classList.remove("show");
}

// Không đóng ảnh khi nhấn trực tiếp vào ảnh
document.getElementById("modalImage").addEventListener("click", function (event) {
    event.stopPropagation();
});

// Không để nút đóng ảnh kích hoạt sự kiện đóng hai lần
document.querySelector(".close-modal").addEventListener("click", function (event) {
    event.stopPropagation();
    closePhoto();
});

// Đóng ảnh bằng phím Escape
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closePhoto();
    }
});

// =====================================
// 7. THỔI NẾN BẰNG MICRO
// =====================================

let audioContext = null;
let microphoneStream = null;
let microphoneSource = null;
let analyser = null;
let microphoneFrame = null;
let isBlown = false;
let loudSince = null;

async function blowCandles() {
    if (isBlown) {
        return;
    }

    const button = document.getElementById("blowButton");
    const status = document.getElementById("micStatus");

    // Kiểm tra trình duyệt có hỗ trợ micro không
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = "Trình duyệt chưa hỗ trợ micro. Hãy mở bằng Chrome hoặc Edge nhé!";
        return;
    }

    button.disabled = true;
    status.textContent = "Đang chờ bạn cho phép sử dụng micro...";

    try {
        microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            throw new Error("Trình duyệt không hỗ trợ xử lý âm thanh.");
        }

        audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        microphoneSource = audioContext.createMediaStreamSource(microphoneStream);
        analyser = audioContext.createAnalyser();

        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.25;

        microphoneSource.connect(analyser);

        const data = new Uint8Array(analyser.fftSize);

        status.textContent = "Hãy thổi nhẹ vào micro để tắt nến nhé! ♡";
        button.textContent = "🎤 Đang nghe tiếng thổi...";

        function detectBlow() {
            if (isBlown || !analyser) {
                return;
            }

            analyser.getByteTimeDomainData(data);

            let sum = 0;

            for (let i = 0; i < data.length; i++) {
                const value = (data[i] - 128) / 128;
                sum += value * value;
            }

            const volume = Math.sqrt(sum / data.length);

            // Tiếng thổi thường tạo âm lượng lớn hơn tiếng nền
            if (volume > 0.16) {
                if (!loudSince) {
                    loudSince = Date.now();
                }

                if (Date.now() - loudSince >= 350) {
                    turnOffCandles();
                    return;
                }
            } else {
                loudSince = null;
            }

            microphoneFrame = requestAnimationFrame(detectBlow);
        }

        detectBlow();

    } catch (error) {
        console.error(error);

        status.textContent =
            "Không mở được micro. Hãy kiểm tra quyền micro của trình duyệt nhé!";

        button.disabled = false;
        button.textContent = "🎤 Thử bật micro lại";
    }
}

// =====================================
// 8. TẮT NẾN
// =====================================

function turnOffCandles() {
    if (isBlown) {
        return;
    }

    isBlown = true;

    const flame = document.getElementById("flame");
    const button = document.getElementById("blowButton");
    const status = document.getElementById("micStatus");
    const message = document.getElementById("finalMessage");

    flame.classList.add("off");

    button.textContent = "Điều ước đã được gửi đi ✨";
    button.disabled = true;

    status.textContent = "Bạn đã thổi tắt nến rồi! ♡";

    message.textContent = "Chúc Kimpap tuổi mới thật hạnh phúc! ♡";

    stopMicrophone();
    createConfetti();
}

// Dừng micro sau khi thổi nến
function stopMicrophone() {
    if (microphoneFrame) {
        cancelAnimationFrame(microphoneFrame);
        microphoneFrame = null;
    }

    if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop());
        microphoneStream = null;
    }

    if (audioContext) {
        audioContext.close().catch(error => console.log(error));
        audioContext = null;
    }

    analyser = null;
    microphoneSource = null;
}

// =====================================
// 9. PHÁO GIẤY
// =====================================

function createConfetti() {
    const colors = [
        "#f3b8c9",
        "#c9b5df",
        "#f7dfa0",
        "#fff0c9",
        "#d9c6ec",
        "#e9a9b9"
    ];

    for (let i = 0; i < 100; i++) {
        const piece = document.createElement("div");

        piece.className = "confetti";

        piece.style.left = Math.random() * 100 + "vw";
        piece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDelay = Math.random() * 1.5 + "s";
        piece.style.animationDuration = 2.5 + Math.random() * 2 + "s";

        piece.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, 5000);
    }
}

// =====================================
// 10. DỌN MICRO KHI RỜI TRANG
// =====================================

window.addEventListener("beforeunload", function () {
    stopMicrophone();
});
