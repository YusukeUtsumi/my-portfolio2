document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector(".rg-section");
    if (!section) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) section.classList.add("is-in");
            else section.classList.remove("is-in");
        });
    }, { threshold: 0.2 });

    io.observe(section);
});
