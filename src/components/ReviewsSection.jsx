import { Link } from 'react-router-dom';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Dra. Ana Paula Silveira",
    role: "Psicóloga Clínica",
    content: "O Meu Sistema Psi mudou minha rotina. A agenda integrada com o WhatsApp reduziu minhas faltas em 40%. Não vivo mais sem!",
    rating: 5,
    date: "há 2 semanas"
  },
  {
    id: 2,
    name: "Marcos Oliveira",
    role: "Terapeuta ABA",
    content: "A segurança dos dados era minha maior preocupação. Com a conformidade LGPD e a facilidade de uso, me sinto muito mais tranquilo para focar nos pacientes.",
    rating: 5,
    date: "há 1 mês"
  },
  {
    id: 3,
    name: "Beatriz Santos",
    role: "Psicóloga Escolar",
    content: "Interface intuitiva e suporte nota 10. A inteligência artificial para resumos de sessão é um diferencial incrível que poupa muito meu tempo.",
    rating: 5,
    date: "há 3 dias"
  }
];

const ReviewsSection = () => {
  // Structured Data for SEO (Rich Snippets - Star Ratings)
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Meu Sistema Psi",
    "description": "Sistema completo para psicólogos: prontuário eletrônico seguro (LGPD), agenda com lembretes por WhatsApp e gestão financeira.",
    "brand": {
      "@type": "Brand",
      "name": "Meu Sistema Psi"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "127"
    },
    "review": reviews.map(r => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.name
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": r.content
    }))
  };

  return (
    <section id="reviews" className="py-20 bg-white">
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            O que dizem os especialistas
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Mais de 127 psicólogos já transformaram suas clínicas com o Meu Sistema Psi.
          </p>
          <div className="flex justify-center items-center mt-6 gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill="currentColor" />
              ))}
            </div>
            <span className="text-slate-900 font-bold text-xl">4.9/5</span>
            <span className="text-slate-500 ml-2">no Google</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold">{review.name}</h4>
                  <p className="text-slate-500 text-sm">{review.role}</p>
                </div>
              </div>
              
              <div className="relative">
                <Quote className="absolute -top-4 -left-2 text-slate-200" size={40} />
                <p className="text-slate-700 leading-relaxed relative z-10 mb-6 italic">
                  "{review.content}"
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="text-slate-400 text-xs italic">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            to="/cadastrar" 
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg shadow-indigo-200"
          >
            Quero ter resultados como estes
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
