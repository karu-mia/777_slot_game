// ===== Core =====
function rand19() { return Math.floor(Math.random() * 9) + 1; }
function payoutMultiplier(l, c, r) {
  if (l === 7 && c === 7 && r === 7) return 10000;
  if (l === c && c === r)            return 50;
  if (l === c || l === r || c === r) return 5;
  return 0;
}

// ===== State =====
const state = {
  money: 5000,
  goal: 10_000_000,
  spinning: false,   // アニメ中フラグ
  auto: false
};

const el = {
  bet:   document.getElementById('bet'),
  play:  document.getElementById('play'),
  auto:  document.getElementById('auto'),
  reset: document.getElementById('reset'),
  money: document.getElementById('money'),
  log:   document.getElementById('log'),
  reelL: document.getElementById('reelL'),
  reelC: document.getElementById('reelC'),
  reelR: document.getElementById('reelR'),
};

function appendLog(msg = "") {
  el.log.textContent += msg + "\n";
  el.log.scrollTop = el.log.scrollHeight;
}
function setMoney(v) { state.money = v; el.money.textContent = v.toLocaleString(); }
function startMessage() {
  appendLog("You Start With 5000 G");
  appendLog("3つ同じ数字で 50倍！");
  appendLog("7 が3つで 10000倍！！");
  appendLog("--- SLOT START !! ---");
  appendLog("Left : Center : Right\n");
}

// ===== Reels animation =====
// 指定時間だけ高速で数字を回して、最後に final を表示する
function spinReel(elReel, durationMs, final) {
  return new Promise((resolve) => {
    elReel.classList.add('spinning');
    let t = 0;
    const step = 70; // 数字切り替え間隔
    const id = setInterval(() => {
      elReel.textContent = rand19();
      t += step;
      if (t >= durationMs) {
        clearInterval(id);
        elReel.textContent = final;
        elReel.classList.remove('spinning');
        resolve();
      }
    }, step);
  });
}

// 3つのリールを「順番に」止める（左→中→右）
async function spinThreeAnimated(finalL, finalC, finalR) {
  // ばらつきを出すため少し長さに差をつける
  await spinReel(el.reelL, 500, finalL);
  await spinReel(el.reelC, 650, finalC);
  await spinReel(el.reelR, 800, finalR);
}

// 当たり時の軽い発光演出
function flashWin() {
  [el.reelL, el.reelC, el.reelR].forEach(n => {
    n.classList.remove('win'); // 連続当たり時の再適用のためリセット
    // リフローを強制してから再付与
    void n.offsetWidth;
    n.classList.add('win');
    setTimeout(() => n.classList.remove('win'), 600);
  });
}

// ===== Actions =====
async function spinOnce() {
  if (state.spinning) return; // 多重押下防止
  if (state.money <= 0) { appendLog("\n--- GAME OVER ---"); state.auto = false; el.auto.textContent = "Auto OFF"; return; }

  const bet = Math.max(1, Number(el.bet.value | 0));
  if (state.money < bet) {
    appendLog("\n-- You don't have that much money on YOU --");
    appendLog(`You have ${state.money.toLocaleString()} G`);
    state.auto = false; el.auto.textContent = "Auto OFF";
    return;
  }

  // 掛け金差し引き & ボタン無効化
  setMoney(state.money - bet);
  setButtonsEnabled(false);

  state.spinning = true;

  // 最終出目を先に決めてからアニメ実行
  const L = rand19(), C = rand19(), R = rand19();

  // アニメーション（順に停止）
  await spinThreeAnimated(L, C, R);
  appendLog(`result: ${L} - ${C} - ${R}`);

  // 判定
  const mult = payoutMultiplier(L, C, R);
  if (mult > 0) {
    appendLog("You Lucky!!");
    appendLog(`${(bet * mult).toLocaleString()} win!!`);
    setMoney(state.money + bet * mult);
    flashWin();
  } else {
    appendLog("You lose");
  }
  appendLog(`You have ${state.money.toLocaleString()} G`);

  // ゴール・続行
  if (state.money > state.goal) {
    appendLog("\n| --- finish --- |");
    appendLog(`You have ${state.money.toLocaleString()} G`);
    state.auto = false; el.auto.textContent = "Auto OFF";
  } else if (state.money > 0 && mult === 0) {
    appendLog("\n--- one more to play ---");
  } else if (state.money <= 0) {
    appendLog("\n--- GAME OVER ---");
    state.auto = false; el.auto.textContent = "Auto OFF";
  }

  state.spinning = false;
  setButtonsEnabled(true);

  // Autoモードなら、1回のアニメが終わってから次を開始
  if (state.auto) {
    // 体感を良くするため少し間を置く
    setTimeout(spinOnce, 200);
  }
}

function setButtonsEnabled(enabled) {
  el.play.disabled  = !enabled;
  el.reset.disabled = !enabled;
  el.bet.disabled   = !enabled;
}

// ===== Events =====
el.play.addEventListener('click', spinOnce);

el.auto.addEventListener('click', () => {
  state.auto = !state.auto;
  el.auto.textContent = state.auto ? "Auto ON" : "Auto OFF";
  if (state.auto && !state.spinning) spinOnce();
});

el.reset.addEventListener('click', () => {
  state.auto = false; el.auto.textContent = "Auto OFF";
  setButtonsEnabled(true);
  setMoney(5000);
  el.reelL.textContent = el.reelC.textContent = el.reelR.textContent = "-";
  el.log.textContent = "";
  startMessage();
});

// init
setMoney(5000);
startMessage();
