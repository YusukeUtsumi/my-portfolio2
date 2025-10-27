import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector("#agentflow");
if (section) {
    const head  = section.querySelector(".af-head");
    const panel = section.querySelector(".device-frame, .af-frame");
    const glow  = section.querySelector(".af-glow");

    const isSmall = window.matchMedia("(max-width: 959px)").matches;

    // ===== スマホ：アニメーション無効・即表示 =====
    if (isSmall) {
        if (head)  gsap.set(head,  { opacity: 1, y: 0 });
        if (panel) gsap.set(panel, { opacity: 1, y: 0 });
        if (glow)  glow.style.display = "none"; // 負荷軽減
        // ScrollTrigger を作らず終了（PCの挙動には影響なし）
        return;
    }

    // ===== PC：従来どおり（フェードイン + グロー/ピン） =====
    if (head || panel) {
        gsap.set([head, panel], { opacity: 0, y: 24 });
        ScrollTrigger.create({
            trigger: section,
            start: "top 72%",
            once: true,
            onEnter: () => {
                const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
                if (panel) tl.to(panel, { opacity: 1, y: 0, duration: 0.6 });
                if (head)  tl.to(head,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
            }
        });
    }

    // PCのみの演出（グロー強調 & ピン）
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
            if (panel) {
                ScrollTrigger.create({
                    trigger: panel,
                    start: "top 20%",
                    end: "+=120%",
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.6
                });
            }
        }
    });
}
