// GSAP（CDN）
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

// RisaGPTs セクション：画像（右パネル）→テキストの順で入場
document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector("#risagpts");
    if (!section) return;

    const head  = section.querySelector(".rg-head");   // テキスト
    const panel = section.querySelector(".rg-frame");  // 右側の画像パネル
    const glow  = section.querySelector(".rg-glow");   // あれば

    // 初期状態（AgentFlowと同じ y:24 / opacity:0）
    gsap.set([head, panel], { opacity: 0, y: 24 });
    if (glow) gsap.set(glow, { opacity: 0 });

    // 入場アニメ（セクションが見えたら、画像→テキストでフェードイン）
    ScrollTrigger.create({
        trigger: section,
        start: "top 72%",
        once: true,
        onEnter: () => {
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.to(panel, { opacity: 1, y: 0, duration: 0.6 })           // 画像を先に
              .to(head,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.2"); // テキストを後追い
            if (glow) tl.to(glow, { opacity: 0.5, duration: 0.6 }, 0.15);
        }
    });

    // PCのみ：グローのスクラブ＆パネルのピン留め（AgentFlow準拠）
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
});
