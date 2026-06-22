import type { AppUser, SavedCar, ServiceReminder, StoredReport } from '../../types'

export interface CrudRepository<T extends { id: string }> {
  list(): Promise<T[]>
  get(id: string): Promise<T | undefined>
  upsert(value: T): Promise<T>
  remove(id: string): Promise<void>
}

class LocalMockRepository<T extends { id: string }> implements CrudRepository<T> {
  constructor(private key: string) {}

  async list(): Promise<T[]> {
    try { return JSON.parse(localStorage.getItem(this.key) ?? '[]') as T[] } catch { return [] }
  }

  async get(id: string) { return (await this.list()).find((item) => item.id === id) }

  async upsert(value: T) {
    const current = await this.list()
    const next = [value, ...current.filter((item) => item.id !== value.id)]
    localStorage.setItem(this.key, JSON.stringify(next))
    return value
  }

  async remove(id: string) {
    localStorage.setItem(this.key, JSON.stringify((await this.list()).filter((item) => item.id !== id)))
  }
}

export const mockSupabase = {
  users: new LocalMockRepository<AppUser>('autoscan.mock.users.v1'),
  vehicles: new LocalMockRepository<SavedCar>('autoscan.mock.vehicles.v1'),
  reports: new LocalMockRepository<StoredReport>('autoscan.mock.reports.v1'),
  reminders: new LocalMockRepository<ServiceReminder>('autoscan.cz.reminders.v1'),
}
