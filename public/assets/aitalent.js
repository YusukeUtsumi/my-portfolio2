// ============================
// AI TALENT animations & stripes (smooth)
// ============================

// 1) GSAP（CDN）
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

// 2) ストライプの一時停止（既存）
const stripes = document.querySelectorAll(".ai-stripes .stripe");
const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const stripe = entry.target;
        if (entry.isIntersecting) {
            stripe.classList.remove("paused");
        } else {
            stripe.classList.add("paused");
        }
    });
}, { root: null, threshold: 0.1 });
stripes.forEach((s) => io.observe(s));
stripes.forEach((s) => {
    s.addEventListener("click", () => {
        s.classList.toggle("paused");
    });
});

// 3) フェード（テキスト先 → 画像後追い）
document.addEventListener("DOMContentLoaded", () => {
    const sections = Array.from(document.querySelectorAll(".ai-section"));
    if (!sections.length) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    sections.forEach((section) => {
        const head = section.querySelector(".ai-head");                 // テキスト
        const risaImg = section.querySelector(".risa img");             // Risa画像
        const liliaImgs = Array.from(section.querySelectorAll(".lilia-item img")); // Lilia画像群
        const imgs = [risaImg, ...liliaImgs].filter(Boolean);

        // スマホはアニメ無効・即表示
        if (isMobile) {
            if (head) gsap.set(head, { autoAlpha: 1, y: 0 });
            imgs.forEach((img) => {
                gsap.set(img, { autoAlpha: 1, y: 0, filter: "none" });
            });
            return; // ScrollTriggerを作らない（PC挙動に影響なし）
        }

        // ===== PC版：既存アニメーションそのまま維持 =====
        if (head) head.style.willChange = "transform, opacity";
        imgs.forEach((img) => { img.style.willChange = "transform, opacity"; });

        // 初期値
        gsap.set(head, { autoAlpha: 0, y: 14 });
        gsap.set(imgs, { autoAlpha: 0, y: 16, filter: "blur(2px)" });

        const tl = gsap.timeline({
            defaults: { ease: "power3.out", immediateRender: false },
            scrollTrigger: {
                trigger: section,
                start: "top 76%",  // PCは従来通り
                once: true,
                invalidateOnRefresh: true
            }
        });

        // テキスト → Risa → Lilia群
        tl.to(head, { autoAlpha: 1, y: 0, duration: 0.48, clearProps: "transform" })
            .to(risaImg, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.52, clearProps: "transform,filter" }, "-=0.18")
            .to(liliaImgs, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.46, stagger: 0.08, clearProps: "transform,filter" }, "-=0.26");

        // 遅延読み込み対策
        imgs.forEach((img) => {
            if (!img) return;
            if (img.complete) return;
            img.addEventListener("load", () => {
                requestAnimationFrame(() => ScrollTrigger.refresh());
            }, { once: true });
        });

        window.addEventListener("load", () => {
            ScrollTrigger.refresh();
        });
    });
});
