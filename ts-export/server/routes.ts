import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  updateUserSchema,
  insertKeyBindingSchema,
  insertExtensionSettingsSchema,
  insertActivityLogSchema,
  insertSecurityIncidentSchema,
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

  const httpServer = createServer(app);
  return httpServer;
}
