import { db } from "../lib/db";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
// Create a shared user entry
export async function createSharedUser(req, res) {
  try {
    const { firm_id, user_number, role } = req.body;
    const id = uuidv4();

    await db("firm_user_shares").insert({
      id,
      firm_id,
      user_number,
      role,
    });

    res.status(201).json({ message: "Shared user added", id });
  } catch (error) {
    console.error("Error creating shared user:", error);
    res.status(500).json({ error: "Failed to create shared user" });
  }
}

// Update shared user role
export async function updateSharedUser(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updated = await db("firm_user_shares")
      .where("id", id)
      .update({ role });

    if (updated === 0)
      return res.status(404).json({ error: "Shared user not found" });

    res.json({ message: "Shared user updated" });
  } catch (error) {
    console.error("Error updating shared user:", error);
    res.status(500).json({ error: "Failed to update shared user" });
  }
}

// Delete a shared user
export async function deleteSharedUser(req, res) {
  try {
    const { id } = req.params;

    const deleted = await db("firm_user_shares").where("id", id).delete();

    if (deleted === 0)
      return res.status(404).json({ error: "Shared user not found" });

    res.json({ message: "Shared user deleted" });
  } catch (error) {
    console.error("Error deleting shared user:", error);
    res.status(500).json({ error: "Failed to delete shared user" });
  }
}

// Get all shared users for a firm
export async function getSharedUsersByFirm(req, res) {
  try {
    const { firm_id } = req.params;

    const users = await db("firm_user_shares")
      .where("firm_id", firm_id)
      .select();

    res.json(users);
  } catch (error) {
    console.error("Error fetching shared users:", error);
    res.status(500).json({ error: "Failed to get shared users" });
  }
}

// Get all firms shared with a given user number
export async function getFirmsByUserNumber(req, res) {
  try {
    const { user_number } = req.params;

    // Get all shares for the user
    const shares = await db("firm_user_shares")
      .where("user_number", user_number)
      .select();

    const firmIds = shares.map((s) => s.firm_id);

    if (firmIds.length === 0) return res.json([]);

    // Get all firm details for the collected firm IDs
    const firms = await db("firms")
      .whereIn("id", firmIds)
      .select();

    // Create a map for quick lookup of firm name by ID
    const firmMap = {};
    firms.forEach(firm => {
      firmMap[firm.id] = firm.name;
    });

    // Merge firm name into each share object
    const enrichedShares = shares.map(share => ({
      ...share,
      firm_name: firmMap[share.firm_id] || null,
    }));

    res.json(enrichedShares);
  } catch (error) {
    console.error("Error fetching firms by user:", error);
    res.status(500).json({ error: "Failed to get firms" });
  }
}


// Toggle sync_enabled status of a firm
export async function toggleSyncEnabled(req, res) {
  try {
    const { firm_id } = req.params;

    const firm = await db("firms").where("id", firm_id).first();

    if (!firm) return res.status(404).json({ error: "Firm not found" });

    const newValue = firm.sync_enabled ? 0 : 1;

    await db("firms").where("id", firm_id).update({ sync_enabled: newValue });

    res.json({ message: "Sync toggled", sync_enabled: newValue });
  } catch (error) {
    console.error("Error toggling sync:", error);
    res.status(500).json({ error: "Failed to toggle sync" });
  }
}

export const pullLocalData = async (req: Request, res: Response) => {
  try {
    const firmId = req.query.firmId as string;
    if (!firmId) return res.status(400).json({ error: "firmId is required" });

    const tables = [
      "categories",
      "units",
      "unit_conversions",
      "items",
      "groups",
      "parties",
      "party_additional_fields",
      "documents",
      "document_items",
      "document_charges",
      "document_transportation",
      "document_relationships",
      "stock_movements",
      "bank_accounts",
      "bank_transactions",
      "payments",
    ];

    const result: Record<string, any[]> = {};

    for (const table of tables) {
      result[table] = await db(table, firmId).select();
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in pullLocalData:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const pushToLocalDb = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const firmId = req.query.firmId as string;

    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Invalid sync payload" });
    }
    // ✅ Check if this firm already exists
    const firmExists = await db("firms").where("id", firmId).first();
    const isInitialSync = !firmExists;

    for (const tableName of Object.keys(data)) {
      const rows = data[tableName];
      if (!Array.isArray(rows)) continue;

      try {
        if (!isInitialSync) {
          // Scoped deletion for existing firm
          await db(tableName).where("firmId", firmId).delete();
        }

        // Insert all rows (initial or update)
        for (const row of rows) {
          await db(tableName).insert(row);
        }
      } catch (err) {
        console.warn(`Error syncing table ${tableName}:`, err);
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Data pushed successfully" });
  } catch (err) {
    console.error("Error in pushToLocalDb:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
