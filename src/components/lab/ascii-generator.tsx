"use client";

import { Camera, CameraOff, Check, Copy, Download, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sampleGrid, toAscii, type AsciiMode, type AsciiOptions, type AsciiResult, type Dither } from "@/lib/ascii";
import { cn } from "@/lib/cn";

const MODES: AsciiMode[] = ["density", "blocks", "binary", "edge", "custom"];
const DITHERS: Dither[] = ["none", "floyd-steinberg", "atkinson", "ordered"];

/** Procedural sample so the demo works before anything is uploaded. */
function makeSample() {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 400;
  const g = c.getContext("2d")!;
  g.fillStyle = "#050505";
  g.fillRect(0, 0, 640, 400);
  const sphere = g.createRadialGradient(250, 150, 10, 300, 200, 170);
  sphere.addColorStop(0, "#e9fff6");
  sphere.addColorStop(0.35, "#3df2a6");
  sphere.addColorStop(0.75, "#0f5a8a");
  sphere.addColorStop(1, "#050505");
  g.fillStyle = sphere;
  g.beginPath();
  g.arc(300, 200, 165, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(255,255,255,.85)";
  g.lineWidth = 3;
  g.beginPath();
  g.ellipse(300, 200, 250, 52, -0.25, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#fff";
  g.font = "bold 46px monospace";
  g.fillText("A.OS", 470, 360);
  return c;
}

export function AsciiGenerator() {
  const [opts, setOpts] = useState<AsciiOptions>({
    cols: 110,
    mode: "density",
    dither: "floyd-steinberg",
    brightness: 0,
    contrast: 1.15,
    gamma: 1,
    invert: false,
    color: false,
    custom: " .oO@",
  });
  const [out, setOut] = useState<AsciiResult | null>(null);
  const [source, setSource] = useState<{ el: CanvasImageSource; w: number; h: number; name: string } | null>(null);
  const [cam, setCam] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = makeSample();
    setSource({ el: s, w: s.width, h: s.height, name: "sample" });
  }, []);

  const render = useCallback(() => {
    if (!source) return;
    const img = sampleGrid(source.el, source.w, source.h, opts.cols);
    setOut(toAscii(img, opts));
  }, [source, opts]);

  useEffect(() => {
    if (!cam) render();
  }, [render, cam]);

  // Webcam loop
  useEffect(() => {
    if (!cam) return;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      const v = videoRef.current;
      if (v && v.readyState >= 2 && t - last > 66) {
        last = t;
        const img = sampleGrid(v, v.videoWidth, v.videoHeight, opts.cols);
        setOut(toAscii(img, opts));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cam, opts]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const loadFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return setErr("Please choose an image file.");
    setErr(null);
    stopCam();
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setSource({ el: img, w: img.naturalWidth, h: img.naturalHeight, name: file.name });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setErr(null);
      setCam(true);
    } catch {
      setErr("Camera unavailable or permission denied.");
    }
  };
  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCam(false);
  };

  const text = out?.rows.join("\n") ?? "";
  const set = <K extends keyof AsciiOptions>(k: K, v: AsciiOptions[K]) => setOpts((o) => ({ ...o, [k]: v }));
  const fontSize = Math.max(4, Math.min(10, 880 / opts.cols / 0.6));

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-5 font-mono text-[11px]">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            loadFile(e.dataTransfer.files?.[0]);
          }}
          className={cn("rounded-md border border-dashed p-4 text-center transition-colors", drag ? "border-accent bg-accent/5" : "border-line-strong")}
        >
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" id="ascii-file" onChange={(e) => loadFile(e.target.files?.[0])} />
          <label htmlFor="ascii-file" className="flex cursor-pointer flex-col items-center gap-2 text-muted hover:text-fg">
            <Upload size={16} />
            <span>Drop an image or click to upload</span>
            <span className="text-dim">processed locally, never uploaded</span>
          </label>
        </div>
        <button onClick={cam ? stopCam : startCam} className={cn("btn w-full justify-center", cam ? "border-danger/50 text-danger" : "border-line-strong text-fg hover:border-fg")}>
          {cam ? <CameraOff size={13} /> : <Camera size={13} />} {cam ? "Stop webcam" : "Live webcam"}
        </button>
        {err ? <p className="text-danger">{err}</p> : null}

        <fieldset>
          <legend className="mb-2 uppercase tracking-[0.14em] text-dim">Mode</legend>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button key={m} onClick={() => set("mode", m)} className={cn("chip", opts.mode === m && "border-accent/60 text-accent")} aria-pressed={opts.mode === m}>
                {m}
              </button>
            ))}
          </div>
          {opts.mode === "custom" ? (
            <input
              value={opts.custom}
              onChange={(e) => set("custom", e.target.value)}
              className="mt-2 w-full rounded border border-line bg-surface px-2 py-1.5 text-fg focus:outline-none"
              aria-label="Custom character ramp, dark to light"
            />
          ) : null}
        </fieldset>

        <fieldset disabled={opts.mode === "edge"} className="disabled:opacity-40">
          <legend className="mb-2 uppercase tracking-[0.14em] text-dim">Dithering</legend>
          <div className="flex flex-wrap gap-1.5">
            {DITHERS.map((d) => (
              <button key={d} onClick={() => set("dither", d)} className={cn("chip", opts.dither === d && "border-accent/60 text-accent")} aria-pressed={opts.dither === d}>
                {d}
              </button>
            ))}
          </div>
        </fieldset>

        {(
          [
            ["cols", "Columns", 40, 180, 2],
            ["brightness", "Brightness", -0.5, 0.5, 0.02],
            ["contrast", "Contrast", 0.3, 2.5, 0.05],
            ["gamma", "Gamma", 0.3, 2.5, 0.05],
          ] as const
        ).map(([k, label, min, max, step]) => (
          <div key={k}>
            <label htmlFor={`a-${k}`} className="flex justify-between text-muted">
              <span className="uppercase tracking-[0.14em]">{label}</span>
              <span className="text-fg">{(opts[k] as number).toFixed(k === "cols" ? 0 : 2)}</span>
            </label>
            <input id={`a-${k}`} type="range" min={min} max={max} step={step} value={opts[k] as number} onChange={(e) => set(k, +e.target.value)} className="mt-1.5 w-full accent-[#3DF2A6]" />
          </div>
        ))}

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" checked={opts.invert} onChange={(e) => set("invert", e.target.checked)} className="accent-[#3DF2A6]" /> invert
          </label>
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" checked={opts.color} onChange={(e) => set("color", e.target.checked)} className="accent-[#3DF2A6]" /> colour
          </label>
        </div>
      </div>

      <div className="panel flex min-w-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px] text-muted">
          <span className="truncate">
            {cam ? (
              <span className="text-danger">● LIVE</span>
            ) : (
              source?.name
            )}{" "}
            · {out ? `${out.cols}×${out.rows.length}` : "…"} · {opts.mode}
            {opts.mode !== "edge" && opts.dither !== "none" ? ` · ${opts.dither}` : ""}
          </span>
          <span className="flex gap-1">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded p-1.5 hover:text-fg"
              aria-label="Copy ASCII to clipboard"
            >
              {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
            </button>
            <button
              onClick={() => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
                a.download = "ascii-lab.txt";
                a.click();
                URL.revokeObjectURL(a.href);
              }}
              className="rounded p-1.5 hover:text-fg"
              aria-label="Download as .txt"
            >
              <Download size={14} />
            </button>
          </span>
        </div>
        <div className="grid flex-1 place-items-center overflow-auto bg-black p-3">
          <pre className="font-mono leading-[1.0] text-fg/90" style={{ fontSize: `${fontSize}px`, letterSpacing: 0 }} aria-label="ASCII output" role="img">
            {out?.colors
              ? out.rows.map((row, y) => (
                  <div key={y}>
                    {Array.from(row).map((ch, x) => (
                      <span key={x} style={{ color: out.colors![y][x] }}>
                        {ch}
                      </span>
                    ))}
                  </div>
                ))
              : text}
          </pre>
        </div>
        <video ref={videoRef} className="hidden" playsInline muted />
      </div>
    </div>
  );
}
