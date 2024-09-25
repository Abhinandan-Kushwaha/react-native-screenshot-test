import * as fs from 'fs';
import * as path from 'path';

// Path to the user's package.json
const packageJsonPath = path.resolve(process.cwd(), 'package.json');

// Read and parse the package.json file
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Modify package.json (for example, adding a script)
packageJson.scripts = {
  ...packageJson.scripts,
  'ss-test': 'cd ./node_modules/screenshot-test-server/dist && node server.js',
};

// Write the modified package.json back to the file system
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');