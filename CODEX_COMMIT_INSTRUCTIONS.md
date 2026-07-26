# Codex Git Commit Instructions

## Purpose

These instructions define how Codex must commit repository changes so that the primary developer and the contributor below receive proper GitHub credit.

**Contributor to credit**

- Name: Neelaka Nadeeshan
- Email: `neelakanadeeshan171@gmail.com`

---

## Required Commit Workflow

Before creating a commit, Codex must:

1. Review the current branch and working tree.

   ```bash
   git branch --show-current
   git status
   ```

2. Review the actual changes.

   ```bash
   git diff
   git diff --staged
   ```

3. Run the relevant validation commands for the project, such as:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

   Run only commands that exist in the repository. Do not invent scripts.

4. Stage only the files related to the current task.

   ```bash
   git add <file-or-directory>
   ```

   Avoid using `git add .` when unrelated files are present.

5. Confirm the staged changes.

   ```bash
   git diff --staged
   ```

---

## Required Commit Format

Every commit that includes Neelaka Nadeeshan's contribution must include this exact co-author trailer:

```text
Co-authored-by: Neelaka Nadeeshan <neelakanadeeshan171@gmail.com>
```

There must be one blank line between the commit description and the co-author trailer.

### Example

```bash
git commit -m "Implement Sprint 7 candidate filtering interface

Add the filtering form, result table, pagination, loading states,
and API integration for the admin candidate filtering workflow.

Co-authored-by: Neelaka Nadeeshan <neelakanadeeshan171@gmail.com>"
```

### Minimal Example

```bash
git commit -m "Fix shortlist pagination

Co-authored-by: Neelaka Nadeeshan <neelakanadeeshan171@gmail.com>"
```

---

## Commit Message Rules

Codex must:

- Use an imperative, specific subject line.
- Keep the subject focused on one logical change.
- Explain important implementation details in the body when needed.
- Include the co-author trailer exactly as written above.
- Avoid vague subjects such as `update`, `changes`, `fix stuff`, or `work done`.
- Avoid combining unrelated changes in one commit.
- Never claim that tests passed unless the tests were actually run successfully.

Recommended subject examples:

```text
Implement admin student deep-dive page
Connect internship request form to API
Fix candidate filtering URL state
Add shortlist export loading state
Refactor registered-student query hooks
```

---

## Amending the Latest Unpushed Commit

When the latest commit was created without the co-author trailer and has not been pushed, Codex may amend it:

```bash
git commit --amend
```

The final commit message must end with:

```text
Co-authored-by: Neelaka Nadeeshan <neelakanadeeshan171@gmail.com>
```

For a non-interactive amendment:

```bash
git commit --amend -m "Implement Sprint 7 candidate filtering

Co-authored-by: Neelaka Nadeeshan <neelakanadeeshan171@gmail.com>"
```

Do not amend or rewrite shared history unless explicitly instructed.

---

## Pushing Changes

Before pushing, Codex must confirm:

```bash
git status
git log -1 --pretty=full
```

The latest commit should display the co-author trailer.

Push the current branch with:

```bash
git push
```

For a new branch:

```bash
git push -u origin <branch-name>
```

Do not force-push unless explicitly instructed.

---

## GitHub Credit Requirements

The co-authored commit can be associated with Neelaka Nadeeshan's GitHub profile when:

- `neelakanadeeshan171@gmail.com` is added to and verified on that GitHub account.
- The commit reaches the repository's default branch, normally `main`.
- The repository satisfies GitHub's normal contribution-counting rules.
- GitHub has completed processing the contribution statistics.

GitHub contribution graphs and repository contributor insights may take time to update.

---

## Safety Rules

Codex must not commit:

- `.env` files containing secrets
- API keys
- passwords
- access tokens
- private certificates
- database credentials
- generated dependency folders such as `node_modules`
- unrelated local configuration files
- large generated artifacts unless the repository explicitly tracks them

Before committing, inspect staged files with:

```bash
git diff --staged --name-only
```

---

## Final Checklist

Before every commit, Codex must verify:

- [ ] The current branch is correct.
- [ ] Only task-related files are staged.
- [ ] Relevant validation commands were run.
- [ ] The commit message is clear and specific.
- [ ] The co-author trailer is present exactly once.
- [ ] No secrets or unrelated files are included.
- [ ] The final commit was reviewed with `git log -1 --pretty=full`.
- [ ] No force-push or history rewrite is performed without explicit approval.
