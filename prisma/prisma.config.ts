import path from 'node:path'
import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Load .env.local for local development
config({ path: path.join(__dirname, '..', '.env.local') })

export default defineConfig({
    earlyAccess: true,
    schema: path.join(__dirname, 'schema.prisma'),
    migrate: {
        adapter: async () => {
            const { Pool } = await import('pg')
            const { PrismaPg } = await import('@prisma/adapter-pg')

            const pool = new Pool({
                connectionString: process.env.DATABASE_URL
            })

            return new PrismaPg(pool)
        }
    }
})
