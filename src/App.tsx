import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/Navigation';
import { ParticleBackground } from './components/ParticleBackground';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { FAQ } from './components/FAQ';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayPage, setDisplayPage] = useState('home');

  useEffect(() => {
    if (currentPage !== displayPage) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayPage(currentPage);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPage, displayPage]);

  const scrollToServices = () => {
    const servicesSection = document.getElementById('nos-services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderPage = () => {
    switch (displayPage) {
      case 'home':
        return <Hero onNavigateToServices={scrollToServices} />;
      case 'about':
        return <About />;
      case 'faq':
        return <FAQ />;
      case 'contact':
        return <Contact />;
      default:
        return <Hero onNavigateToServices={scrollToServices} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
        <ParticleBackground />
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="relative z-10 pt-20 flex-grow">
          <div
            className={`transition-all duration-300 ease-in-out ${
              isTransitioning
                ? 'opacity-0 transform translate-y-4'
                : 'opacity-100 transform translate-y-0'
            }`}
          >
            {renderPage()}
          </div>
        </main>
        <Footer setCurrentPage={setCurrentPage} />
      </div>
    </ThemeProvider>
  );
}

export default App;