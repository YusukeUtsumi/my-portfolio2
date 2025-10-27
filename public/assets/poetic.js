import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

function initPoetic() {
    const isSmall = window.matchMedia("(max-width: 768px)").matches;
    const startValue = isSmall ? "top 98%" : "top 78%"; // ← 後半でも確実に入るよう、さらに手前

    const blocks = document.querySelectorAll('[data-poetic]');
    blocks.forEach((block) => {
        const lines = block.querySelectorAll('.po-line');
        const glow  = block.querySelector('.po-glow');
        if (!lines.length) return;

        ScrollTrigger.create({
            trigger: block,
            start: startValue,          // ← ここ重要
            once: true,
            invalidateOnRefresh: true,  // ← 再計算を有効化
            onEnter: () => {
                const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
                if (glow) {
                    tl.to(glow, { opacity: 0.45, duration: 0.8 }, 0)
                        .to(glow, { opacity: 0.28, duration: 1.2, ease: "sine.inOut" }, 0.8);
                }
                tl.to(lines, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: isSmall ? 0.05 : 0.08
                }, 0.05);
            }
        });
    });

    // 画像が後から読み込まれて高さが変わる → 必ず再計算
    const imgs = Array.from(document.images);
    imgs.forEach(img => {
        if (!img.complete) {
            img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
            img.addEventListener('error', () => ScrollTrigger.refresh(), { once: true });
        }
    });

    // フォント読み込み完了後にも再計算（Safari/Chrome両方で効く）
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    // アドレスバーの開閉・回転・復帰で再計算
    window.addEventListener("orientationchange", () => ScrollTrigger.refresh());
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") ScrollTrigger.refresh();
    });

    // モバイルのアドレスバーが落ち着くタイミングで追い refresh
    setTimeout(() => ScrollTrigger.refresh(), 400);
}

// DOM とリソースの両方が揃ってから初期化（後半ズレ対策）
if (document.readyState === "complete") {
    initPoetic();
} else {
    window.addEventListener("load", initPoetic, { once: true });
}
