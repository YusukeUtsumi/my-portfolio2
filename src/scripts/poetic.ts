/* src/scripts/poetic.ts */
const ready = (cb: () => void) => {
    if (document.readyState === "complete" || document.readyState === "interactive") cb();
    else document.addEventListener("DOMContentLoaded", cb, { once: true });
};

ready(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const blocks: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>(".poetic"));
    if (blocks.length === 0) return;

    // JS有効サイン：まず .reveal を付けて「一旦隠す」
    blocks.forEach((b) => b.classList.add("reveal"));

    if (prefersReduced) {
        // 動きOFF環境では即表示して終わり
        blocks.forEach((b) => b.classList.add("is-in"));
        return;
    }

    // 次フレームで is-in を付けると CSS transition が確実に走る
    const showNextFrame = (el: HTMLElement) => {
        requestAnimationFrame(() => {
            el.classList.add("is-in");
        });
    };

    const io = new IntersectionObserver((entries, obs) => {
        for (const e of entries) {
            if (e.isIntersecting) {
                showNextFrame(e.target as HTMLElement);
                obs.unobserve(e.target);
            }
        }
    }, {
        root: null,
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.2
    });

    // 初期から画面内にあるブロックは次フレームで表示、それ以外は監視
    const vh = window.innerHeight || document.documentElement.clientHeight;
    blocks.forEach((b) => {
        const top = b.getBoundingClientRect().top;
        if (top < vh * 0.8) showNextFrame(b);
        else io.observe(b);
    });
});
