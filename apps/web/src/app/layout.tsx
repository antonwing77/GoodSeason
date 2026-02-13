import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoodSeason – What\'s best to buy this month?',
  description: 'A location-aware guide showing what produce is in-season locally, with carbon footprint data and water-stress risk indicators. All data cited.',
  keywords: ['seasonal food', 'carbon footprint', 'sustainable eating', 'CO2e', 'food sustainability'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-stone-50 antialiased">
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
