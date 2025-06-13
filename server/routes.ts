import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  updateUserSchema,
  insertKeyBindingSchema,
  insertKeyBindingGroupSchema,
  insertExtensionSettingsSchema,
  insertActivityLogSchema,
  insertSecurityIncidentSchema,
  insertVitalsCategorySchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Update last login
      if (user) {
        await storage.updateUser({
          id: userId,
          lastLoginAt: new Date(),
        });
        
        // Log activity
        await storage.createActivityLog({
          userId,
          action: 'login',
          details: { timestamp: new Date() },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes (Admin only)
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { search, role, tier, status, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const result = await storage.getAllUsers({
        search: search as string,
        role: role as string,
        tier: tier as string,
        status: status as string,
        offset,
        limit: parseInt(limit),
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updates = updateUserSchema.parse({
        id: req.params.id,
        ...req.body,
      });

      const updatedUser = await storage.updateUser(updates);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'update_user',
        details: { targetUserId: req.params.id, updates },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteUser(req.params.id);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'delete_user',
        details: { targetUserId: req.params.id },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Key bindings routes
  app.get('/api/key-bindings', isAuthenticated, async (req: any, res) => {
    try {
      const keyBindings = await storage.getUserKeyBindings(req.user.claims.sub);
      res.json(keyBindings);
    } catch (error) {
      console.error("Error fetching key bindings:", error);
      res.status(500).json({ message: "Failed to fetch key bindings" });
    }
  });

  app.post('/api/key-bindings', isAuthenticated, async (req: any, res) => {
    try {
      const keyBinding = insertKeyBindingSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
      });

      const created = await storage.createKeyBinding(keyBinding);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'create_key_binding',
        details: { keyBinding: created },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(created);
    } catch (error) {
      console.error("Error creating key binding:", error);
      res.status(500).json({ message: "Failed to create key binding" });
    }
  });

  app.put('/api/key-bindings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updates = z.object({
        shortcut: z.string().optional(),
        template: z.string().optional(),
        category: z.string().optional(),
        groupId: z.number().nullable().optional(),
        isActive: z.boolean().optional(),
      }).parse(req.body);

      const updated = await storage.updateKeyBinding(parseInt(req.params.id), updates);

      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'update_key_binding',
        details: { keyBindingId: req.params.id, updates },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating key binding:", error);
      res.status(500).json({ message: "Failed to update key binding" });
    }
  });

  app.delete('/api/key-bindings/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteKeyBinding(parseInt(req.params.id));
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'delete_key_binding',
        details: { keyBindingId: req.params.id },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key binding:", error);
      res.status(500).json({ message: "Failed to delete key binding" });
    }
  });

  // Key binding groups routes (platinum only)
  app.get('/api/key-binding-groups', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user has platinum tier
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }

      const groups = await storage.getUserKeyBindingGroups(req.user.claims.sub);
      
      // Check if we need to create sample bindings for Wounds group
      const woundsGroup = groups.find(g => g.name === 'Wounds');
      if (woundsGroup) {
        const existingBindings = await storage.getUserKeyBindings(req.user.claims.sub);
        const woundsBindings = existingBindings.filter(b => b.groupId === woundsGroup.id);
        
        if (woundsBindings.length === 0) {
          // Create sample key bindings for wounds
          const sampleBindings = [
            {
              userId: req.user.claims.sub,
              groupId: woundsGroup.id,
              shortcut: 'Ctrl+Shift+W',
              template: 'Wound assessment: {location} - {description}. Size: {size}. Appearance: {appearance}. Pain level: {pain}/10.',
              category: 'Assessment',
              isActive: true
            },
            {
              userId: req.user.claims.sub,
              groupId: woundsGroup.id,
              shortcut: 'Ctrl+Alt+D',
              template: 'Wound dressing changed. Previous dressing: {old_dressing}. New dressing: {new_dressing}. Wound showing {progress}.',
              category: 'Treatment',
              isActive: true
            },
            {
              userId: req.user.claims.sub,
              groupId: woundsGroup.id,
              shortcut: 'Ctrl+Shift+H',
              template: 'Wound healing progress: {status}. No signs of infection. Continue current treatment plan.',
              category: 'Progress',
              isActive: true
            }
          ];

          for (const binding of sampleBindings) {
            await storage.createKeyBinding(binding);
          }
        }
      }
      
      res.json(groups);
    } catch (error) {
      console.error("Error fetching key binding groups:", error);
      res.status(500).json({ message: "Failed to fetch key binding groups" });
    }
  });

  app.post('/api/key-binding-groups', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user has platinum tier
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }

      const group = insertKeyBindingGroupSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
        isSystem: false, // User-created groups are never system groups
      });

      const created = await storage.createKeyBindingGroup(group);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'create_key_binding_group',
        details: { group: created },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(created);
    } catch (error) {
      console.error("Error creating key binding group:", error);
      res.status(500).json({ message: "Failed to create key binding group" });
    }
  });

  app.put('/api/key-binding-groups/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user has platinum tier
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }

      const updates = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }).parse(req.body);

      const updated = await storage.updateKeyBindingGroup(parseInt(req.params.id), updates);

      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'update_key_binding_group',
        details: { groupId: req.params.id, updates },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating key binding group:", error);
      res.status(500).json({ message: "Failed to update key binding group" });
    }
  });

  app.delete('/api/key-binding-groups/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user has platinum tier
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }

      await storage.deleteKeyBindingGroup(parseInt(req.params.id));
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'delete_key_binding_group',
        details: { groupId: req.params.id },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key binding group:", error);
      res.status(500).json({ message: "Failed to delete key binding group" });
    }
  });

  // Extension settings routes
  app.get('/api/extension-settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getUserExtensionSettings(req.user.claims.sub);
      res.json(settings || { isEnabled: false, settings: {} });
    } catch (error) {
      console.error("Error fetching extension settings:", error);
      res.status(500).json({ message: "Failed to fetch extension settings" });
    }
  });

  app.post('/api/extension-settings', isAuthenticated, async (req: any, res) => {
    try {
      const settings = insertExtensionSettingsSchema.parse({
        ...req.body,
        userId: req.user.claims.sub,
        lastSyncAt: new Date(),
      });

      const updated = await storage.upsertExtensionSettings(settings);
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'update_extension_settings',
        details: { settings },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating extension settings:", error);
      res.status(500).json({ message: "Failed to update extension settings" });
    }
  });

  // Dashboard stats route (Admin only)
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Security incidents routes (Admin only)
  app.get('/api/security-incidents', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { resolved, severity, limit } = req.query;
      const incidents = await storage.getSecurityIncidents({
        resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
        severity: severity as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(incidents);
    } catch (error) {
      console.error("Error fetching security incidents:", error);
      res.status(500).json({ message: "Failed to fetch security incidents" });
    }
  });

  app.post('/api/security-incidents', isAuthenticated, async (req: any, res) => {
    try {
      const incident = insertSecurityIncidentSchema.parse(req.body);
      const created = await storage.createSecurityIncident(incident);
      res.json(created);
    } catch (error) {
      console.error("Error creating security incident:", error);
      res.status(500).json({ message: "Failed to create security incident" });
    }
  });

  app.put('/api/security-incidents/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const resolved = await storage.resolveSecurityIncident(parseInt(req.params.id));
      
      await storage.createActivityLog({
        userId: req.user.claims.sub,
        action: 'resolve_security_incident',
        details: { incidentId: req.params.id },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(resolved);
    } catch (error) {
      console.error("Error resolving security incident:", error);
      res.status(500).json({ message: "Failed to resolve security incident" });
    }
  });

  // Chrome extension API endpoints
  app.post('/api/extension/sync', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's key bindings and settings
      const [keyBindings, extensionSettings] = await Promise.all([
        storage.getUserKeyBindings(req.user.claims.sub),
        storage.getUserExtensionSettings(req.user.claims.sub),
      ]);

      const syncData = {
        user: {
          id: user.id,
          tier: user.tier,
          isActive: user.isActive,
        },
        keyBindings: keyBindings.filter(kb => kb.isActive),
        settings: extensionSettings?.settings || {},
        lastSync: new Date(),
      };

      // Update last sync time
      if (extensionSettings) {
        await storage.upsertExtensionSettings({
          userId: req.user.claims.sub,
          isEnabled: extensionSettings.isEnabled,
          settings: extensionSettings.settings,
          lastSyncAt: new Date(),
        });
      }

      res.json(syncData);
    } catch (error) {
      console.error("Error syncing extension:", error);
      res.status(500).json({ message: "Failed to sync extension" });
    }
  });

  // Admin tool settings routes
  app.get("/api/admin/tool-settings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = await storage.getAdminToolSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin tool settings:", error);
      res.status(500).json({ message: "Failed to fetch tool settings" });
    }
  });

  app.put("/api/admin/tool-settings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { toolType, settings } = req.body;
      if (!toolType || !settings) {
        return res.status(400).json({ message: "Tool type and settings are required" });
      }
      
      const updatedSettings = await storage.updateAdminToolSettings(toolType, settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating admin tool settings:", error);
      res.status(500).json({ message: "Failed to update tool settings" });
    }
  });

  // Admin settings routes
  app.get("/api/admin/settings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = await storage.getAdminSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch admin settings" });
    }
  });

  app.put("/api/admin/settings", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { category, settings } = req.body;
      if (!category || !settings) {
        return res.status(400).json({ message: "Category and settings are required" });
      }
      
      const updatedSettings = await storage.updateAdminSettings(category, settings);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating admin settings:", error);
      res.status(500).json({ message: "Failed to update admin settings" });
    }
  });

  // Advanced Analytics routes
  app.get('/api/advanced-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { startDate, endDate, eventType, userId } = req.query;
      const analytics = await storage.getAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        eventType: eventType as string,
        userId: userId as string
      });
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching advanced analytics:", error);
      res.status(500).json({ message: "Failed to fetch advanced analytics" });
    }
  });

  app.post('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const eventData = req.body;
      const userId = req.user?.claims?.sub;
      const event = await storage.createAnalyticsEvent({
        ...eventData,
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID
      });
      res.json(event);
    } catch (error) {
      console.error("Error creating analytics event:", error);
      res.status(500).json({ message: "Failed to create analytics event" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { unreadOnly } = req.query;
      const notifications = await storage.getUserNotifications(userId, unreadOnly === 'true');
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notification = await storage.markNotificationAsRead(parseInt(req.params.id));
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Announcements routes
  app.get('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user?.claims?.sub);
      const announcements = await storage.getActiveAnnouncements(user?.tier, user?.role);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const announcement = await storage.createAnnouncement(req.body);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch('/api/announcements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const announcement = await storage.updateAnnouncement(parseInt(req.params.id), req.body);
      res.json(announcement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  // Audit logs routes
  app.get('/api/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, action, resource, startDate, endDate, limit } = req.query;
      const logs = await storage.getAuditLogs({
        userId: userId as string,
        action: action as string,
        resource: resource as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json({ logs, total: logs.length });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.post('/api/audit-logs', isAuthenticated, async (req: any, res) => {
    try {
      const log = await storage.createAuditLog({
        ...req.body,
        userId: req.user?.claims?.sub,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID
      });
      res.json(log);
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({ message: "Failed to create audit log" });
    }
  });

  // Reports routes
  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const report = await storage.createReport({
        ...req.body,
        createdBy: req.user?.claims?.sub
      });
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.patch('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const report = await storage.updateReport(parseInt(req.params.id), req.body);
      res.json(report);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  app.delete('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.deleteReport(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  app.post('/api/reports/:id/execute', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const execution = await storage.executeReport(
        parseInt(req.params.id),
        req.user?.claims?.sub
      );
      res.json(execution);
    } catch (error) {
      console.error("Error executing report:", error);
      res.status(500).json({ message: "Failed to execute report" });
    }
  });

  app.get('/api/reports/:id/executions', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const executions = await storage.getReportExecutions(parseInt(req.params.id));
      res.json(executions);
    } catch (error) {
      console.error("Error fetching report executions:", error);
      res.status(500).json({ message: "Failed to fetch report executions" });
    }
  });

  // Vitals Categories routes (Platinum tier only)
  app.get('/api/vitals-categories', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }
      
      const categories = await storage.getVitalsCategories(req.user.claims.sub);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching vitals categories:", error);
      res.status(500).json({ message: "Failed to fetch vitals categories" });
    }
  });

  app.post('/api/vitals-categories', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }
      
      const validatedData = insertVitalsCategorySchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      
      const category = await storage.createVitalsCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating vitals category:", error);
      res.status(500).json({ message: "Failed to create vitals category" });
    }
  });

  app.put('/api/vitals-categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }
      
      const validatedData = insertVitalsCategorySchema.partial().parse(req.body);
      const category = await storage.updateVitalsCategory(parseInt(req.params.id), validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error updating vitals category:", error);
      res.status(500).json({ message: "Failed to update vitals category" });
    }
  });

  app.delete('/api/vitals-categories/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }
      
      await storage.deleteVitalsCategory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vitals category:", error);
      res.status(500).json({ message: "Failed to delete vitals category" });
    }
  });

  app.post('/api/vitals-categories/:id/set-default', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.tier !== 'platinum') {
        return res.status(403).json({ message: "Platinum tier required" });
      }
      
      await storage.setDefaultVitalsCategory(req.user.claims.sub, parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default vitals category:", error);
      res.status(500).json({ message: "Failed to set default vitals category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
