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

    clicker.addEventListener('click', function() {
        balance += clickValue;
        updateBalance();
        updateLeague();
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
    }

    setInterval(passiveIncomeTick, 1000);
});
