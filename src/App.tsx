import { useEffect, useState } from 'react'
import { Layout, type View } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Scan } from './pages/Scan'
import { Costs } from './pages/Costs'
import { Garage } from './pages/Garage'
import { Compare } from './pages/Compare'
import { EngineDatabase } from './pages/EngineDatabase'
import { carRepository } from './services/storage'
import { engineCatalog, type EngineCatalogResult } from './services/engineCatalog'
import { offlineCatalog } from './data/catalogSeed'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [cars, setCars] = useState(() => carRepository.getAll())
  const [catalog, setCatalog] = useState<EngineCatalogResult>({ engines: offlineCatalog, source: 'offline' })
  const [catalogLoading, setCatalogLoading] = useState(true)
  useEffect(() => {
    let active = true
    engineCatalog.load().then((next) => { if (active) setCatalog(next) }).finally(() => { if (active) setCatalogLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [view])
  const content = view === 'dashboard' ? <Dashboard cars={cars} navigate={setView} engineCount={catalog.engines.length} />
    : view === 'scan' ? <Scan engines={catalog.engines} onSave={(result) => { const next = carRepository.save(result); setCars(next); return next }} />
      : view === 'costs' ? <Costs />
        : view === 'garage' ? <Garage cars={cars} onDelete={(id) => setCars(carRepository.remove(id))} onClear={() => { carRepository.clear(); setCars([]) }} />
          : view === 'compare' ? <Compare cars={cars} /> : <EngineDatabase engines={catalog.engines} source={catalog.source} loading={catalogLoading} warning={catalog.warning} />
  return <Layout active={view} setActive={setView} savedCount={cars.length}>{content}</Layout>
}
