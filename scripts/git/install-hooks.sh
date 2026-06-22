#!/bin/sh
set -eu

repo_root="$(git rev-parse --show-toplevel)"
hooks_dir="$repo_root/.git/hooks"
source_hook="$repo_root/scripts/git/pre-push"
target_hook="$hooks_dir/pre-push"

mkdir -p "$hooks_dir"
cp "$source_hook" "$target_hook"
chmod +x "$target_hook"

echo "Installed pre-push hook: blocks direct pushes to main."
echo "Run 'npm run verify' before opening a PR."
