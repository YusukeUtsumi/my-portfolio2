// GSAP（CDN）
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

// RisaGPTs：右パネル → テキストの順で入場（スクロール連動による移動は無し）
document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector("#risagpts");
    if (!section) return;

    const head  = section.querySelector(".rg-head");    // テキスト側
    const panel = section.querySelector(".rg-frame");   // 右側画像パネル
    const glow  = section.querySelector(".rg-glow");    // 任意のグロー

    // 初期状態（AgentFlowと同じ）
    gsap.set([head, panel], { opacity: 0, y: 24 });
    if (glow) gsap.set(glow, { opacity: 0 });

    // タイムライン（ScrollTrigger直付け）
    const tl = gsap.timeline({
        defaults: { ease: "power2.out", immediateRender: false },
        scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
            invalidateOnRefresh: true
        }
    });

    // 画像 → テキスト
    tl.to(panel, { opacity: 1, y: 0, duration: 0.6 })
        .to(head,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    if (glow) tl.to(glow, { opacity: 0.5, duration: 0.6 }, 0.15);

    // 画像の遅延読み込みでレイアウトが変わった場合に備えて refresh
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

    // ページ全体のロード完了時も保険で refresh
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });
});
