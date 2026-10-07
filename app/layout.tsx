import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpeakUp — Speak with confidence",
  description: "AI communication coaching for real-world conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const root = document.documentElement;
                const stored = localStorage.getItem('speakup_settings');
                const settings = stored ? JSON.parse(stored) : {};
                const appearance = settings.appearance || {};
                const accessibility = settings.accessibility || {};
                const allowedThemes = ['dark', 'light', 'system'];
                const allowedAccents = ['blue', 'purple', 'emerald', 'rose'];
                const allowedDensities = ['compact', 'normal', 'relaxed'];
                const allowedFontSizes = ['small', 'medium', 'large'];
                const theme = allowedThemes.includes(appearance.theme) ? appearance.theme : 'dark';
                const accent = allowedAccents.includes(appearance.accentColor) ? appearance.accentColor : 'blue';
                const density = allowedDensities.includes(appearance.uiDensity) ? appearance.uiDensity : 'normal';
                const fontSize = allowedFontSizes.includes(accessibility.fontSize) ? accessibility.fontSize : 'medium';
                const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
                const applyTheme = () => {
                  root.dataset.theme = theme === 'system' ? (systemTheme.matches ? 'light' : 'dark') : theme;
                  root.dataset.themePreference = theme;
                };
                applyTheme();
                root.dataset.accent = accent;
                root.dataset.density = density;
                root.dataset.fontSize = fontSize;
                root.classList.toggle('high-contrast', accessibility.highContrast === true);
                root.classList.toggle('reduce-motion-override', accessibility.reduceMotion === true || appearance.animations === false);
                systemTheme.addEventListener('change', () => {
                  if (root.dataset.themePreference === 'system') {
                    root.dataset.theme = systemTheme.matches ? 'light' : 'dark';
                  }
                });
              } catch {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
