// Removed socket.io import - using HTTP requests instead

export interface GeminiAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  suspiciousElements: string[];
  explanation: string;
  recommendations: string[];
}

export interface ConversationSummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  importantDetails: {
    dates: string[];
    amounts: string[];
    names: string[];
  };
}

export interface GeminiResponse {
  success: boolean;
  analysis?: GeminiAnalysis;
  summary?: ConversationSummary;
  conversationId?: string;
  error?: string;
}

class GeminiService {
  private conversationId: string | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.conversationId = this.generateConversationId();
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Connect to backend (HTTP-based)
  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔍 Checking backend health...');
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        
        if (data.status === 'OK') {
          console.log('🔌 Connected to Gemini backend');
          this.isConnected = true;
          resolve();
        } else {
          throw new Error('Backend not responding correctly');
        }
      } catch (error) {
        console.error('❌ Connection error:', error);
        this.isConnected = false;
        reject(error);
      }
    });
  }

  // Disconnect from backend
  disconnect(): void {
    this.isConnected = false;
  }

  // Analyze text with Gemini AI
  async analyzeText(text: string): Promise<GeminiAnalysis | null> {
    if (!this.isConnected || !this.conversationId) {
      console.warn('⚠️ Not connected to backend or no conversation ID');
      return null;
    }

    try {
      const response = await fetch('http://localhost:5000/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          conversationId: this.conversationId
        })
      });

      const data: GeminiResponse = await response.json();
      
      if (data.success && data.analysis) {
        return data.analysis;
      } else {
        console.error('❌ Analysis failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error analyzing text:', error);
      return null;
    }
  }

  // Generate conversation summary
  async generateSummary(): Promise<ConversationSummary | null> {
    if (!this.isConnected || !this.conversationId) {
      console.warn('⚠️ Not connected to backend or no conversation ID');
      return null;
    }

    try {
      const response = await fetch('http://localhost:5000/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: this.conversationId
        })
      });

      const data: GeminiResponse = await response.json();
      
      if (data.success && data.summary) {
        return data.summary;
      } else {
        console.error('❌ Summary generation failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error generating summary:', error);
      return null;
    }
  }

  // Get conversation details
  async getConversationDetails(): Promise<any> {
    if (!this.conversationId) {
      return null;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/conversation/${this.conversationId}`);
      const data = await response.json();
      return data.success ? data.conversation : null;
    } catch (error) {
      console.error('❌ Error getting conversation details:', error);
      return null;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      return data.status === 'OK';
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return false;
    }
  }

  // Getters
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getConversationId(): string | null {
    return this.conversationId;
  }

  // Start new conversation
  startNewConversation(): void {
    this.conversationId = this.generateConversationId();
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
