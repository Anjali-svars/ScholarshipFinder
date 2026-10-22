import express, { Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Helper function to execute Python CLI bridge
function runPythonBridge(action: string, payload: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'backend', 'cli_bridge.py');
    const child = spawn('python3', [pythonScript, action]);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('close', (code) => {
      if (code !== 0 && !stdoutData) {
        return reject(new Error(`Python bridge error (${code}): ${stderrData}`));
      }
      try {
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse Python response: ${stdoutData} (stderr: ${stderrData})`));
      }
    });

    // Write JSON payload to stdin
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

// Extract user ID from Bearer token
function getUserIdFromAuthHeader(req: Request): number {
  const authHeader = req.headers.authorization;
  if (!authHeader) return 2; // Default to demo student ID 2
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const parts = token.split('-');
  if (parts.length >= 2 && !isNaN(parseInt(parts[1], 10))) {
    return parseInt(parts[1], 10);
  }
  return 2;
}

// 1. Auth routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const result = await runPythonBridge('auth_register', req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const result = await runPythonBridge('auth_login', req.body);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 2. Student Profile routes
app.get('/api/students/me', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const result = await runPythonBridge('get_profile', { user_id: userId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/students/me', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const result = await runPythonBridge('update_profile', { user_id: userId, profile: req.body });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Scholarship Discovery
app.get('/api/scholarships', async (req: Request, res: Response) => {
  try {
    const result = await runPythonBridge('get_scholarships', req.query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/scholarships/:id', async (req: Request, res: Response) => {
  try {
    const result = await runPythonBridge('get_scholarships', {});
    const sch = result.scholarships?.find((s: any) => s.id === parseInt(req.params.id, 10));
    if (!sch) {
      return res.status(404).json({ success: false, error: 'Scholarship not found' });
    }
    res.json({ success: true, scholarship: sch });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Recommendation Engine
app.get('/api/recommendations', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const weights = req.query.weights ? JSON.parse(req.query.weights as string) : undefined;
    const result = await runPythonBridge('get_recommendations', { user_id: userId, weights });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Saved Scholarships
app.get('/api/saved-scholarships', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const result = await runPythonBridge('get_saved_scholarships', { user_id: userId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/saved-scholarships/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const scholarshipId = parseInt(req.params.id, 10);
    const result = await runPythonBridge('toggle_save', { user_id: userId, scholarship_id: scholarshipId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/saved-scholarships/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const scholarshipId = parseInt(req.params.id, 10);
    const result = await runPythonBridge('toggle_save', { user_id: userId, scholarship_id: scholarshipId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Application Tracker
app.get('/api/applications', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const result = await runPythonBridge('get_applications', { user_id: userId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/applications', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const result = await runPythonBridge('save_application', { ...req.body, user_id: userId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/applications/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const scholarshipId = parseInt(req.params.id, 10);
    const result = await runPythonBridge('save_application', {
      ...req.body,
      user_id: userId,
      scholarship_id: scholarshipId
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/applications/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const scholarshipId = parseInt(req.params.id, 10);
    const result = await runPythonBridge('delete_application', {
      user_id: userId,
      scholarship_id: scholarshipId
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Student Dashboard
app.get('/api/dashboard', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromAuthHeader(req);
    const result = await runPythonBridge('get_dashboard', { user_id: userId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Admin endpoints
app.post('/api/admin/scholarships', async (req: Request, res: Response) => {
  try {
    const result = await runPythonBridge('admin_create_scholarship', { scholarship: req.body });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/scholarships/:id', async (req: Request, res: Response) => {
  try {
    const scholarshipId = parseInt(req.params.id, 10);
    const result = await runPythonBridge('admin_update_scholarship', { scholarship_id: scholarshipId, scholarship: req.body });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/scholarships/:id', async (req: Request, res: Response) => {
  try {
    const scholarshipId = parseInt(req.params.id, 10);
    const result = await runPythonBridge('admin_delete_scholarship', { scholarship_id: scholarshipId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/scholarships/:id/verify', async (req: Request, res: Response) => {
  try {
    const scholarshipId = parseInt(req.params.id, 10);
    const result = await runPythonBridge('admin_toggle_verify', { scholarship_id: scholarshipId });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/audit-logs', async (_req: Request, res: Response) => {
  try {
    const result = await runPythonBridge('admin_get_audit_logs', {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/export-csv', async (_req: Request, res: Response) => {
  try {
    const result = await runPythonBridge('admin_export_csv', {});
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=scholarships_export.csv');
    res.send(result.csv_content);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/run-tests', async (_req: Request, res: Response) => {
  try {
    const result = await runPythonBridge('run_tests', {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite Middleware for SPA Frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Scholarship Recommendation System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
