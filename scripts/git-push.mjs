import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const dir = path.resolve('.');
const commitMessage = process.argv.slice(2).join(' ') || 'Update from Antigravity';

async function main() {
  let token = '';
  try {
    token = execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.warn('Could not read token via gh auth token:', e.message);
  }

  console.log('Staging changes...');
  const status = await git.statusMatrix({ fs, dir });
  for (const [filepath, head, workdir, stage] of status) {
    if (workdir !== stage) {
      if (workdir === 0) {
        await git.remove({ fs, dir, filepath });
      } else {
        await git.add({ fs, dir, filepath });
      }
    }
  }

  console.log(`Committing: "${commitMessage}"...`);
  const sha = await git.commit({
    fs,
    dir,
    message: commitMessage,
    author: {
      name: 'Shakso89',
      email: 'Shakso89@users.noreply.github.com'
    }
  });
  console.log(`Committed: ${sha.substring(0, 7)}`);

  console.log('Pushing to origin/main...');
  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({ username: token || 'x-access-token' })
  });

  if (pushResult.ok) {
    console.log('✓ Successfully pushed to GitHub!');
  } else {
    console.error('Push failed:', pushResult);
  }
}

main().catch(err => {
  console.error('Git push error:', err);
  process.exit(1);
});
