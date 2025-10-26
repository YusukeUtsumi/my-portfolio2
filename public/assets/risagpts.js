import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
/**
 * RisaGPTs section fade-in on first view.
 * AgentFlow.ts のアニメーション構成を参考にして実装。
 * セクションが見えたらふわっとフェードイン＋Y軸上昇。
 * CSSで .is-in を使う既存の処理とも共存可能。
 */
document.addEventListener("DOMContentLoaded", () => {
    const sections = Array.from(document.querySelectorAll(".rg-section"));
    if (!sections.length)
        return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sections.forEach((section) => {
        const head = section.querySelector(".rg-head");
        const lead = section.querySelector(".rg-lead");
        const glow = section.querySelector(".rg-glow");
        // アニメーション対象を抽出（なければセクション全体）
        const candidates = section.querySelectorAll([
            "[data-fade]",
            ".rg-head",
            ".rg-lead",
            ".rg-hero",
            ".rg-media",
            ".rg-copy > *",
            ".rg-grid > *",
            ".rg-row > *",
            ".rg-col > *",
            ".rg-card",
            ".rg-item",
            "img",
            "p",
            "h1,h2,h3,h4,h5"
        ].join(","));
        const targets = candidates.length
            ? Array.from(candidates).filter((el) => el.offsetParent !== null || el === section)
            : [section];
        // モーション削減環境では即時表示
        if (prefersReduced) {
            section.classList.add("is-in");
            gsap.set(targets, { opacity: 1, y: 0, clearProps: "all" });
            return;
        }
        // 初期状態
        gsap.set(targets, { opacity: 0, y: 24, willChange: "transform,opacity" });
        if (glow)
            gsap.set(glow, { opacity: 0 });
        // タイムライン
        const tl = gsap.timeline({
            paused: true,
            defaults: { ease: "power3.out" }
        });
        tl.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: { each: 0.08, from: 0 }
        }, 0);
        if (glow) {
            tl.to(glow, { opacity: 1, duration: 0.6 }, 0.15);
        }
        // ScrollTriggerで再生
        ScrollTrigger.create({
            trigger: section,
            start: "top 75%",
            once: true,
            onEnter: () => {
                section.classList.add("is-in");
                tl.play(0);
            }
        });
        // 既存のCSS連動用 IntersectionObserver
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.target !== section)
                    return;
                if (e.isIntersecting)
                    section.classList.add("is-in");
                else
                    section.classList.remove("is-in");
            });
        }, { threshold: 0.2 });
        io.observe(section);
    });
});
