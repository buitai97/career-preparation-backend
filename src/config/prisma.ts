import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL!;
const isLocalDb =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

const shouldUseSsl = process.env.DB_SSL === "true" || !isLocalDb;

const adapter = new PrismaPg({
    connectionString,
    ...(shouldUseSsl
        ? {
              ssl: process.env.AIVEN_CA_CERT
                  ? {
                        rejectUnauthorized: true,
                        ca: process.env.AIVEN_CA_CERT,
                    }
                  : {
                        rejectUnauthorized: true,
                        ca: fs.readFileSync(
                            path.resolve(process.cwd(), "certs/ca.pem"),
                            "utf8"
                        ),
                    },
          }
        : {}),
});

const prisma = new PrismaClient({
    adapter,
});

export default prisma;
