// 1. 問題データの定義
const currentProblem = {
    text: "H₂ 4.0g から生成する H₂O は何 g か？ (2H₂ + O₂ → 2H₂O)",
    solution: [
        { slot: 1, type: "div", val: 2, label: "÷2.0" }, // H2の分子量
        { slot: 2, type: "mul", val: 1, label: "×1" },   // 係数比 2:2 = 1:1
        { slot: 3, type: "mul", val: 18, label: "×18" }  // H2Oの分子量
    ],
    finalAnswer: 36 // (4 / 2) * 1 * 18 = 36
};

let playerHand = [
    { label: "÷2.0", type: "div", val: 2 },
    { label: "×18", type: "mul", val: 18 },
    { label: "×22.4", type: "mul", val: 22.4 },
    { label: "÷44", type: "div", val: 44 },
    { label: "×1", type: "mul", val: 1 }
];

let score = 0;
let filledSlots = [false, false, false];

// 2. 初期化
function init() {
    renderHand();
    document.getElementById('problem-text').textContent = "問題：" + currentProblem.text;
}

// 手札の描画
function renderHand() {
    const container = document.getElementById('player-hand');
    container.innerHTML = '';
    playerHand.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = card.label;
        div.onclick = () => playCard(index);
        container.appendChild(div);
    });
}

// カードを出すアクション
function playCard(cardIndex) {
    const card = playerHand[cardIndex];
    // どのスロットに合うかチェック
    let matched = false;
    currentProblem.solution.forEach((step, i) => {
        if (!filledSlots[i] && step.label === card.label) {
            // 正解のスロットに置いた
            document.getElementById(`slot-${i+1}`).innerHTML = `<div class="card">${card.label}</div>`;
            filledSlots[i] = true;
            score += 10;
            matched = true;
            playerHand.splice(cardIndex, 1); // カードを消費
        }
    });

    if (!matched) {
        alert("そのスロットには合いません！ (-5pt)");
        score -= 5;
    }

    checkFinalChallenge();
    renderHand();
    updateScore();
}

// 全スロットが埋まったか確認
function checkFinalChallenge() {
    if (filledSlots.every(s => s === true)) {
        const finalZone = document.getElementById('final-zone');
        const finalInput = document.getElementById('final-answer');
        const finalBtn = document.getElementById('final-submit');

        finalZone.classList.add('active');
        finalInput.disabled = false;
        finalBtn.disabled = false;
        finalInput.focus();

        finalBtn.onclick = () => {
            if (parseFloat(finalInput.value) === currentProblem.finalAnswer) {
                alert("ファイナル正解！ +30pt");
                score += 30;
            } else {
                alert("計算ミス！ -10pt");
                score -= 10;
            }
            location.reload(); // 次の問題へ（リロードで簡易リセット）
        };
    }
}

function updateScore() {
    document.getElementById('player-score').textContent = `Score: ${score}`;
}

init();