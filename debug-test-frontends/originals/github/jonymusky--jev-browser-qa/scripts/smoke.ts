import 'dotenv/config';
import { askJev, jevCallLog } from '../src/jev/index.js';

// Verifies the gateway key and the model wiring without a browser.
const result = await askJev(
  'smoke',
  { page: { url: 'http://localhost:3000/dashboard', title: 'Dashboard', visibleText: 'Candidatos\nPosiciones\nConfiguración\nCerrar sesión' } },
  {
    signedIn: { type: 'boolean', instructions: 'Is the user signed in, judging from `page`?' },
    section: {
      type: 'choice',
      instructions: 'Which section is the page currently showing?',
      criteria: { dashboard: null, login: null, other: null },
    },
  },
);
console.log(JSON.stringify({ answers: result.answers, usage: result.usage, call: jevCallLog[0] }, null, 2));
