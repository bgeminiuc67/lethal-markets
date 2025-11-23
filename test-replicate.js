import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'your_api_key_here',
});

async function testReplicate() {
  try {
    console.log('Testing Replicate connection...');
    
    const output = await replicate.run(
      "openai/gpt-5",
      {
        input: {
          prompt: "Say 'Hello from GPT-5!' and list 3 current major global conflicts in 2024-2025.",
          max_tokens: 200,
          temperature: 0.3
        }
      }
    );

    console.log('Success! GPT-5 Response:');
    console.log(Array.isArray(output) ? output.join('') : output);
    
  } catch (error) {
    console.error('Replicate test failed:', error);
  }
}

testReplicate();
