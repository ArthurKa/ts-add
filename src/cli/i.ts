#!/usr/bin/env node

const oldTitle = process.title;
process.title = 'ts-add';
process.argv.push('-i');

import { tsAdd } from '..';

tsAdd().finally(() => {
  process.title = oldTitle;
});
