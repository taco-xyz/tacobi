import { state } from "@/context/myTacoBIContext";
import { TacoBIProvider } from "@/context/TacoBIContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TacoBIProvider state={state}>{children}</TacoBIProvider>
      </body>
    </html>
  );
}
