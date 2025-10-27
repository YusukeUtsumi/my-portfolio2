import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector("#agentflow, .af-section");
if (section) {
    const head  = section.querySelector(".af-head");
    // panel は .af-frame / .device-frame どちらでも対応
    const panel = section.querySelector(".af-frame") || section.querySelector(".device-frame");
    const glow  = section.querySelector(".af-glow");

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // ===== スマホ：アニメ無効・即表示 =====
    if (isMobile) {
        if (head)  gsap.set(head,  { opacity: 1, y: 0 });
        if (panel) gsap.set(panel, { opacity: 1, y: 0 });
        if (glow)  glow.style.display = "none";
        // ScrollTrigger を作らず終了（PC挙動に影響なし）
        return;
    }

    // ===== PC：フェード（ScrollTrigger）を復活 =====
    if (head || panel) {
        gsap.set([head, panel].filter(Boolean), { opacity: 0, y: 24 });

        ScrollTrigger.create({
            trigger: section,
            start: "top 72%",          // 画面の72%地点に来たら発火（従来相当）
            once: true,
            invalidateOnRefresh: true,
            onEnter: () => {
                const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
                if (panel) tl.to(panel, { opacity: 1, y: 0, duration: 0.6 });
                if (head)  tl.to(head,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
            }
        });
    }

    // PCのみの追加演出（任意・従来どおり維持）
    ScrollTrigger.matchMedia({
        "(min-width: 1024px)": function () {
            if (glow) {
                gsap.to(glow, {
                    opacity: 0.5,
                    scrollTrigger: {
                        trigger: section,
                        start: "top center",
                        end: "+=80%",
                        scrub: 0.5
                    }
                });
            }
        }
    });

    // レイアウト変動対策（後読み画像/フォント）
    const imgs = Array.from(document.images);
    imgs.forEach(img => {
        if (!img.complete) {
            img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
            img.addEventListener("error", () => ScrollTrigger.refresh(), { once: true });
        }
    });
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener("orientationchange", () => ScrollTrigger.refresh());
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") ScrollTrigger.refresh();
    });
    setTimeout(() => ScrollTrigger.refresh(), 350);
}
