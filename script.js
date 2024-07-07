document.addEventListener('DOMContentLoaded', function() {
    let balance = 0;
    let clickValue = 1;
    let passiveIncome = 0;

    const balanceElement = document.getElementById('balance');
    const clicker = document.getElementById('clicker');
    const upgradeClickButton = document.getElementById('upgrade-click');
    const upgradePassiveButton = document.getElementById('upgrade-passive');
    const leagueBar = document.getElementById('league-bar');
    const leagueElement = document.getElementById('league');

    let leagueThresholds = [];
    for (let i = 1; i <= 50; i++) {
        leagueThresholds.push(Math.pow(10, i + 2));
    }
    let currentLeague = 0;

    function loadGame() {
        const savedGame = JSON.parse(localStorage.getItem('ndctbcoinFarmSave'));
        if (savedGame) {
            balance = savedGame.balance || 0;
            clickValue = savedGame.clickValue || 1;
            passiveIncome = savedGame.passiveIncome || 0;
            upgradeClickButton.setAttribute('data-cost', savedGame.clickUpgradeCost || 50);
            upgradePassiveButton.setAttribute('data-cost', savedGame.passiveUpgradeCost || 500);
            updateBalance();
            updateLeague();
        }
    }

    function saveGame() {
        const saveData = {
            balance: balance,
            clickValue: clickValue,
            passiveIncome: passiveIncome,
            clickUpgradeCost: parseInt(upgradeClickButton.getAttribute('data-cost')),
            passiveUpgradeCost: parseInt(upgradePassiveButton.getAttribute('data-cost'))
        };
        localStorage.setItem('ndctbcoinFarmSave', JSON.stringify(saveData));
    }

    clicker.addEventListener('click', function() {
        balance += clickValue;
        updateBalance();
        updateLeague();
        saveGame();
    });

    upgradeClickButton.addEventListener('click', function() {
        let cost = parseInt(upgradeClickButton.getAttribute('data-cost'));
        if (balance >= cost) {
            balance -= cost;
            clickValue += 1;
            upgradeClickButton.setAttribute('data-cost', cost * 2);
            upgradeClickButton.textContent = `Улучшить клик (${cost * 2})`;
            updateBalance();
            updateLeague();
            saveGame();
        }
    });

    upgradePassiveButton.addEventListener('click', function() {
        let cost = parseInt(upgradePassiveButton.getAttribute('data-cost'));
        if (balance >= cost) {
            balance -= cost;
            passiveIncome += 1;
            upgradePassiveButton.setAttribute('data-cost', cost * 2);
            upgradePassiveButton.textContent = `Пассивный доход (${cost * 2})`;
            updateBalance();
            updateLeague();
            saveGame();
        }
    });

    function updateBalance() {
        balanceElement.textContent = balance;
    }

    function updateLeague() {
        for (let i = leagueThresholds.length - 1; i >= 0; i--) {
            if (balance >= leagueThresholds[i]) {
                currentLeague = i + 1;
                break;
            }
        }

        let leagueProgress = (balance - (currentLeague > 1 ? leagueThresholds[currentLeague - 2] : 0)) /
                             (leagueThresholds[currentLeague - 1] - (currentLeague > 1 ? leagueThresholds[currentLeague - 2] : 0)) * 100;
        leagueBar.style.width = `${Math.min(leagueProgress, 100)}%`;
        leagueElement.textContent = `${currentLeague} лига`;
    }

    function passiveIncomeTick() {
        balance += passiveIncome;
        updateBalance();
        updateLeague();
        saveGame();
    }

    loadGame();
    setInterval(passiveIncomeTick, 1000);
});
