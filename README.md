# Generate-DB-Journey-Url

Generate-DB-Journey-Url is a straightforward package to receive a user-friendly URL to the Deutsche Bahn (German Railway) website for a given journey identifier (refreshToken/ctxRecon).

## Installation

```bash
npm install @WahrscheinlichAnkommen/generate-db-journey-url
```

## Usage

```javascript
import { generateDbJourneyUrl } from '@WahrscheinlichAnkommen/generate-db-journey-url';

const refreshToken = 'your_refresh_token'; // should be something like 'T$A=1@O=Berlin Hbf@L=8011160@a=128@$A=1@O=Frankfurt(Main)Hbf@L=8000105@a=128@$202404201829$202404202244$ICE  877$$1$$$$$$'
const url = await generateDbJourneyUrl(refreshToken);
console.log(`Journey URL: ${url}`);
```

The url will forward the user to either the `Deutsche Bahn Website` or the `DB Navigator` and display the journey details.

`generateDbJourneyUrl(refreshToken: string) => Promise<string>` will

-   extract necessary info from the refreshToken
-   make a backend API call using that info
-   constructs URL parameters to return the constructed URL as a string.

Therefore, you should handle errors which might occur during the process. If you don't have a `refreshToken`/`ctxRecon`, the [hafas-client](https://github.com/public-transport/hafas-client) is a good starting point!

Happy coding! ❤️

## License

This project is open source and available under MIT License.
