import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

function initPoetic() {
    const isSmall = window.matchMedia("(max-width: 768px)").matches;

    // ====== モバイルはアニメーション無効・即表示 ======
    if (isSmall) {
        document.querySelectorAll('[data-poetic] .po-line').forEach(el => {
            el.classList.add('visible');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        document.querySelectorAll('.po-glow').forEach(el => {
            el.style.display = 'none';
        });
        return; // ScrollTriggerを作らず終了（PC表示は影響なし）
    }

    // ====== PCは従来のフェード（start: "top 78%"） ======
    const blocks = document.querySelectorAll('[data-poetic]');
    blocks.forEach((block) => {
        const lines = block.querySelectorAll('.po-line');
        const glow  = block.querySelector('.po-glow');
        if (!lines.length) return;

        ScrollTrigger.create({
            trigger: block,
            start: "top 78%",
            once: true,
            invalidateOnRefresh: true,
            onEnter: () => {
                const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
                if (glow) {
                    tl.to(glow, { opacity: 0.45, duration: 0.8 }, 0)
                      .to(glow, { opacity: 0.28, duration: 1.2, ease: "sine.inOut" }, 0.8);
                }
                tl.to(lines, {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,     // CSSのtransitionと歩調合わせ
                    stagger: 0.08
                }, 0.05);
            }
        });
    });

    // 後から高さが変わる要素へのリフレッシュ
    const imgs = Array.from(document.images);
    imgs.forEach(img => {
        if (!img.complete) {
            img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
            img.addEventListener('error', () => ScrollTrigger.refresh(), { once: true });
        }
    });
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener("orientationchange", () => ScrollTrigger.refresh());
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") ScrollTrigger.refresh();
    });
    setTimeout(() => ScrollTrigger.refresh(), 400);
}

// DOMとリソースが揃ってから初期化
if (document.readyState === "complete") {
    initPoetic();
} else {
    window.addEventListener("load", initPoetic, { once: true });
}
