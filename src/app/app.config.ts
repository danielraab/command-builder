import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { CommandService } from './services/command.service';
import packageJson from '../../package.json';

export const APP_VERSION = new InjectionToken<string>('APP_VERSION');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    { provide: APP_VERSION, useValue: packageJson.version },
    provideAppInitializer(() => {
      const commandService = inject(CommandService);
      return commandService.loadCommands();
    })
  ]
};
