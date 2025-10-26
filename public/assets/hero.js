const root = document.querySelector('.hero-wrap');
const orbsContainer = document.querySelector('.orbs');
if (root && orbsContainer) {
    let raf = 0;
    let mx = 0, my = 0;
    let t = 0;
    const autoAmpX = 0.05;
    const autoAmpY = 0.035;
    const autoSpeed = 0.0016;
    const updateVars = () => {
        const ax = Math.sin(t) * autoAmpX;
        const ay = Math.cos(t * 0.9) * autoAmpY;
        root.style.setProperty('--mx', (mx + ax).toFixed(4));
        root.style.setProperty('--my', (my + ay).toFixed(4));
        raf = 0;
    };
    const onPointer = (x, y) => {
        const rect = root.getBoundingClientRect();
        mx = ((x - rect.left) / rect.width) * 2 - 1;
        my = ((y - rect.top) / rect.height) * 2 - 1;
        if (!raf)
            raf = requestAnimationFrame(updateVars);
    };
    window.addEventListener('pointermove', (e) => onPointer(e.clientX, e.clientY), { passive: true });
    const onScroll = () => {
        const rect = root.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const visible = Math.max(0, Math.min(1, 1 - Math.abs(rect.top + rect.height / 2 - vh / 2) / (vh / 2)));
        const intensity = 0.65 + visible * 0.45;
        root.style.setProperty('--intensity', intensity.toFixed(3));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    // ★ HTMLから個数を取得（未指定なら PC=72 / SP=8）
    const desktopCount = parseInt(root.dataset.orbsDesktop || "96", 10);
    const mobileCount = parseInt(root.dataset.orbsMobile || "8", 10);
    const isDesktop = () => window.matchMedia('(min-width: 1100px)').matches;
    const makeTinyOrbs = (count = 24) => {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const s = document.createElement('span');
            s.className = 'orb orb--tiny';
            // ★ 分布を広げる（-6%〜106% にばら撒いて端の“埋まり感”UP）
            let x = -6 + Math.random() * 112;
            let y = -6 + Math.random() * 112;
            // 中央のど真ん中だけ薄く避けたい場合（半径12%）
            const dx = x - 50, dy = y - 48;
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r < 12) {
                const th = Math.random() * Math.PI * 2;
                x = 50 + Math.cos(th) * 14;
                y = 48 + Math.sin(th) * 14;
            }
            // ★ サイズを拡張（60〜180px）で“面積”を増やす
            const sz = Math.round(60 + Math.random() * 120);
            // 彩度配分（青紫:暖色 ≈ 6:4）
            const huePool = Math.random() < 0.6 ? [255, 268, 292] : [18, 28, 36, 45];
            const h = huePool[Math.floor(Math.random() * huePool.length)];
            // 濃くならないよう全体を薄め（0.04〜0.10）
            const a = 0.04 + Math.random() * 0.06;
            // 時間にムラを出す
            const d1 = (10 + Math.random() * 14).toFixed(1) + 's';
            const d2 = (16 + Math.random() * 16).toFixed(1) + 's';
            const k = Math.random() < 0.5 ? 1 : -1;
            s.setAttribute('style', [
                `--x:${x.toFixed(1)}`,
                `--y:${y.toFixed(1)}`,
                `--sz:${sz}px`,
                `--h:${h}`,
                `--a:${a.toFixed(2)}`,
                `--d1:${d1}`,
                `--d2:${d2}`,
                `--k:${k}`
            ].join('; '));
            frag.appendChild(s);
        }
        orbsContainer.appendChild(frag);
    };
    const clearTinyOrbs = () => {
        orbsContainer.querySelectorAll('.orb--tiny').forEach(n => n.remove());
    };
    const ensureTinyOrbs = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        clearTinyOrbs(); // ★ いったんクリアしてから再生成（状態ずれを防ぐ）
        if (isDesktop()) {
            makeTinyOrbs(desktopCount);
        }
        else {
            if (mobileCount > 0)
                makeTinyOrbs(mobileCount);
        }
    };
    ensureTinyOrbs();
    let rAF = 0;
    window.addEventListener('resize', () => {
        if (rAF)
            cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(() => { ensureTinyOrbs(); rAF = 0; });
    });
    // 低負荷ループ（30fps相当）
    let frame = 0;
    const loop = () => {
        t += autoSpeed * (1 + Math.sin(t * 0.23) * 0.08);
        frame++;
        if (frame % 2 === 0)
            if (!raf)
                raf = requestAnimationFrame(updateVars);
        requestAnimationFrame(loop);
    };
    loop();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
        root.style.setProperty('--mx', '0');
        root.style.setProperty('--my', '0');
        root.style.setProperty('--intensity', '0.75');
        clearTinyOrbs();
    }
}
