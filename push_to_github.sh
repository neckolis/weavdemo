#!/bin/bash

# This script helps push the code to a new GitHub repository
# You'll need to create a Personal Access Token (PAT) on GitHub first

echo "This script will help you push your code to https://github.com/amgtrott/weaviatedemo1"
echo "Before continuing, make sure you have:"
echo "1. Created the repository on GitHub"
echo "2. Generated a Personal Access Token (PAT) with 'repo' scope"
echo ""
echo "To create a PAT, go to: https://github.com/settings/tokens/new"
echo ""

# Ask for GitHub username and PAT
read -p "Enter your GitHub username: " username
read -sp "Enter your GitHub Personal Access Token: " token
echo ""

# Configure Git with the PAT
git_url="https://$username:$token@github.com/amgtrott/weaviatedemo1.git"

# Check if the remote already exists
if git remote | grep -q "github-new"; then
    git remote remove github-new
fi

# Add the new remote
git remote add github-new "$git_url"

# Push to the new repository
echo "Pushing to the new repository..."
git push -u github-new main

# Clean up
git remote remove github-new

echo ""
echo "Done! Your code has been pushed to https://github.com/amgtrott/weaviatedemo1"
echo "You can now use this repository for deployment to Cloudflare Pages and Render."
