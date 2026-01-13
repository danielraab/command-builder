import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Option } from '../../../models/command.model';

@Component({
  selector: 'app-option-item',
  imports: [FormsModule],
  templateUrl: './option-item.component.html'
})
export class OptionItemComponent {
  option = input.required<Option>();
  selected = input.required<boolean>();
  value = input<string | number>();
  toggle = output<void>();
  valueChange = output<Event>();
}
