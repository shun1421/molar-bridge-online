// --- 1. 化学データ（問題のネタ） ---
const substances = [
    { name: "水 (H₂O)", molarMass: 18.02 },
    { name: "二酸化炭素 (CO₂)", molarMass: 44.01 },
    { name: "塩化ナトリウム (NaCl)", molarMass: 58.44 },
    { name: "グルコース (C₆H₁₂O₆)", molarMass: 180.16 },
    { name: "酸素 (O₂)", molarMass: 32.00 },
    { name: "メタン (CH₄)", molarMass: 16.04 }
];

// --- 2. ゲームの状態（State） ---
let gameState = {
    score: 0,
    lives: 3,
    currentQuestion: 1,
    correctAnswer: 0,
    isAnswered: false,
    bridgeProgress: 0 // 0〜100 (%)
};

// --- 3. DOM要素の取得 ---
const scoreDisplay = document.getElementById('score-display');
const lifeDisplay = document.getElementById('life-display');
const qNumberDisplay = document.getElementById('question-number');
const qTextDisplay = document.getElementById('question-text');
const optionsContainer = document.getElementById('answer-options');
const nextBtn = document.getElementById('next-btn');
const bridge = document.getElementById('bridge');
const character = document.getElementById('character');

// --- 4. ゲーム関数 ---

// ゲーム初期化
function initGame() {
    gameState = { score: 0, lives: 3, currentQuestion: 1, correctAnswer: 0, isAnswered: false, bridgeProgress: 0 };
    updateUI();
    generateQuestion();
}

// 画面表示を更新
function updateUI() {
    scoreDisplay.textContent = `スコア: ${gameState.score}`;
    qNumberDisplay.textContent = gameState.currentQuestion;
    nextBtn.classList.add('hidden');

    // ライフ（ハート）の表示更新
    lifeDisplay.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const heart = document.createElement('i');
        heart.className = i < gameState.lives ? 'fas fa-heart' : 'far fa-heart';
        lifeDisplay.appendChild(heart);
    }

    // 橋とキャラのアニメーション
    bridge.style.width = `${gameState.bridgeProgress}%`;
    character.style.left = `${10 + gameState.bridgeProgress * 0.8}%`; // 10%から90%の位置まで移動
}

// 問題を生成
function generateQuestion() {
    gameState.isAnswered = false;
    optionsContainer.innerHTML = ''; // 選択肢をクリア

    // 1. 物質をランダムに選択
    const substance = substances[Math.floor(Math.random() * substances.length)];

    // 2. 問題のパターンを決定 (0: g->mol, 1: mol->g)
    const pattern = Math.random() > 0.5 ? 0 : 1;

    let questionText, correctValue, unit, options;

    if (pattern === 0) {
        // パターン0: 質量(g)から物質量(mol)を求める
        const mass = (Math.random() * 50 + 5).toFixed(1); // 5〜55gの間
        correctValue = parseFloat(mass) / substance.molarMass;
        questionText = `${substance.name} <span class="highlight">${mass} g</span> は何 mol か？`;
        unit = "mol";
        options = generateOptions(correctValue, unit);
    } else {
        // パターン1: 物質量(mol)から質量(g)を求める
        const mol = (Math.random() * 2 + 0.1).toFixed(2); // 0.1〜2.1molの間
        correctValue = parseFloat(mol) * substance.molarMass;
        questionText = `${substance.name} <span class="highlight">${mol} mol</span> の質量は何 g か？`;
        unit = "g";
        options = generateOptions(correctValue, unit);
    }

    qTextDisplay.innerHTML = questionText;
    gameState.correctAnswer = correctValue; // 四捨五入前の値を保持

    // 選択肢ボタンを生成
    options.forEach(opt => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = `${opt.toFixed(2)} ${unit}`;
        button.addEventListener('click', () => checkAnswer(button, opt));
        optionsContainer.appendChild(button);
    });
}

// 誤答を含む選択肢を生成
function generateOptions(correctValue, unit) {
    const options = [correctValue];
    // 誤答を3つ作る（±20%, 分子量を掛け算/割り算を逆にする、桁をずらすなど）
    while (options.length < 4) {
        let wrong;
        const type = Math.random();
        if (type < 0.4) wrong = correctValue * (1 + (Math.random() - 0.5) * 0.4); // ±20%
        else if (type < 0.7) wrong = correctValue * 10; // 桁違い
        else wrong = correctValue / 10;

        if (wrong > 0 && !options.includes(wrong)) {
            options.push(wrong);
        }
    }
    // 配列をシャッフル
    return options.sort(() => Math.random() - 0.5);
}

// 解答判定
function checkAnswer(selectedButton, selectedValue) {
    if (gameState.isAnswered) return; // 回答済みなら何もしない
    gameState.isAnswered = true;

    // 誤差を許容して判定 (±1%以内)
    const isCorrect = Math.abs(selectedValue - gameState.correctAnswer) / gameState.correctAnswer < 0.01;

    // すべてのボタンを選択不可に
    const buttons = optionsContainer.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.style.cursor = 'default');

    if (isCorrect) {
        // 正解
        selectedButton.classList.add('correct');
        gameState.score += 10;
        gameState.bridgeProgress += 20; // 橋を20%伸ばす（5問で完走）
        if (gameState.bridgeProgress > 100) gameState.bridgeProgress = 100;
    } else {
        // 不正解
        selectedButton.classList.add('incorrect');
        gameState.lives--;
        // 正解のボタンをハイライト
        buttons.forEach(btn => {
            const val = parseFloat(btn.textContent);
            if (Math.abs(val - gameState.correctAnswer) / gameState.correctAnswer < 0.01) {
                btn.classList.add('correct');
            }
        });
    }

    updateUI();
    nextBtn.classList.remove('hidden'); // 次へボタンを表示

    // ゲームオーバー判定
    if (gameState.lives <= 0) {
        setTimeout(() => {
            alert(`ゲームオーバー！\nスコア: ${gameState.score}`);
            initGame();
        }, 500);
    } else if (gameState.bridgeProgress >= 100) {
        setTimeout(() => {
            alert(`おめでとう！橋が架かりました！\n向こう岸へ渡れました！\nスコア: ${gameState.score}`);
            initGame();
        }, 500);
    }
}

// 次の問題へ
nextBtn.addEventListener('click', () => {
    gameState.currentQuestion++;
    generateQuestion();
    nextBtn.classList.add('hidden');
});

// --- 5. ゲーム開始 ---
initGame();