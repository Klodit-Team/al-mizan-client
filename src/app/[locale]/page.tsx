import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionaries";

interface HomeProps {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col font-sans bg-[#f8f9fa]">
      <Navbar dict={dict.navbar} locale={locale} />
      
      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="w-full pt-24 pb-16 px-4 flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-5xl md:text-6xl font-extrabold tracking-tight text-[#1e2535] mb-6">
            Le Portail Souverain des <br />
            <span style={{ color: "#4CAF50" }}>Marchés Publics</span> en Algérie
          </h1>
          <p className="max-w-2xl text-lg text-gray-600 mb-12">
            Accédez à l'ensemble des opportunités d'affaires publiques en Algérie sur une plateforme sécurisée, transparente et centralisée.
          </p>

          {/* SEARCH BAR */}
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Rechercher un marché..." 
                className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 py-2"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto px-2">
              <select className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-[#4CAF50] cursor-pointer appearance-none pr-8 relative">
                <option value="">Secteur</option>
              </select>
              <select className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2.5 outline-none focus:border-[#4CAF50] cursor-pointer appearance-none pr-8 relative">
                <option value="">Wilaya</option>
              </select>
              <button 
                type="button"
                className="bg-[#4CAF50] hover:bg-[#43a047] text-white font-semibold py-2.5 px-6 rounded-lg transition-colors ml-auto md:ml-2"
              >
                Rechercher
              </button>
            </div>
          </div>
        </section>

        {/* GREEN RIBBON */}
        <section className="w-full bg-[#4CAF50] py-6 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 divide-y md:divide-y-0 md:divide-x divide-green-600/30">
            <div className="flex-1 flex items-center justify-center gap-3 pt-4 md:pt-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <div className="text-white font-bold text-xl">1,240 <span className="text-sm font-semibold opacity-90 uppercase tracking-wide ml-1">Active Tenders</span></div>
            </div>
            <div className="flex-1 flex items-center justify-center gap-3 pt-4 md:pt-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="text-white font-bold text-xl">450 <span className="text-sm font-semibold opacity-90 uppercase tracking-wide ml-1">Awarded Markets</span></div>
            </div>
            <div className="flex-1 flex items-center justify-center gap-3 pt-4 md:pt-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <div className="text-white font-bold text-xl">8,000 <span className="text-sm font-semibold opacity-90 uppercase tracking-wide ml-1">Registered Operators</span></div>
            </div>
          </div>
        </section>

        {/* LATEST TENDERS */}
        <section className="w-full max-w-6xl mx-auto py-20 px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#1e2535]">Latest Tenders</h2>
            <a href="#" className="text-[#4CAF50] font-semibold hover:underline flex items-center gap-1">
              View All Tenders <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">National</span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  12/10/2023
                </span>
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Sonatrach - Division Production</p>
              <h3 className="text-lg font-bold text-[#1e2535] leading-snug mb-8 flex-1">
                Fourniture d'équipements de forage pour les champs de Hassi Messaoud
              </h3>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-red-500 font-bold text-sm">Dans 14 jours</p>
                </div>
                <button type="button" className="bg-green-50 text-green-700 hover:bg-green-100 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">International</span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  10/10/2023
                </span>
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Ministère de la Santé</p>
              <h3 className="text-lg font-bold text-[#1e2535] leading-snug mb-8 flex-1">
                Installation de systèmes d'imagerie médicale avancée - CHU Constantine
              </h3>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-gray-800 font-bold text-sm">Dans 28 jours</p>
                </div>
                <button type="button" className="bg-green-50 text-green-700 hover:bg-green-100 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">National</span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  08/10/2023
                </span>
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Algérie Télécom</p>
              <h3 className="text-lg font-bold text-[#1e2535] leading-snug mb-8 flex-1">
                Extension du réseau de fibre optique FTTH - Wilaya d'Oran
              </h3>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Deadline</p>
                  <p className="text-red-500 font-bold text-sm">Dans 5 jours</p>
                </div>
                <button type="button" className="bg-green-50 text-green-700 hover:bg-green-100 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PILLARS SECTION */}
        <section className="w-full bg-[#f8f9fa] py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#1e2535] mb-4">The Pillars of Al-Mizan</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-16">
              Providing a sovereign infrastructure for transparent and efficient public procurement in Algeria.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* PILLAR 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-[#1e2535]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#1e2535] mb-4">Total Transparency</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  Each step of the procurement process is tracked and visible to authorized parties, ensuring fair competition.
                </p>
              </div>
              
              {/* PILLAR 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-[#1e2535]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#1e2535] mb-4">E2EE Security</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  End-to-end encrypted bids and sovereign data hosting protect sensitive commercial information.
                </p>
              </div>

              {/* PILLAR 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-[#1e2535]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#1e2535] mb-4">AI-Driven Analysis</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  Advanced analytics and pattern detection to optimize public spending and identify market trends.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer dict={dict.footer} locale={locale} />
    </div>
  );
}
