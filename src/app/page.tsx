import NavigationBar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/HeroSection';
import PracticeAreasSection from '@/components/ui/PracticeAreasSection';
import TestimonialsSection from '@/components/ui/TestimonialsSection';
import AboutSection from '@/components/ui/AboutSection';
import ContactSection from '@/components/ui/ContactSection';

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <NavigationBar />
      <HeroSection />
      <PracticeAreasSection />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  );
}