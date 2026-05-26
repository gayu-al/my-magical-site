// Global Variable Definitions
let countdown, countdownContainer, treeDisplayContainer, dynamicHeartTree;
let wishPage, canvas, ctx, scoreBoard, scoreDisplay, readyBox, readyBtn;
let messageModal, modalText, closeModal, girlTrigger;
let loveQuestionPage, questionCard, punchlineCard, yesLoveBtn, noLoveBtn, lipsProceedBtn;

let timeLeft = 10;
let score = 0;
let gameActive = false;
let fireworkBlastActive = false;
let particles = [];
let fallingHearts = [];
let spawnerInterval;
let yesButtonScale = 1.0;
let noButtonScale = 1.0;

let bucket = {
    x: 0,
    y: 0,
    width: 110,
    height: 25,
    color: "#ff1493"
};

const branchPlacements = [
    {top: 46, left: 24}, {top: 37, left: 33}, {top: 29, left: 25}, {top: 23, left: 40},
    {top: 21, left: 54}, {top: 27, left: 70}, {top: 36, left: 64}, {top: 48, left: 78},
    {top: 38, left: 49}, {top: 52, left: 60}, {top: 42, left: 20}, {top: 32, left: 30},
    {top: 26, left: 35}, {top: 18, left: 45}, {top: 19, left: 58}, {top: 24, left: 65},
    {top: 31, left: 75}, {top: 43, left: 72}, {top: 49, left: 66}, {top: 40, left: 55},
    {top: 44, left: 28}, {top: 35, left: 22}, {top: 28, left: 38}, {top: 22, left: 48},
    {top: 23, left: 60}, {top: 30, left: 61}, {top: 34, left: 68}, {top: 41, left: 81},
    {top: 45, left: 74}, {top: 51, left: 57}, {top: 47, left: 31}, {top: 39, left: 26},
    {top: 31, left: 21}, {top: 25, left: 42}, {top: 20, left: 51}, {top: 25, left: 56},
    {top: 29, left: 66}, {top: 35, left: 73}, {top: 46, left: 69}, {top: 48, left: 59},
    {top: 43, left: 34}, {top: 36, left: 28}, {top: 27, left: 29}, {top: 21, left: 38},
    {top: 17, left: 49}, {top: 22, left: 63}, {top: 33, left: 78}, {top: 39, left: 62},
    {top: 44, left: 64}, {top: 50, left: 54}
];

branchPlacements.sort(() => Math.random() - 0.5);

const sweetMessages = [
    "U make everything feel brighter just by being there 🌸✨",
    "You’re literally amazinggg and I love you sooo much 💋",
    "May this year bring you endless laughter, success, and beautiful memories 🫶",
    "You deserve every bit of happiness in the universe 💋",
    "To my favorite person — keep shining like always 🌷💎",
    "Every moment with you feels like a special memory ❤️",
    "Never stop chasing your dreams — you’re meant for great things 🌠🌟",
    "You have the kindest soul and the warmest heart ❤️",
    "Hope this year gives u all the happiness nd crazy beautiful memories 🦋🦄",
    "The last secret leaf is waiting for u… now tap the girl under the tree 🌙👑"
];

let readSecretHearts = new Set();

// Safely boot everything up once DOM links are ready
window.addEventListener("DOMContentLoaded", () => {
    countdown = document.getElementById("countdown");
    countdownContainer = document.getElementById("countdown-container");
    treeDisplayContainer = document.getElementById("tree-display-container");
    dynamicHeartTree = document.getElementById("dynamic-heart-tree");
    wishPage = document.getElementById("wish-page");
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");
    scoreBoard = document.getElementById("score-board");
    scoreDisplay = document.getElementById("score");
    readyBox = document.getElementById("ready-box");
    readyBtn = document.getElementById("ready-btn");
    messageModal = document.getElementById("message-modal");
    modalText = document.getElementById("modal-text");
    closeModal = document.querySelector(".close-modal");
    girlTrigger = document.getElementById("girl-trigger");

    loveQuestionPage = document.getElementById("love-question-page");
    questionCard = document.getElementById("question-card");
    punchlineCard = document.getElementById("punchline-card");
    yesLoveBtn = document.getElementById("yes-love-btn");
    noLoveBtn = document.getElementById("no-love-btn");
    lipsProceedBtn = document.getElementById("lips-proceed-btn");

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Catch controls mapping
    canvas.addEventListener("mousemove", (e) => moveBucket(e.clientX));
    canvas.addEventListener("touchmove", (e) => {
        if(e.touches.length > 0) moveBucket(e.touches[0].clientX);
    });

    // Modal close binds
    closeModal.addEventListener("click", () => messageModal.classList.add("hidden"));
    window.addEventListener("click", (e) => {
        if (e.target === messageModal) messageModal.classList.add("hidden");
    });

    // Setup Prank Actions
    noLoveBtn.addEventListener("click", () => {
        yesButtonScale += 0.5;
        noButtonScale -= 0.15;
        yesLoveBtn.style.transform = `scale(${yesButtonScale})`;
        noLoveBtn.style.transform = `scale(${noButtonScale})`;
        if(noButtonScale <= 0.15) {
            noLoveBtn.style.opacity = "0";
            noLoveBtn.style.pointerEvents = "none";
        }
    });

    yesLoveBtn.addEventListener("click", () => {
        questionCard.classList.add("hidden");
        punchlineCard.classList.remove("hidden");
    });

    lipsProceedBtn.addEventListener("click", () => {
        loveQuestionPage.style.display = "none";
        wishPage.classList.remove("hidden");
    });

    girlTrigger.addEventListener("click", function() {
        if (this.classList.contains("unlocked")) {
            readyBox.classList.remove("hidden");
        } else {
            alert("You haven't read all 10 secret shining notes yet! Find and tap all 10 bright yellow pulsing hearts on the tree. 💛");
        }
    });

    readyBtn.addEventListener("click", () => {
        treeDisplayContainer.style.display = "none";
        readyBox.classList.add("hidden");
        loveQuestionPage.classList.remove("hidden"); 
    });

    // KICKSTART THE TIMER NOW!
    countdown.innerHTML = timeLeft;
    const timer = setInterval(() => {
        timeLeft--;
        countdown.innerHTML = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            countdownContainer.style.display = "none"; 
            triggerFireworkBlast(); 
        }
    }, 1000);
});

