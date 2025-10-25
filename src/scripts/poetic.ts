/* src/scripts/poetic.ts */

const ready = (cb: () => void) => {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        cb();
    } else {
        document.addEventListener("DOMContentLoaded", cb, { once: true });
    }
};

ready(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const blocks: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>(".poetic"));

    if (blocks.length === 0) return;

    // JSが有効なときだけ演出を有効化
    blocks.forEach((b) => b.classList.add("reveal"));

    if (prefersReduced) {
        // 動きを抑える環境 → 即時表示
        blocks.forEach((b) => b.classList.add("is-in"));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (e.isIntersecting) {
                (e.target as HTMLElement).classList.add("is-in");
                io.unobserve(e.target);
            }
        }
    }, {
        root: null,
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.2
    });

    blocks.forEach((b) => io.observe(b));
});
