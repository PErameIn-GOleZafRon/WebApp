document.addEventListener('DOMContentLoaded', function() {
    let balance = 0;
    let clickValue = 1;
    let passiveIncome = 0;
    let critChance = 0;
    let totalClicks = 0;
    let totalEarned = 0;
    let currentBooster = 1.0;

    // Переменные биржи
    let stockPrice = 100;
    let stocksOwned = 0;
    let stockHistory = new Array(12).fill(100); // 12 точек (1 минута)

    const balanceElement = document.getElementById('balance');
    const clicker = document.getElementById('clicker');
    const leagueBar = document.getElementById('league-bar');
    const leagueElement = document.getElementById('league');
    
    // Элементы биржи
    const stockPriceElem = document.getElementById('stock-price');
    const stockTrendElem = document.getElementById('stock-trend');
    const myStocksElem = document.getElementById('my-stocks');
    const buyAmountInput = document.getElementById('buy-amount');
    const buyBtn = document.getElementById('buy-stock');
    const sellBtn = document.getElementById('sell-stock');
    
    const clickSound = document.getElementById('clickSound');
    const menuSound = document.getElementById('menuSound');

    function formatNum(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }

    let leagueThresholds = [];
    for (let i = 1; i <= 50; i++) { leagueThresholds.push(Math.pow(10, i + 2)); }

    function loadGame() {
        const saved = JSON.parse(localStorage.getItem('ndctbcoinFarmSave'));
        if (saved) {
            balance = saved.balance || 0;
            clickValue = saved.clickValue || 1;
            passiveIncome = saved.passiveIncome || 0;
            critChance = saved.critChance || 0;
            totalClicks = saved.totalClicks || 0;
            totalEarned = saved.totalEarned || balance;
            stocksOwned = saved.stocksOwned || 0;
            stockPrice = saved.stockPrice || 100;
            stockHistory = saved.stockHistory || new Array(12).fill(100);

            setupBtn('upgrade-click', saved.clickUpgradeCost || 50, 'Улучшить клик');
            setupBtn('upgrade-passive', saved.passiveUpgradeCost || 500, 'Пассивный доход');
            setupBtn('upgrade-crit', saved.critUpgradeCost || 1000, 'Критический удар');

            updateUI();
            drawChart();
            
            if (saved.lastUpdate) {
                const timeDiff = Math.floor((Date.now() - saved.lastUpdate) / 1000);
                const earned = (passiveIncome * currentBooster) * timeDiff;
                balance += earned;
                totalEarned += earned;
            }
            updateUI();
        } else {
            drawChart(); // Отрисовка дефолтного графика
        }
    }

    function setupBtn(id, cost, text) {
        const btn = document.getElementById(id);
        if(btn) {
            btn.setAttribute('data-cost', cost);
            btn.textContent = `${text} (${formatNum(cost)})`;
        }
    }

    function saveGame() {
        const data = {
            balance, clickValue, passiveIncome, critChance, totalClicks, totalEarned, 
            stocksOwned, stockPrice, stockHistory,
            clickUpgradeCost: parseInt(document.getElementById('upgrade-click').getAttribute('data-cost')),
            passiveUpgradeCost: parseInt(document.getElementById('upgrade-passive').getAttribute('data-cost')),
            critUpgradeCost: parseInt(document.getElementById('upgrade-crit').getAttribute('data-cost')),
            lastUpdate: Date.now()
        };
        localStorage.setItem('ndctbcoinFarmSave', JSON.stringify(data));
    }

    function drawChart() {
        const canvas = document.getElementById('stock-chart');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        // Линии сетки
        ctx.strokeStyle = '#e0ffe0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
        ctx.stroke();

        // Линия графика
        ctx.strokeStyle = '#008000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const minP = 50;
        const maxP = 200;
        const range = maxP - minP;
        const stepX = w / (stockHistory.length - 1);
        
        stockHistory.forEach((price, i) => {
            const x = i * stepX;
            // Инвертируем Y, так как координаты canvas идут сверху вниз
            const y = h - ((price - minP) / range) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    function updateUI() {
        let leagueIdx = 0;
        for (let i = leagueThresholds.length - 1; i >= 0; i--) {
            if (balance >= leagueThresholds[i]) { leagueIdx = i + 1; break; }
        }
        currentBooster = 1 + (leagueIdx * 0.3);

        balanceElement.textContent = formatNum(balance);
        leagueElement.textContent = `${leagueIdx + 1} лига (x${currentBooster.toFixed(1)})`;
        
        let nextT = leagueThresholds[leagueIdx] || leagueThresholds[0];
        leagueBar.style.width = `${Math.min((balance / nextT) * 100, 100)}%`;

        // Обновление интерфейса биржи
        if(myStocksElem) myStocksElem.textContent = stocksOwned;
        if(stockPriceElem) stockPriceElem.textContent = `Цена: ${Math.floor(stockPrice)}`;
        
        // Динамическая кнопка покупки
        if(buyAmountInput && buyBtn) {
            let amt = parseInt(buyAmountInput.value) || 0;
            if (amt < 1) amt = 1;
            let totalCost = amt * stockPrice;
            buyBtn.textContent = `Купить за ${formatNum(totalCost)}`;
        }

        if (document.getElementById('stats-container').classList.contains('active')) {
            document.getElementById('stat-total-clicks').textContent = totalClicks;
            document.getElementById('stat-total-earned').textContent = formatNum(totalEarned);
            document.getElementById('stat-click-power').textContent = formatNum(clickValue * currentBooster);
            document.getElementById('stat-passive-rate').textContent = `${formatNum(passiveIncome * currentBooster)}/сек`;
            document.getElementById('stat-crit-chance').textContent = `${critChance}%`;
        }
    }

    // Слушатель для инпута количества акций
    if(buyAmountInput) {
        buyAmountInput.addEventListener('input', updateUI);
    }

    function handleTap(e) {
        let isCrit = Math.random() < critChance / 100;
        let val = (clickValue * currentBooster) * (isCrit ? 10 : 1);
        balance += val; totalEarned += val; totalClicks++;
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        const anim = document.createElement('div');
        anim.textContent = `+${formatNum(val)}`;
        anim.className = `click-value ${isCrit ? 'crit-click' : ''}`;
        anim.style.left = `${x}px`; anim.style.top = `${y}px`;
        document.body.appendChild(anim);
        setTimeout(() => anim.remove(), 1000);
        updateUI(); saveGame();
    }

    clicker.addEventListener('click', (e) => { handleTap(e); if(clickSound) clickSound.play(); });
    clicker.addEventListener('touchstart', (e) => { e.preventDefault(); handleTap(e); if(clickSound) clickSound.play(); });

    function bindUpgrade(id, action, mult) {
        const btn = document.getElementById(id);
        if(btn) {
            btn.addEventListener('click', function() {
                let cost = parseInt(this.getAttribute('data-cost'));
                if (balance >= cost) {
                    balance -= cost; action();
                    let newCost = Math.floor(cost * mult);
                    this.setAttribute('data-cost', newCost);
                    this.textContent = `${this.textContent.split('(')[0]} (${formatNum(newCost)})`;
                    if(menuSound) menuSound.play(); 
                    updateUI(); saveGame();
                }
            });
        }
    }
    bindUpgrade('upgrade-click', () => clickValue++, 1.5);
    bindUpgrade('upgrade-passive', () => passiveIncome += 5, 1.5);
    bindUpgrade('upgrade-crit', () => { if(critChance < 30) critChance++; }, 2);

    // Логика кнопок биржи
    if(buyBtn) buyBtn.addEventListener('click', () => {
        let amt = parseInt(buyAmountInput.value) || 0;
        if (amt < 1) return;
        let totalCost = amt * stockPrice;
        if (balance >= totalCost) {
            balance -= totalCost; 
            stocksOwned += amt;
            if(menuSound) menuSound.play(); 
            updateUI(); 
            saveGame();
        }
    });
    
    if(sellBtn) sellBtn.addEventListener('click', () => {
        if (stocksOwned > 0) {
            balance += stocksOwned * stockPrice; 
            totalEarned += stocksOwned * stockPrice;
            stocksOwned = 0; 
            if(menuSound) menuSound.play(); 
            updateUI(); 
            saveGame();
        }
    });

    function updateStockMarket() {
        let changePercent = (Math.random() * 40 - 18); // от -18% до +22%
        let oldPrice = stockPrice;
        
        // Новая цена с лимитами от 50 до 200
        stockPrice = Math.max(50, Math.min(200, stockPrice * (1 + changePercent / 100)));
        
        // Обновляем историю графика
        stockHistory.push(stockPrice);
        if(stockHistory.length > 12) {
            stockHistory.shift();
        }

        if(stockTrendElem) {
            let diff = ((stockPrice / oldPrice - 1) * 100).toFixed(1);
            stockTrendElem.textContent = (diff > 0 ? '+' : '') + diff + '%';
            stockTrendElem.className = diff > 0 ? 'up' : 'down';
        }
        
        updateUI();
        drawChart();
        saveGame();
    }
    setInterval(updateStockMarket, 5000);

    // Табы
    const tabs = ['clicker', 'upgrade', 'market', 'friends', 'stats'];
    tabs.forEach(t => {
        const tabBtn = document.getElementById(`${t}-tab`);
        if(tabBtn) {
            tabBtn.addEventListener('click', function() {
                tabs.forEach(name => {
                    const container = document.getElementById(`${name}-container`);
                    const btn = document.getElementById(`${name}-tab`);
                    if(container) container.classList.remove('active');
                    if(btn) btn.classList.remove('active');
                });
                document.getElementById(`${t}-container`).classList.add('active');
                this.classList.add('active');
                if(menuSound) menuSound.play();
                updateUI();
                if(t === 'market') drawChart(); // Перерисовываем при открытии вкладки
            });
        }
    });

    setInterval(() => {
        if (passiveIncome > 0) {
            balance += passiveIncome * currentBooster;
            totalEarned += passiveIncome * currentBooster;
            updateUI(); saveGame();
        }
    }, 1000);

    loadGame();
});
