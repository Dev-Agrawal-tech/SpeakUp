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
    <html lang="en" className="h-full antialiased theme-dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let stored = localStorage.getItem('speakup_settings');
                if (stored) {
                  let settings = JSON.parse(stored);
                  
                  // Appearance
                  if (settings.appearance) {
                    if (settings.appearance.theme) {
                      document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-system');
                      document.documentElement.classList.add('theme-' + settings.appearance.theme);
                    }
                    if (settings.appearance.accentColor) {
                      document.documentElement.setAttribute('data-accent', settings.appearance.accentColor);
                    }
                    if (settings.appearance.uiDensity) {
                      document.documentElement.setAttribute('data-density', settings.appearance.uiDensity);
                    }
                    if (settings.appearance.animations === false) {
                      document.documentElement.classList.add('reduce-motion-override');
                    }
                  }
                  
                  // Accessibility
                  if (settings.accessibility) {
                    if (settings.accessibility.reduceMotion) {
                      document.documentElement.classList.add('reduce-motion-override');
                    }
                    if (settings.accessibility.highContrast) {
                      document.documentElement.classList.add('high-contrast');
                    }
                    if (settings.accessibility.fontSize) {
                      document.documentElement.setAttribute('data-font-size', settings.accessibility.fontSize);
                    }
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
