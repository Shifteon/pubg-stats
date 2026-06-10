---
name: Create Pull Request Workflow
description: Guides agents on branching, committing, and opening a pull request using the GitHub CLI for the pubg-stats repository. Use this skill when the user asks to create or open a pull request.
---

# Create Pull Request Workflow

Follow this systematic workflow to create a branch, commit code, and open a pull request for the `pubg-stats` repository.

## 1. Branch Creation
Always checkout a new branch from `main` before committing or pushing code. 
* Prefix the branch name with either `feature-` or `refactor-` depending on the type of changes made.
* Keep the branch name concise, lowercase, and hyphenated.

**Example command:**
```bash
git checkout -b refactor-dashboard-colocation
# or
git checkout -b feature-player-average-comparison
```

## 2. Staging and Committing Changes
Ensure your working tree is clean except for the files you intend to commit.
1. Stage your modifications:
   ```bash
   git add .
   ```
2. Commit with a brief but descriptive message (preferably following conventional commits):
   ```bash
   git commit -m "refactor: colocate team dashboard components under team page directory"
   ```

*Note: If the git commit fails with "Author identity unknown", configure the local repository user and email to represent the AI coding agent:*
```bash
git config user.name "antigravity"
git config user.email "ben.wyatts.antigravity.agent@gmail.com"
```

## 3. Creating a Pull Request with the GitHub CLI
Do not push the branch manually if using the GitHub CLI `gh pr create` command directly, as it handles the push and remote setup interactively.

1. Run the `gh pr create` command specifying a descriptive title and body:
   ```bash
   gh pr create --title "<Title describing change>" --body "<Detailed description of what was changed and why>"
   ```
2. The CLI will prompt:
   ```
   ? Where should we push the '<branch-name>' branch?
   ```
   Provide/select the remote repository: **`Shifteon/pubg-stats`**.
3. Once created, print the URL of the pull request to the user.

## 4. Resetting Workspace to Main
After the pull request is successfully created:
1. Switch back to the default branch to keep the workspace ready for the next task:
   ```bash
   git checkout main
   ```
2. Verify you are on a clean `main` branch:
   ```bash
   git status
   ```
