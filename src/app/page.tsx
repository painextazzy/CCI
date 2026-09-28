import Header from "./components/Header";
import Hero from "./components/Hero";
import Partners from "./components/Partners";
import SummaryBar from "./components/SummaryBar";
import About from "./components/About";
import Services from "./components/Services";
import HowItWorks from "./components/HowItWorks"; 
import OpportunitiesPreview from "./components/OpportunitiesPreview";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
            <SummaryBar />
        <Partners />
    
        <About />
        <Services />
        <HowItWorks /> 
        <OpportunitiesPreview />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}