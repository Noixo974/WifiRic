import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Quels types de sites web créez-vous ?',
      answer: '//'
    },
    {
      question: 'Combien coûte un site internet ou un bot Discord ?',
      answer: '//'
    },
    {
      question: 'Quel est le délai de réalisation ?',
      answer: '//'
    },
    {
      question: 'Proposez-vous de la maintenance ?',
      answer: '//'
    },
    {
      question: 'Comment fonctionnent la création de bots Discord ?',
      answer: '//'
    },
    {
      question: 'Acceptez-vous les paiements en plusieurs fois ?',
      answer: '//'
    }
  ];

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-gray-800 via-[#9cd4e3] to-blue-600 dark:from-white dark:via-[#9cd4e3] dark:to-blue-400 bg-clip-text text-transparent">
              Questions Fréquentes
            </span>
          </h2>
          <p className="text-base md:text-xl text-gray-600 dark:text-gray-300">
            Trouvez rapidement les réponses à vos questions
          </p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-[#9cd4e3]/50 transition-all duration-300 hover:shadow-lg relative"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 py-4 md:px-8 md:py-6 text-left flex items-center justify-between hover:bg-[#9cd4e3]/5 transition-all duration-300 group/button rounded-2xl active:scale-[0.98]"
              >
                <span className="text-base md:text-lg font-semibold text-gray-800 dark:text-white pr-3 md:pr-4 transition-all duration-300 group-hover/button:text-[#9cd4e3] group-hover/button:translate-x-1">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 p-1 rounded-full bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white transition-all duration-300 group-hover/button:scale-110 group-hover/button:shadow-lg group-hover/button:shadow-[#9cd4e3]/50 ${openIndex === index ? 'rotate-180' : ''}`}>
                  {openIndex === index ? (
                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 md:px-8 md:pb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-[#9cd4e3]/30 to-transparent mb-3 md:mb-4"></div>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-16 text-center">
          <div className="bg-gradient-to-r from-[#9cd4e3]/10 to-blue-500/10 dark:from-[#9cd4e3]/5 dark:to-blue-500/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-[#9cd4e3]/20 hover:border-[#9cd4e3]/30 transition-all duration-300">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800 dark:text-white transition-colors duration-300">
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6 transition-colors duration-300">
              Notre équipe est là pour répondre à toutes vos questions spécifiques
            </p>
            <a
              href="https://discord.gg/9mKPA3kHBA"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#9cd4e3]/50 hover:scale-110 active:scale-95 text-sm md:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-[#9cd4e3] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative group-hover:tracking-wide transition-all duration-300">Contactez-nous sur Discord</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};