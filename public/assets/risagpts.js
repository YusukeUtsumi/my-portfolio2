// GSAP（CDN）
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

// RisaGPTs：右パネル → テキストの順で入場（スクロール連動による移動は無し）
document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector("#risagpts");
    if (!section) return;

    const head  = section.querySelector(".rg-head");    // テキスト側
    const panel = section.querySelector(".rg-frame");   // 右側の画像パネル（※ここは動かさない）
    const glow  = section.querySelector(".rg-glow");    // 任意のグロー

    // 初期状態（AgentFlowと同じ）
    gsap.set([head, panel], { opacity: 0, y: 24 });
    if (glow) gsap.set(glow, { opacity: 0 });

    // タイムラインをScrollTrigger直付けにして、発火を安定化
    const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
            trigger: section,
            start: "top 72%",
            once: true
        }
    });

    // 画像（パネル） → テキスト の順で入場
    tl.to(panel, { opacity: 1, y: 0, duration: 0.6 })
      .to(head,  { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");
    if (glow) tl.to(glow, { opacity: 0.5, duration: 0.6 }, 0.15);

    // ★ 画像読み込み後にリフレッシュ（遅延ロード対策）
    const img = panel ? panel.querySelector("img") : null;
    if (img) {
        if (img.complete) {
            // すでに読み込み済みでもリフレッシュ
            ScrollTrigger.refresh();
        } else {
            img.addEventListener("load", () => {
                // レイアウトが安定してから少し待ってリフレッシュ
                requestAnimationFrame(() => ScrollTrigger.refresh());
            }, { once: true });
        }
    }

    // ★ ページ全リソース読了後にもリフレッシュ（フォント/画像で高さが変わる場合の保険）
    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
    });

    // ★ スクロール連動の“移動”は全て無効化
    //    以前の pin/scrub を使ったパネル固定・移動は付けない
    //    （glow だけは見た目強調のため残す場合は、下のブロックでスクラブ可）

    // （任意）PCのみ：グローの微スクラブは残したい場合だけ有効化
    // ScrollTrigger.matchMedia({
    //     "(min-width: 1024px)": function () {
    //         if (glow) {
    //             gsap.to(glow, {
    //                 opacity: 0.5,
    //                 scrollTrigger: {
    //                     trigger: section,
    //                     start: "top center",
    //                     end: "+=80%",
    //                     scrub: 0.5
    //                 }
    //             });
    //         }
    //     }
    // });
});
