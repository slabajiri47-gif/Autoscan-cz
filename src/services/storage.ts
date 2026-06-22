import type { AnalysisResult, SavedCar } from '../types'

const KEY = 'autoscan.cz.cars.v2'
const PREVIOUS_KEY = 'autoscan.cz.cars.v1'
const LEGACY_KEY = 'autoscanCars'

export interface VehicleRepository {
  list(): Promise<SavedCar[]>
  saveAnalysis(result: AnalysisResult): Promise<SavedCar>
  upsert(car: SavedCar): Promise<SavedCar>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}

class LocalVehicleRepository implements VehicleRepository {
  private read(): SavedCar[] {
    try {
      const current = localStorage.getItem(KEY) ?? localStorage.getItem(PREVIOUS_KEY)
      if (current) return JSON.parse(current) as SavedCar[]
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? '[]') as Array<Record<string, unknown>>
      return legacy.map((car) => ({
        id: String(car.id), createdAt: String(car.date ?? new Date().toISOString()), vin: String(car.vin ?? ''),
        engineId: String(car.engine), brand: String(car.brand), model: String(car.model), score: Number(car.score),
        mileage: Number(car.km), age: Number(car.age), owners: Number(car.owners), repairReserve: Number(car.reserve), note: String(car.note ?? ''),
      }))
    } catch { return [] }
  }

  private write(cars: SavedCar[]) { localStorage.setItem(KEY, JSON.stringify(cars)) }

  async list() { return this.read() }

  async saveAnalysis(result: AnalysisResult) {
    const car: SavedCar = {
      id: result.id,
      createdAt: result.createdAt,
      vin: result.vin,
      engineId: result.engine.id,
      brand: result.vehicleBrand || result.engine.brand,
      model: result.vehicleModel || result.engine.model,
      score: result.score,
      mileage: result.mileage,
      age: result.age,
      owners: result.owners,
      repairReserve: result.repairReserve,
      note: result.note,
      year: result.year,
      transmission: result.transmission,
      condition: result.condition,
      askingPrice: result.askingPrice,
      estimatedPrice: result.estimatedPrice,
      recommendation: result.recommendation,
      engine: result.engine,
    }
    return this.upsert(car)
  }

  async upsert(car: SavedCar) {
    this.write([car, ...this.read().filter((item) => item.id !== car.id)])
    return car
  }

  async remove(id: string) { this.write(this.read().filter((car) => car.id !== id)) }
  async clear() { localStorage.removeItem(KEY); localStorage.removeItem(PREVIOUS_KEY) }
}

// The app currently chooses the local implementation. A Supabase implementation can
// satisfy the same interface without changing pages or components.
export const vehicleRepository: VehicleRepository = new LocalVehicleRepository()
