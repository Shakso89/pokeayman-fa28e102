import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const dir = path.resolve('.');

async function main() {
  let token = '';
  try {
    token = execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn('Could not read token via gh auth token:', e.message);
  }

  console.log('Discarding local build artifacts to allow clean pull...');
  try {
    await git.checkout({ fs, dir, ref: 'HEAD', force: true });
  } catch (e) {
    console.warn('Checkout warning:', e.message);
  }

  console.log('Pulling latest changes from origin/main...');
  await git.pull({
    fs,
    http,
    dir,
    ref: 'main',
    singleBranch: true,
    fastForwardOnly: false,
    author: {
      name: 'Shakso89',
      email: 'Shakso89@users.noreply.github.com'
    },
    onAuth: () => ({ username: token || 'x-access-token' })
  });

  console.log('Syncing game modules with latest files...');
  try {
    execSync('node scripts/sync-pokeayman-game-modules.mjs', { stdio: 'inherit' });
  } catch (e) {
    console.warn('Module sync note:', e.message);
  }

  const commits = await git.log({ fs, dir, depth: 3 });
  console.log('\n✓ Successfully pulled latest updates from GitHub!');
  console.log('Current HEAD commit:');
  for (const c of commits) {
    console.log(`  ${c.oid.substring(0, 7)} - ${c.commit.message.split('\n')[0]}`);
  }
}

main().catch(err => {
  console.error('Git pull error:', err);
  process.exit(1);
});
