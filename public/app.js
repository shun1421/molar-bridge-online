import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// TODO: 自分のFirebase Configを貼り付けてください
const firebaseConfig = {
    apiKey: "AIzaSyAIhzpYSCsTJv4xQ3-l747Kpb9GzqJyxOo",
    authDomain: "molar-bridge-online.firebaseapp.com",
    projectId: "molar-bridge-online",
    storageBucket: "molar-bridge-online.firebasestorage.app",
    messagingSenderId: "683715595290",
    appId: "1:683715595290:web:24b4a2f5cd1597e14195a3",
    measurementId: "G-9YTLQRG2XS"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- グローバル変数 ---
let currentRoomId = null;
let myPlayerId = null;
let isMyTurn = false;

// --- 画面遷移用 ---
window.showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
};

// --- 個人学習モードロジック (簡易版) ---
const indQuizzes = [
    { q: "22.4 Lの水素($H_2$)は、何 molか？", ans: "÷ 22.4 L/mol", type: "V→n" },
    { q: "2.0 molの酸素($O_2$)は、何 gか？", ans: "× 32 g/mol", type: "n→m" }
];

// --- 対戦モードロジック ---
window.createRoom = async () => {
    const playerName = document.getElementById('player-name').value || "Player1";
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    currentRoomId = roomCode;
    myPlayerId = "p1";

    const roomRef = ref(db, 'rooms/' + roomCode);
    await set(roomRef, {
        status: "waiting",
        turn: "p1",
        slots: { s1: null, s2: null, s3: null },
        players: { p1: { name: playerName, score: 0 } },
        currentQuestion: {
            eq: "2H₂ + O₂ → 2H₂O",
            target: "H₂ 4.0g から生成する H₂O の質量"
        }
    });

    listenToRoom(roomCode);
    showScreen('battle-mode');
    document.getElementById('display-room-code').innerText = "Code: " + roomCode;
};

window.joinRoom = () => {
    const code = document.getElementById('room-code-input').value.toUpperCase();
    const playerName = document.getElementById('player-name').value || "Player2";
    currentRoomId = code;
    myPlayerId = "p2";

    update(ref(db, `rooms/${code}/players/p2`), { name: playerName, score: 0 });
    listenToRoom(code);
    showScreen('battle-mode');
};

function listenToRoom(code) {
    const roomRef = ref(db, 'rooms/' + code);
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // ターン確認
        isMyTurn = (data.turn === myPlayerId);
        document.getElementById('turn-indicator').innerText = isMyTurn ? "あなたのターン！" : "相手のターン...";
        
        // スロット描画
        updateSlots(data.slots);
    });
}

function updateSlots(slots) {
    for (let i = 1; i <= 3; i++) {
        const slotEl = document.querySelector(`#slot-${i} .slot-content`);
        slotEl.innerText = slots[`s${i}`] || "";
    }
}

// 初期化時にホーム画面表示
showScreen('home-screen');