function resizeCanvas() {
    if(!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bucket.y = canvas.height - 60;
    if (!gameActive && score === 0) bucket.x = canvas.width / 2 - bucket.width / 2;
}

function moveBucket(clientX) {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    const rootX = clientX - rect.left;
    bucket.x = rootX - bucket.width / 2;
    if (bucket.x < 0) bucket.x = 0;
    if (bucket.x + bucket.width > canvas.width) bucket.x = canvas.width - bucket.width;
}

function triggerFireworkBlast() {
    fireworkBlastActive = true;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        particles.push({
            x: centerX, y: centerY,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            alpha: 1, color: `hsl(${Math.random() * 60 + 320}, 100%, 65%)`
        });
    }
    animateBlast();
}

function animateBlast() {
    if (particles.length === 0) {
        fireworkBlastActive = false;
        startHeartGame(); 
        return;
    }
    requestAnimationFrame(animateBlast);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.x += p.vx; p.y += p.vy; p.alpha -= 0.015;
        ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        if (p.alpha <= 0) particles.splice(i, 1);
    }
}

function startHeartGame() {
    canvas.classList.remove("hidden");
    treeDisplayContainer.classList.remove("hidden");
    scoreBoard.style.display = "block";
    gameActive = true;
    spawnerInterval = setInterval(spawnHeart, 300);
    animateGame();
}

function spawnHeart() {
    if (gameActive && fallingHearts.length < 20) {
        fallingHearts.push({
            x: Math.random() * (canvas.width - 30) + 15,
            y: -20,
            speed: Math.random() * 3 + 3,
            size: Math.random() * 6 + 10
        });
    }
}

function drawVectorHeart(x, y, size, color) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, -size / 4);
    ctx.bezierCurveTo(-size / 2, -size / 2, -size, -size / 4, -size, size / 4);
    ctx.bezierCurveTo(-size, size * 0.7, -size / 4, size, 0, size * 1.2);
    ctx.bezierCurveTo(size / 4, size, size, size * 0.7, size, size / 4);
    ctx.bezierCurveTo(size, -size / 4, size / 2, -size / 2, 0, -size / 4);
    ctx.closePath();
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function animateGame() {
    if (!gameActive) return;
    requestAnimationFrame(animateGame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save(); ctx.shadowBlur = 15; ctx.shadowColor = bucket.color; ctx.fillStyle = bucket.color;
    ctx.beginPath(); ctx.roundRect(bucket.x, bucket.y, bucket.width, bucket.height, 10); ctx.fill(); ctx.restore();
    
    for (let i = fallingHearts.length - 1; i >= 0; i--) {
        let h = fallingHearts[i];
        h.y += h.speed;
        drawVectorHeart(h.x, h.y, h.size, "#ff4081");
        
        if (h.y + h.size >= bucket.y && h.y - h.size <= bucket.y + bucket.height &&
            h.x >= bucket.x && h.x <= bucket.x + bucket.width) {
            
            fallingHearts.splice(i, 1);
            attachHeartToTree(score); 
            score++;
            scoreDisplay.innerText = score;
            
            if (score >= 50) {
                endGameSequence(); 
            }
            continue;
        }
        if (h.y > canvas.height + 20) fallingHearts.splice(i, 1);
    }
}

function attachHeartToTree(index) {
    if (index >= branchPlacements.length) return;
    const coord = branchPlacements[index];
    const newHeart = document.createElement("div");
    newHeart.classList.add("tree-heart");
    newHeart.style.top = coord.top + "%";
    newHeart.style.left = coord.left + "%";
    
    if (index < 10) {
        newHeart.classList.add("has-message");
        newHeart.setAttribute("data-id", index + 1);
        newHeart.setAttribute("data-msg", sweetMessages[index]);
        newHeart.style.pointerEvents = "none"; 
    }
    dynamicHeartTree.appendChild(newHeart);
}

function endGameSequence() {
    gameActive = false;
    clearInterval(spawnerInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scoreBoard.style.display = "none";
    canvas.style.display = "none";
    
    document.querySelectorAll(".tree-heart.has-message").forEach(h => {
        h.style.pointerEvents = "auto";
    });
    activateTreeInteraction();
}

function activateTreeInteraction() {
    document.querySelectorAll(".tree-heart.has-message").forEach(heart => {
        heart.addEventListener("click", function() {
            const heartId = this.getAttribute("data-id");
            const noteContent = this.getAttribute("data-msg");
            
            readSecretHearts.add(heartId);
            this.classList.add("read"); 
            modalText.innerText = noteContent;
            messageModal.classList.remove("hidden");
            
            if (readSecretHearts.size >= 10) {
                girlTrigger.classList.remove("locked");
                girlTrigger.classList.add("unlocked");
                girlTrigger.title = "Click me to see your surprise! ✨";
            }
        });
    });
}

function revealPart(element) {
    if (element.classList.contains("unlocked-quad")) return;
    element.classList.remove("locked");
    element.classList.add("unlocked-quad");
    const headingBlock = element.querySelector(".quad-heading");
    const contentBlock = element.querySelector(".quad-content");
    headingBlock.style.display = "none";
    contentBlock.classList.remove("hidden");
}