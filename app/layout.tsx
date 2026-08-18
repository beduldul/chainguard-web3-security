import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ChainGuard | Onchain Transaction Guardian & Security Layer',
  description: 'Web3 transaction security firewall before wallet signature. Simulate token transfers, audit contract risks, detect unlimited approvals, and scan dApps.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-black">
        {/* Background Ambient Glowing Orbs */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed bottom-10 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
