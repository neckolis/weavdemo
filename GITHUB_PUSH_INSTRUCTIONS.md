# Instructions for Pushing to GitHub

This document provides instructions for pushing your code to the new GitHub repository at https://github.com/neckolis/weavdemo.

## Prerequisites

1. Make sure you have Git installed on your machine
2. Ensure you have a GitHub account
3. You need to have write access to the repository https://github.com/neckolis/weavdemo

## Creating a Personal Access Token (PAT)

To push to GitHub, you'll need to create a Personal Access Token:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token" and select "Generate new token (classic)"
3. Give your token a descriptive name
4. Select the "repo" scope to allow the token to access your repositories
5. Click "Generate token"
6. **Important**: Copy the token immediately and save it somewhere secure. You won't be able to see it again!

## Pushing to GitHub

### Option 1: Using the provided script

We've created a script to help you push to GitHub:

1. Open a terminal in the project directory
2. Run the script:
   ```
   ./push_to_github.sh
   ```
3. Enter your GitHub username and the Personal Access Token when prompted

### Option 2: Manual push

If you prefer to push manually:

1. Open a terminal in the project directory
2. Add the new remote with your PAT:
   ```
   git remote add github-new https://YOUR_USERNAME:YOUR_PAT@github.com/neckolis/weavdemo.git
   ```
3. Push to the new repository:
   ```
   git push -u github-new main
   ```

## After Pushing

Once you've successfully pushed to the new repository, you can:

1. Deploy the frontend to Cloudflare Pages
2. Deploy the backend to Render
3. Follow the deployment instructions in the main README.md file

## Troubleshooting

If you encounter any issues:

- Make sure your Personal Access Token has the correct permissions
- Verify that you have write access to the repository
- Check that you're using the correct GitHub username
- Ensure you're in the correct directory when running the commands
