import type { AnalysisResult, SavedCar } from '../types'

const KEY = 'autoscan.cz.cars.v1'
const LEGACY_KEY = 'autoscanCars'

export const carRepository = {
  getAll(): SavedCar[] {
    try {
      const current = localStorage.getItem(KEY)
      if (current) return JSON.parse(current) as SavedCar[]
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? '[]') as Array<Record<string, unknown>>
      return legacy.map((car) => ({
        id: String(car.id), createdAt: String(car.date ?? new Date().toISOString()), vin: String(car.vin ?? ''),
        engineId: String(car.engine), brand: String(car.brand), model: String(car.model), score: Number(car.score),
        mileage: Number(car.km), age: Number(car.age), owners: Number(car.owners), repairReserve: Number(car.reserve), note: String(car.note ?? ''),
      }))
    } catch { return [] }
  },
  save(result: AnalysisResult): SavedCar[] {
    const cars = this.getAll()
    const car: SavedCar = { id: result.id, createdAt: result.createdAt, vin: result.vin, engineId: result.engine.id, brand: result.engine.brand, model: result.engine.model, score: result.score, mileage: result.mileage, age: result.age, owners: result.owners, repairReserve: result.repairReserve, note: result.note }
    const next = [car, ...cars]
    localStorage.setItem(KEY, JSON.stringify(next))
    return next
  },
  remove(id: string): SavedCar[] {
    const next = this.getAll().filter((car) => car.id !== id)
    localStorage.setItem(KEY, JSON.stringify(next))
    return next
  },
  clear() { localStorage.removeItem(KEY) },
}
