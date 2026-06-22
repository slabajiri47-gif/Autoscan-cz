import type { ServicePlanItem, ServiceReminder } from '../types'

const KEY = 'autoscan.cz.reminders.v1'

function read(): ServiceReminder[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as ServiceReminder[] } catch { return [] }
}

export const reminderRepository = {
  async list() { return read() },
  async add(vehicleId: string, item: ServicePlanItem) {
    const reminder: ServiceReminder = { ...item, id: crypto.randomUUID(), vehicleId, createdAt: new Date().toISOString(), completed: false, notificationStatus: 'local-only' }
    localStorage.setItem(KEY, JSON.stringify([reminder, ...read()]))
    return reminder
  },
  async toggle(id: string) {
    const next = read().map((item) => item.id === id ? { ...item, completed: !item.completed } : item)
    localStorage.setItem(KEY, JSON.stringify(next)); return next
  },
  async remove(id: string) { const next = read().filter((item) => item.id !== id); localStorage.setItem(KEY, JSON.stringify(next)); return next },
}
