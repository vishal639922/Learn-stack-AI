"use client";

import { useState, useEffect } from "react";
import { Palette, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { THEME_PRESETS, hexToHsl, hslToHex } from "@/lib/site-theme-presets";
import type { IThemeSettings } from "@/types/theme";

export function ThemeSettings() {
  const [theme, setTheme] = useState<IThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/theme")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTheme(data.data);
        setLoading(false);
      });
  }, []);

  const applyPreview = (t: IThemeSettings) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", t.primary);
    root.style.setProperty("--primary-foreground", t.primaryForeground);
    root.style.setProperty("--brand", t.brand);
    root.style.setProperty("--ring", t.ring);
    root.style.setProperty("--radius", t.radius);
  };

  const handlePreset = (presetKey: string) => {
    const preset = THEME_PRESETS[presetKey];
    if (!preset || !theme) return;
    const next = { ...preset.theme };
    setTheme(next);
    applyPreview(next);
  };

  const handleColorChange = (hex: string) => {
    if (!theme) return;
    const hsl = hexToHsl(hex);
    const next = {
      ...theme,
      primary: hsl,
      brand: hsl,
      ring: hsl,
      preset: "custom",
    };
    setTheme(next);
    applyPreview(next);
  };

  const handleRadiusChange = (radius: string) => {
    if (!theme) return;
    const next = { ...theme, radius, preset: "custom" };
    setTheme(next);
    applyPreview(next);
  };

  const handleSave = async () => {
    if (!theme) return;
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      const data = await res.json();
      if (data.success) {
        setTheme(data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.error || "Theme save fail ho gaya");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultTheme = THEME_PRESETS["scholar-blue"].theme;
    setTheme(defaultTheme);
    applyPreview(defaultTheme);
  };

  if (loading || !theme) {
    return <p className="text-muted-foreground text-center py-8">Theme load ho raha hai...</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" /> Color Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Professional student website themes — ek click mein apply karo
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(THEME_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePreset(key)}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                  theme.preset === key ? "border-primary ring-2 ring-primary/20" : ""
                }`}
              >
                <div
                  className="w-full h-10 rounded-lg mb-2"
                  style={{ background: `hsl(${preset.theme.primary})` }}
                />
                <p className="font-medium text-sm">{preset.label}</p>
                {theme.preset === key && (
                  <span className="text-xs text-primary flex items-center gap-1 mt-1">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Brand Color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hslToHex(theme.primary)}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-16 h-16 rounded-lg border cursor-pointer"
            />
            <div>
              <Label className="text-sm">Primary Color</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Buttons, links, accents — poori site par apply hoga
              </p>
              <p className="text-xs font-mono mt-1">hsl({theme.primary})</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <select
              value={theme.radius}
              onChange={(e) => handleRadiusChange(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm max-w-xs"
            >
              <option value="0.25rem">Sharp (0.25rem)</option>
              <option value="0.5rem">Default (0.5rem)</option>
              <option value="0.625rem">Rounded (0.625rem)</option>
              <option value="0.75rem">Soft (0.75rem)</option>
              <option value="1rem">Pill (1rem)</option>
            </select>
          </div>

          <div className="p-6 rounded-xl border bg-muted/20 space-y-3">
            <p className="text-sm font-medium">Live Preview</p>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Primary Button</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <span className="text-primary font-medium text-sm self-center">Primary Link</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saved ? <Check className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
              {saving ? "Save ho raha hai..." : saved ? "Saved!" : "Theme Save Karo"}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
