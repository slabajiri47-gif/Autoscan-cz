import type { ReactNode } from 'react'

export type View = 'dashboard' | 'scan' | 'costs' | 'garage' | 'compare' | 'database'

const nav: Array<{ id: View; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Přehled', icon: 'fa-chart-pie' },
  { id: 'scan', label: 'Nová analýza', icon: 'fa-wand-magic-sparkles' },
  { id: 'costs', label: 'Náklady', icon: 'fa-coins' },
  { id: 'garage', label: 'Moje garáž', icon: 'fa-warehouse' },
  { id: 'compare', label: 'Porovnání', icon: 'fa-code-compare' },
  { id: 'database', label: 'Motory', icon: 'fa-database' },
]

interface Props { active: View; setActive: (view: View) => void; children: ReactNode; savedCount: number }

export function Layout({ active, setActive, children, savedCount }: Props) {
  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => setActive('dashboard')}>
        <span className="brand-mark"><i className="fa-solid fa-gauge-high" /></span>
        <span><strong>AUTOSCAN</strong><small>CZECH REPUBLIC</small></span>
      </button>
      <nav className="nav-list" aria-label="Hlavní navigace">
        {nav.map((item) => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
          <i className={`fa-solid ${item.icon}`} /><span>{item.label}</span>{item.id === 'garage' && savedCount > 0 && <em>{savedCount}</em>}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="status-dot"><span /> Offline režim</div>
        <p>Data zůstávají bezpečně ve vašem prohlížeči.</p>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <div><span className="eyebrow">PŘEDKUPNÍ ASISTENT</span><h1>{nav.find((item) => item.id === active)?.label}</h1></div>
        <button className="primary compact" onClick={() => setActive('scan')}><i className="fa-solid fa-plus" /> Analyzovat vůz</button>
      </header>
      <div className="page">{children}</div>
    </main>
  </div>
}
