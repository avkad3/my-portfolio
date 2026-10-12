/**
 * Browser port of the ASCII Lab rendering pipeline:
 * luminance → adjustments → (dither) → glyph mapping, with optional per-cell colour.
 */
export type AsciiMode = "density" | "blocks" | "binary" | "edge" | "custom";
export type Dither = "none" | "floyd-steinberg" | "atkinson" | "ordered";

export const RAMPS: Record<Exclude<AsciiMode, "custom" | "edge">, string> = {
  density: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: " 01",
};

export type AsciiOptions = {
  cols: number;
  mode: AsciiMode;
  dither: Dither;
  brightness: number; // -1..1
  contrast: number; // 0..3
  gamma: number; // 0.2..3
  invert: boolean;
  color: boolean;
  custom: string;
};

export type AsciiResult = { rows: string[]; colors?: string[][]; cols: number };

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((v) => (v + 0.5) / 16 - 0.5));

/** Sample `source` into a cols×rows grid. Characters are ~2× taller than wide. */
export function sampleGrid(source: CanvasImageSource, srcW: number, srcH: number, cols: number) {
  const rows = Math.max(1, Math.round((srcH / srcW) * cols * 0.5));
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0, cols, rows);
  return ctx.getImageData(0, 0, cols, rows);
}

export function toAscii(img: ImageData, o: AsciiOptions): AsciiResult {
  const { width: w, height: h, data } = img;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    let l = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
    l = (l - 0.5) * o.contrast + 0.5 + o.brightness;
    l = Math.pow(Math.min(1, Math.max(0, l)), 1 / o.gamma);
    lum[i] = o.invert ? 1 - l : l;
  }

  if (o.mode === "edge") return edgeAscii(lum, w, h, img, o);

  const ramp = o.mode === "custom" ? (o.custom.length > 1 ? o.custom : " .#") : RAMPS[o.mode];
  const levels = ramp.length - 1;

  if (o.dither === "floyd-steinberg" || o.dither === "atkinson") {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const old = lum[i];
        const q = Math.round(Math.min(1, Math.max(0, old)) * levels) / levels;
        lum[i] = q;
        const err = old - q;
        const add = (dx: number, dy: number, f: number) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny < h) lum[ny * w + nx] += err * f;
        };
        if (o.dither === "floyd-steinberg") {
          add(1, 0, 7 / 16);
          add(-1, 1, 3 / 16);
          add(0, 1, 5 / 16);
          add(1, 1, 1 / 16);
        } else {
          for (const [dx, dy] of [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]) add(dx, dy, 1 / 8);
        }
      }
    }
  } else if (o.dither === "ordered") {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) lum[y * w + x] += BAYER4[y % 4][x % 4] / levels;
  }

  const rows: string[] = [];
  const colors: string[][] | undefined = o.color ? [] : undefined;
  for (let y = 0; y < h; y++) {
    let row = "";
    const crow: string[] = [];
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const l = Math.min(1, Math.max(0, lum[i]));
      row += ramp[Math.round(l * levels)];
      if (colors) crow.push(`rgb(${data[i * 4]},${data[i * 4 + 1]},${data[i * 4 + 2]})`);
    }
    rows.push(row);
    colors?.push(crow);
  }
  return { rows, colors, cols: w };
}

function edgeAscii(lum: Float32Array, w: number, h: number, img: ImageData, o: AsciiOptions): AsciiResult {
  const rows: string[] = [];
  const colors: string[][] | undefined = o.color ? [] : undefined;
  const at = (x: number, y: number) => lum[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y++) {
    let row = "";
    const crow: string[] = [];
    for (let x = 0; x < w; x++) {
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      const mag = Math.hypot(gx, gy);
      let ch = " ";
      if (mag > 0.35) {
        const a = ((Math.atan2(gy, gx) * 180) / Math.PI + 180) % 180;
        ch = a < 22.5 || a >= 157.5 ? "|" : a < 67.5 ? "/" : a < 112.5 ? "-" : "\\";
      } else if (lum[y * w + x] > 0.7) ch = ".";
      row += ch;
      const i = y * w + x;
      if (colors) crow.push(`rgb(${img.data[i * 4]},${img.data[i * 4 + 1]},${img.data[i * 4 + 2]})`);
    }
    rows.push(row);
    colors?.push(crow);
  }
  return { rows, colors, cols: w };
}
