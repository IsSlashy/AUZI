// src/app/services/storage.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get(key: string): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(key) : null;
  }

  set(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(key, value);
  }

  remove(key: string): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(key);
  }
}
