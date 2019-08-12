/* eslint import/no-extraneous-dependencies: ["error", { "peerDependencies": true }] */

import dotenv from 'dotenv';

dotenv.config();

const SRC = process.env.SRC || 'app';
const OUTPUT = process.env.OUTPUT || 'dist';
const TEMP = '.tmp';

export {
  SRC,
  OUTPUT,
  TEMP,
};
