import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "user"] }).notNull().default("user"),
  tier: varchar("tier", { enum: ["standard", "gold", "platinum"] }).notNull().default("standard"),
  isActive: boolean("is_active").notNull().default(true),
  status: varchar("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  expirationDate: timestamp("expiration_date"),
  lastLoginAt: timestamp("last_login_at"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: varchar("two_factor_secret"),
  passwordChangedAt: timestamp("password_changed_at").defaultNow(),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  sessionTimeout: integer("session_timeout_minutes").default(480), // 8 hours default
  preferences: jsonb("preferences").default({}),
  darkMode: boolean("dark_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Key binding groups for platinum tier users
export const keyBindingGroups = pgTable("key_binding_groups", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false), // System groups like wounds, medications, dementia
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Key bindings for automation tools
export const keyBindings = pgTable("key_bindings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: integer("group_id").references(() => keyBindingGroups.id, { onDelete: "set null" }),
  shortcut: varchar("shortcut").notNull(),
  template: text("template").notNull(),
  category: varchar("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Extension settings for Chrome integration
export const extensionSettings = pgTable("extension_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isEnabled: boolean("is_enabled").notNull().default(false),
  settings: jsonb("settings"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security incidents
export const securityIncidents = pgTable("security_incidents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(),
  severity: varchar("severity", { enum: ["low", "medium", "high", "critical"] }).notNull(),
  description: text("description").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin tool settings configuration
export const adminToolSettings = pgTable("admin_tool_settings", {
  id: serial("id").primaryKey(),
  toolType: varchar("tool_type").notNull(), // reportGenerator, vitalsGenerator, qualityCheck, customKeys
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin system settings
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  category: varchar("category").notNull(), // system, security, userManagement, notifications, database
  settings: jsonb("settings").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics and metrics tracking
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type").notNull(), // login, logout, feature_usage, etc.
  eventCategory: varchar("event_category").notNull(), // auth, tools, admin, etc.
  eventData: jsonb("event_data").default({}),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  sessionId: varchar("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { enum: ["info", "warning", "error", "success"] }).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// System announcements
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type", { enum: ["maintenance", "feature", "security", "general"] }).notNull(),
  priority: varchar("priority", { enum: ["low", "medium", "high"] }).default("medium"),
  targetTiers: varchar("target_tiers").array().default([]), // which tiers to show to
  targetRoles: varchar("target_roles").array().default([]), // which roles to show to
  isActive: boolean("is_active").default(true),
  scheduledFor: timestamp("scheduled_for"),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit trail for compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action").notNull(), // create, update, delete, view, export, etc.
  resource: varchar("resource").notNull(), // user, report, settings, etc.
  resourceId: varchar("resource_id"),
  details: jsonb("details").default({}),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  sessionId: varchar("session_id"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom reports and templates
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type", { enum: ["user_activity", "analytics", "compliance", "custom"] }).notNull(),
  config: jsonb("config").notNull(), // report configuration and filters
  schedule: varchar("schedule"), // cron expression for scheduled reports
  recipients: varchar("recipients").array().default([]), // email addresses
  format: varchar("format", { enum: ["pdf", "csv", "excel", "json"] }).default("pdf"),
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report execution history
export const reportExecutions = pgTable("report_executions", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  status: varchar("status", { enum: ["pending", "running", "completed", "failed"] }).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  fileUrl: varchar("file_url"),
  fileSize: integer("file_size"),
  recordCount: integer("record_count"),
  errorMessage: text("error_message"),
  executedBy: varchar("executed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Data retention policies
export const dataRetentionPolicies = pgTable("data_retention_policies", {
  id: serial("id").primaryKey(),
  resourceType: varchar("resource_type").notNull(), // audit_logs, analytics, etc.
  retentionDays: integer("retention_days").notNull(),
  isActive: boolean("is_active").default(true),
  lastCleanup: timestamp("last_cleanup"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session management for security
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  keyBindings: many(keyBindings),
  extensionSettings: many(extensionSettings),
  activityLogs: many(activityLogs),
  securityIncidents: many(securityIncidents),
  analytics: many(analytics),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  reports: many(reports),
  userSessions: many(userSessions),
}));

export const keyBindingGroupsRelations = relations(keyBindingGroups, ({ one, many }) => ({
  user: one(users, {
    fields: [keyBindingGroups.userId],
    references: [users.id],
  }),
  keyBindings: many(keyBindings),
}));

export const keyBindingsRelations = relations(keyBindings, ({ one }) => ({
  user: one(users, {
    fields: [keyBindings.userId],
    references: [users.id],
  }),
  group: one(keyBindingGroups, {
    fields: [keyBindings.groupId],
    references: [keyBindingGroups.id],
  }),
}));

export const extensionSettingsRelations = relations(extensionSettings, ({ one }) => ({
  user: one(users, {
    fields: [extensionSettings.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const securityIncidentsRelations = relations(securityIncidents, ({ one }) => ({
  user: one(users, {
    fields: [securityIncidents.userId],
    references: [users.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdBy: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [reports.createdBy],
    references: [users.id],
  }),
  executions: many(reportExecutions),
}));

export const reportExecutionsRelations = relations(reportExecutions, ({ one }) => ({
  report: one(reports, {
    fields: [reportExecutions.reportId],
    references: [reports.id],
  }),
  executedBy: one(users, {
    fields: [reportExecutions.executedBy],
    references: [users.id],
  }),
}));

export const dataRetentionPoliciesRelations = relations(dataRetentionPolicies, ({ one }) => ({
  createdBy: one(users, {
    fields: [dataRetentionPolicies.createdBy],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export const upsertUserSchema = insertUserSchema.pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const updateUserSchema = insertUserSchema.partial().extend({
  id: z.string(),
});

export const insertKeyBindingGroupSchema = createInsertSchema(keyBindingGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectKeyBindingGroupSchema = createSelectSchema(keyBindingGroups);

export const insertKeyBindingSchema = createInsertSchema(keyBindings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectKeyBindingSchema = createSelectSchema(keyBindings);

export const insertExtensionSettingsSchema = createInsertSchema(extensionSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectExtensionSettingsSchema = createSelectSchema(extensionSettings);

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const selectActivityLogSchema = createSelectSchema(activityLogs);

export const insertSecurityIncidentSchema = createInsertSchema(securityIncidents).omit({
  id: true,
  createdAt: true,
});

export const selectSecurityIncidentSchema = createSelectSchema(securityIncidents);

export const insertAdminToolSettingsSchema = createInsertSchema(adminToolSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectAdminToolSettingsSchema = createSelectSchema(adminToolSettings);

export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectAdminSettingsSchema = createSelectSchema(adminSettings);

// New schemas for additional features
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const selectAnalyticsSchema = createSelectSchema(analytics);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const selectNotificationSchema = createSelectSchema(notifications);

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
});

export const selectAnnouncementSchema = createSelectSchema(announcements);

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const selectAuditLogSchema = createSelectSchema(auditLogs);

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectReportSchema = createSelectSchema(reports);

export const insertReportExecutionSchema = createInsertSchema(reportExecutions).omit({
  id: true,
  createdAt: true,
});

export const selectReportExecutionSchema = createSelectSchema(reportExecutions);

export const insertDataRetentionPolicySchema = createInsertSchema(dataRetentionPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectDataRetentionPolicySchema = createSelectSchema(dataRetentionPolicies);

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  createdAt: true,
});

export const selectUserSessionSchema = createSelectSchema(userSessions);

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertKeyBindingGroup = z.infer<typeof insertKeyBindingGroupSchema>;
export type KeyBindingGroup = z.infer<typeof selectKeyBindingGroupSchema>;
export type InsertKeyBinding = z.infer<typeof insertKeyBindingSchema>;
export type KeyBinding = z.infer<typeof selectKeyBindingSchema>;
export type InsertExtensionSettings = z.infer<typeof insertExtensionSettingsSchema>;
export type ExtensionSettings = z.infer<typeof selectExtensionSettingsSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = z.infer<typeof selectActivityLogSchema>;
export type InsertSecurityIncident = z.infer<typeof insertSecurityIncidentSchema>;
export type SecurityIncident = z.infer<typeof selectSecurityIncidentSchema>;
export type InsertAdminToolSettings = z.infer<typeof insertAdminToolSettingsSchema>;
export type AdminToolSettings = z.infer<typeof selectAdminToolSettingsSchema>;
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type AdminSettings = z.infer<typeof selectAdminSettingsSchema>;

// New types for additional features
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = z.infer<typeof selectAnalyticsSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = z.infer<typeof selectAnnouncementSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = z.infer<typeof selectAuditLogSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = z.infer<typeof selectReportSchema>;
export type InsertReportExecution = z.infer<typeof insertReportExecutionSchema>;
export type ReportExecution = z.infer<typeof selectReportExecutionSchema>;
export type InsertDataRetentionPolicy = z.infer<typeof insertDataRetentionPolicySchema>;
export type DataRetentionPolicy = z.infer<typeof selectDataRetentionPolicySchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = z.infer<typeof selectUserSessionSchema>;

// Vitals category templates table
export const vitalsCategories = pgTable("vitals_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  isDefault: boolean("is_default").default(false),
  isSystem: boolean("is_system").default(false), // System templates cannot be deleted
  vitalsConfig: jsonb("vitals_config").notNull().default({}), // Stores vitals with their ranges
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for vitals categories
export const vitalsCategoriesRelations = relations(vitalsCategories, ({ one }) => ({
  user: one(users, {
    fields: [vitalsCategories.userId],
    references: [users.id],
  }),
}));

// Insert and select schemas for vitals categories
export const insertVitalsCategorySchema = createInsertSchema(vitalsCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectVitalsCategorySchema = createSelectSchema(vitalsCategories);

export type InsertVitalsCategory = z.infer<typeof insertVitalsCategorySchema>;
export type VitalsCategory = z.infer<typeof selectVitalsCategorySchema>;
