import {
  users,
  keyBindings,
  extensionSettings,
  activityLogs,
  securityIncidents,
  adminToolSettings,
  adminSettings,
  type User,
  type UpsertUser,
  type UpdateUser,
  type InsertKeyBinding,
  type KeyBinding,
  type InsertExtensionSettings,
  type ExtensionSettings,
  type InsertActivityLog,
  type ActivityLog,
  type InsertSecurityIncident,
  type SecurityIncident,
  type InsertAdminToolSettings,
  type AdminToolSettings,
  type InsertAdminSettings,
  type AdminSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management operations
  getAllUsers(filters?: {
    search?: string;
    role?: string;
    tier?: string;
    status?: string;
    offset?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }>;
  updateUser(userData: UpdateUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Key bindings operations
  getUserKeyBindings(userId: string): Promise<KeyBinding[]>;
  createKeyBinding(keyBinding: InsertKeyBinding): Promise<KeyBinding>;
  updateKeyBinding(id: number, updates: Partial<InsertKeyBinding>): Promise<KeyBinding>;
  deleteKeyBinding(id: number): Promise<void>;
  
  // Extension settings operations
  getUserExtensionSettings(userId: string): Promise<ExtensionSettings | undefined>;
  upsertExtensionSettings(settings: InsertExtensionSettings): Promise<ExtensionSettings>;
  
  // Activity logs operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getUserActivityLogs(userId: string, limit?: number): Promise<ActivityLog[]>;
  
  // Security incidents operations
  createSecurityIncident(incident: InsertSecurityIncident): Promise<SecurityIncident>;
  getSecurityIncidents(filters?: {
    resolved?: boolean;
    severity?: string;
    limit?: number;
  }): Promise<SecurityIncident[]>;
  resolveSecurityIncident(id: number): Promise<SecurityIncident>;
  
  // Analytics operations
  getDashboardStats(): Promise<{
    dailyActiveUsers: number;
    newRegistrations: number;
    revenue: number;
    securityIncidents: number;
  }>;
  
  // Admin tool settings operations
  getAdminToolSettings(): Promise<Record<string, any>>;
  updateAdminToolSettings(toolType: string, settings: any): Promise<AdminToolSettings>;
  
  // Admin settings operations
  getAdminSettings(): Promise<Record<string, any>>;
  updateAdminSettings(category: string, settings: any): Promise<AdminSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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
  async getAllUsers(filters?: {
    search?: string;
    role?: string;
    tier?: string;
    status?: string;
    offset?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    const conditions = [];
    
    if (filters?.search) {
      conditions.push(
        sql`(${users.firstName} ILIKE ${`%${filters.search}%`} OR ${users.lastName} ILIKE ${`%${filters.search}%`} OR ${users.email} ILIKE ${`%${filters.search}%`})`
      );
    }
    
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as any));
    }
    
    if (filters?.tier) {
      conditions.push(eq(users.tier, filters.tier as any));
    }
    
    if (filters?.status === 'active') {
      conditions.push(eq(users.isActive, true));
    } else if (filters?.status === 'inactive') {
      conditions.push(eq(users.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [userResults, totalResults] = await Promise.all([
      db
        .select()
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(filters?.limit || 10)
        .offset(filters?.offset || 0),
      db
        .select({ count: count() })
        .from(users)
        .where(whereClause),
    ]);

    return {
      users: userResults,
      total: totalResults[0].count,
    };
  }

  async updateUser(userData: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, userData.id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Key bindings operations
  async getUserKeyBindings(userId: string): Promise<KeyBinding[]> {
    return await db
      .select()
      .from(keyBindings)
      .where(eq(keyBindings.userId, userId))
      .orderBy(desc(keyBindings.createdAt));
  }

  async createKeyBinding(keyBinding: InsertKeyBinding): Promise<KeyBinding> {
    const [binding] = await db
      .insert(keyBindings)
      .values(keyBinding)
      .returning();
    return binding;
  }

  async updateKeyBinding(id: number, updates: Partial<InsertKeyBinding>): Promise<KeyBinding> {
    const [binding] = await db
      .update(keyBindings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(keyBindings.id, id))
      .returning();
    return binding;
  }

  async deleteKeyBinding(id: number): Promise<void> {
    await db.delete(keyBindings).where(eq(keyBindings.id, id));
  }

  // Extension settings operations
  async getUserExtensionSettings(userId: string): Promise<ExtensionSettings | undefined> {
    const [settings] = await db
      .select()
      .from(extensionSettings)
      .where(eq(extensionSettings.userId, userId));
    return settings as ExtensionSettings | undefined;
  }

  async upsertExtensionSettings(settings: InsertExtensionSettings): Promise<ExtensionSettings> {
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
    return result as ExtensionSettings;
  }

  // Activity logs operations
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return activity as ActivityLog;
  }

  async getUserActivityLogs(userId: string, limit = 50): Promise<ActivityLog[]> {
    const results = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
    return results as ActivityLog[];
  }

  // Security incidents operations
  async createSecurityIncident(incident: InsertSecurityIncident): Promise<SecurityIncident> {
    const [result] = await db
      .insert(securityIncidents)
      .values(incident)
      .returning();
    return result;
  }

  async getSecurityIncidents(filters?: {
    resolved?: boolean;
    severity?: string;
    limit?: number;
  }): Promise<SecurityIncident[]> {
    const conditions = [];
    
    if (filters?.resolved !== undefined) {
      conditions.push(eq(securityIncidents.resolved, filters.resolved));
    }
    
    if (filters?.severity) {
      conditions.push(eq(securityIncidents.severity, filters.severity as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(securityIncidents)
      .where(whereClause)
      .orderBy(desc(securityIncidents.createdAt))
      .limit(filters?.limit || 20);
  }

  async resolveSecurityIncident(id: number): Promise<SecurityIncident> {
    const [incident] = await db
      .update(securityIncidents)
      .set({
        resolved: true,
        resolvedAt: new Date(),
      })
      .where(eq(securityIncidents.id, id))
      .returning();
    return incident;
  }

  // Analytics operations
  async getDashboardStats(): Promise<{
    dailyActiveUsers: number;
    newRegistrations: number;
    revenue: number;
    securityIncidents: number;
  }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      dailyActiveResult,
      newRegistrationsResult,
      securityIncidentsResult,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.isActive, true),
            sql`${users.lastLoginAt} >= ${oneDayAgo}`
          )
        ),
      db
        .select({ count: count() })
        .from(users)
        .where(sql`${users.createdAt} >= ${thirtyDaysAgo}`),
      db
        .select({ count: count() })
        .from(securityIncidents)
        .where(
          and(
            eq(securityIncidents.resolved, false),
            sql`${securityIncidents.createdAt} >= ${thirtyDaysAgo}`
          )
        ),
    ]);

    // Mock revenue calculation based on tier distribution
    const tierCounts = await db
      .select({
        tier: users.tier,
        count: count(),
      })
      .from(users)
      .where(eq(users.isActive, true))
      .groupBy(users.tier);

    let revenue = 0;
    tierCounts.forEach(({ tier, count }) => {
      const tierRevenue = {
        standard: 29,
        gold: 49,
        platinum: 79,
      };
      revenue += count * (tierRevenue[tier as keyof typeof tierRevenue] || 0);
    });

    return {
      dailyActiveUsers: dailyActiveResult[0].count,
      newRegistrations: newRegistrationsResult[0].count,
      revenue: revenue,
      securityIncidents: securityIncidentsResult[0].count,
    };
  }

  // Admin tool settings operations
  async getAdminToolSettings(): Promise<Record<string, any>> {
    const toolSettings = await db.select().from(adminToolSettings);
    
    const result: Record<string, any> = {};
    for (const setting of toolSettings) {
      result[setting.toolType] = setting.settings;
    }
    
    // Return default settings if none exist
    if (Object.keys(result).length === 0) {
      return {
        reportGenerator: {
          outputFormat: "structured",
          llmModel: "gpt-4",
          summaryTemplate: "",
          includeTimestamps: true,
          autoGenerateSummary: true,
          maxTokens: 2000,
        },
        vitalsGenerator: {
          numberOfVitals: 8,
          vitalSigns: [
            "Blood Pressure",
            "Heart Rate", 
            "Temperature",
            "Respiratory Rate",
            "Oxygen Saturation",
            "Weight",
            "Height",
            "BMI"
          ],
          autoCalculateBMI: true,
          normalRanges: {},
          alertThresholds: {},
        },
        qualityCheck: {
          pdfComparisonFields: [
            "Patient Name",
            "Date of Birth", 
            "Medical Record Number",
            "Diagnosis",
            "Medication List",
            "Allergies"
          ],
          automationFields: [
            "Vital Signs",
            "Chief Complaint",
            "History of Present Illness",
            "Assessment",
            "Plan"
          ],
          strictMatching: false,
          toleranceLevel: "medium",
          alertOnMismatch: true,
        },
        customKeys: {
          keyBindings: [],
        }
      };
    }
    
    return result;
  }

  async updateAdminToolSettings(toolType: string, settings: any): Promise<AdminToolSettings> {
    const existing = await db.select().from(adminToolSettings).where(eq(adminToolSettings.toolType, toolType));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(adminToolSettings)
        .set({ 
          settings: settings as any,
          updatedAt: new Date()
        })
        .where(eq(adminToolSettings.toolType, toolType))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(adminToolSettings)
        .values({ toolType, settings: settings as any })
        .returning();
      return created;
    }
  }

  // Admin settings operations
  async getAdminSettings(): Promise<Record<string, any>> {
    const settings = await db.select().from(adminSettings);
    
    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.category] = setting.settings;
    }
    
    // Return default settings if none exist
    if (Object.keys(result).length === 0) {
      return {
        system: {
          applicationName: "ClickDoc",
          maintenanceMode: false,
          allowNewRegistrations: true,
          defaultUserTier: "standard",
          sessionTimeout: 24,
          maxConcurrentSessions: 5,
        },
        security: {
          enforceStrongPasswords: true,
          requireTwoFactor: false,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          enableAuditLogs: true,
          ipWhitelist: [],
        },
        userManagement: {
          autoApproveUsers: false,
          defaultRole: "user",
          allowSelfUpgrade: true,
          maxUsersPerTier: {
            standard: 1000,
            gold: 500,
            platinum: 100
          },
        },
        notifications: {
          emailNotifications: true,
          securityAlerts: true,
          systemUpdates: true,
          adminEmail: "",
          smtpServer: "",
          smtpPort: 587,
        },
        database: {
          backupFrequency: "daily",
          retentionPeriod: 30,
          enableCompression: true,
          autoOptimize: true,
        }
      };
    }
    
    return result;
  }

  async updateAdminSettings(category: string, settings: any): Promise<AdminSettings> {
    const existing = await db.select().from(adminSettings).where(eq(adminSettings.category, category));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(adminSettings)
        .set({ 
          settings: settings as any,
          updatedAt: new Date()
        })
        .where(eq(adminSettings.category, category))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(adminSettings)
        .values({ category, settings: settings as any })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
