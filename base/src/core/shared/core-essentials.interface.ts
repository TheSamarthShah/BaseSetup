import { InjectionToken } from '@angular/core';

export interface CoreEssentials {
  BASE_ENDPOINT: string;
}

// Create injection token - no factory here
export const CORE_ESSENTIALS = new InjectionToken<CoreEssentials>('core.essentials');