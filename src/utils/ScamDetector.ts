import { ScamKeyword } from '../types';

export interface ScamDetectionResult {
  hasScamKeywords: boolean;
  keywords: string[];
  severity: 'low' | 'medium' | 'high';
  categories: string[];
}

export class ScamDetector {
  static detectScamKeywords(text: string, keywords: ScamKeyword[]): ScamDetectionResult {
    const detectedKeywords: string[] = [];
    const categories: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' = 'low';

    const normalizedText = text.toLowerCase();

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.keyword.toLowerCase()}\\b`, 'gi');
      if (regex.test(normalizedText)) {
        detectedKeywords.push(keyword.keyword);
        
        if (!categories.includes(keyword.category)) {
          categories.push(keyword.category);
        }

        // Update severity based on keyword severity
        if (keyword.severity === 'high') {
          maxSeverity = 'high';
        } else if (keyword.severity === 'medium' && maxSeverity !== 'high') {
          maxSeverity = 'medium';
        } else if (keyword.severity === 'low' && maxSeverity === 'low') {
          maxSeverity = 'low';
        }
      }
    });

    return {
      hasScamKeywords: detectedKeywords.length > 0,
      keywords: detectedKeywords,
      severity: maxSeverity,
      categories
    };
  }

  static getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
    switch (severity) {
      case 'high':
        return '#dc3545'; // Red
      case 'medium':
        return '#fd7e14'; // Orange
      case 'low':
        return '#ffc107'; // Yellow
      default:
        return '#6c757d'; // Gray
    }
  }

  static getSeverityMessage(severity: 'low' | 'medium' | 'high'): string {
    switch (severity) {
      case 'high':
        return 'HIGH RISK - This conversation contains highly suspicious language. Be extremely cautious.';
      case 'medium':
        return 'MEDIUM RISK - This conversation contains potentially suspicious language. Proceed with caution.';
      case 'low':
        return 'LOW RISK - This conversation contains some suspicious keywords. Stay alert.';
      default:
        return 'No suspicious activity detected.';
    }
  }

  static getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      financial: 'Financial urgency or payment requests',
      identity: 'Personal information requests',
      payment: 'Unusual payment methods (gift cards, etc.)',
      government: 'Government impersonation',
      legal: 'Legal threats or fake legal documents',
      tech: 'Tech support scams',
      prize: 'Lottery or prize scams',
      family: 'Family emergency scams',
      investment: 'Investment or cryptocurrency scams',
      pressure: 'High-pressure tactics'
    };

    return descriptions[category] || 'Unknown category';
  }
}
