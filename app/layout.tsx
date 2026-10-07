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
                const settings = JSON.parse(localStorage.getItem('speakup_settings') || '{}');
                const appearance = settings.appearance || {};
                const accessibility = settings.accessibility || {};
                const theme = ['dark', 'light', 'system'].includes(appearance.theme) ? appearance.theme : 'dark';
                const media = window.matchMedia('(prefers-color-scheme: light)');
                const applyTheme = () => {
                  root.dataset.theme = theme === 'system' ? (media.matches ? 'light' : 'dark') : theme;
                  root.dataset.themePreference = theme;
                };
                applyTheme();
                root.dataset.accent = ['blue', 'purple', 'emerald', 'rose'].includes(appearance.accentColor) ? appearance.accentColor : 'blue';
                root.dataset.density = ['compact', 'normal', 'relaxed'].includes(appearance.uiDensity) ? appearance.uiDensity : 'normal';
                root.dataset.fontSize = ['small', 'medium', 'large'].includes(accessibility.fontSize) ? accessibility.fontSize : 'medium';
                root.classList.toggle('high-contrast', accessibility.highContrast === true);
                root.classList.toggle('reduce-motion-override', accessibility.reduceMotion === true || appearance.animations === false);
                media.addEventListener('change', () => { if (root.dataset.themePreference === 'system') root.dataset.theme = media.matches ? 'light' : 'dark'; });
              } catch {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
