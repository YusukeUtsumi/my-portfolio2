// ============================
// AI TALENT animations & stripes
// ============================

// 1) GSAP（CDN）
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

// 2) ストライプの一時停止（既存機能）
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
stripes.forEach(s => io.observe(s));
stripes.forEach((s) => {
    s.addEventListener("click", () => {
        s.classList.toggle("paused");
    });
});

// 3) フェード（テキスト先→画像後追い）
document.addEventListener("DOMContentLoaded", () => {
    // 複数セクション想定でループ（通常は1つ）
    const sections = Array.from(document.querySelectorAll(".ai-section"));
    if (!sections.length) return;

    sections.forEach((section) => {
        const head = section.querySelector(".ai-head");                 // テキストブロック
        const risaImg = section.querySelector(".risa img");             // Risa画像
        const liliaImgs = Array.from(section.querySelectorAll(".lilia-item img")); // Lilia画像群

        // 初期状態（AgentFlow/RisaGPTsと同じ y:24 / opacity:0）
        const imgs = [risaImg, ...liliaImgs].filter(Boolean);
        gsap.set([head, ...imgs], { opacity: 0, y: 24 });

        // テキスト → 画像群（Risa → Liliaたちをstagger）
        const tl = gsap.timeline({
            defaults: { ease: "power2.out", immediateRender: false },
            scrollTrigger: {
                trigger: section,
                start: "top 72%",
                once: true,
                invalidateOnRefresh: true
            }
        });

        tl.to(head, { opacity: 1, y: 0, duration: 0.6 })
            .to(imgs, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, "-=0.2");

        // 遅延読み込み画像対策（読み込み後に位置を再計算）
        const allImgs = imgs;
        allImgs.forEach((img) => {
            if (!img) return;
            if (img.complete) return;
            img.addEventListener("load", () => {
                requestAnimationFrame(() => ScrollTrigger.refresh());
            }, { once: true });
        });

        // 念のためページ読了後にも再計算
        window.addEventListener("load", () => {
            ScrollTrigger.refresh();
        });
    });
});

export {};
