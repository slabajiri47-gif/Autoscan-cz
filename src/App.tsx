import { useCallback, useEffect, useState } from 'react'
import { Layout, type View } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Scan } from './pages/Scan'
import { Costs } from './pages/Costs'
import { Garage } from './pages/Garage'
import { Compare } from './pages/Compare'
import { EngineDatabase } from './pages/EngineDatabase'
import { vehicleRepository } from './services/storage'
import { engineCatalog, type EngineCatalogResult } from './services/engineCatalog'
import { offlineCatalog } from './data/catalogSeed'
import { ListingImport } from './pages/ListingImport'
import { ServicePlan } from './pages/ServicePlan'
import type { ListingCandidate } from './types'

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [cars, setCars] = useState([] as Awaited<ReturnType<typeof vehicleRepository.list>>)
  const [scanDraft, setScanDraft] = useState<ListingCandidate | null>(null)
  const [catalog, setCatalog] = useState<EngineCatalogResult>({ engines: offlineCatalog, source: 'offline' })
  const [catalogLoading, setCatalogLoading] = useState(true)
  const refreshCars = useCallback(async () => setCars(await vehicleRepository.list()), [])
  const clearDraft = useCallback(() => setScanDraft(null), [])
  useEffect(() => {
    let active = true
    engineCatalog.load().then((next) => { if (active) setCatalog(next) }).finally(() => { if (active) setCatalogLoading(false) })
    return () => { active = false }
  }, [])
  useEffect(() => { void refreshCars() }, [refreshCars])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [view])
  const content = view === 'dashboard' ? <Dashboard cars={cars} navigate={setView} engineCount={catalog.engines.length} />
    : view === 'scan' ? <Scan engines={catalog.engines} draft={scanDraft} onDraftConsumed={clearDraft} onSave={async (result) => { await vehicleRepository.saveAnalysis(result); await refreshCars() }} />
      : view === 'import' ? <ListingImport onAnalyze={(candidate) => { setScanDraft(candidate); setView('scan') }} />
        : view === 'costs' ? <Costs />
          : view === 'garage' ? <Garage cars={cars} onDelete={async (id) => { await vehicleRepository.remove(id); await refreshCars() }} onClear={async () => { await vehicleRepository.clear(); await refreshCars() }} onUpdate={async (car) => { await vehicleRepository.upsert(car); await refreshCars() }} />
            : view === 'service' ? <ServicePlan cars={cars} engines={catalog.engines} />
              : view === 'compare' ? <Compare cars={cars} /> : <EngineDatabase engines={catalog.engines} source={catalog.source} loading={catalogLoading} warning={catalog.warning} />
  return <Layout active={view} setActive={setView} savedCount={cars.length}>{content}</Layout>
}
