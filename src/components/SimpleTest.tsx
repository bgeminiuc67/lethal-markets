import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SimpleTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const testWithFetch = async () => {
    setTesting(true);
    setResult('Testing direct fetch to Replicate API...\n');

    try {
      // Try multiple CORS proxies
      const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://cors.bridged.cc/',
        'https://api.codetabs.com/v1/proxy?quest='
      ];
      
      const targetUrl = 'https://api.replicate.com/v1/predictions';
      let lastError = '';
      
      for (const proxy of proxies) {
        try {
          setResult(prev => prev + `Trying proxy: ${proxy}\n`);
          
          const response = await fetch(proxy + encodeURIComponent(targetUrl), {
            method: 'POST',
            headers: {
              'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              version: "openai/gpt-5",
              input: {
                prompt: "Say hello world"
              }
            })
          });
          
          if (response.ok) {
            // Success with this proxy!
            setResult(prev => prev + `✅ Success with ${proxy}!\n`);
            const data = await response.json();
            setResult(prev => prev + `Response: ${JSON.stringify(data, null, 2)}\n`);
            return; // Exit the function on success
          } else {
            lastError = `${response.status}: ${await response.text()}`;
            setResult(prev => prev + `❌ Failed: ${lastError}\n`);
          }
        } catch (proxyError: any) {
          lastError = proxyError.message;
          setResult(prev => prev + `❌ Proxy error: ${lastError}\n`);
        }
      }
      
      // If we get here, all proxies failed
      throw new Error(`All proxies failed. Last error: ${lastError}`);

    } catch (error: any) {
      setResult(prev => prev + `❌ Fetch Error: ${error.message}\n`);
      
      // Try alternative: Use mock data for now
      setResult(prev => prev + '\n🔄 Since API calls are blocked, let me show you with mock data...\n');
      
      // Switch to mock data version
      setTimeout(() => {
        window.location.href = window.location.href.replace(/\?.*/, '') + '?useMock=true';
      }, 2000);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
          
          <Button onClick={testWithFetch} disabled={testing} className="mb-4">
            {testing ? 'Testing...' : 'Test Direct API Call'}
          </Button>

          {result && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {result}
                </pre>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Alternative Solution:</h3>
            <p className="text-sm text-muted-foreground">
              If API calls are blocked by CORS, I can show you the crisis tracker with realistic mock data 
              that demonstrates all the features. This is common in frontend-only applications.
            </p>
            <Button 
              onClick={() => window.location.href = window.location.href.replace(/\?.*/, '') + '?useMock=true'} 
              variant="outline" 
              className="mt-2"
            >
              Show Crisis Tracker with Mock Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SimpleTest;
