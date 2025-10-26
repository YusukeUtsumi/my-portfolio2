// public/assets/aboutme.js
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    const sec = document.querySelector(".about-section");
    if (!sec) return;

    // 対象（セクション全体＋中身まとめて一気にフェード）
    const targets = [
        sec,
        sec.querySelector(".about-name"),
        sec.querySelector(".about-role"),
        sec.querySelector(".about-intro"),
        sec.querySelector(".about-links"),
        sec.querySelector(".about-contact"),
    ].filter(Boolean);

    // 初期値
    gsap.set(targets, { autoAlpha: 0, y: 30 });

    // スクロールでふわっと1回だけ上がる
    gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        ease: "power2.out",
        duration: 1.4,
        stagger: 0.0, // 一斉に動く
        scrollTrigger: {
            trigger: sec,
            start: "top 80%",
            once: true,
        },
        clearProps: "transform",
    });
});
