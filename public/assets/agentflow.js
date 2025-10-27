import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

// AgentFlow：右パネル → テキストの順で入場（RisaGPTsと同じ構成）
document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector("#agentflow") || document.querySelector(".af-section");
    if (!section) return;

    const head  = section.querySelector(".af-head");           // テキスト側
    const panel = section.querySelector(".af-frame") || section.querySelector(".device-frame"); // 右側パネル
    const glow  = section.querySelector(".af-glow");           // 任意のグロー

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // ===== スマホはアニメ無効・即表示 =====
    if (isMobile) {
        if (head)  gsap.set(head,  { opacity: 1, y: 0 });
        if (panel) gsap.set(panel, { opacity: 1, y: 0 });
        if (glow)  glow.style.display = "none";
        return; // ScrollTriggerを作らない
    }

    // ===== PC：RisaGPTsと同じ“タイムライン直付け＋start: top 72%”で復旧 =====
    // 初期状態
    gsap.set([head, panel].filter(Boolean), { opacity: 0, y: 24 });
    if (glow) gsap.set(glow, { opacity: 0 });

    // タイムライン（RisaGPTsの実装方式に揃える）
    const tl = gsap.timeline({
        defaults: { ease: "power2.out", immediateRender: false },
        scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true,
            invalidateOnRefresh: true
        }
    });

    // パネル → テキスト（重なり-0.2s）＋グロー
    if (panel) tl.to(panel, { opacity: 1, y: 0, duration: 0.6 });
    if (head)  tl.to(head,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    if (glow)  tl.to(glow,  { opacity: 0.5, duration: 0.6 }, 0.15);

    // 遅延確定要素で高さが変わった場合の再計算（画像・フォント）
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
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });
});
