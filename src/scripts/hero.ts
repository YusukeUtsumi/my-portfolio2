import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
export {};

const hero = document.querySelector('#hero') as HTMLElement | null;
if (!hero) {
    console.warn('[hero] section not found');
} else {
    const flare = hero.querySelector('.hero-flare') as HTMLElement | null;
    const risaGlow = hero.querySelector('.risa-glow') as HTMLElement | null;

    // Risa グロー：入場時にフェード
    if (risaGlow) {
        gsap.fromTo(
            risaGlow,
            { opacity: 0 },
            {
                opacity: 0.35,
                duration: 1.2,
                ease: 'power2.out',
                scrollTrigger: { trigger: hero, start: 'top 80%', once: true }
            }
        );
    }

    // 紫フレア：常時ゆっくり往復
    if (flare) {
        gsap.set(flare, { xPercent: -10, yPercent: -2, rotate: 8 });
        gsap.to(flare, {
            xPercent: 10,
            yPercent: 4,
            rotate: 12,
            duration: 18,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });

        // PC時はスクロールでほんのり強調
        ScrollTrigger.matchMedia({
            '(min-width: 960px)': () => {
                gsap.to(flare, {
                    opacity: 0.5,
                    scrollTrigger: {
                        trigger: hero,
                        start: 'top top',
                        end: '+=80%',
                        scrub: 0.4
                    }
                });
            }
        });
    } else {
        console.warn('[hero] .hero-flare not found');
    }
}
