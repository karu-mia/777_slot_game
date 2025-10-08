// ===== Core =====
function rand19() { return Math.floor(Math.random() * 9) + 1; }
function payoutMultiplier(l, c, r) {
  if (l === 7 && c === 7 && r === 7) return 10000;
  if (l === c && c === r)            return 50;
  if (l === c || l === r || c === r) return 5;
  return 0;
}

// ===== State =====
const state = { money: 5000, goal: 10_000_000, auto: false, timer: null };
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

// ===== Actions =====
function spinOnce() {
  if (state.money <= 0) { appendLog("\n--- GAME OVER ---"); stopAuto(); return; }

  const bet = Math.max(1, Number(el.bet.value | 0));
  if (state.money < bet) {
    appendLog("\n-- You don't have that much money on YOU --");
    appendLog(`You have ${state.money.toLocaleString()} G`);
    stopAuto();
    return;
  }

  setMoney(state.money - bet);

  const L = rand19(), C = rand19(), R = rand19();
  el.reelL.textContent = L; el.reelC.textContent = C; el.reelR.textContent = R;
  appendLog(`result: ${L} - ${C} - ${R}`);

  const mult = payoutMultiplier(L, C, R);
  if (mult > 0) {
    appendLog("You Lucky!!");
    appendLog(`${(bet * mult).toLocaleString()} win!!`);
    setMoney(state.money + bet * mult);
  } else {
    appendLog("You lose");
  }
  appendLog(`You have ${state.money.toLocaleString()} G`);

  if (state.money > state.goal) {
    appendLog("\n| --- finish --- |");
    appendLog(`You have ${state.money.toLocaleString()} G`);
    stopAuto();
  } else if (state.money > 0 && mult === 0) {
    appendLog("\n--- one more to play ---");
  } else if (state.money <= 0) {
    appendLog("\n--- GAME OVER ---");
    stopAuto();
  }
}

function stopAuto() {
  state.auto = false;
  el.auto.textContent = "Auto OFF";
  if (state.timer) { clearInterval(state.timer); state.timer = null; }
}

// ===== Events =====
el.play.addEventListener('click', spinOnce);

el.auto.addEventListener('click', () => {
  state.auto = !state.auto;
  if (state.auto) {
    el.auto.textContent = "Auto ON";
    state.timer = setInterval(spinOnce, 500);
  } else {
    stopAuto();
  }
});

el.reset.addEventListener('click', () => {
  stopAuto();
  setMoney(5000);
  el.reelL.textContent = el.reelC.textContent = el.reelR.textContent = "-";
  el.log.textContent = "";
  startMessage();
});

// init
setMoney(5000);
startMessage();
