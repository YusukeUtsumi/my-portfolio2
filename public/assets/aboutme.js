// public/assets/aboutme.js
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    const sec = document.querySelector(".about-section");
    if (!sec) return;

    const targets = [
        sec,
        sec.querySelector(".about-name"),
        sec.querySelector(".about-role"),
        sec.querySelector(".about-intro"),
        sec.querySelector(".about-links"),
        sec.querySelector(".about-contact"),
    ].filter(Boolean);

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // ===== スマホ：アニメ無効・即表示 =====
    if (isMobile) {
        gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: "all" });
        return; // ScrollTriggerは作らない（PC挙動に影響なし）
    }

    // ===== PC：既存のフェードを維持 =====
    gsap.set(targets, { autoAlpha: 0, y: 30 }); // 現行初期値を踏襲
    gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 1.4,
        stagger: 0.0, // 一斉に
        scrollTrigger: {
            trigger: sec,
            start: "top 80%",
            once: true
        },
        clearProps: "transform"
    });
});
