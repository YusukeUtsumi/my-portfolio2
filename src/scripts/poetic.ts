/* src/scripts/poetic.ts */
const ready = (cb: () => void) => {
    if (document.readyState === "complete" || document.readyState === "interactive") cb();
    else document.addEventListener("DOMContentLoaded", cb, { once: true });
};

ready(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const blocks: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>(".poetic"));
    if (blocks.length === 0) return;

    // JSが効いている印として .reveal を付与（CSSが演出を有効化）
    blocks.forEach((b) => b.classList.add("reveal"));

    if (prefersReduced) {
        blocks.forEach((b) => b.classList.add("is-in"));
        return;
    }

    const inViewportNow = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // 画面の80%より上に頭が来ていたら「見えている」とみなす
        return r.top < vh * 0.8;
    };

    const io = new IntersectionObserver((entries, obs) => {
        for (const e of entries) {
            if (e.isIntersecting) {
                (e.target as HTMLElement).classList.add("is-in");
                obs.unobserve(e.target);
            }
        }
    }, {
        root: null,
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.2
    });

    // すでに画面内にある要素は即表示、それ以外は監視
    blocks.forEach((b) => (inViewportNow(b) ? b.classList.add("is-in") : io.observe(b)));
});
