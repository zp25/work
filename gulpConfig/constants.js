/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import dotenv from 'dotenv';

dotenv.config({ silent: true });

const SRC = process.env.SRC || 'app';
const OUTPUT = process.env.OUTPUT || 'dist';
const TEMP = '.tmp';

export {
  SRC,
  OUTPUT,
  TEMP,
};
