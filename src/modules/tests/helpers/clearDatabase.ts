import prisma from "../../../config/prisma";

export async function clearDatabase() {
    const tablenames = await prisma.$queryRaw<
        Array<{ tablename: string }>
    >`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname='public'
  `;
    for (const { tablename } of tablenames) {
        if (tablename !== "_prisma_migrations") {
            await prisma.$executeRawUnsafe(
                `TRUNCATE TABLE "public"."${tablename}" RESTART IDENTITY CASCADE;`
            );
        }
    }
}


