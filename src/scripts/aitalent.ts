export {};

const stripes = document.querySelectorAll<HTMLElement>(".ai-stripes .stripe");

// 画面外で停止
const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const stripe = entry.target as HTMLElement;
        if (entry.isIntersecting) {
            stripe.classList.remove("paused");
        } else {
            stripe.classList.add("paused");
        }
    });
}, { root: null, threshold: 0.1 });

stripes.forEach(s => io.observe(s));

// SP: タップで一時停止トグル（PCは :hover で止まる）
stripes.forEach((s) => {
    s.addEventListener("click", () => {
        s.classList.toggle("paused");
    });
});
