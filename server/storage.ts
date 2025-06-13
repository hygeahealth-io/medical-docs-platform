import {
  users,
  keyBindings,
  keyBindingGroups,
  extensionSettings,
  activityLogs,
  securityIncidents,
  adminToolSettings,
  adminSettings,
  analytics,
  notifications,
  announcements,
  auditLogs,
  reports,
  reportExecutions,
  dataRetentionPolicies,
  userSessions,
  vitalsCategories,
  type User,
  type UpsertUser,
  type UpdateUser,
  type InsertKeyBinding,
  type KeyBinding,
  type InsertKeyBindingGroup,
  type KeyBindingGroup,
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
  type Analytics,
  type InsertAnalytics,
  type Notification,
  type InsertNotification,
  type Announcement,
  type InsertAnnouncement,
  type AuditLog,
  type InsertAuditLog,
  type Report,
  type InsertReport,
  type ReportExecution,
  type InsertReportExecution,
  type DataRetentionPolicy,
  type InsertDataRetentionPolicy,
  type UserSession,
  type InsertUserSession,
  type VitalsCategory,
  type InsertVitalsCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, count, sql } from "drizzle-orm";

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
  
  // Key binding groups operations (platinum only)
  getUserKeyBindingGroups(userId: string): Promise<KeyBindingGroup[]>;
  createKeyBindingGroup(group: InsertKeyBindingGroup): Promise<KeyBindingGroup>;
  updateKeyBindingGroup(id: number, updates: Partial<InsertKeyBindingGroup>): Promise<KeyBindingGroup>;
  deleteKeyBindingGroup(id: number): Promise<void>;
  
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
  
  // Analytics operations
  createAnalyticsEvent(event: InsertAnalytics): Promise<Analytics>;
  getAnalytics(filters?: {
    userId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Analytics[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  
  // Announcement operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getActiveAnnouncements(userTier?: string, userRole?: string): Promise<Announcement[]>;
  updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement>;
  
  // Audit logging operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReports(userId?: string): Promise<Report[]>;
  updateReport(id: number, updates: Partial<InsertReport>): Promise<Report>;
  deleteReport(id: number): Promise<void>;
  executeReport(reportId: number, executedBy: string): Promise<ReportExecution>;
  getReportExecutions(reportId: number): Promise<ReportExecution[]>;
  
  // Data retention operations
  createDataRetentionPolicy(policy: InsertDataRetentionPolicy): Promise<DataRetentionPolicy>;
  getDataRetentionPolicies(): Promise<DataRetentionPolicy[]>;
  updateDataRetentionPolicy(id: number, updates: Partial<InsertDataRetentionPolicy>): Promise<DataRetentionPolicy>;
  cleanupExpiredData(): Promise<void>;
  
  // Session management operations
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  updateSessionActivity(sessionId: string): Promise<UserSession>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllUserSessions(userId: string): Promise<void>;
  
  // Vitals category operations
  getVitalsCategories(userId: string): Promise<VitalsCategory[]>;
  createVitalsCategory(category: InsertVitalsCategory): Promise<VitalsCategory>;
  updateVitalsCategory(id: number, updates: Partial<InsertVitalsCategory>): Promise<VitalsCategory>;
  deleteVitalsCategory(id: number): Promise<void>;
  setDefaultVitalsCategory(userId: string, categoryId: number): Promise<void>;
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

  // Key binding groups operations (platinum only)
  async getUserKeyBindingGroups(userId: string): Promise<KeyBindingGroup[]> {
    return await db
      .select()
      .from(keyBindingGroups)
      .where(or(eq(keyBindingGroups.userId, userId), eq(keyBindingGroups.isSystem, true)))
      .orderBy(
        sql`CASE WHEN name = 'Wounds' THEN 0 WHEN is_system = true THEN 1 ELSE 2 END`,
        keyBindingGroups.name
      );
  }

  async createKeyBindingGroup(group: InsertKeyBindingGroup): Promise<KeyBindingGroup> {
    const [createdGroup] = await db
      .insert(keyBindingGroups)
      .values(group)
      .returning();
    return createdGroup;
  }

  async updateKeyBindingGroup(id: number, updates: Partial<InsertKeyBindingGroup>): Promise<KeyBindingGroup> {
    const [updatedGroup] = await db
      .update(keyBindingGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(keyBindingGroups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteKeyBindingGroup(id: number): Promise<void> {
    // First, remove group association from key bindings
    await db
      .update(keyBindings)
      .set({ groupId: null })
      .where(eq(keyBindings.groupId, id));
    
    // Then delete the group
    await db.delete(keyBindingGroups).where(eq(keyBindingGroups.id, id));
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
          settings,
          updatedAt: new Date()
        })
        .where(eq(adminToolSettings.toolType, toolType))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(adminToolSettings)
        .values({ toolType, settings })
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
          settings,
          updatedAt: new Date()
        })
        .where(eq(adminSettings.category, category))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(adminSettings)
        .values({ category, settings })
        .returning();
      return created;
    }
  }

  // Analytics operations
  async createAnalyticsEvent(event: InsertAnalytics): Promise<Analytics> {
    const [analyticsEvent] = await db
      .insert(analytics)
      .values(event)
      .returning();
    return analyticsEvent;
  }

  async getAnalytics(filters?: {
    userId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Analytics[]> {
    let query = db.select().from(analytics);
    
    const conditions = [];
    if (filters?.userId) conditions.push(eq(analytics.userId, filters.userId));
    if (filters?.eventType) conditions.push(eq(analytics.eventType, filters.eventType));
    if (filters?.startDate) conditions.push(sql`${analytics.createdAt} >= ${filters.startDate}`);
    if (filters?.endDate) conditions.push(sql`${analytics.createdAt} <= ${filters.endDate}`);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query
      .orderBy(desc(analytics.createdAt))
      .limit(filters?.limit || 100);
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));
    
    if (unreadOnly) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    }
    
    return await query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Announcement operations
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return newAnnouncement;
  }

  async getActiveAnnouncements(userTier?: string, userRole?: string): Promise<Announcement[]> {
    const conditions = [eq(announcements.isActive, true)];
    
    if (userTier) {
      conditions.push(sql`(${announcements.targetTiers} = '{}' OR ${userTier} = ANY(${announcements.targetTiers}))`);
    }
    if (userRole) {
      conditions.push(sql`(${announcements.targetRoles} = '{}' OR ${userRole} = ANY(${announcements.targetRoles}))`);
    }
    
    return await db
      .select()
      .from(announcements)
      .where(and(...conditions))
      .orderBy(desc(announcements.priority), desc(announcements.createdAt));
  }

  async updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [announcement] = await db
      .update(announcements)
      .set(updates)
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }

  // Audit logging operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    
    const conditions = [];
    if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
    if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters?.resource) conditions.push(eq(auditLogs.resource, filters.resource));
    if (filters?.startDate) conditions.push(sql`${auditLogs.createdAt} >= ${filters.startDate}`);
    if (filters?.endDate) conditions.push(sql`${auditLogs.createdAt} <= ${filters.endDate}`);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(filters?.limit || 100);
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getReports(userId?: string): Promise<Report[]> {
    let query = db.select().from(reports);
    
    if (userId) {
      query = query.where(eq(reports.createdBy, userId));
    }
    
    return await query.orderBy(desc(reports.createdAt));
  }

  async updateReport(id: number, updates: Partial<InsertReport>): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  async executeReport(reportId: number, executedBy: string): Promise<ReportExecution> {
    const [execution] = await db
      .insert(reportExecutions)
      .values({
        reportId,
        status: "pending",
        executedBy,
      })
      .returning();
    return execution;
  }

  async getReportExecutions(reportId: number): Promise<ReportExecution[]> {
    return await db
      .select()
      .from(reportExecutions)
      .where(eq(reportExecutions.reportId, reportId))
      .orderBy(desc(reportExecutions.createdAt));
  }

  // Data retention operations
  async createDataRetentionPolicy(policy: InsertDataRetentionPolicy): Promise<DataRetentionPolicy> {
    const [newPolicy] = await db
      .insert(dataRetentionPolicies)
      .values(policy)
      .returning();
    return newPolicy;
  }

  async getDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    return await db
      .select()
      .from(dataRetentionPolicies)
      .where(eq(dataRetentionPolicies.isActive, true))
      .orderBy(dataRetentionPolicies.resourceType);
  }

  async updateDataRetentionPolicy(id: number, updates: Partial<InsertDataRetentionPolicy>): Promise<DataRetentionPolicy> {
    const [policy] = await db
      .update(dataRetentionPolicies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dataRetentionPolicies.id, id))
      .returning();
    return policy;
  }

  async cleanupExpiredData(): Promise<void> {
    const policies = await this.getDataRetentionPolicies();
    
    for (const policy of policies) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);
      
      switch (policy.resourceType) {
        case "audit_logs":
          await db.delete(auditLogs).where(sql`${auditLogs.createdAt} < ${cutoffDate}`);
          break;
        case "analytics":
          await db.delete(analytics).where(sql`${analytics.createdAt} < ${cutoffDate}`);
          break;
        case "activity_logs":
          await db.delete(activityLogs).where(sql`${activityLogs.createdAt} < ${cutoffDate}`);
          break;
      }
      
      await db
        .update(dataRetentionPolicies)
        .set({ lastCleanup: new Date() })
        .where(eq(dataRetentionPolicies.id, policy.id));
    }
  }

  // Session management operations
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db
      .insert(userSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, true)))
      .orderBy(desc(userSessions.lastActivity));
  }

  async updateSessionActivity(sessionId: string): Promise<UserSession> {
    const [session] = await db
      .update(userSessions)
      .set({ lastActivity: new Date() })
      .where(eq(userSessions.id, sessionId))
      .returning();
    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.id, sessionId));
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  }

  // Vitals category operations
  async getVitalsCategories(userId: string): Promise<VitalsCategory[]> {
    return await db
      .select()
      .from(vitalsCategories)
      .where(
        or(
          eq(vitalsCategories.userId, userId),
          eq(vitalsCategories.isSystem, true)
        )
      )
      .orderBy(desc(vitalsCategories.isDefault), vitalsCategories.name);
  }

  async createVitalsCategory(category: InsertVitalsCategory): Promise<VitalsCategory> {
    const [created] = await db
      .insert(vitalsCategories)
      .values(category)
      .returning();
    return created;
  }

  async updateVitalsCategory(id: number, updates: Partial<InsertVitalsCategory>): Promise<VitalsCategory> {
    const [updated] = await db
      .update(vitalsCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vitalsCategories.id, id))
      .returning();
    return updated;
  }

  async deleteVitalsCategory(id: number): Promise<void> {
    await db
      .delete(vitalsCategories)
      .where(
        and(
          eq(vitalsCategories.id, id),
          eq(vitalsCategories.isSystem, false) // Can't delete system categories
        )
      );
  }

  async setDefaultVitalsCategory(userId: string, categoryId: number): Promise<void> {
    // First, unset all defaults for this user
    await db
      .update(vitalsCategories)
      .set({ isDefault: false })
      .where(eq(vitalsCategories.userId, userId));

    // Then set the new default
    await db
      .update(vitalsCategories)
      .set({ isDefault: true })
      .where(
        and(
          eq(vitalsCategories.id, categoryId),
          eq(vitalsCategories.userId, userId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
