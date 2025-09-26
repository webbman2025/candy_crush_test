import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Noto_Sans_TC, Montserrat } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@theme";
import ClientModalProvider from "@components/providers/ClientModalProvider";
import "@styles/global.scss";
import "@styles/reset.scss";
import "@styles/reset-button.scss";

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const notoSansTC = Noto_Sans_TC({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-tc",
});

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSansTC.variable} ${montserrat.variable}`}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <ClientModalProvider>{children}</ClientModalProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
