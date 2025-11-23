import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const TestReplicate: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testReplicateAPI = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      console.log('Testing Replicate API...');
      
      // Import Replicate dynamically
      const Replicate = (await import('replicate')).default;
      
      const replicate = new Replicate({
        auth: import.meta.env.VITE_REPLICATE_API_TOKEN,
      });

      console.log('Making API call to GPT-5...');
      
      // Use the streaming API as shown in Replicate docs
      const input = {
        prompt: "Say 'Hello from GPT-5!' and list 3 current major global conflicts in 2024-2025. Keep it brief."
      };

      let responseText = '';
      
      for await (const event of replicate.stream("openai/gpt-5", { input })) {
        responseText += event;
      }
      console.log('GPT-5 Response:', responseText);
      
      setResult(responseText);
      
    } catch (err: any) {
      console.error('Replicate test failed:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Replicate API Test</h1>
          <p className="text-muted-foreground">
            Testing your GPT-5 connection with API key: {import.meta.env.VITE_REPLICATE_API_TOKEN?.substring(0, 10)}...
          </p>
        </div>

        <Card className="p-6">
          <div className="text-center space-y-4">
            <Button 
              onClick={testReplicateAPI} 
              disabled={testing}
              className="flex items-center gap-2"
              size="lg"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing GPT-5 Connection...
                </>
              ) : (
                'Test Replicate API'
              )}
            </Button>

            {testing && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Making API call to GPT-5... This may take 10-30 seconds.
                  <br />
                  Check your Replicate billing page to see if usage appears.
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="text-left">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>✅ Success! GPT-5 Response:</strong>
                  <pre className="mt-2 whitespace-pre-wrap text-sm bg-muted p-2 rounded">
                    {result}
                  </pre>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>❌ Error:</strong> {error}
                  <br />
                  <br />
                  <strong>Possible fixes:</strong>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Check if your API key is correct</li>
                    <li>Verify you have credits in your Replicate account</li>
                    <li>Make sure the openai/gpt-5 model is available</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            If this test works, your billing should show usage on the Replicate dashboard.
            <br />
            Once confirmed working, we'll switch back to the full crisis tracker.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestReplicate;
