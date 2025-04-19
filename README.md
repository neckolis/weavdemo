# Weaviate Demo Application

## Project info

**URL**: https://lovable.dev/projects/63353980-acab-4d9e-a0a2-818aa6ab831c

## Running the Application

This application can be run locally using Docker Compose, which makes it easy to set up both the frontend and backend services.

### Prerequisites

- Docker and Docker Compose installed on your machine
- A Weaviate instance (cloud or self-hosted) with API key

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
WEAVIATE_URL=your-weaviate-instance-url
WEAVIATE_API_KEY=your-weaviate-api-key
```

### Development Mode

To run the application in development mode with hot-reloading:

```sh
# Start both frontend and backend services
docker-compose up
```

The frontend will be available at http://localhost:8080 and the backend at http://localhost:8000.

### Production Mode

To run the application in production mode:

```sh
# Build and start the production services
docker-compose -f docker-compose.prod.yml up -d
```

The application will be available at http://localhost:80.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/63353980-acab-4d9e-a0a2-818aa6ab831c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment Options

### Option 1: Cloudflare Pages (Frontend) + Render (Backend)

This is the recommended deployment option for this application.

#### Backend Deployment on Render

1. Create a new Web Service on [Render](https://render.com/)
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `weaviatedemo-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `WEAVIATE_URL`: Your Weaviate instance URL
   - `WEAVIATE_API_KEY`: Your Weaviate API key

#### Frontend Deployment on Cloudflare Pages

1. Install Wrangler CLI:
   ```sh
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```sh
   wrangler login
   ```

3. Build the frontend:
   ```sh
   npm run build
   ```

4. Deploy to Cloudflare Pages:
   ```sh
   npm run deploy
   ```

5. Configure environment variables in Cloudflare Pages dashboard:
   - Go to your project settings
   - Add environment variable: `VITE_API_URL` with value of your Render backend URL

### Option 2: Deploy with Docker

You can deploy this application to any hosting provider that supports Docker and Docker Compose:

1. **VPS providers** like DigitalOcean, Linode, AWS EC2, etc.
   - Set up a server with Docker and Docker Compose installed
   - Clone this repository to the server
   - Create the `.env` file with your Weaviate credentials
   - Run `docker-compose -f docker-compose.prod.yml up -d`
   - Set up a domain name and configure SSL with Let's Encrypt

### Option 3: Other Platform as a Service (PaaS) Options

You can deploy the frontend and backend separately to other PaaS providers:

1. **Backend options**:
   - [Railway](https://railway.app/) - Easy deployment with GitHub integration
   - [Fly.io](https://fly.io/) - Global deployment with free tier

2. **Frontend options**:
   - [Vercel](https://vercel.com/) - Optimized for frontend applications
   - [Netlify](https://www.netlify.com/) - Easy deployment with continuous integration

### Option 4: Lovable Deployment

Simply open [Lovable](https://lovable.dev/projects/63353980-acab-4d9e-a0a2-818aa6ab831c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
