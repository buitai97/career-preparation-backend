import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs'
import path from 'path'

const ca = fs.readFileSync(
  path.join(process.cwd(), 'certs', 'ca.pem')
)

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: {
        ca,
    },
})

const prisma = new PrismaClient({
    adapter,
})

export default prisma