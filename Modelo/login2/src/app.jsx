// Top-level app
const { createRoot } = ReactDOM;

function App() {
  return (
    <>
      <main>
        <Hero />
        <Manifesto />
        <Features />
        <Workflow />
        <Security />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FooterCTA />
      </main>
      <Footer />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
