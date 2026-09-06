import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  imports: [],
  template: `
    <div class="skeleton-card">
      <div class="skeleton-photo"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line"></div>
    </div>
  `,
  styles: [
    `
      .skeleton-card {
        border-radius: 14px;
        border: 1px solid var(--line);
        background: var(--surface);
        overflow: hidden;
        padding-bottom: 12px;
      }
      .skeleton-photo {
        height: 190px;
        background: var(--surface-2);
      }
      .skeleton-line {
        height: 12px;
        margin: 12px;
        border-radius: 6px;
        background: var(--surface-2);
      }
      .skeleton-line.short {
        width: 60%;
      }
      .skeleton-photo,
      .skeleton-line {
        animation: pulse 1.4s ease-in-out infinite;
      }
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.55;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .skeleton-photo,
        .skeleton-line {
          animation: none;
        }
      }
    `,
  ],
})
export class SkeletonCard {}
