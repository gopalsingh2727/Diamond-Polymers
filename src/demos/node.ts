import { lstat } from 'node:fs/promises';
import { cwd } from 'node:process';

lstat(cwd()).then((stats) => {

}).catch((err) => {

});