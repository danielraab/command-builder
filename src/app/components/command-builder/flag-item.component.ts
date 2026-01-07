import { Component, input, output } from '@angular/core';
import { Flag } from '../../models/command.model';

@Component({
  selector: 'app-flag-item',
  template: `
    @if (flag(); as f) {
      <div class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md">
        <input
          type="checkbox"
          [id]="'flag-' + f.id"
          [checked]="selected()"
          (change)="toggle.emit()"
          class="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label [attr.for]="'flag-' + f.id" class="flex-1 cursor-pointer">
          <div class="font-mono font-semibold text-blue-600">{{ f.flag }}</div>
          <div class="text-sm text-gray-600">
            {{ f.description }}
            @if (f.link) {
              <a [href]="f.link" target="_blank" rel="noopener noreferrer" class="ml-1 text-blue-500 hover:text-blue-700 underline" (click)="$event.stopPropagation()">
                Learn more
              </a>
            }
          </div>
        </label>
      </div>
    }
  `
})
export class FlagItemComponent {
  flag = input.required<Flag>();
  selected = input.required<boolean>();
  toggle = output<void>();
}
