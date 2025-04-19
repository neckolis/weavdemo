import OpenAI from 'openai';

// DeepSeek API configuration
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_BASE = import.meta.env.VITE_DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1';
const BACKEND_URL = import.meta.env.VITE_API_URL || '';

console.log('DeepSeek Service - Backend URL:', BACKEND_URL);

// SECURITY NOTE: In a production environment, you should NOT expose API keys in the frontend.
// A better approach would be to create a backend proxy endpoint that makes the API calls
// and keeps the API keys secure on the server side.

// Initialize the OpenAI client with DeepSeek configuration
const deepseekClient = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_API_BASE,
  dangerouslyAllowBrowser: true, // Allow running in browser environment - NOT recommended for production
});

// Define the model to use
const MODEL = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface WeaviateDocument {
  filename: string;
  content: string;
  uploaded_at: string;
}

// Function to search Weaviate for relevant documents based on a query
export async function searchWeaviateDocuments(query: string): Promise<WeaviateDocument[]> {
  try {
    const searchUrl = BACKEND_URL ? `${BACKEND_URL}/search` : '/api/search';
    console.log('Search URL:', searchUrl);

    // Check if the backend URL is valid
    if (!BACKEND_URL) {
      console.warn('Backend URL is not set. Using mock data for search.');
      return getMockDocuments(query);
    }

    try {
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query }),
        mode: 'cors',
      });

      console.log('Search response status:', response.status);

      if (!response.ok) {
        console.warn(`Search request failed with status ${response.status}. Using mock data.`);
        return getMockDocuments(query);
      }

      const data = await response.json();
      console.log('Search results:', data);
      return data.results || [];
    } catch (fetchError) {
      console.warn('Error fetching search results:', fetchError);
      return getMockDocuments(query);
    }
  } catch (error) {
    console.error('Error searching Weaviate:', error);
    return getMockDocuments(query);
  }
}

// Function to generate mock documents for testing when the backend is not available
function getMockDocuments(query: string): WeaviateDocument[] {
  return [
    {
      filename: 'sample-document-1.txt',
      content: `This is a sample document that contains information about ${query}. It's used for testing when the backend is not available.`,
      uploaded_at: new Date().toISOString()
    },
    {
      filename: 'sample-document-2.txt',
      content: `Here's another document with details about ${query} and related topics. This is mock data for testing purposes.`,
      uploaded_at: new Date().toISOString()
    }
  ];
}

export async function generateChatResponse(
  messages: ChatMessage[],
  query: string
): Promise<string> {
  try {
    // Search for relevant documents in Weaviate
    const relevantDocuments = await searchWeaviateDocuments(query);

    // Generate system prompt based on relevant documents
    const systemPrompt = generateSystemPrompt(relevantDocuments);

    // Add system prompt to messages
    const allMessages = [
      { role: 'system', content: systemPrompt } as ChatMessage,
      ...messages
    ];

    // Check if DeepSeek API key is valid
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your-deepseek-api-key') {
      console.warn('DeepSeek API key is not set or is using the default value. Using mock response.');
      return generateMockResponse(query, relevantDocuments);
    }

    try {
      // Call the DeepSeek API
      const response = await deepseekClient.chat.completions.create({
        model: MODEL,
        messages: allMessages as any,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Return the generated text
      return response.choices[0]?.message?.content || 'No response generated.';
    } catch (apiError) {
      console.warn('Error calling DeepSeek API:', apiError);
      return generateMockResponse(query, relevantDocuments);
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'Sorry, there was an error generating a response. Please try again.';
  }
}

// Function to generate a mock response for testing when the DeepSeek API is not available
function generateMockResponse(query: string, documents: WeaviateDocument[]): string {
  if (documents.length === 0) {
    return `I couldn't find any relevant documents about "${query}". Please try a different query or upload some documents first.`;
  }

  const documentMentions = documents.map(doc => `In the document "${doc.filename}", I found information related to "${query}".`).join('\n\n');

  return `Based on the documents you've uploaded, here's what I found about "${query}":\n\n${documentMentions}\n\nThis is a simulated response as the DeepSeek API is not properly configured. Please set up your DeepSeek API key in the environment variables to get real AI-generated responses.`;
}

// Function to generate a system prompt based on relevant documents from Weaviate
export function generateSystemPrompt(documents: WeaviateDocument[]): string {
  if (documents.length === 0) {
    return `You are an AI assistant that helps users find information in their documents. However, I couldn't find any relevant documents for this query. Please let the user know and offer general assistance.`;
  }

  const documentContents = documents.map(doc => `Document: ${doc.filename}\n${doc.content}`);

  return `You are an AI assistant that helps users find information in their documents.
  Use the following relevant document contents to answer the user's questions:

  ${documentContents.join('\n\n')}

  If the answer is not in the documents, say so clearly. Do not make up information.
  Always cite the document filename when providing information from a specific document.`;
}
