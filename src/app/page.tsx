import Header from "./components/Header";
import Hero from "./components/Hero";
import SummaryBar from "./components/SummaryBar";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks"; 
import Services from "./components/Services";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SummaryBar />
        
        
        <Services />
               <HowItWorks />  
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}