import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const section = document.querySelector("#silentguard");
if (section) {
    const head = section.querySelector(".sg-head");
    const panel = section.querySelector(".device-frame");
    const glow = section.querySelector(".glow");
    gsap.set([head, panel], { opacity: 0, y: 24 });
    ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        once: true,
        onEnter: () => {
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.to(head, { opacity: 1, y: 0, duration: 0.6 })
                .to(panel, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
        }
    });
    // Glow と pin 演出（PC時のみ）
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
                trigger: panel,
                start: "top 20%",
                end: "+=120%",
                pin: true,
                pinSpacing: true,
                scrub: 0.6
            });
        }
    });
}
