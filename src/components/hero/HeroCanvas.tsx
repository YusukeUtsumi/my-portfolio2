import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
    EffectComposer,
    RenderPass,
    EffectPass,
    BloomEffect,
    GodRaysEffect
} from 'postprocessing';

/**
 * Hero 背景：抽象派手め
 *  - ネビュラ・フォグ（シェーダ平面 + カラーノイズ）
 *  - ゴッドレイ（光条：postprocessing / GodRaysEffect）
 *  - 微粒子ドリフト（遠景の小粒 Additive）
 *  - PCのみ（SPはHeroテキスト優先。reduced-motionにも対応）
 *
 * MODE を切り替えると色プリセットが反映されます。
 *   'risa'    : 薄い金 × 乳白
 *   'lilia'   : 深い紺 × アメジスト
 *   'personal': ブルーグリーン（SilentGuard / AgentFlow 共通）
 */
const MODE: 'risa' | 'lilia' | 'personal' = 'lilia';

const PRESETS = {
    risa: {
        fogA: new THREE.Color('#F6E9C9'),   // 乳白
        fogB: new THREE.Color('#C9A646'),   // 薄い金
        god: new THREE.Color('#FFF4CC'),
        particleA: new THREE.Color('#FFF1D6'),
        particleB: new THREE.Color('#EACE6A')
    },
    lilia: {
        fogA: new THREE.Color('#0E1035'),   // 深い紺
        fogB: new THREE.Color('#5D2E8C'),   // アメジスト
        god: new THREE.Color('#B19CFF'),
        particleA: new THREE.Color('#B9A3FF'),
        particleB: new THREE.Color('#5CB8B2')
    },
    personal: {
        fogA: new THREE.Color('#041F2A'),   // 濃紺
        fogB: new THREE.Color('#0D4D4A'),   // ティール
        god: new THREE.Color('#8FD3E8'),
        particleA: new THREE.Color('#7FD9FF'),
        particleB: new THREE.Color('#00BFA5')
    }
} as const;

const VERT = /* glsl */`
    precision highp float;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

// 2D ノイズ（simplex 簡易版）＋ 緩やかな時間変化で雲状グラデ
const FRAG = /* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2  uResolution;
    uniform vec3  uColorA;
    uniform vec3  uColorB;
    uniform float uGrain;

    // hash / noise（簡易）
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    float fbm(vec2 p){
        float v = 0.0;
        float a = 0.5;
        for(int i=0;i<5;i++){
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        // 中央がやや明るくなるレンズ風
        vec2 uv = vUv - 0.5;
        float vignette = smoothstep(0.95, 0.2, length(uv));

        // 時間でゆっくり流れる雲
        float t = uTime * 0.03;
        vec2 p = (vUv * vec2(uResolution.x / uResolution.y, 1.0)) * 1.5;
        float n  = fbm(p + t);
        float n2 = fbm((p - t) * 0.6 + 10.0);

        // 2色間をノイズでミックス
        vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.85, n * 0.75 + n2 * 0.25));

        // 軽い粒状感
        float grain = (hash(vUv * uResolution.xy + uTime) - 0.5) * uGrain;
        col += grain;

        // 中央の持ち上げ + 外周の落ち
        col *= vignette * 1.08;

        gl_FragColor = vec4(col, 1.0);
    }
`;

