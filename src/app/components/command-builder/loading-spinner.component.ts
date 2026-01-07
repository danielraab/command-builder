import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-800">Loading command...</h2>
      </div>
    </div>
  `
})
export class LoadingSpinnerComponent {}
