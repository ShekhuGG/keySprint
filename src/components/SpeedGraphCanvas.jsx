import React, { useEffect, useRef } from "react";

/*
Props:
 - getCurrentWpm: () => number
 - startTime: number | null (ms since epoch)
 - running: boolean
 - duration: seconds (default 60)
*/

export default function SpeedGraphCanvas({
    getCurrentWpm,
    startTime,
    running,
    duration = 60,
}) {
    const canvasRef = useRef(null);
    const frameRef = useRef(null);
    const pointsRef = useRef([]); // {t, wpm}
    const startPerfRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Resize for devicePixelRatio
        const resize = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        // Reset points on restart
        pointsRef.current = [];
        startPerfRef.current = startTime
            ? performance.now() - (Date.now() - startTime)
            : null;

        // Padding constants
        const leftPad = 48;
        const bottomPad = 32;
        const topPad = 24;
        const rightPad = 12;

        function drawAxes() {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            // background
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, w, h);

            // Y axis labels
            ctx.fillStyle = "#94A3B8";
            ctx.font = "12px Inter, Arial";
            ctx.fillText("200", 6, topPad + 6);
            ctx.fillText(
                "100",
                6,
                topPad + (h - topPad - bottomPad) / 2 + 6
            );
            ctx.fillText("0", 6, h - bottomPad + 6);

            // axes lines
            ctx.strokeStyle = "#CBD5E1";
            ctx.lineWidth = 1;
            ctx.beginPath();
            // vertical Y
            ctx.moveTo(leftPad - 8, topPad);
            ctx.lineTo(leftPad - 8, h - bottomPad);
            // horizontal X
            ctx.moveTo(leftPad - 8, h - bottomPad);
            ctx.lineTo(w - rightPad, h - bottomPad);
            ctx.stroke();
        }

        const drawFrame = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;

            ctx.clearRect(0, 0, w, h);
            drawAxes();

            if (!running) return;

            const nowPerf = performance.now();
            if (!startPerfRef.current) startPerfRef.current = nowPerf;
            const elapsed = (nowPerf - startPerfRef.current) / 1000;

            // Current WPM
            let wpm = getCurrentWpm();
            if (!isFinite(wpm) || wpm < 0) wpm = 0;
            const clamped = Math.max(0, Math.min(200, Math.round(wpm)));

            // Record points
            pointsRef.current.push({ t: elapsed, wpm: clamped });
            pointsRef.current = pointsRef.current.filter(
                (p) => p.t >= elapsed - duration
            );

            const plotW = w - leftPad - rightPad;
            const plotH = h - topPad - bottomPad;
            const scaleX = (t) => leftPad + (t / duration) * plotW;
            const scaleY = (v) => topPad + (plotH - (v / 200) * plotH);

            // grid lines
            ctx.strokeStyle = "#E6EEF8";
            ctx.lineWidth = 1;
            const yTicks = [0, 50, 100, 150, 200];
            ctx.beginPath();
            yTicks.forEach((tick) => {
                const y = scaleY(tick);
                ctx.moveTo(leftPad - 8, y);
                ctx.lineTo(w - rightPad, y);
            });
            ctx.stroke();

            // main WPM line
            ctx.strokeStyle = "#6366F1";
            ctx.lineWidth = 2;
            ctx.beginPath();
            let started = false;
            pointsRef.current.forEach((p) => {
                const x = scaleX(Math.min(p.t, duration));
                const y = scaleY(p.wpm);
                if (!started) {
                    ctx.moveTo(x, y);
                    started = true;
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();

            // vertical red cursor
            const cursorX = Math.min(scaleX(elapsed), w - rightPad);
            ctx.save();
            ctx.strokeStyle = "#EF4444";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(cursorX, topPad);
            ctx.lineTo(cursorX, h - bottomPad);
            ctx.stroke();
            ctx.restore();

            // label box above the line
            ctx.save();
            ctx.font = "12px Inter, Arial";
            const label = `${Math.round(wpm)} WPM`;
            const textW = ctx.measureText(label).width;
            const boxW = textW + 12;
            const boxH = 18;
            let labelX = cursorX + 8;
            if (labelX + boxW > w - rightPad) labelX = cursorX - boxW - 8;
            const labelY = topPad + 4;

            ctx.fillStyle = "#EF4444";
            ctx.fillRect(labelX - 6, labelY - 16, boxW, boxH);
            ctx.fillStyle = "#fff";
            ctx.fillText(label, labelX, labelY - 3);
            ctx.restore();

            // continue until test ends
            if (elapsed < duration) {
                frameRef.current = requestAnimationFrame(drawFrame);
            }
        };

        if (running) {
            frameRef.current = requestAnimationFrame(drawFrame);
        } else {
            drawAxes();
        }

        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener("resize", resize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running, startTime, getCurrentWpm, duration]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: "100%",
                height: 350,
                borderRadius: 10,
                background: "#fff",
                boxShadow: "0 6px 18px rgba(16,24,40,0.04)",
            }}
        />
    );
}
