import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const DebugDashboard: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    // Check environment variables
    const debug = {
      apiKey: import.meta.env.VITE_REPLICATE_API_TOKEN,
      apiKeyLength: import.meta.env.VITE_REPLICATE_API_TOKEN?.length || 0,
      apiKeyFirst10: import.meta.env.VITE_REPLICATE_API_TOKEN?.substring(0, 10) || 'NOT_FOUND',
      nodeEnv: import.meta.env.NODE_ENV,
      mode: import.meta.env.MODE,
      allEnvVars: Object.keys(import.meta.env)
    };
    setDebugInfo(debug);
  }, []);

  const testDirectAPI = async () => {
    setTesting(true);
    setResult('');

    try {
      // Test 1: Check if we can import Replicate
      setResult(prev => prev + '✅ Step 1: Importing Replicate...\n');
      const Replicate = (await import('replicate')).default;
      setResult(prev => prev + '✅ Step 2: Replicate imported successfully\n');

      // Test 2: Create instance
      const replicate = new Replicate({
        auth: import.meta.env.VITE_REPLICATE_API_TOKEN || 'your_api_key_here',
      });
      setResult(prev => prev + '✅ Step 3: Replicate instance created\n');

      // Test 3: Make API call
      setResult(prev => prev + '🔄 Step 4: Making API call to GPT-5...\n');
      
      const input = {
        prompt: "Just say 'Hello World' and nothing else."
      };

      // Use replicate.run() as shown in the official docs
      const output = await replicate.run("openai/gpt-5", { input });
      
      // Handle the response (could be string or array)
      const response = Array.isArray(output) ? output.join('') : String(output);

      setResult(prev => prev + `✅ Step 5: SUCCESS! GPT-5 Response: "${response}"\n`);
      setResult(prev => prev + '✅ API is working! Check your Replicate billing.\n');

    } catch (error: any) {
      setResult(prev => prev + `❌ ERROR: ${error.message}\n`);
      setResult(prev => prev + `❌ Full error: ${JSON.stringify(error, null, 2)}\n`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🔍 Debug Dashboard</h1>
          <p className="text-muted-foreground">
            Let's figure out why the API isn't working
          </p>
        </div>

        {/* Environment Debug */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>API Key: {debugInfo.apiKey ? '✅ Found' : '❌ Missing'}</div>
            <div>API Key Length: {debugInfo.apiKeyLength}</div>
            <div>API Key Preview: {debugInfo.apiKeyFirst10}...</div>
            <div>Node Environment: {debugInfo.nodeEnv}</div>
            <div>Vite Mode: {debugInfo.mode}</div>
            <div>All Env Vars: {debugInfo.allEnvVars?.join(', ')}</div>
          </div>
        </Card>

        {/* API Test */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Direct API Test</h2>
            <Button 
              onClick={testDirectAPI} 
              disabled={testing}
              className="flex items-center gap-2"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test API with Hardcoded Key'
              )}
            </Button>
          </div>

          {result && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {result}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <div className="space-y-2 text-sm">
            <div>1. Check if environment variables are loaded correctly</div>
            <div>2. Test API with hardcoded key to isolate the issue</div>
            <div>3. Verify network connectivity and CORS settings</div>
            <div>4. Check Replicate account status and credits</div>
            <div>5. Ensure the openai/gpt-5 model is available</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DebugDashboard;
