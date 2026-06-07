import type { IThemeSettings } from "@/types/theme";

export const THEME_PRESETS: Record<
  string,
  { label: string; theme: IThemeSettings }
> = {
  "scholar-blue": {
    label: "Scholar Blue",
    theme: {
      primary: "217 91% 55%",
      primaryForeground: "0 0% 100%",
      brand: "217 91% 55%",
      ring: "217 91% 55%",
      radius: "0.5rem",
      preset: "scholar-blue",
    },
  },
  "campus-green": {
    label: "Campus Green",
    theme: {
      primary: "142 76% 36%",
      primaryForeground: "0 0% 100%",
      brand: "142 76% 36%",
      ring: "142 76% 36%",
      radius: "0.5rem",
      preset: "campus-green",
    },
  },
  "academic-purple": {
    label: "Academic Purple",
    theme: {
      primary: "262 83% 58%",
      primaryForeground: "0 0% 100%",
      brand: "262 83% 58%",
      ring: "262 83% 58%",
      radius: "0.625rem",
      preset: "academic-purple",
    },
  },
  "engineering-orange": {
    label: "Engineering Orange",
    theme: {
      primary: "24 95% 53%",
      primaryForeground: "0 0% 100%",
      brand: "24 95% 53%",
      ring: "24 95% 53%",
      radius: "0.5rem",
      preset: "engineering-orange",
    },
  },
  "classic-navy": {
    label: "Classic Navy",
    theme: {
      primary: "222 47% 35%",
      primaryForeground: "0 0% 100%",
      brand: "222 47% 35%",
      ring: "222 47% 35%",
      radius: "0.375rem",
      preset: "classic-navy",
    },
  },
  "rose-student": {
    label: "Rose Student",
    theme: {
      primary: "346 77% 50%",
      primaryForeground: "0 0% 100%",
      brand: "346 77% 50%",
      ring: "346 77% 50%",
      radius: "0.75rem",
      preset: "rose-student",
    },
  },
};

export const DEFAULT_THEME = THEME_PRESETS["scholar-blue"].theme;

function adjustPrimaryForDark(primary: string): string {
  const parts = primary.split(" ");
  if (parts.length !== 3) return primary;
  const [h, s] = parts;
  return `${h} ${s} 58%`;
}

export function themeToCssVars(theme: IThemeSettings): string {
  return `:root {
  --primary: ${theme.primary};
  --primary-foreground: ${theme.primaryForeground};
  --brand: ${theme.brand};
  --ring: ${theme.ring};
  --radius: ${theme.radius};
}
.dark {
  --primary: ${adjustPrimaryForDark(theme.primary)};
  --ring: ${adjustPrimaryForDark(theme.primary)};
}`;
}

export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return DEFAULT_THEME.primary;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function hslToHex(hsl: string): string {
  const parts = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!parts) return "#3b82f6";

  const h = parseInt(parts[1]) / 360;
  const s = parseInt(parts[2]) / 100;
  const l = parseInt(parts[3]) / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
