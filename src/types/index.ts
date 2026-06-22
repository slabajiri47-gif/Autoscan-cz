export type Severity = 'nízká' | 'střední' | 'vysoká'
export type ServiceHistory = 'good' | 'mid' | 'bad'

export interface EngineFault {
  name: string
  probability: number
  repairCost: number
  severity: Severity
}

export interface Engine {
  id: string
  code?: string
  brand: string
  model: string
  generation?: string
  yearFrom?: number
  yearTo?: number
  fuel?: 'benzín' | 'nafta' | 'hybrid' | 'elektro' | 'LPG/CNG' | 'jiné'
  displacement?: number
  powerKw?: number
  market?: string
  riskDataStatus?: 'verified' | 'estimated' | 'pending'
  riskMethod?: string
  vinPrefixes: string[]
  baseScore: number
  repairReserve: number
  faults: EngineFault[]
}

export interface AnalysisInput {
  vin: string
  engineId: string
  mileage: number
  age: number
  owners: number
  history: ServiceHistory
  note: string
}

export interface AnalysisResult extends AnalysisInput {
  id: string
  createdAt: string
  engine: Engine
  score: number
  repairReserve: number
  recommendation: string
}

export interface SavedCar {
  id: string
  createdAt: string
  vin: string
  engineId: string
  brand: string
  model: string
  score: number
  mileage: number
  age: number
  owners: number
  repairReserve: number
  note: string
}

export interface CostInputs {
  yearlyKm: number
  consumption: number
  fuelPrice: number
  insurance: number
  service: number
  repairs: number
}
