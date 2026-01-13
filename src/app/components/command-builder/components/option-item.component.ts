import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Option } from '../../../models/command.model';

@Component({
  selector: 'app-option-item',
  imports: [FormsModule],
  template: `
    @if (option(); as opt) {
      <div class="p-4 border border-gray-200 rounded-md hover:border-blue-300 transition-colors">
        <div class="flex items-start space-x-3 mb-3">
          <input
            type="checkbox"
            [id]="'option-' + opt.id"
            [checked]="selected()"
            (change)="toggle.emit()"
            class="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label [attr.for]="'option-' + opt.id" class="flex-1 cursor-pointer">
            @if (opt.option) {
              <div class="font-mono font-semibold text-blue-600">{{ opt.option }}</div>
            }
            <div class="text-sm text-gray-600">
              {{ opt.description }}
              @if (opt.link) {
                <a [href]="opt.link" target="_blank" rel="noopener noreferrer" class="ml-1 text-blue-500 hover:text-blue-700 underline" (click)="$event.stopPropagation()">
                  Learn more
                </a>
              }
            </div>
          </label>
        </div>

        @if (opt.parameter && selected()) {
          <div class="ml-7 mt-2">
            @if (opt.parameter.type === 'text') {
              <input
                type="text"
                [id]="'param-' + opt.id"
                [value]="value() || ''"
                (input)="valueChange.emit($event)"
                [placeholder]="opt.parameter.placeholder || ''"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [attr.aria-label]="opt.description + ' value'"
              />
            }

            @if (opt.parameter.type === 'number') {
              <input
                type="number"
                [id]="'param-' + opt.id"
                [value]="value() || ''"
                (input)="valueChange.emit($event)"
                [placeholder]="opt.parameter.placeholder || ''"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [attr.aria-label]="opt.description + ' value'"
              />
            }

            @if (opt.parameter.type === 'enum' && opt.parameter.enumValues) {
              <select
                [id]="'param-' + opt.id"
                [value]="value() || opt.parameter.defaultValue || ''"
                (change)="valueChange.emit($event)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                [attr.aria-label]="opt.description + ' value'"
              >
                <option value="">Select...</option>
                @for (enumVal of opt.parameter.enumValues; track enumVal.value) {
                  <option [value]="enumVal.value" [title]="enumVal.description || ''">
                    {{ enumVal.label }}
                  </option>
                }
              </select>
            }
          </div>
        }
      </div>
    }
  `
})
export class OptionItemComponent {
  option = input.required<Option>();
  selected = input.required<boolean>();
  value = input<string | number>();
  toggle = output<void>();
  valueChange = output<Event>();
}
