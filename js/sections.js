// Play/replay animations for the pipeline and agent sections, plus the
// website wall lightbox. Loaded with defer from index.html.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STOP = Symbol("stop");
  const rand = (a, b) => a + Math.random() * (b - a);
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Each Play press starts a new run; older runs stop at their next frame or pause.
  function runner(btn, reset, play, finish) {
    let id = 0;
    const state = { running: false };
    btn.addEventListener("click", () => {
      const my = ++id;
      btn.classList.add("replay");
      btn.querySelector("span").textContent = "Replay";
      const alive = () => my === id;
      const check = () => {
        if (!alive()) throw STOP;
      };
      const c = {
        sleep: (ms) => new Promise((r) => setTimeout(r, ms)).then(check),
        tween: (ms, fn, e) =>
          new Promise((res, rej) => {
            const t0 = performance.now();
            const f = (now) => {
              if (!alive()) return rej(STOP);
              const t = Math.min(1, (now - t0) / ms);
              fn(e ? e(t) : t);
              t < 1 ? requestAnimationFrame(f) : res();
            };
            requestAnimationFrame(f);
          }),
      };
      reset();
      if (reduce) {
        finish();
        return;
      }
      state.running = true;
      play(c).then(
        () => {
          if (alive()) state.running = false;
        },
        (e) => {
          if (e !== STOP) console.error(e);
        },
      );
    });
    return state;
  }

  /* ---------- 1. Pipeline ---------- */
  const deploy = document.getElementById("deploy");
  const scenes = [...deploy.querySelectorAll(".scene")];
  const links = [...deploy.querySelectorAll(".link")];
  const lines = [...deploy.querySelectorAll(".ln")];
  const stream = document.getElementById("stream");
  const repo = document.getElementById("repo");
  const pushNote = document.getElementById("push-note");
  const battery = document.getElementById("battery");
  for (let i = 0; i < 24; i++)
    battery.appendChild(
      Object.assign(document.createElement("span"), { className: "cell" }),
    );
  const cells = [...battery.children];
  const ringFg = document.getElementById("ring-fg");
  const ringCk = document.getElementById("ring-ck");
  const testNote = document.getElementById("test-note");
  const pkg = document.getElementById("pkg");
  const dests = [...deploy.querySelectorAll(".dest")];
  const loop = document.getElementById("loop");
  const TOTAL = 128;

  const deployReset = () => {
    [...scenes, ...links].forEach((el) => el.classList.remove("on"));
    lines.forEach((l) => {
      l.querySelector(".t").textContent = "";
      l.classList.remove("shown", "typing");
    });
    lines[0].classList.add("shown", "typing");
    stream.classList.remove("streaming");
    repo.classList.remove("got");
    pushNote.textContent = "Waiting for a push";
    cells.forEach((cl) => cl.classList.remove("on"));
    ringFg.style.strokeDashoffset = 157.08;
    ringCk.style.strokeDashoffset = 30;
    testNote.textContent = "Waiting for code";
    pkg.classList.remove("sealed", "away");
    dests.forEach((d) => d.classList.remove("on", "live"));
    loop.classList.remove("on");
  };
  const deployFinish = () => {
    [...scenes, ...links].forEach((el) => el.classList.add("on"));
    lines.forEach((l) => {
      l.querySelector(".t").textContent = l.dataset.text;
      l.classList.add("shown");
      l.classList.remove("typing");
    });
    repo.classList.add("got");
    pushNote.innerHTML = "Pull request <b>opened</b>";
    cells.forEach((cl) => cl.classList.add("on"));
    ringFg.style.strokeDashoffset = 0;
    ringCk.style.strokeDashoffset = 0;
    testNote.innerHTML = `<b>${TOTAL}</b> tests passed`;
    pkg.classList.add("sealed");
    dests.forEach((d) => d.classList.add("on", "live"));
    loop.classList.add("on");
  };
  const deployPlay = async (c) => {
    scenes[0].classList.add("on");
    await c.sleep(300);
    for (const l of lines) {
      lines.forEach((x) => x.classList.remove("typing"));
      l.classList.add("shown", "typing");
      const t = l.querySelector(".t");
      for (const ch of l.dataset.text) {
        t.textContent += ch;
        await c.sleep(rand(14, 38));
      }
      await c.sleep(160);
    }
    lines.forEach((x) => x.classList.remove("typing"));
    links[0].classList.add("on");
    await c.sleep(350);

    scenes[1].classList.add("on");
    pushNote.innerHTML = "Pushing <b>3 files</b> to main";
    stream.classList.add("streaming");
    await c.sleep(1400);
    stream.classList.remove("streaming");
    repo.classList.add("got");
    pushNote.innerHTML = "Pull request <b>opened</b>";
    await c.sleep(350);
    links[1].classList.add("on");
    await c.sleep(350);

    scenes[2].classList.add("on");
    const order = cells.slice().sort(() => Math.random() - 0.5);
    for (let k = 0; k < order.length; k++) {
      order[k].classList.add("on");
      testNote.innerHTML = `<b>${Math.round(((k + 1) / order.length) * TOTAL)}</b> / ${TOTAL} passing`;
      await c.sleep(rand(25, 70));
    }
    await c.tween(
      550,
      (t) => {
        ringFg.style.strokeDashoffset = 157.08 * (1 - t);
      },
      ease,
    );
    await c.tween(260, (t) => {
      ringCk.style.strokeDashoffset = 30 * (1 - t);
    });
    testNote.innerHTML = `<b>${TOTAL}</b> tests passed`;
    await c.sleep(300);
    links[2].classList.add("on");
    await c.sleep(350);

    scenes[3].classList.add("on");
    pkg.classList.add("sealed");
    await c.sleep(500);
    pkg.classList.remove("away");
    void pkg.offsetWidth;
    pkg.classList.add("away");
    for (const d of dests) {
      d.classList.add("on");
      await c.sleep(330);
      d.classList.add("live");
      await c.sleep(120);
    }
    await c.sleep(250);
    loop.classList.add("on");
  };
  deployReset();
  runner(
    document.getElementById("play-deploy"),
    deployReset,
    deployPlay,
    deployFinish,
  );

  /* ---------- 2. Agent fleet ---------- */
  const fleet = document.getElementById("fleet");
  const slots = [...fleet.querySelectorAll(".slot")];
  const agentEls = [...fleet.querySelectorAll(".agent")];
  const cursor = fleet.querySelector(".cursor");
  const box = document.getElementById("agent-box");
  const blocks = {
    head: document.getElementById("b-head"),
    hero: document.getElementById("b-hero"),
    card1: document.getElementById("card1"),
    card2: document.getElementById("card2"),
    list: document.getElementById("b-list"),
    btn: document.getElementById("b-btn"),
  };
  const built = {
    head: "Built the header",
    hero: "Built the hero",
    card1: "Built a card",
    card2: "Built a card",
    list: "Built the list",
    btn: "Built the button",
  };
  const colors = ["var(--bp-gold)", "var(--bp-indigo)", "var(--bp-teal)"];
  const log = document.getElementById("log");
  const shipped = document.getElementById("shipped");
  const apos = agentEls.map(() => [0, 0]);
  let cpos = [0, 0];
  let t0 = 0;

  const rel = (el) => {
    const s = fleet.getBoundingClientRect(),
      r = el.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  };
  const mid = (el) => {
    const r = rel(el);
    return [r.x + r.w / 2, r.y + r.h / 2];
  };
  const inside = (el) => {
    const r = rel(el);
    return [r.x + r.w * rand(0.18, 0.82), r.y + r.h * rand(0.25, 0.75)];
  };
  const putAgent = (i, p) => {
    apos[i] = p;
    agentEls[i].style.transform = `translate(${p[0] - 7}px, ${p[1] - 7}px)`;
  };
  const putCursor = (p) => {
    cpos = p;
    cursor.style.transform = `translate(${p[0] - 4}px, ${p[1] - 3}px)`;
  };
  const home = (i) => mid(slots[i]);

  // Curved flight: a quadratic path bowed to a random side, so no two trips look alike.
  const fly = (c, get, put, to, ms, bend) => {
    const from = get();
    const dx = to[0] - from[0],
      dy = to[1] - from[1],
      len = Math.hypot(dx, dy) || 1;
    const off = (Math.random() < 0.5 ? -1 : 1) * bend * rand(0.5, 1.2);
    const ctrl = [
      (from[0] + to[0]) / 2 - (dy / len) * off,
      (from[1] + to[1]) / 2 + (dx / len) * off,
    ];
    return c.tween(
      ms,
      (t) => {
        const u = 1 - t;
        put([
          u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0],
          u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1],
        ]);
      },
      ease,
    );
  };
  const flyAgent = (c, i, to, ms, bend) =>
    fly(
      c,
      () => apos[i],
      (p) => putAgent(i, p),
      to,
      ms,
      bend,
    );

  const stamp = () => {
    const s = Math.floor((performance.now() - t0) / 1000);
    return `0:${String(s).padStart(2, "0")}`;
  };
  const addLog = (color, text, who, time) => {
    const hint = log.querySelector(".hint");
    if (hint) hint.remove();
    const li = document.createElement("li");
    li.innerHTML = `<time>${time ?? stamp()}</time><span class="dot" style="--c:${color}"></span><span>${who ? `<span class="who">${who}</span> · ` : ""}${text}</span>`;
    log.appendChild(li);
  };

  const workOn = async (c, i, name, opts = {}) => {
    const b = blocks[name];
    const land = inside(b);
    await flyAgent(c, i, land, rand(650, 1000), 55);
    const r = rel(b);
    b.style.setProperty("--ox", `${((land[0] - r.x) / r.w) * 100}%`);
    b.style.setProperty("--oy", `${((land[1] - r.y) / r.h) * 100}%`);
    b.style.setProperty("--c", colors[i]);
    if (opts.cramped) b.classList.add("cramped");
    b.classList.add("working");
    const W = rand(1000, 1700),
      start = performance.now();
    const fill = c.tween(
      W,
      (t) => b.style.setProperty("--p", t),
      (t) => 1 - Math.pow(1 - t, 2),
    );
    fill.catch(() => {});
    while (performance.now() - start < W - 250)
      await flyAgent(c, i, inside(b), rand(200, 380), 16);
    await fill;
    b.classList.remove("working");
    b.classList.add("filled");
    if (opts.refined) b.classList.add("refined");
    addLog(colors[i], opts.msg ?? built[name]);
  };

  const placeHome = () => {
    agentEls.forEach((_, i) => putAgent(i, home(i)));
    const r = rel(box);
    putCursor([r.x + r.w - 20, r.y + r.h + 4]);
  };
  const agentsReset = () => {
    Object.values(blocks).forEach((b) => {
      b.classList.remove("filled", "flagged", "refined", "cramped", "working");
      b.style.setProperty("--p", 0);
    });
    cursor.classList.remove("show");
    shipped.classList.remove("on");
    log.innerHTML = '<li class="hint">Press Play to start the build.</li>';
    placeHome();
  };
  const agentsFinish = () => {
    Object.values(blocks).forEach((b) => {
      b.classList.add("filled");
      b.style.setProperty("--p", 1);
    });
    blocks.card2.classList.add("refined");
    log.innerHTML = "";
    [
      ["var(--bp-muted)", "booking screen, 6 parts", "Plan", "0:00"],
      [colors[0], "Built the header", "", "0:02"],
      [colors[1], "Built the hero", "", "0:02"],
      [colors[2], "Built a card", "", "0:03"],
      [colors[0], "Built a card", "", "0:04"],
      [colors[1], "Built the list", "", "0:04"],
      [colors[2], "Built the button", "", "0:05"],
      ["var(--bp-flag)", "card spacing is off, sent back", "Review", "0:07"],
      [colors[0], "Rebuilt the card with even spacing", "", "0:09"],
      ["var(--bp-gold)", "approved", "Review", "0:10"],
    ].forEach(([col, text, who, time]) => addLog(col, text, who, time));
    shipped.classList.add("on");
  };
  const agentsPlay = async (c) => {
    t0 = performance.now();
    addLog("var(--bp-muted)", "booking screen, 6 parts", "Plan");
    const queue = ["head", "hero", "card1", "card2", "list", "btn"];
    const worker = async (i, delay) => {
      await c.sleep(delay);
      while (queue.length) {
        const name = queue.shift();
        await workOn(c, i, name, { cramped: name === "card2" });
      }
      await flyAgent(c, i, home(i), rand(650, 900), 45);
    };
    await Promise.all([worker(0, 200), worker(1, 450), worker(2, 700)]);

    await c.sleep(250);
    const r = rel(box);
    putCursor([r.x + r.w - 20, r.y + r.h + 4]);
    cursor.classList.add("show");
    await c.sleep(200);
    const target = mid(blocks.card2);
    await fly(
      c,
      () => cpos,
      putCursor,
      [target[0] + 6, target[1] + 8],
      850,
      50,
    );
    blocks.card2.classList.add("flagged");
    addLog("var(--bp-flag)", "card spacing is off, sent back", "Review");
    await c.sleep(1000);
    blocks.card2.classList.remove("filled", "flagged", "cramped");
    blocks.card2.style.setProperty("--p", 0);
    await fly(c, () => cpos, putCursor, [cpos[0] + 40, cpos[1] + 30], 400, 20);
    cursor.classList.remove("show");
    await workOn(c, 0, "card2", {
      refined: true,
      msg: "Rebuilt the card with even spacing",
    });
    await flyAgent(c, 0, home(0), 800, 45);
    await c.sleep(200);
    addLog("var(--bp-gold)", "approved", "Review");
    shipped.classList.add("on");
  };
  const fleetRun = runner(
    document.getElementById("play-agents"),
    agentsReset,
    agentsPlay,
    agentsFinish,
  );
  const settle = () => {
    if (!fleetRun.running) placeHome();
  };
  requestAnimationFrame(settle);
  addEventListener("resize", settle);
  if (document.fonts) document.fonts.ready.then(settle);

  /* ---------- 3. Website wall lightbox ---------- */
  const lb = document.getElementById("lb"),
    lbImg = document.getElementById("lb-img"),
    lbCap = document.getElementById("lb-cap");
  document.querySelectorAll(".shot").forEach((b) =>
    b.addEventListener("click", () => {
      lbImg.src = b.dataset.src;
      lbImg.alt = b.querySelector("img").alt;
      lbCap.textContent = b.dataset.cap;
      if (lb.showModal) lb.showModal();
      else lb.setAttribute("open", "");
    }),
  );
  const closeLb = () => {
    if (lb.close) lb.close();
    else lb.removeAttribute("open");
  };
  document.getElementById("lb-close").addEventListener("click", closeLb);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLb();
  });
})();
