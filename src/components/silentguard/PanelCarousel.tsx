import React, { useEffect, useRef, useState } from "react";

export type Slide = { src: string; caption?: string };

type Props = {
    slides: Slide[];
    intervalMs?: number;
};

export default function PanelCarousel({ slides, intervalMs = 3600 }: Props) {
    const [index, setIndex] = useState(0);
    const timerRef = useRef<number | null>(null);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const tick = () => setIndex((i) => (i + 1) % slides.length);
        timerRef.current = window.setInterval(tick, intervalMs);
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [slides.length, intervalMs]);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        Array.from(wrap.children).forEach((child, i) => {
            (child as HTMLElement).style.opacity = i === index ? "1" : "0";
            (child as HTMLElement).style.zIndex = i === index ? "2" : "1";
        });
    }, [index]);

    return (
        <div className="sg-carousel" ref={wrapRef}>
            {slides.map((s, i) => (
                <figure className="sg-slide" key={i} aria-hidden={i !== index}>
                    <img
                        loading="lazy"
                        decoding="async"
                        src={s.src}
                        alt={s.caption || `screen ${i + 1}`}
                    />
                    {s.caption && <figcaption>{s.caption}</figcaption>}
                </figure>
            ))}
            <div className="dots" role="tablist" aria-label="SilentGuard screens">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        role="tab"
                        aria-selected={i === index}
                        aria-controls={`sg-slide-${i}`}
                        onClick={() => setIndex(i)}
                        className={i === index ? "on" : ""}
                        title={`画面 ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