export default function HeroCanvas() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current!;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const reducedMotion = typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.autoClear = false; // composerが管理
        container.appendChild(renderer.domElement);

        // Scene / Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 4);

        // --------------------------------------------------
        // 1) ネビュラ・フォグ（フルスクリーン四角形にシェーダ）
        // --------------------------------------------------
        const quadGeo = new THREE.PlaneGeometry(2, 2);
        const preset = PRESETS[MODE];
        const nebulaMat = new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(width, height) },
                uColorA: { value: preset.fogA },
                uColorB: { value: preset.fogB },
                uGrain: { value: 0.06 }
            },
            depthWrite: false,
            depthTest: false
        });
        const nebula = new THREE.Mesh(quadGeo, nebulaMat);
        nebula.frustumCulled = false;

        // ネビュラ専用の背景シーン & orthographic camera
        const bgScene = new THREE.Scene();
        const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        bgScene.add(nebula);

        // --------------------------------------------------
        // 2) 微粒子ドリフト（遠景 Points）
        // --------------------------------------------------
        const particleCount = 2400;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const colorA = new THREE.Color(preset.particleA);
        const colorB = new THREE.Color(preset.particleB);
        for (let i = 0; i < particleCount; i++) {
            // 遠景に散布（薄い球殻）
            const r = 4.5 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(THREE.MathUtils.randFloatSpread(2)); // 0..PI
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            positions[i * 3 + 0] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const c = colorA.clone().lerp(colorB, Math.random());
            colors[i * 3 + 0] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const pMat = new THREE.PointsMaterial({
            size: 0.01,
            vertexColors: true,
            transparent: true,
            opacity: 0.28,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(pGeo, pMat);
        scene.add(particles);

        // スクロールで密度（=不透明度）を10〜20%だけ変化
        const handleScroll = () => {
            const y = window.scrollY || 0;
            const vh = window.innerHeight || 1;
            const n = THREE.MathUtils.clamp(y / (vh * 1.2), 0, 1); // 0..1
            const base = 0.22;
            const delta = 0.10; // 最大 +0.10
            pMat.opacity = base + n * delta;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        // --------------------------------------------------
        // 3) ゴッドレイ（上部の光源から光条）
        // --------------------------------------------------
        // 光源となるメッシュ（薄い円盤を上部に）
        const sun = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 32, 32),
            new THREE.MeshBasicMaterial({ color: preset.god })
        );
        sun.position.set(0, 1.2, -1.2);
        scene.add(sun);

        // ライト（視覚補助）
        const hemi = new THREE.HemisphereLight(0xffffff, preset.fogA, 0.6);
        scene.add(hemi);

        // ポストエフェクト
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        // Bloom（にじみ過ぎ注意。threshold 高めで上品に）
        const bloom = new BloomEffect({
            intensity: MODE === 'lilia' ? 1.15 : 1.0,
            luminanceThreshold: 0.9,
            luminanceSmoothing: 0.2
        });

        // God Rays
        const godrays = new GodRaysEffect(camera, sun, {
            density: 0.9,
            decay: 0.93,
            weight: 0.6,
            samples: 60,
            clampMax: 1.0
        });

        const effectPass = new EffectPass(camera, bloom, godrays);
        effectPass.renderToScreen = true;
        composer.addPass(effectPass);

        // --------------------------------------------------
        // 4) パララックス（視差に連動して角度微変化）
        // --------------------------------------------------
        let targetRotX = 0;
        let targetRotY = 0;
        const maxTilt = THREE.MathUtils.degToRad(2.5);

        const onMouseMove = (e: MouseEvent) => {
            const nx = (e.clientX / width) * 2 - 1;
            const ny = (e.clientY / height) * 2 - 1;
            targetRotY = nx * maxTilt;
            targetRotX = -ny * maxTilt;
        };
        const onLeave = () => {
            targetRotX = 0;
            targetRotY = 0;
        };
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onLeave);

        // --------------------------------------------------
        // 5) ループ
        // --------------------------------------------------
        let rafId = 0;
        let t = 0;
        const clock = new THREE.Clock();

        const render = () => {
            const dt = clock.getDelta();
            if (!reducedMotion) {
                t += dt;
                nebulaMat.uniforms.uTime.value = t;
                // 光源をほんの少しだけ揺らす（視差に連動）
                sun.position.x = THREE.MathUtils.lerp(sun.position.x, targetRotY * 1.2, 0.05);
                sun.position.y = THREE.MathUtils.lerp(sun.position.y, 1.2 + targetRotX * 1.2, 0.05);
                // 粒子をゆっくり回転（遠景の漂い）
                particles.rotation.y += 0.002 * (MODE === 'lilia' ? 1.1 : 1.0);
                particles.rotation.x += 0.0008;
            }
            // カメラの傾き（慣性）
            const lerp = 0.08;
            scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, targetRotX, lerp);
            scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, targetRotY, lerp);

            // 背景 → 前景 + ポスト
            renderer.clear();
            renderer.render(bgScene, bgCamera);
            composer.render();

            rafId = requestAnimationFrame(render);
        };
        render();

        // --------------------------------------------------
        // 6) リサイズ
        // --------------------------------------------------
        const onResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(w, h);
            composer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            nebulaMat.uniforms.uResolution.value.set(w, h);
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(container);

        // --------------------------------------------------
        // 7) クリーンアップ
        // --------------------------------------------------
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', handleScroll);
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseleave', onLeave);
            ro.disconnect();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none' // クリックはテキスト側へ
            }}
            aria-hidden="true"
        />
    );
}
