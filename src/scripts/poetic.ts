/* src/scripts/poetic.ts */
const addJSFlagEarly = () => {
    // JSが有効なときだけ <html class="js"> を付ける
    document.documentElement.classList.add("js");
};
addJSFlagEarly();

const ready = (cb: () => void) => {
    if (document.readyState === "complete" || document.readyState === "interactive") cb();
    else document.addEventListener("DOMContentLoaded", cb, { once: true });
};

ready(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const blocks: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>(".poetic"));
    if (blocks.length === 0) return;

    if (prefersReduced) {
        // 動きを抑える環境 → 即表示
        blocks.forEach((b) => b.classList.add("is-in"));
        return;
    }

    const showNextFrame = (el: HTMLElement) => {
        requestAnimationFrame(() => el.classList.add("is-in"));
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
        rootMargin: "0px 0px -5% 0px",
        threshold: 0.01
    });

    // すでに画面内にある要素は即表示、それ以外は監視
    const vh = window.innerHeight || document.documentElement.clientHeight;
    blocks.forEach((b) => {
        const top = b.getBoundingClientRect().top;
        if (top < vh * 0.9) showNextFrame(b);
        else io.observe(b);
    });
});
