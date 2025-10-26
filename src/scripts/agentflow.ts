import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export {};

const section = document.querySelector("#agentflow") as HTMLElement | null;
if (section) {
    const head = section.querySelector(".af-head");
    const panel = section.querySelector(".device-frame");
    const glow = section.querySelector(".af-glow");

    // 初期状態
    gsap.set([head, panel], { opacity: 0, y: 24 });

    // 入場アニメ（セクションが見えたらフェードイン）
    ScrollTrigger.create({
        trigger: section,
        start: "top 72%",
        once: true,
        onEnter: () => {
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.to(panel, { opacity: 1, y: 0, duration: 0.6 })     // 画像を先に
              .to(head, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2"); // テキストを後追い
        }
    });

    // PC時のみ：グロー強調＆パネルを軽くピン
    ScrollTrigger.matchMedia({
        "(min-width: 1024px)": function () {
            gsap.to(glow, {
                opacity: 0.5,
                scrollTrigger: {
                    trigger: section,
                    start: "top center",
                    end: "+=80%",
                    scrub: 0.5
                }
            });

            ScrollTrigger.create({
                trigger: panel!,
                start: "top 20%",
                end: "+=120%",
                pin: true,
                pinSpacing: true,
                scrub: 0.6
            });
        }
    });
}