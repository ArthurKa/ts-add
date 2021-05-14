#!/usr/bin/env node

const oldTitle = process.title;
process.title = 'ts-add';

import { tsAdd } from '..';

tsAdd().finally(() => {
  process.title = oldTitle;
});
