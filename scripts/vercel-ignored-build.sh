#!/bin/bash

# Vercel Ignored Build Step script
# Determines if Vercel should build the current commit.
#
# Rules:
# - Build ONLY if the branch is 'master' AND the commit message starts with 'chore(release):'
# - Skip (ignore) all other commits to avoid redundant builds on development pushes.

echo "🔍 Checking build eligibility..."
echo "Branch: $VERCEL_GIT_COMMIT_REF"
echo "Commit Message: $VERCEL_GIT_COMMIT_MESSAGE"

if [ "$VERCEL_GIT_COMMIT_REF" = "master" ] && [[ "$VERCEL_GIT_COMMIT_MESSAGE" == chore\(release\):* ]]; then
  echo "✅ Match found (release commit on master). Proceeding with Vercel deployment."
  exit 1 # Exit code 1 tells Vercel to PROCEED with the build
else
  echo "🛑 Skip criteria met. Ignoring this commit for deployment."
  exit 0 # Exit code 0 tells Vercel to CANCEL/SKIP the build
fi
