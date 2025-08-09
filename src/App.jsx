import React, { useMemo, useState } from 'react'
import partners from './data/partners.json'
import './styles.css'
import { partnerOverrideUrl, withUTM, logClick } from './utils'

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-white/10 text-white/80 px-2 py-0.5 text-xs font-medium border border-white/15">
    {children}
  </span>
)

const Card = ({ p }) => {
  const base = partnerOverrideUrl(p.name, p.affiliate_url)
  const href = withUTM(base, { ref: 'biosnap' })
  const onClick = () => logClick({ partner: p.name, url: href })
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}
       className="group relative block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-colors">
      <div className="aspect-[16/9] bg-slate-800/50 flex items-center justify-center">
        <img src={p.logo} alt={p.name} className="max-h-16 opacity-90 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{p.name}</h3>
        <p className="text-slate-300 text-sm">{p.description}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {p.categories.map((c) => <Badge key={c}>{c}</Badge>)}
        </div>
        <div className="pt-2 text-right">
          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm">
            Voir l’offre partenaire
          </button>
        </div>
      </div>
    </a>
  )
}

function Filters({ countries, categories, selectedCountry, setSelectedCountry, selectedCategory, setSelectedCategory, search, setSearch }) {
  return (
    <div className="grid md:grid-cols-4 gap-3">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher un partenaire..."
        className="col-span-2 md:col-span-1 rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
      />
      <select
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
      >
        <option value="">Tous pays</option>
        {countries.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-white/30"
      >
        <option value="">Toutes catégories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <a href="/partners_invite.html" className="text-center rounded-xl bg-slate-900/70 border border-slate-800 px-3 py-2 hover:bg-slate-900">
        Inviter un partenaire
      </a>
    </div>
  )
}

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')

  const countries = useMemo(() => {
    const set = new Set()
    partners.forEach(p => p.country.forEach(c => set.add(c)))
    return Array.from(set).sort()
  }, [])

  const categories = useMemo(() => {
    const set = new Set()
    partners.forEach(p => p.categories.forEach(c => set.add(c)))
    return Array.from(set).sort()
  }, [])

  const filtered = partners.filter(p => {
    if (selectedCountry && !p.country.includes(selectedCountry)) return false
    if (selectedCategory && !p.categories.includes(selectedCategory)) return false
    if (search && !(p.name + ' ' + p.description).toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 backdrop-blur bg-slate-950/70 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-72.png" width="28" height="28" alt="logo" className="rounded-md" />
            <div>
              <div className="text-sm text-slate-400">BioSnap AI</div>
              <h1 className="text-lg font-semibold">Market — Partenaires</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm">Installer l’app</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 p-6">
          <h2 className="text-xl font-semibold mb-2">Affiliations jardinage & semences</h2>
          <p className="text-slate-300 text-sm">
            Les échanges sont limités aux graines et plantes. Les animaux sont interdits. Respectez les lois locales.
          </p>
        </section>

        <Filters
          countries={countries}
          categories={categories}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          search={search}
          setSearch={setSearch}
        />

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => <Card key={p.name} p={p} />)}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-400 border border-dashed border-slate-700 rounded-xl p-10">
              Aucun partenaire trouvé. Ajustez les filtres.
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-900 mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-400 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
          <span>© {new Date().getFullYear()} BioSnap AI — PWA</span>
          <a href="/legal.html" className="hover:text-slate-200">Mentions légales</a>
          <a href="/partners_invite.html" className="hover:text-slate-200">Inviter un partenaire</a>
        </div>
      </footer>
    </div>
  )
}
