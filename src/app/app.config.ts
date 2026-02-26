import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter } from "@angular/router";
import { providePrimeNG } from "primeng/config";
import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

import { routes } from "./app.routes";

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{lime.50}",
      100: "{lime.100}",
      200: "{lime.200}",
      300: "{lime.300}",
      400: "{lime.400}",
      500: "{lime.500}",
      600: "{lime.600}",
      700: "{lime.700}",
      800: "{lime.800}",
      900: "{lime.900}",
      950: "{lime.950}",
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: ".app-dark",
        },
      },
    }),
  ],
};
