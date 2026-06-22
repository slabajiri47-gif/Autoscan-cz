export type Severity = 'nízká' | 'střední' | 'vysoká'
export type ServiceHistory = 'unknown' | 'good' | 'mid' | 'bad'
export type Transmission = 'manuální' | 'automatická' | 'DSG/DCT' | 'CVT' | 'jiná'
export type VehicleCondition = 'excellent' | 'good' | 'average' | 'poor'

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
  purchaseRecommendation?: string
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
  year?: number
  vehicleBrand?: string
  vehicleModel?: string
  transmission?: Transmission
  askingPrice?: number
  estimatedPrice?: number
  condition?: VehicleCondition
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
  year?: number
  transmission?: Transmission
  condition?: VehicleCondition
  askingPrice?: number
  estimatedPrice?: number
  recommendation?: string
  engine?: Engine
}

export interface VinDecodeResult {
  vin: string
  make: string
  model: string
  year: number
  engineCode: string
  transmission: Transmission
  fuel?: Engine['fuel']
  mileage?: number
  owners?: number
  serviceHistory?: ServiceHistory
  matchedEngine?: Engine
  source: 'mock' | 'api'
}

export interface PriceEstimate {
  fairPrice: number
  minPrice: number
  maxPrice: number
  verdict?: 'low' | 'fair' | 'high'
  confidence: 'low' | 'medium'
  explanation: string
}

export interface ListingCandidate {
  id: string
  source: 'Sauto' | 'TipCars' | 'Bazoš' | 'Marketplace'
  sourceUrl: string
  title: string
  brand: string
  model: string
  year: number
  mileage: number
  engineCode: string
  transmission: Transmission
  askingPrice: number
  condition: VehicleCondition
  vin?: string
  parserWarnings?: string[]
  parserSource?: 'json-ld' | 'metadata'
}

export interface ServicePlanItem {
  id: string
  title: string
  description: string
  dueKm: number
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}

export interface ServiceReminder extends ServicePlanItem {
  vehicleId: string
  createdAt: string
  completed: boolean
  notificationStatus: 'local-only' | 'scheduled' | 'sent'
}

export interface AppUser { id: string; email: string; displayName?: string; createdAt: string }
export interface StoredReport { id: string; vehicleId: string; createdAt: string; score: number }

export interface CostInputs {
  yearlyKm: number
  consumption: number
  fuelPrice: number
  insurance: number
  service: number
  repairs: number
}
