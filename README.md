# Career Prep Backend

Backend API for the Career Prep Platform, an AI-powered resume builder and interview practice system.

Frontend repository:
https://github.com/buitai97/career-prep-frontend

Tech stack:
- Node.js
- Express
- TypeScript
- Prisma 7
- MongoDB Atlas
- JWT
- Bcrypt

## Project Structure

`src/`
- `config/` app config and Prisma client
- `modules/` feature modules (`auth`, `resume`, `interview`)
- `middleware/` Express middleware
- `app.ts`
- `server.ts`

`prisma/`
- `schema.prisma`

## Environment Variables

Create a `.env` file in the project root:

```bash
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/career_prep?retryWrites=true&w=majority&appName=career-prep
TEST_DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/career_prep_test?retryWrites=true&w=majority&appName=career-prep
PORT=5000
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
JWT_SECRET=YOUR_JWT_SECRET
FRONTEND_URL=http://localhost:3000
```

## Atlas Setup Notes

- In MongoDB Atlas, allow your development IP in Network Access.
- Create a database user with read/write access.
- Replace `<username>`, `<password>`, and `<cluster-name>` in your URI.

## Install Dependencies

```bash
npm install
```

## Sync Prisma Schema to MongoDB

```bash
npx prisma db push
npx prisma generate
```

## Run Development Server

```bash
npm run dev
```

Server runs at:

```bash
http://localhost:5000
```

## Optional Local MongoDB (Docker)

If you want local MongoDB instead of Atlas for development:

```bash
docker compose up -d
```
