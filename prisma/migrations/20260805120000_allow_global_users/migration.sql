-- Allow platform-level users, such as SUPER_ADMIN, to exist outside a client.
ALTER TABLE "User" ALTER COLUMN "clientId" DROP NOT NULL;
