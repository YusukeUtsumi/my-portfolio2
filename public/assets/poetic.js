import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

const isSmall = window.matchMedia("(max-width: 768px)").matches;
const startValue = isSmall ? "top 96%" : "top 78%";

const blocks = document.querySelectorAll('[data-poetic]');
blocks.forEach((block) => {
    const lines = block.querySelectorAll('.po-line');
    const glow = block.querySelector('.po-glow');
    if (!lines.length)
        return;

    ScrollTrigger.create({
        trigger: block,
        start: startValue, 
        once: true,
        invalidateOnRefresh: true,
        onEnter: () => {
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            // 1) グローをうっすら点灯
            if (glow) {
                tl.to(glow, { opacity: 0.45, duration: 0.8 }, 0)
                    // 維持しつつ少し落とす（呼吸感）
                    .to(glow, { opacity: 0.28, duration: 1.2, ease: "sine.inOut" }, 0.8);
            }
            // 2) 行ごとに下→上フェード
            tl.to(lines, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: isSmall ? 0.05 : 0.08
            }, 0.05);
        }
    });
});

// iOS/Safari のアドレスバー変動対策（初回/回転/復帰で再計算）
window.addEventListener("load", () => ScrollTrigger.refresh());
window.addEventListener("orientationchange", () => ScrollTrigger.refresh());
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") ScrollTrigger.refresh();
});