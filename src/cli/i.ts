#!/usr/bin/env node

const oldTitle = process.title;
process.title = 'ts-add';

if(process.argv.includes('--:make-autocompletion-flags')) {
  const command = process.argv.pop()!.split(' ');
  command.splice(1, 0, '-i');
  process.argv.push(command.join(' '));
} else {
  process.argv.splice(2, 0, '-i');
}

import { tsAdd } from '..';

tsAdd().finally(() => {
  process.title = oldTitle;
});
