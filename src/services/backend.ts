import type { SavedCar } from '../types'

export interface CarBackend {
  listCars(): Promise<SavedCar[]>
  upsertCar(car: SavedCar): Promise<void>
  deleteCar(id: string): Promise<void>
}

// Future Supabase implementation should satisfy this interface; LocalStorage remains the offline source today.
export const backendConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
}
