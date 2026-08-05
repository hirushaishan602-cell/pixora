import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Portfolio from "../components/Portfolio";
import About from "../components/About";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import WhatsApp from "../components/Whatsapp";
import ScrollTop from "../components/ScrollTop";
import Loader from "../components/Loader";

export default function Home() {
  return (
    <>
      <Loader />
      <Navbar />
      <Hero />
      <Services />
      <Portfolio />
      <About />
      <Stats />
      <Testimonials />
      <Contact />
      <Footer />
      <WhatsApp />
      <ScrollTop />
    </>
  );
}
