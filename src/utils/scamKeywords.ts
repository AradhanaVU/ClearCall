import { ScamKeyword } from '../types';

export const scamKeywords: ScamKeyword[] = [
  // Financial urgency
  { keyword: 'urgent payment', severity: 'high', category: 'financial' },
  { keyword: 'immediate payment', severity: 'high', category: 'financial' },
  { keyword: 'wire transfer', severity: 'high', category: 'financial' },
  { keyword: 'bank account', severity: 'medium', category: 'financial' },
  { keyword: 'social security number', severity: 'high', category: 'identity' },
  { keyword: 'ssn', severity: 'high', category: 'identity' },
  
  // Gift cards
  { keyword: 'gift cards', severity: 'high', category: 'payment' },
  { keyword: 'gift card', severity: 'high', category: 'payment' },
  { keyword: 'itunes card', severity: 'high', category: 'payment' },
  { keyword: 'google play card', severity: 'high', category: 'payment' },
  { keyword: 'amazon card', severity: 'high', category: 'payment' },
  
  // Government impersonation
  { keyword: 'irs', severity: 'high', category: 'government' },
  { keyword: 'internal revenue service', severity: 'high', category: 'government' },
  { keyword: 'tax debt', severity: 'medium', category: 'government' },
  { keyword: 'arrest warrant', severity: 'high', category: 'legal' },
  { keyword: 'court summons', severity: 'medium', category: 'legal' },
  
  // Tech support scams
  { keyword: 'microsoft support', severity: 'medium', category: 'tech' },
  { keyword: 'windows support', severity: 'medium', category: 'tech' },
  { keyword: 'computer virus', severity: 'medium', category: 'tech' },
  { keyword: 'remote access', severity: 'high', category: 'tech' },
  { keyword: 'install software', severity: 'medium', category: 'tech' },
  
  // Lottery/prize scams
  { keyword: 'you have won', severity: 'medium', category: 'prize' },
  { keyword: 'lottery winner', severity: 'medium', category: 'prize' },
  { keyword: 'claim your prize', severity: 'medium', category: 'prize' },
  { keyword: 'congratulations', severity: 'low', category: 'prize' },
  
  // Romance/family emergency
  { keyword: 'grandparent scam', severity: 'high', category: 'family' },
  { keyword: 'grandma', severity: 'low', category: 'family' },
  { keyword: 'grandpa', severity: 'low', category: 'family' },
  { keyword: 'jail', severity: 'medium', category: 'family' },
  { keyword: 'bail money', severity: 'high', category: 'family' },
  
  // Investment scams
  { keyword: 'investment opportunity', severity: 'medium', category: 'investment' },
  { keyword: 'guaranteed returns', severity: 'high', category: 'investment' },
  { keyword: 'cryptocurrency', severity: 'low', category: 'investment' },
  { keyword: 'bitcoin', severity: 'low', category: 'investment' },
  
  // Pressure tactics
  { keyword: 'act now', severity: 'medium', category: 'pressure' },
  { keyword: 'limited time', severity: 'medium', category: 'pressure' },
  { keyword: 'don\'t tell anyone', severity: 'high', category: 'pressure' },
  { keyword: 'keep this secret', severity: 'high', category: 'pressure' },
  { keyword: 'confidential', severity: 'medium', category: 'pressure' }
];
