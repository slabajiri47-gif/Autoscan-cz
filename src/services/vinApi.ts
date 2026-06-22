import type { Engine } from '../types'

export interface VinDecodeResult { vin: string; make?: string; model?: string; year?: number; matchedEngine?: Engine }

export interface VinApiClient { decode(vin: string): Promise<VinDecodeResult> }

// Adapter seam for a future paid VIN provider. UI and analysis stay provider-independent.
export class DemoVinApiClient implements VinApiClient {
  async decode(vin: string): Promise<VinDecodeResult> { return { vin: vin.trim().toUpperCase() } }
}
