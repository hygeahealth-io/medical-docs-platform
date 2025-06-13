import { createServer } from "http";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated } from "./replitAuth.js";

export async function registerRoutes(app) {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes (Admin only)
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const filters = {
        search: req.query.search,
        role: req.query.role,
        tier: req.query.tier,
        status: req.query.status,
        offset: parseInt(req.query.offset) || 0,
        limit: parseInt(req.query.limit) || 50,
      };

      const result = await storage.getAllUsers(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const user = await storage.upsertUser(req.body);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const user = await storage.updateUser({ id: req.params.id, ...req.body });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Key bindings routes
  app.get('/api/key-bindings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const keyBindings = await storage.getUserKeyBindings(userId);
      res.json(keyBindings);
    } catch (error) {
      console.error("Error fetching key bindings:", error);
      res.status(500).json({ message: "Failed to fetch key bindings" });
    }
  });

  app.post('/api/key-bindings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const keyBinding = await storage.createKeyBinding({
        ...req.body,
        userId,
      });
      res.json(keyBinding);
    } catch (error) {
      console.error("Error creating key binding:", error);
      res.status(500).json({ message: "Failed to create key binding" });
    }
  });

  app.put('/api/key-bindings/:id', isAuthenticated, async (req, res) => {
    try {
      const keyBinding = await storage.updateKeyBinding(
        parseInt(req.params.id),
        req.body
      );
      res.json(keyBinding);
    } catch (error) {
      console.error("Error updating key binding:", error);
      res.status(500).json({ message: "Failed to update key binding" });
    }
  });

  app.delete('/api/key-bindings/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteKeyBinding(parseInt(req.params.id));
      res.json({ message: "Key binding deleted successfully" });
    } catch (error) {
      console.error("Error deleting key binding:", error);
      res.status(500).json({ message: "Failed to delete key binding" });
    }
  });

  // Extension settings routes
  app.get('/api/extension-settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserExtensionSettings(userId);
      res.json(settings || { isEnabled: true, settings: {} });
    } catch (error) {
      console.error("Error fetching extension settings:", error);
      res.status(500).json({ message: "Failed to fetch extension settings" });
    }
  });

  app.post('/api/extension-settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.upsertExtensionSettings({
        ...req.body,
        userId,
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating extension settings:", error);
      res.status(500).json({ message: "Failed to update extension settings" });
    }
  });

  // Analytics routes (Admin only)
  app.get('/api/analytics/dashboard', isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Activity logs routes
  app.get('/api/activity-logs', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit) || 50;
      const logs = await storage.getUserActivityLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Security incidents routes (Admin only)
  app.get('/api/security-incidents', isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const filters = {
        resolved: req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined,
        severity: req.query.severity,
        limit: parseInt(req.query.limit) || 100,
      };

      const incidents = await storage.getSecurityIncidents(filters);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching security incidents:", error);
      res.status(500).json({ message: "Failed to fetch security incidents" });
    }
  });

  app.post('/api/security-incidents/:id/resolve', isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const incident = await storage.resolveSecurityIncident(parseInt(req.params.id));
      res.json(incident);
    } catch (error) {
      console.error("Error resolving security incident:", error);
      res.status(500).json({ message: "Failed to resolve security incident" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}