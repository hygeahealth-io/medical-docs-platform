import {
  users,
  keyBindings,
  extensionSettings,
  activityLogs,
  securityIncidents,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, like, and, or, count } from "drizzle-orm";

// Interface for storage operations
export class DatabaseStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData) {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User management operations
  async getAllUsers(filters = {}) {
    const { search, role, tier, status, offset = 0, limit = 50 } = filters;
    
    let query = db.select().from(users);
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (tier) {
      conditions.push(eq(users.tier, tier));
    }

    if (status) {
      conditions.push(eq(users.isActive, status === "active"));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const totalQuery = db.select({ count: count() }).from(users);
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }

    const [usersResult, totalResult] = await Promise.all([
      query.limit(limit).offset(offset),
      totalQuery,
    ]);

    return {
      users: usersResult,
      total: totalResult[0]?.count || 0,
    };
  }

  async updateUser(userData) {
    const { id, ...updateData } = userData;
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
  }

  // Key bindings operations
  async getUserKeyBindings(userId) {
    return await db
      .select()
      .from(keyBindings)
      .where(eq(keyBindings.userId, userId))
      .orderBy(keyBindings.category, keyBindings.shortcut);
  }

  async createKeyBinding(keyBinding) {
    const [result] = await db
      .insert(keyBindings)
      .values(keyBinding)
      .returning();
    return result;
  }

  async updateKeyBinding(id, updates) {
    const [result] = await db
      .update(keyBindings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(keyBindings.id, id))
      .returning();
    return result;
  }

  async deleteKeyBinding(id) {
    await db.delete(keyBindings).where(eq(keyBindings.id, id));
  }

  // Extension settings operations
  async getUserExtensionSettings(userId) {
    const [settings] = await db
      .select()
      .from(extensionSettings)
      .where(eq(extensionSettings.userId, userId));
    return settings;
  }

  async upsertExtensionSettings(settings) {
    const [result] = await db
      .insert(extensionSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: extensionSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Activity logs operations
  async createActivityLog(log) {
    const [activity] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return activity;
  }

  async getUserActivityLogs(userId, limit = 50) {
    const results = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
    return results;
  }

  // Security incidents operations
  async createSecurityIncident(incident) {
    const [result] = await db
      .insert(securityIncidents)
      .values(incident)
      .returning();
    return result;
  }

  async getSecurityIncidents(filters = {}) {
    const { resolved, severity, limit = 100 } = filters;
    
    let query = db.select().from(securityIncidents);
    const conditions = [];

    if (typeof resolved === "boolean") {
      conditions.push(eq(securityIncidents.resolved, resolved));
    }

    if (severity) {
      conditions.push(eq(securityIncidents.severity, severity));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query
      .orderBy(desc(securityIncidents.createdAt))
      .limit(limit);
  }

  async resolveSecurityIncident(id) {
    const [result] = await db
      .update(securityIncidents)
      .set({
        resolved: true,
        resolvedAt: new Date(),
      })
      .where(eq(securityIncidents.id, id))
      .returning();
    return result;
  }

  // Analytics operations
  async getDashboardStats() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      dailyActiveUsersResult,
      newRegistrationsResult,
      securityIncidentsResult,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(activityLogs)
        .where(eq(activityLogs.createdAt, yesterday)),
      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.createdAt, weekAgo)),
      db
        .select({ count: count() })
        .from(securityIncidents)
        .where(and(
          eq(securityIncidents.resolved, false),
          eq(securityIncidents.createdAt, weekAgo)
        )),
    ]);

    return {
      dailyActiveUsers: dailyActiveUsersResult[0]?.count || 0,
      newRegistrations: newRegistrationsResult[0]?.count || 0,
      revenue: 0, // Placeholder for revenue calculation
      securityIncidents: securityIncidentsResult[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();