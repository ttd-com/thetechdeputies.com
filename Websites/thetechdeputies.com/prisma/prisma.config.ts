import path from 'node:path'
import { getDatabaseUrl } from '../src/lib/env'

export default {
  schema: path.join(__dirname, 'schema.prisma'),
  datasources: {
    db: {
      url: getDatabaseUrl() || "postgresql://test:test@localhost:5432/thetechdeputies"
    }
  }
}