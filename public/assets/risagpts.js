import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

// RisaGPTs：右パネル → テキストの順で入場（PCは従来通り）
document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector("#risagpts");
    if (!section) return;

    const head  = section.querySelector(".rg-head");   // テキスト側
    const panel = section.querySelector(".rg-frame");  // 右側パネル
    const glow  = section.querySelector(".rg-glow");   // 任意のグロー

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // ===== スマホ：フェード無効・即表示 =====
    if (isMobile) {
        if (head)  gsap.set(head,  { opacity: 1, y: 0 });
        if (panel) gsap.set(panel, { opacity: 1, y: 0 });
        if (glow)  glow.style.display = "none";
        return; // ScrollTriggerを作らず終了（PC挙動は変えない）
    }

    // ===== PC：既存のタイムラインをそのまま維持 =====
    gsap.set([head, panel].filter(Boolean), { opacity: 0, y: 24 });
    if (glow) gsap.set(glow, { opacity: 0 });

    const tl = gsap.timeline({
        defaults: { ease: "power2.out", immediateRender: false },
        scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
            invalidateOnRefresh: true
        }
    });

    if (panel) tl.to(panel, { opacity: 1, y: 0, duration: 0.6 });
    if (head)  tl.to(head,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    if (glow)  tl.to(glow,  { opacity: 0.5, duration: 0.6 }, 0.15);

    // 高さ変動対策（画像/フォント後読み）
    const img = panel ? panel.querySelector("img") : null;
    if (img) {
        if (img.complete) {
            ScrollTrigger.refresh();
        } else {
            img.addEventListener("load", () => {
                requestAnimationFrame(() => ScrollTrigger.refresh());
            }, { once: true });
        }
    }
    window.addEventListener("load", () => ScrollTrigger.refresh());
});
