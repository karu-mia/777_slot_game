<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Slot Game (JS)</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="container">
    <h1>Slot Game (JS)</h1>

    <section class="panel">
      <div class="row">
        <label for="bet">Bet</label>
        <input id="bet" type="number" min="1" value="100" />
        <button id="play">Play</button>
        <button id="auto">Auto OFF</button>
        <button id="reset">Reset</button>
      </div>

      <div class="status">
        <div>Money: <span id="money">5,000</span> G</div>
        <div>Goal: 10,000,000 G</div>
      </div>

      <div class="reels" id="reels">
        <div class="reel" id="reelL">-</div>
        <div class="reel" id="reelC">-</div>
        <div class="reel" id="reelR">-</div>
      </div>

      <pre id="log" class="log"></pre>
    </section>

    <footer>
      <small>Rules: 7-7-7 → x10000 / ゾロ目(777以外) → x50 / どれか2つ一致 → x5</small>
    </footer>
  </main>

  <script src="main.js"></script>
</body>
</html>
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
* { box-sizing: border-box; }
body {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto,
               "Hiragino Kaku Gothic ProN", Meiryo, Arial, sans-serif;
  margin: 0; background: #0b0e13; color: #e7f0ff;
}
.container { max-width: 820px; margin: 24px auto; padding: 16px; }
h1 { margin: 0 0 16px; font-size: 28px; }

.panel { background: #131a22; border: 1px solid #223044; border-radius: 12px; padding: 16px; }
.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
label { opacity: .9; }
input[type="number"] {
  width: 120px; padding: 6px 8px; border-radius: 8px;
  border: 1px solid #334152; background: #0d141c; color: #e7f0ff;
}
button {
  padding: 8px 14px; border: 1px solid #334152;
  background: #1a2432; color: #e7f0ff; border-radius: 10px; cursor: pointer;
}
button:hover { background: #1f2b3b; }

.status { display: flex; gap: 16px; margin: 8px 0 12px; opacity: .95; }

.reels {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; margin: 10px 0 12px;
}
.reel {
  background: #0e151e; border: 1px solid #2e3a4d; border-radius: 12px;
  padding: 18px; text-align: center; font-size: 36px; font-weight: 700;
  min-height: 72px; display: grid; place-items: center;
}

.log {
  background: #0a0f16; border: 1px solid #223044; border-radius: 10px;
  padding: 12px; min-height: 220px; max-height: 360px;
  overflow: auto; white-space: pre-wrap;
}
footer { margin-top: 12px; opacity: .7; }
