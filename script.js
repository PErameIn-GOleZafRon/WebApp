document.addEventListener('DOMContentLoaded', function() {
    let balance = 0;
    let clickValue = 1;
    let passiveIncome = 0;
    let critChance = 0;
    let lastUpdate = Date.now();

    const balanceElement = document.getElementById('balance');
    const clicker = document.getElementById('clicker');
    const upgradeClickButton = document.getElementById('upgrade-click');
    const upgradePassiveButton = document.getElementById('upgrade-passive');
    const upgradeCritButton = document.getElementById('upgrade-crit');
    const leagueBar = document.getElementById('league-bar');
    const leagueElement = document.getElementById('league');
    const clickSound = document.getElementById('clickSound');
    const menuSound = document.getElementById('menuSound');
    

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
            critChance = savedGame.critChance || 0;
            const clickUpgradeCost = savedGame.clickUpgradeCost || 50;
            const passiveUpgradeCost = savedGame.passiveUpgradeCost || 500;
            const critUpgradeCost = savedGame.critUpgradeCost || 1000;
            upgradeClickButton.setAttribute('data-cost', clickUpgradeCost);
            upgradePassiveButton.setAttribute('data-cost', passiveUpgradeCost);
            upgradeCritButton.setAttribute('data-cost', critUpgradeCost);
            upgradeClickButton.textContent = `Улучшить клик (${clickUpgradeCost})`;
            upgradePassiveButton.textContent = `Пассивный доход (${passiveUpgradeCost})`;
            upgradeCritButton.textContent = `Критический удар (${critUpgradeCost})`;
            console.log('Game loaded:', savedGame);
            updateBalance();
            updateLeague();
            if (savedGame.lastUpdate) {
                const timeDiff = Date.now() - savedGame.lastUpdate;
                balance += passiveIncome * Math.floor(timeDiff / 1000);
            }
        }
    }

    function saveGame() {
        const saveData = {
            balance: balance,
            clickValue: clickValue,
            passiveIncome: passiveIncome,
            critChance: critChance,
            clickUpgradeCost: parseInt(upgradeClickButton.getAttribute('data-cost')),
            passiveUpgradeCost: parseInt(upgradePassiveButton.getAttribute('data-cost')),
            critUpgradeCost: parseInt(upgradeCritButton.getAttribute('data-cost')),
            lastUpdate: Date.now()
        };
        localStorage.setItem('ndctbcoinFarmSave', JSON.stringify(saveData));
    }

    function createClickAnimation(value, x, y, isCrit) {
        const clickValueElement = document.createElement('div');
        clickValueElement.textContent = value;
        clickValueElement.classList.add('click-value');
        if (isCrit) clickValueElement.classList.add('crit-click');

        // Получаем координаты верхнего левого угла #clicker относительно окна браузера
        const clickerRect = clicker.getBoundingClientRect();
        const clickerOffsetX = clickerRect.left + window.pageXOffset;
        const clickerOffsetY = clickerRect.top + window.pageYOffset;

        // Вычисляем относительные координаты клика в пределах #clicker
        const relativeX = x - clickerOffsetX;
        const relativeY = y - clickerOffsetY;

        // Устанавливаем позицию элемента анимации
        clickValueElement.style.position = 'absolute';
        clickValueElement.style.left = `47,5%`;
        clickValueElement.style.top = `30%`;
        clickValueElement.style.transform = 'translate(-50%, -50%)';

        // Добавляем элемент анимации в тело документа
        document.body.appendChild(clickValueElement);

        // Удаляем элемент анимации через 1 секунду
        setTimeout(() => {
            clickValueElement.remove();
        }, 1000);
    }

    clicker.addEventListener('click', function(event) {
        handleMultiClick(event, 1);
        clickSound.currentTime = 0;
        clickSound.play();
    });

    clicker.addEventListener('touchstart', function(event) {
        event.preventDefault();
        for (let i = 0; i < event.touches.length; i++) {
            handleMultiClick(event.touches[i], 1);
            clickSound.currentTime = 0;
            clickSound.play();
        }
    });

    function handleMultiClick(event, numClicks) {
        let isCrit = Math.random() < critChance / 100;
        let value = clickValue * numClicks;
        if (isCrit) value *= 10;
        balance += value;

        // Получаем абсолютные координаты клика относительно окна браузера
        const x = event.clientX;
        const y = event.clientY;

        // Создаем анимацию клика внутри #clicker
        createClickAnimation(value, x, y, isCrit);

        updateBalance();
        updateLeague();
        saveGame();
    }

    upgradeClickButton.addEventListener('click', function() {
        let cost = parseInt(upgradeClickButton.getAttribute('data-cost'));
        if (balance >= cost) {
            balance -= cost;
            clickValue += 1;
            const newCost = Math.floor(cost * 1.5);
            upgradeClickButton.setAttribute('data-cost', newCost);
            upgradeClickButton.textContent = `Улучшить клик (${newCost})`;
            updateBalance();
            updateLeague();
            saveGame();
            menuSound.play();
        }
    });

    upgradePassiveButton.addEventListener('click', function() {
        let cost = parseInt(upgradePassiveButton.getAttribute('data-cost'));
        if (balance >= cost) {
            balance -= cost;
            passiveIncome += 5; // Increased passive income increment
            const newCost = Math.floor(cost * 1.5);
            upgradePassiveButton.setAttribute('data-cost', newCost);
            upgradePassiveButton.textContent = `Пассивный доход (${newCost})`;
            updateBalance();
            updateLeague();
            saveGame();
            menuSound.play();
        }
    });

    upgradeCritButton.addEventListener('click', function() {
        let cost = parseInt(upgradeCritButton.getAttribute('data-cost'));
        if (balance >= cost && critChance < 30) {
            balance -= cost;
            critChance += 1;
            const newCost = Math.floor(cost * 2);
            upgradeCritButton.setAttribute('data-cost', newCost);
            upgradeCritButton.textContent = `Критический удар (${newCost})`;
            updateBalance();
            updateLeague();
            saveGame();
            menuSound.play();
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
        leagueElement.textContent = `${currentLeague + 1} лига`;
        const nextThreshold = leagueThresholds[currentLeague] || leagueThresholds[leagueThresholds.length - 1];
        const progress = Math.min((balance / nextThreshold) * 100, 100);
        leagueBar.style.width = `${progress}%`;
    }

    function addPassiveIncome() {
        balance += passiveIncome;
        updateBalance();
        updateLeague();
        saveGame();
    }

    setInterval(addPassiveIncome, 1000);

    // Tab switching logic
    const clickerTab = document.getElementById('clicker-tab');
    const upgradeTab = document.getElementById('upgrade-tab');
    const friendsTab = document.getElementById('friends-tab');
    const statsTab = document.getElementById('stats-tab');
    const clickerContainer = document.getElementById('clicker-container');
    const upgradeContainer = document.getElementById('upgrade-container');
    const friendsContainer = document.getElementById('friends-container');
    const statsContainer = document.getElementById('stats-container');

    const tabMap = {
        'clicker-tab': clickerContainer,
        'upgrade-tab': upgradeContainer,
        'friends-tab': friendsContainer,
        'stats-tab': statsContainer
    };

    function switchTab(event) {
        const tabId = event.target.id;
        Object.keys(tabMap).forEach(id => {
            tabMap[id].classList.remove('active');
            document.getElementById(id).classList.remove('active');
        });
        tabMap[tabId].classList.add('active');
        document.getElementById(tabId).classList.add('active');
        menuSound.play();
    }

    clickerTab.addEventListener('click', switchTab);
    upgradeTab.addEventListener('click', switchTab);
    friendsTab.addEventListener('click', switchTab);
    statsTab.addEventListener('click', switchTab);

    // Initialize the game state
    loadGame();
    clickerContainer.classList.add('active');
});
