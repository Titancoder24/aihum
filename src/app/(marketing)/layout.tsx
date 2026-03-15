import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-dark text-gray-100">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
