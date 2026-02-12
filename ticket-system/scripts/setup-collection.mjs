/**
 * Setup Script: Create Tickets Collection in Appwrite
 *
 * This script uses the node-appwrite (server SDK) to create a new
 * tickets collection with the correct attributes and permissions.
 *
 * Usage:
 *   node scripts/setup-collection.mjs
 *
 * After running successfully, update your .env file with the new
 * collection ID printed at the end.
 */

import { Client, Databases, Permission, Role, ID } from "node-appwrite";

// ─── Config ────────────────────────────────────────────────────────────
const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "698c4d4a0032d3feede6";
const API_KEY =
    "standard_f075e310ed10ac4f8aea636ca000b71e00176d70ac26f6e7d82f0c5140e61b0fcc6199aaf4e8cbb06c92ae66fcf7d5b96f66f44847fefde9b4a539a94c9e49135ed8c9c210dc13d04f647cbb957540d9286e5523abf4d93c4ce83a454e351c68907fc085fe6e907193bc93c978583f564f74e354e4e8f0f76d256fba941b539d";
const DATABASE_ID = "698c66ac002427b203a0";

// ─── Initialize Client ─────────────────────────────────────────────────
const client = new Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    console.log("🚀 Starting Appwrite collection setup...\n");

    // ─── 1. Create Collection ───────────────────────────────────────────
    console.log("📦 Creating 'tickets' collection...");
    const collection = await databases.createCollection({
        databaseId: DATABASE_ID,
        collectionId: ID.unique(),
        name: "tickets",
        permissions: [
            Permission.create(Role.users()),  // Any logged-in user can create
            Permission.read(Role.users()),    // Any logged-in user can read
            Permission.update(Role.users()),  // Any logged-in user can update own
            Permission.delete(Role.users()),  // Any logged-in user can delete own
        ],
        documentSecurity: true, // Enable document-level permissions
    });

    const COLLECTION_ID = collection.$id;
    console.log(`   ✅ Collection created: ${COLLECTION_ID}\n`);

    // ─── 2. Create Attributes ──────────────────────────────────────────
    console.log("🏗️  Creating attributes...");

    // title - required string
    await databases.createStringAttribute({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        key: "title",
        size: 255,
        required: true,
    });
    console.log("   ✅ title (string, required, max 255)");

    // description - required string (larger)
    await databases.createStringAttribute({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        key: "description",
        size: 5000,
        required: true,
    });
    console.log("   ✅ description (string, required, max 5000)");

    // status - required string with default "open"
    await databases.createStringAttribute({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        key: "status",
        size: 50,
        required: false,
        xdefault: "open",
    });
    console.log('   ✅ status (string, default "open", max 50)');

    // userId - required string
    await databases.createStringAttribute({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        key: "userId",
        size: 100,
        required: true,
    });
    console.log("   ✅ userId (string, required, max 100)");

    // screenshot - optional string (stores file ID)
    await databases.createStringAttribute({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        key: "screenshot",
        size: 255,
        required: false,
    });
    console.log("   ✅ screenshot (string, optional, max 255)");

    // ─── 3. Wait for attributes to be ready ─────────────────────────────
    console.log("\n⏳ Waiting for attributes to be processed...");
    await waitForAttributes(DATABASE_ID, COLLECTION_ID);
    console.log("   ✅ All attributes are ready!\n");

    // ─── 4. Create Indexes ──────────────────────────────────────────────
    console.log("📇 Creating indexes...");

    await databases.createIndex({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        key: "idx_userId",
        type: "key",
        attributes: ["userId"],
    });
    console.log("   ✅ Index on userId");

    await databases.createIndex({
        databaseId: DATABASE_ID,
        collectionId: COLLECTION_ID,
        key: "idx_status",
        type: "key",
        attributes: ["status"],
    });
    console.log("   ✅ Index on status");

    // ─── Done ───────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(55));
    console.log("🎉 Collection setup complete!");
    console.log("═".repeat(55));
    console.log(`\n📋 New Collection ID: ${COLLECTION_ID}`);
    console.log(`\nUpdate your .env file:`);
    console.log(
        `   NEXT_PUBLIC_TICKETS_COLLECTION_ID = "${COLLECTION_ID}"`
    );
    console.log("═".repeat(55) + "\n");
}

/**
 * Poll until all attributes in the collection are in "available" status.
 * Appwrite processes attributes asynchronously.
 */
async function waitForAttributes(databaseId, collectionId) {
    const maxRetries = 30;
    for (let i = 0; i < maxRetries; i++) {
        const attrs = await databases.listAttributes({
            databaseId,
            collectionId,
        });

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
    process.exit(1);
});
