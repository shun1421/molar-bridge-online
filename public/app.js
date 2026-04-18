const massInput = document.getElementById('mass');
const substanceSelect = document.getElementById('substance');
const resultDisplay = document.getElementById('result-value');

function calculateMol() {
    const mass = parseFloat(massInput.value);
    const molarMass = parseFloat(substanceSelect.value);

    if (mass > 0) {
        const mol = mass / molarMass;
        // 小数第3位で四捨五入して表示
        resultDisplay.textContent = mol.toFixed(2);
    } else {
        resultDisplay.textContent = "0.00";
    }
}

// 入力が変わるたびに計算を実行する
massInput.addEventListener('input', calculateMol);
substanceSelect.addEventListener('change', calculateMol);