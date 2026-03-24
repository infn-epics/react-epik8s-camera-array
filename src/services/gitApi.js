/**
 * Git platform API abstraction — supports GitLab and GitHub.
 *
 * Detects platform from the repository URL.  Uses personal access tokens (PAT)
 * for authentication.  Operations:
 *   - getFile: read a file from the repo
 *   - commitFile: create or update a file via a commit
 */

/**
 * Parse a git clone URL into { platform, host, projectPath }.
 * Handles https://host/group/project.git and git@host:group/project.git
 */
export function parseGitUrl(giturl) {
  if (!giturl) return null;

  // HTTPS
  const httpsMatch = giturl.match(/^https?:\/\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    const host = httpsMatch[1];
    const projectPath = httpsMatch[2];
    const platform = host.includes('github.com') ? 'github' : 'gitlab';
    return { platform, host, projectPath };
  }

  // SSH
  const sshMatch = giturl.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (sshMatch) {
    const host = sshMatch[1];
    const projectPath = sshMatch[2];
    const platform = host.includes('github.com') ? 'github' : 'gitlab';
    return { platform, host, projectPath };
  }

  return null;
}

/**
 * Read a file from the repository.
 * Returns { content (string), sha (GitHub) | blob_id (GitLab), encoding }.
 */
export async function getFile(repoInfo, filePath, branch, token) {
  if (repoInfo.platform === 'github') {
    return getFileGitHub(repoInfo, filePath, branch, token);
  }
  return getFileGitLab(repoInfo, filePath, branch, token);
}

/**
 * Commit a file (create or update) to the repository.
 * Returns the commit info from the API.
 */
export async function commitFile(repoInfo, filePath, branch, content, commitMessage, token, existingRef) {
  if (repoInfo.platform === 'github') {
    return commitFileGitHub(repoInfo, filePath, branch, content, commitMessage, token, existingRef);
  }
  return commitFileGitLab(repoInfo, filePath, branch, content, commitMessage, token, existingRef);
}

// ─── GitLab ────────────────────────────────────────────────────────────

async function getFileGitLab({ host, projectPath }, filePath, branch, token) {
  const projectId = encodeURIComponent(projectPath);
  const encodedPath = encodeURIComponent(filePath);
  const url = `https://${host}/api/v4/projects/${projectId}/repository/files/${encodedPath}?ref=${encodeURIComponent(branch)}`;
  const resp = await fetch(url, {
    headers: { 'PRIVATE-TOKEN': token },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitLab GET file failed (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  const content = atob(data.content);
  return { content, blob_id: data.blob_id, encoding: data.encoding };
}

async function commitFileGitLab({ host, projectPath }, filePath, branch, content, commitMessage, token) {
  const projectId = encodeURIComponent(projectPath);
  const encodedPath = encodeURIComponent(filePath);
  const url = `https://${host}/api/v4/projects/${projectId}/repository/files/${encodedPath}`;

  // Determine if the file already exists — GitLab requires POST for create, PUT for update
  const checkResp = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, {
    headers: { 'PRIVATE-TOKEN': token },
  });
  const method = checkResp.ok ? 'PUT' : 'POST';

  const resp = await fetch(url, {
    method,
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      branch,
      content,
      commit_message: commitMessage,
      encoding: 'text',
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitLab commit failed (${resp.status}): ${text}`);
  }
  return resp.json();
}

// ─── GitHub ────────────────────────────────────────────────────────────

async function getFileGitHub({ projectPath }, filePath, branch, token) {
  const url = `https://api.github.com/repos/${projectPath}/contents/${filePath}?ref=${encodeURIComponent(branch)}`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitHub GET file failed (${resp.status}): ${text}`);
  }
  const data = await resp.json();
  const content = atob(data.content.replace(/\n/g, ''));
  return { content, sha: data.sha, encoding: data.encoding };
}

async function commitFileGitHub({ projectPath }, filePath, branch, content, commitMessage, token, existingRef) {
  const url = `https://api.github.com/repos/${projectPath}/contents/${filePath}`;
  const body = {
    message: commitMessage,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  // If updating an existing file, we need the sha
  if (existingRef) body.sha = existingRef;

  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitHub commit failed (${resp.status}): ${text}`);
  }
  return resp.json();
}
