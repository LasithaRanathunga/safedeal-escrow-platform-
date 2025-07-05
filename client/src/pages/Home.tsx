import Header from "@/containers/Header";
import HeroSection from "@/containers/HeroSection";
import Features from "@/containers/Features";
import HowItWorks from "@/containers/HowItWorks";
import Footer from "@/containers/footer";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <Features />
      <HowItWorks />
      <Footer />
    </>
  );
}
