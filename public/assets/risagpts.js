// GSAP（CDN）
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

// .rg-section ごとに同じ演出（画像→テキストの順でフェードイン）
document.addEventListener("DOMContentLoaded", () => {
    const sections = Array.from(document.querySelectorAll(".rg-section"));
    if (!sections.length) return;

    sections.forEach((section) => {
        const head = section.querySelector(".rg-head");   // テキスト
        const panel = section.querySelector(".rg-frame"); // 画像（パネル）
        const glow  = section.querySelector(".rg-glow");  // あれば

        // 初期状態（AgentFlowと同じ y:24 / opacity:0）
        gsap.set([head, panel], { opacity: 0, y: 24 });
        if (glow) gsap.set(glow, { opacity: 0 });

        // セクションが見えたら入場（画像先→テキスト後追い）
        ScrollTrigger.create({
            trigger: section,
            start: "top 72%", // AgentFlowに合わせる
            once: true,
            onEnter: () => {
                const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
                tl.to(panel, { opacity: 1, y: 0, duration: 0.6 })
                    .to(head,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
                if (glow) tl.to(glow, { opacity: 0.5, duration: 0.6 }, 0.15);
            }
        });

        // PCのみ：グロー強調＆パネルを軽くピン（AgentFlow準拠）
        ScrollTrigger.matchMedia({
            "(min-width: 1024px)": function() {
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
    });
});
