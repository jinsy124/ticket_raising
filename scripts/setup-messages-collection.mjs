/**
 * Setup Script: Create Messages Collection in Appwrite
 *
 * This script creates a messages collection for the support ticket system
 * with proper attributes, indexes, and permissions.
 *
 * Usage:
 *   node scripts/setup-messages-collection.mjs
 */

import { Client, Databases, Permission, Role, ID } from "node-appwrite";

// ─── Config ────────────────────────────────────────────────────────
// Replace these with your actual values from .env.local
const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "698c4d4a0032d3feede6";
const API_KEY = "standard_f075e310ed10ac4f8aea636ca000b71e00176d70ac26f6e7d82f0c5140e61b0fcc6199aaf4e8cbb06c92ae66fcf7d5b96f66f44847fefde9b4a539a94c9e49135ed8c9c210dc13d04f647cbb957540d9286e5523abf4d93c4ce83a454e351c68907fc085fe6e907193bc93c978583f564f74e354e4e8f0f76d256fba941b539d";
const DATABASE_ID = "698c66ac002427b203a0";

// ─── Initialize Client ─────────────────────────────────────────────────
const client = new Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    console.log("🚀 Creating Messages Collection...\n");
    console.log("Using Database ID:", DATABASE_ID);

    // ─── 1. Create Collection ───────────────────────────────────────────
    console.log("\n📦 Creating 'messages' collection...");
    
    const collection = await databases.createCollection(
        DATABASE_ID,
        ID.unique(),
        "messages",
        [
            Permission.create(Role.users()),  // Any authenticated user can create
            Permission.read(Role.users()),    // Users can read
            Permission.update(Role.users()),  // Users can update their own
            Permission.delete(Role.users()),  // Users can delete their own
        ],
        true // Enable document-level security
    );

    const COLLECTION_ID = collection.$id;
    console.log(`   ✅ Collection created: ${COLLECTION_ID}\n`);

    // ─── 2. Create Attributes ──────────────────────────────────────────
    console.log("🏗️  Creating attributes...");

    // ticketId - required (links message to ticket)
    await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        "ticketId",
        100,
        true // required
    );
    console.log("   ✅ ticketId (string, required, max 100)");

    // userId - required (identifies the sender)
    await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        "userId",
        100,
        true // required
    );
    console.log("   ✅ userId (string, required, max 100)");

    // message - required (message body)
    await databases.createStringAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        "message",
        5000,
        true // required
    );
    console.log("   ✅ message (string, required, max 5000)");

    // isInternal - optional boolean (for admin-only notes)
    await databases.createBooleanAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        "isInternal",
        false, // not required
        false  // default value
    );
    console.log("   ✅ isInternal (boolean, optional, default: false)");

    // ─── 3. Wait for attributes to be ready ─────────────────────────────
    console.log("\n⏳ Waiting for attributes to be processed...");
    await waitForAttributes(DATABASE_ID, COLLECTION_ID);
    console.log("   ✅ All attributes are ready!\n");

    // ─── 4. Create Indexes ──────────────────────────────────────────────
    console.log("📇 Creating indexes...");

    await databases.createIndex(
        DATABASE_ID,
        COLLECTION_ID,
        "idx_ticketId",
        "key",
        ["ticketId"]
    );
    console.log("   ✅ Index on ticketId");

    await databases.createIndex(
        DATABASE_ID,
        COLLECTION_ID,
        "idx_userId",
        "key",
        ["userId"]
    );
    console.log("   ✅ Index on userId");

    // ─── Done ───────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(60));
    console.log("🎉 Messages Collection Setup Complete!");
    console.log("═".repeat(60));
    console.log(`\n📋 New Collection ID: ${COLLECTION_ID}`);
    console.log(`\nAdd this to your .env.local file:`);
    console.log(`   NEXT_PUBLIC_MESSAGES_COLLECTION_ID="${COLLECTION_ID}"`);
    console.log("\n" + "═".repeat(60) + "\n");
}

/**
 * Poll until all attributes in the collection are in "available" status.
 * Appwrite processes attributes asynchronously.
 */
async function waitForAttributes(databaseId, collectionId) {
    const maxRetries = 30;
    for (let i = 0; i < maxRetries; i++) {
        const attrs = await databases.listAttributes(databaseId, collectionId);

        const allReady = attrs.attributes.every(
            (attr) => attr.status === "available"
        );

        if (allReady && attrs.attributes.length > 0) return;

        // Wait 1 second before checking again
        await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error("Timed out waiting for attributes to become available.");
}

// ─── Run ────────────────────────────────────────────────────────────────
main().catch((err) => {
    console.error("\n❌ Setup failed:", err.message);
    console.error(err);
    process.exit(1);
});
