import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Hero 背景：パステル三角片 × スリット光 × 3幕のミニ物語（ループ）
 * Act1: DRIFT（散逸） → Act2: GATHER_OUTLINE/FILL（召喚） → Act3: RELEASE（啓示→解放）
 * - 透明キャンバス。テキストは前面のまま。
 * - PostProcessing不使用（軽量）。
 * - three r150+ 対応（colorSpaceやinstanceColorの扱いに注意）。
 */

export default function HeroCanvas() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current!;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // --------------------------------------
        // 基本セットアップ
        // --------------------------------------
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 4);

        // 視差（ほんの少し）
        let targetRotX = 0;
        let targetRotY = 0;
        const maxTilt = THREE.MathUtils.degToRad(2.0);
        const onMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            targetRotY = nx * maxTilt;
            targetRotX = -ny * maxTilt;
        };
        const onLeave = () => { targetRotX = 0; targetRotY = 0; };
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onLeave);

        // --------------------------------------
        // パレット（ループ毎にローテーション）
        // --------------------------------------
        const PRESETS = [
            { // Risa（ピンク強め）
                name: 'risa',
                tri: ['#FFC8DD', '#FFAFCC', '#FDECEF', '#E4C1F9', '#FFD6F0', '#CDE8FF'],
                slitA: '#FFD6F0', slitB: '#CDEBFF'
            },
            { // Lilia（水色 + ラベンダー）
                name: 'lilia',
                tri: ['#BDE0FE', '#A2D2FF', '#E4C1F9', '#CDE8FF', '#FDECEF', '#E3F2FF'],
                slitA: '#E4C1F9', slitB: '#BDE0FE'
            },
            { // Personal（アクア + ベビーブルー）
                name: 'personal',
                tri: ['#CDE8FF', '#BDE0FE', '#A2D2FF', '#D7F6F2', '#FDECEF', '#EAF6FF'],
                slitA: '#CDE8FF', slitB: '#FFFFFF'
            }
        ] as const;
        let presetIndex = 0;
        let currentPreset = PRESETS[presetIndex];

        // --------------------------------------
        // スリット光（Sprite）
        // --------------------------------------
        function makeStreakTexture(w = 256, h = 896, colorA = '#ffffff', colorB = '#ffffff00') {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            const g = ctx.createLinearGradient(w / 2, 0, w / 2, h);
            g.addColorStop(0.00, colorB);
            g.addColorStop(0.18, colorA);
            g.addColorStop(0.33, colorB);
            g.addColorStop(0.67, colorB);
            g.addColorStop(0.82, colorA);
            g.addColorStop(1.00, colorB);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            const tex = new THREE.CanvasTexture(canvas);
            (tex as any).colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 4;
            return tex;
        }
        const streakGroup = new THREE.Group();
        scene.add(streakGroup);

        function spawnStreaks(preset: typeof PRESETS[number]) {
            streakGroup.clear();
            const tex = makeStreakTexture(256, 896, preset.slitA, `${preset.slitB}00`);
            const COUNT = 6;
            for (let i = 0; i < COUNT; i++) {
                const spr = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: tex,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    opacity: 0.2 + (i % 2 === 0 ? 0.05 : 0.0)
                }));
                spr.position.set(
                    THREE.MathUtils.randFloat(-2.8, 2.8),
                    THREE.MathUtils.randFloat(-1.8, 1.8),
                    THREE.MathUtils.randFloat(-0.8, -0.2)
                );
                spr.scale.set(THREE.MathUtils.randFloat(0.6, 1.1), THREE.MathUtils.randFloat(3.2, 4.8), 1);
                spr.rotation.z = THREE.MathUtils.randFloat(-Math.PI / 12, Math.PI / 12);
                (spr as any)._phase = Math.random() * Math.PI * 2;
                streakGroup.add(spr);
            }
        }
        spawnStreaks(currentPreset);

        // --------------------------------------
        // 三角片（InstancedMesh）
        // --------------------------------------
        const SHARD_COUNT = 360;
        const SIZE_MIN = 0.30;
        const SIZE_MAX = 0.90;

        const baseTri = new THREE.CircleGeometry(1, 3);
        // 少し乱形に
        const posAttr = baseTri.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            posAttr.setXY(i, x * THREE.MathUtils.randFloat(0.9, 1.1), y * THREE.MathUtils.randFloat(0.9, 1.1));
        }
        posAttr.needsUpdate = true;

        const shardMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const shards = new THREE.InstancedMesh(baseTri, shardMat, SHARD_COUNT);
        shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(shards);

        // per-instance color（three r150+）
        const colorArray = new Float32Array(SHARD_COUNT * 3);
        shards.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3, false);

        // 初期散布
        const basePos: THREE.Vector3[] = [];
        const baseRot: THREE.Euler[] = [];
        const baseScale: THREE.Vector3[] = [];
        const dummy = new THREE.Object3D();
        function setPaletteColors(preset: typeof PRESETS[number], lerpFrom?: Float32Array) {
            // palette lerp（必要ならクロスフェード）
            for (let i = 0; i < SHARD_COUNT; i++) {
                const c = new THREE.Color(preset.tri[i % preset.tri.length]);
                if (lerpFrom) {
                    // 直前の色から滑らかに（0.85）
                    const r0 = lerpFrom[i * 3 + 0], g0 = lerpFrom[i * 3 + 1], b0 = lerpFrom[i * 3 + 2];
                    colorArray[i * 3 + 0] = THREE.MathUtils.lerp(r0, c.r, 0.85);
                    colorArray[i * 3 + 1] = THREE.MathUtils.lerp(g0, c.g, 0.85);
                    colorArray[i * 3 + 2] = THREE.MathUtils.lerp(b0, c.b, 0.85);
                } else {
                    colorArray[i * 3 + 0] = c.r;
                    colorArray[i * 3 + 1] = c.g;
                    colorArray[i * 3 + 2] = c.b;
                }
            }
            shards.instanceColor!.needsUpdate = true;
        }

        for (let i = 0; i < SHARD_COUNT; i++) {
            basePos.push(new THREE.Vector3(
                THREE.MathUtils.randFloat(-3.7, 3.7),
                THREE.MathUtils.randFloat(-2.3, 2.3),
                THREE.MathUtils.randFloat(-0.6, 0.6)
            ));
            baseRot.push(new THREE.Euler(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            ));
            const s = THREE.MathUtils.randFloat(SIZE_MIN, SIZE_MAX);
            baseScale.push(new THREE.Vector3(s, s * THREE.MathUtils.randFloat(0.85, 1.15), 1));
        }
        setPaletteColors(currentPreset);

        for (let i = 0; i < SHARD_COUNT; i++) {
            dummy.position.copy(basePos[i]);
            dummy.rotation.copy(baseRot[i]);
            dummy.scale.copy(baseScale[i]);
            dummy.updateMatrix();
            shards.setMatrixAt(i, dummy.matrix);
        }
        shards.instanceMatrix.needsUpdate = true;

        // --------------------------------------
        // 円環ターゲット（輪郭/内部）
        // --------------------------------------
        const OUTLINE_RATIO = 0.4; // 輪郭:内部 = 40:60
        const outlineCount = Math.floor(SHARD_COUNT * OUTLINE_RATIO);
        const fillCount = SHARD_COUNT - outlineCount;

        const targetOutline: THREE.Vector3[] = []; // 外周リング
        const targetFill: THREE.Vector3[] = [];    // 内側充填リング群
        const R_BASE = 1.10;   // 半径
        const THICK = 0.18;    // リング幅（厚み）

        function regenerateRingTargets(radiusScale = 1.0) {
            targetOutline.length = 0;
            targetFill.length = 0;

            const R = R_BASE * radiusScale;
            // 輪郭：均等 + 少しのジッタ
            for (let i = 0; i < outlineCount; i++) {
                const a = (i / outlineCount) * Math.PI * 2;
                const jitter = THREE.MathUtils.randFloatSpread(0.04);
                targetOutline.push(new THREE.Vector3(
                    Math.cos(a) * (R + jitter),
                    Math.sin(a) * (R + jitter),
                    THREE.MathUtils.randFloatSpread(0.04)
                ));
            }
            // 内部：リング幅内でランダム
            for (let i = 0; i < fillCount; i++) {
                const a = Math.random() * Math.PI * 2;
                const r = R + THREE.MathUtils.randFloatSpread(THICK);
                targetFill.push(new THREE.Vector3(
                    Math.cos(a) * r,
                    Math.sin(a) * r,
                    THREE.MathUtils.randFloatSpread(0.06)
                ));
            }
        }
        regenerateRingTargets(1.0);

        // --------------------------------------
        // シンボル（中央に一瞬だけ出す）
        // --------------------------------------
        function makeSymbolTexture(text: string, color = '#ffffff') {
            const w = 256, h = 256;
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '700 80px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
            // 簡素な幾何記号（● / ◆ / ✷ をループで変える）
            ctx.globalAlpha = 0.95;
            ctx.fillText(text, w / 2, h / 2);
            const tex = new THREE.CanvasTexture(canvas);
            (tex as any).colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 4;
            return tex;
        }

        const symbolGroup = new THREE.Group();
        scene.add(symbolGroup);
        const SYMBOLS = ['✷', '◆', '●']; // Risa / Lilia / Personal の順に対応
        let symbolSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: makeSymbolTexture(SYMBOLS[0], '#ffffff'),
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        }));
        symbolSprite.scale.set(0.8, 0.8, 1);
        symbolGroup.add(symbolSprite);

        function updateSymbolForPreset(index: number) {
            const sym = SYMBOLS[index % SYMBOLS.length];
            symbolSprite.material.map = makeSymbolTexture(sym, '#ffffff');
            symbolSprite.material.needsUpdate = true;
            symbolSprite.scale.set(0.8, 0.8, 1);
            symbolSprite.material.opacity = 0.0;
        }

        // --------------------------------------
        // タイムライン・ステート
        // --------------------------------------
        type State = 'DRIFT' | 'GATHER_OUTLINE' | 'FILL_RING' | 'RELEASE';
        let state: State = 'DRIFT';
        let tState = 0; // 現在ステートの経過時間（秒）

        // 時間配分（合計 ~8.8s）
        const T_DRIFT = 2.0;
        const T_GATHER = 1.2;
        const T_FILL = 2.0;
        const T_RELEASE = 3.6;

        // ドリフトパラメータ
        const DRIFT_SPEED = 0.06;
        const DRIFT_STRENGTH = 0.55;

        // イージング
        const easeInPower3 = (t: number) => t * t * t;
        const easeOutPower2 = (t: number) => 1 - (1 - t) * (1 - t);
        const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

        // 各インスタンスに固定の位相
        const phases = new Float32Array(SHARD_COUNT);
        for (let i = 0; i < SHARD_COUNT; i++) phases[i] = Math.random() * Math.PI * 2;

        // --------------------------------------
        // メインループ
        // --------------------------------------
        const clock = new THREE.Clock();
        let rafId = 0;

        const render = () => {
            const dt = clock.getDelta();
            tState += dt;

            // 視差
            scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, targetRotX, 0.08);
            scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, targetRotY, 0.08);

            // ステート遷移
            if (state === 'DRIFT' && tState >= T_DRIFT) {
                state = 'GATHER_OUTLINE';
                tState = 0;
            } else if (state === 'GATHER_OUTLINE' && tState >= T_GATHER) {
                state = 'FILL_RING';
                tState = 0;
            } else if (state === 'FILL_RING' && tState >= T_FILL) {
                state = 'RELEASE';
                tState = 0;
                // シンボル出現（RELEASEの頭で）
                symbolSprite.material.opacity = 0.0;
            } else if (state === 'RELEASE' && tState >= T_RELEASE) {
                // 1ループ終了 → 次プリセットへ
                const prevColors = colorArray.slice(0);
                presetIndex = (presetIndex + 1) % PRESETS.length;
                currentPreset = PRESETS[presetIndex];
                setPaletteColors(currentPreset, prevColors);
                spawnStreaks(currentPreset);
                updateSymbolForPreset(presetIndex);
                regenerateRingTargets(1.0 + THREE.MathUtils.randFloatSpread(0.05)); // 半径に微差
                // ベース散布も少しだけ更新して多様性を
                for (let i = 0; i < SHARD_COUNT; i++) {
                    basePos[i].x = THREE.MathUtils.randFloat(-3.7, 3.7);
                    basePos[i].y = THREE.MathUtils.randFloat(-2.3, 2.3);
                    basePos[i].z = THREE.MathUtils.randFloat(-0.6, 0.6);
                }
                state = 'DRIFT';
                tState = 0;
            }

            // スリット光ゆらぎ
            const tAll = clock.elapsedTime;
            streakGroup.children.forEach((s: any) => {
                const spr = s as THREE.Sprite;
                const ph = (spr as any)._phase as number;
                spr.position.y += Math.sin(tAll * 0.25 + ph) * 0.003;
                spr.rotation.z += Math.sin(tAll * 0.08 + ph) * 0.002;
                const baseOpacity = 0.18;
                spr.material.opacity = baseOpacity + (Math.sin(tAll * 0.5 + ph) * 0.5 + 0.5) * 0.08;
            });

            // シンボル（RELEASEの最初の0.8sだけ現れて消える）
            if (state === 'RELEASE') {
                const u = tState / 0.8;
                if (u < 1) {
                    const fade = Math.sin(Math.PI * clamp01(u)); // 0→1→0
                    symbolSprite.material.opacity = 0.9 * fade;
                    const s = 0.7 + 0.2 * Math.sin(Math.PI * clamp01(u));
                    symbolSprite.scale.set(s, s, 1);
                } else {
                    symbolSprite.material.opacity = 0.0;
                }
            }

            // 破片更新
            for (let i = 0; i < SHARD_COUNT; i++) {
                const bp = basePos[i];
                const br = baseRot[i];
                const bs = baseScale[i];
                const ph = phases[i];

                // ベース：ドリフト（常時）
                const t = tAll;
                const offX = (Math.sin(bp.x * 1.3 + ph + t * DRIFT_SPEED) * 0.6 + Math.cos(bp.y * 1.7 - ph + t * 0.9) * 0.4) * DRIFT_STRENGTH;
                const offY = (Math.sin(bp.y * 1.1 + ph + t * (DRIFT_SPEED * 0.9)) * 0.6 + Math.cos(bp.z * 1.5 + ph * 0.7 + t * 0.7) * 0.4) * DRIFT_STRENGTH * 0.8;
                const offZ = (Math.sin(bp.z * 1.0 + ph + t * 0.7) * 0.6 + Math.cos(bp.x * 0.8 - ph + t * 0.6) * 0.4) * DRIFT_STRENGTH * 0.4;

                let tx = bp.x + offX;
                let ty = bp.y + offY;
                let tz = bp.z + offZ;

                // 集束：輪郭→内部
                if (state === 'GATHER_OUTLINE') {
                    const u = clamp01(tState / T_GATHER);
                    const e = easeInPower3(u);
                    const idx = i % outlineCount;
                    const p = targetOutline[idx];
                    // 大きい破片ほど遅らせる
                    const sizeDelay = THREE.MathUtils.mapLinear(bs.x, SIZE_MIN, SIZE_MAX, 0.15, 0.0);
                    const k = clamp01(e - sizeDelay);
                    tx = THREE.MathUtils.lerp(tx, p.x, k);
                    ty = THREE.MathUtils.lerp(ty, p.y, k);
                    tz = THREE.MathUtils.lerp(tz, p.z, k);
                } else if (state === 'FILL_RING') {
                    const u = clamp01(tState / T_FILL);
                    const e = easeOutPower2(u);
                    // 輪郭以外の片を内側リングへ
                    const idx = i % fillCount;
                    const p = targetFill[idx];
                    const sizeDelay = THREE.MathUtils.mapLinear(bs.x, SIZE_MIN, SIZE_MAX, 0.1, 0.0);
                    const k = clamp01(e - sizeDelay);
                    tx = THREE.MathUtils.lerp(tx, p.x, k);
                    ty = THREE.MathUtils.lerp(ty, p.y, k);
                    tz = THREE.MathUtils.lerp(tz, p.z, k);
                } else if (state === 'RELEASE') {
                    // 円環を保ったまま、半径に微妙な呼吸
                    const idxO = i % outlineCount;
                    const idxF = i % fillCount;
                    const p = (i < outlineCount) ? targetOutline[idxO] : targetFill[idxF];
                    const breathe = 1.0 + Math.sin(tAll * 0.8 + ph) * 0.03;
                    tx = THREE.MathUtils.lerp(tx, p.x * breathe, 0.65);
                    ty = THREE.MathUtils.lerp(ty, p.y * breathe, 0.65);
                    tz = THREE.MathUtils.lerp(tz, p.z, 0.65);
                }

                dummy.position.set(tx, ty, tz);

                // 回転：サイズが大きいほど遅く
                const rotScale = THREE.MathUtils.mapLinear(bs.x, SIZE_MIN, SIZE_MAX, 1.2, 0.5);
                dummy.rotation.set(
                    br.x + 0.08 * 0.016 * rotScale,
                    br.y + 0.06 * 0.016 * rotScale,
                    br.z + 0.04 * 0.016 * rotScale
                );

                // 呼吸スケール
                const breatheS = 1.0 + Math.sin((tAll + ph) * 0.6) * 0.05;
                dummy.scale.set(bs.x * breatheS, bs.y * breatheS, 1);

                dummy.updateMatrix();
                shards.setMatrixAt(i, dummy.matrix);
            }
            shards.instanceMatrix.needsUpdate = true;

            renderer.render(scene, camera);
            rafId = requestAnimationFrame(render);
        };
        render();

        // --------------------------------------
        // リサイズ
        // --------------------------------------
        const onResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(container);

        // --------------------------------------
        // クリーンアップ
        // --------------------------------------
        return () => {
            cancelAnimationFrame(rafId);
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
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            aria-hidden="true"
        />
    );
}
