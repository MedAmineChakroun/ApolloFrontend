import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import posthog from 'posthog-js';
import { environment } from './environments/environment.development';

posthog.init(environment.POSTHOG_KEY, {
    api_host: environment.POSTHOG_HOST,
    person_profiles: 'always',
    autocapture: false
});
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
