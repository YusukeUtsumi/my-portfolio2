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

// 3) フェード（テキスト先 → 画像後追い）を“なめらか”に
document.addEventListener("DOMContentLoaded", () => {
    const sections = Array.from(document.querySelectorAll(".ai-section"));
    if (!sections.length) return;

    sections.forEach((section) => {
        const head = section.querySelector(".ai-head");                 // テキスト
        const risaImg = section.querySelector(".risa img");             // Risa画像
        const liliaImgs = Array.from(section.querySelectorAll(".lilia-item img")); // Lilia画像群
        const imgs = [risaImg, ...liliaImgs].filter(Boolean);

        // GPUヒントを先に与える（カクつき減少）
        if (head) head.style.willChange = "transform, opacity";
        imgs.forEach((img) => { img.style.willChange = "transform, opacity"; });

        // 初期値：少しだけ移動量を減らし、blurで“とろみ”をつける
        gsap.set(head, { autoAlpha: 0, y: 14 });
        gsap.set(imgs, { autoAlpha: 0, y: 16, filter: "blur(2px)" });

        const tl = gsap.timeline({
            defaults: { ease: "power3.out", immediateRender: false },
            scrollTrigger: {
                trigger: section,
                start: "top 76%",          // 72%→76%へ少し遅らせて余裕を作る
                once: true,
                invalidateOnRefresh: true
            }
        });

        // テキスト → Risa → Lilia群（短い重なり＆軽いスタッガー）
        tl.to(head, { autoAlpha: 1, y: 0, duration: 0.48, clearProps: "transform" })
            .to(risaImg, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.52, clearProps: "transform,filter" }, "-=0.18")
            .to(liliaImgs, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.46, stagger: 0.08, clearProps: "transform,filter" }, "-=0.26");

        // 遅延読み込みで高さが変わる場合に備えて refresh
        imgs.forEach((img) => {
            if (!img) return;
            if (img.complete) return;
            img.addEventListener("load", () => {
                requestAnimationFrame(() => ScrollTrigger.refresh());
            }, { once: true });
        });

        window.addEventListener("load", () => {
            // ページ全体のロード後にも保険で再計算
            ScrollTrigger.refresh();
        });
    });
});
