// Sketch to finished: the stage strip, sections inking in as they scroll into
// view, the "Show the blueprint" toggle, the hero punch list and the
// before/after slider. Loaded with defer from index.html.
(() => {
  const root = document.documentElement;
  const sketchy = root.classList.contains("sketchy");
  const sections = [...document.querySelectorAll(".ink:not(.inked)")];

  /* ---------- Ink in ---------- */
  // Cards and screenshots in a section ink in one after another.
  const stagger = () =>
    sections.forEach((s) =>
      s
        .querySelectorAll(".bp-card, .shot img")
        .forEach((el, i) =>
          el.style.setProperty("--d", `${Math.min(i, 10) * 80}ms`),
        ),
    );
  const settle = (s) => {
    s.classList.remove("settled");
    setTimeout(() => s.classList.add("settled"), 2000);
  };
  const inkIn = (s) => {
    if (s.classList.contains("inked")) return;
    s.classList.add("inked");
    settle(s);
    s.dispatchEvent(new Event("inked"));
  };
  stagger();

  if (!sketchy || !("IntersectionObserver" in window)) {
    sections.forEach(inkIn);
  } else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            inkIn(e.target);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -12% 0px" },
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Hero punch list ---------- */
  const todo = document.getElementById("todo");
  const items = [...todo.querySelectorAll("li")];
  const checkAll = () => {
    items.forEach((li) => li.classList.add("done"));
    todo.classList.add("all-done");
  };
  if (!sketchy) checkAll();
  else
    (async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await wait(1400);
      for (const li of items) {
        li.classList.add("done");
        await wait(650);
      }
      todo.classList.add("all-done");
    })();

  /* ---------- Before and after ---------- */
  const compare = document.getElementById("compare");
  const range = compare.querySelector("input");
  let sweeping = 0;
  const setPos = (v) => {
    range.value = v;
    compare.style.setProperty("--pos", `${v}%`);
  };
  range.addEventListener("input", () => {
    sweeping++;
    setPos(range.value);
  });
  if (!sketchy) setPos(50);
  else {
    setPos(100);
    compare.closest(".ink").addEventListener("inked", () => {
      const my = ++sweeping;
      const t0 = performance.now() + 900;
      const step = (now) => {
        if (my !== sweeping) return;
        const t = Math.max(0, Math.min(1, (now - t0) / 1400));
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setPos(Math.round(100 - 50 * e));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Show the blueprint ---------- */
  const toggle = document.getElementById("bp-toggle");
  toggle.addEventListener("click", () => {
    const on = root.classList.toggle("show-bp");
    toggle.setAttribute("aria-pressed", String(on));
    toggle.querySelector(".long").textContent = on
      ? "Show the finish"
      : "Show the blueprint";
    toggle.querySelector(".short").textContent = on ? "Finish" : "Plan";
    document.querySelectorAll(".ink").forEach(settle);
  });

  /* ---------- Stage strip ---------- */
  const stageNames = ["sketch", "framing", "wiring", "polish", "shipped"];
  const steps = [...document.querySelectorAll(".stages li")];
  const staged = [...document.querySelectorAll("[data-stage]")];
  const bar = document.querySelector(".stages .bar");
  let ticking = false;
  const update = () => {
    ticking = false;
    const line = innerHeight * 0.4;
    let cur = 0;
    staged.forEach((s) => {
      if (s.getBoundingClientRect().top < line)
        cur = Math.max(cur, stageNames.indexOf(s.dataset.stage));
    });
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max > 0 && scrollY >= max - 2) cur = stageNames.length - 1;
    steps.forEach((li, i) => {
      li.classList.toggle("past", i < cur);
      li.classList.toggle("now", i === cur);
      const a = li.querySelector("a");
      if (i === cur) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });
    bar.style.setProperty(
      "--progress",
      max > 0 ? Math.min(1, scrollY / max).toFixed(3) : 1,
    );
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  update();
})();
