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
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Key bindings for automation tools
export const keyBindings = pgTable("key_bindings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shortcut: varchar("shortcut").notNull(),
  template: text("template").notNull(),
  category: varchar("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Extension settings for Chrome extension
export const extensionSettings = pgTable("extension_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  settings: jsonb("settings").notNull().default({}),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity logs for tracking user actions
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  details: jsonb("details").notNull().default({}),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security incidents tracking
export const securityIncidents = pgTable("security_incidents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  type: varchar("type").notNull(),
  severity: varchar("severity", { enum: ["low", "medium", "high", "critical"] }).notNull(),
  description: text("description").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id, { onDelete: "set null" }),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  keyBindings: many(keyBindings),
  extensionSettings: many(extensionSettings),
  activityLogs: many(activityLogs),
  securityIncidents: many(securityIncidents),
}));

export const keyBindingsRelations = relations(keyBindings, ({ one }) => ({
  user: one(users, {
    fields: [keyBindings.userId],
    references: [users.id],
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
  resolvedByUser: one(users, {
    fields: [securityIncidents.resolvedBy],
    references: [users.id],
  }),
}));

// Zod schemas for validation
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