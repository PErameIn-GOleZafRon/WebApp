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
        console.log('Loading game data...');
        const savedGame = JSON.parse(localStorage.getItem('ndctbcoinFarmSave'));
        if (savedGame) {
            balance = savedGame.balance || 0;
            clickValue = savedGame.clickValue || 1;
            passiveIncome = savedGame.passiveIncome || 0;
            const clickUpgradeCost = savedGame.clickUpgradeCost || 50;
            const passiveUpgradeCost = savedGame.passiveUpgradeCost || 500;
            upgradeClickButton.setAttribute('data-cost', clickUpgradeCost);
            upgradePassiveButton.setAttribute('data-cost', passiveUpgradeCost);
            upgradeClickButton.textContent = `Улучшить клик (${clickUpgradeCost})`;
            upgradePassiveButton.textContent = `Пассивный доход (${passiveUpgradeCost})`;
            console.log('Game loaded:', savedGame);
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
        console.log('Saving game data:', saveData);
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
            const newCost = cost * 2;
            upgradeClickButton.setAttribute('data-cost', newCost);
            upgradeClickButton.textContent = `Улучшить клик (${newCost})`;
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
            const newCost = cost * 2;
            upgradePassiveButton.setAttribute('data-cost', newCost);
            upgradePassiveButton.textContent = `Пассивный доход (${newCost})`;
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
