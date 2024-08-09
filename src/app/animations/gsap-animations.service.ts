import { Injectable } from '@angular/core';
import { gsap } from 'gsap';

@Injectable({
  providedIn: 'root',
})
export class GsapAnimationsService {
  animateBox(element: HTMLElement): void {
    gsap.to(element, { x: 100, duration: 2 });
  }

  // Add more animation methods here
}
