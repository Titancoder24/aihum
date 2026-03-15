// ============ DETECTION TYPES ============

export interface SentenceScore {
  text: string;
  index: number;
  score: number; // 0-1, where 1 = definitely AI
  color: 'green' | 'yellow' | 'orange' | 'red';
  moduleScores: Record<string, number>;
}

export interface ModuleScore {
  name: string;
  score: number; // 0-1
  weight: number;
  details: string[];
}

export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very-high';

export interface DetectionResult {
  overallScore: number; // 0-100
  confidence: ConfidenceLevel;
  sentences: SentenceScore[];
  modules: ModuleScore[];
  patterns: DetectedPattern[];
  wordCount: number;
  processingTimeMs: number;
}

export interface DetectedPattern {
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  examples: string[];
}

export interface DetectionModule {
  name: string;
  weight: number;
  analyze(text: string): ModuleAnalysis;
  analyzeSentence(sentence: string, context: SentenceContext): number;
}

export interface ModuleAnalysis {
  score: number; // 0-1, where 1 = definitely AI
  details: string[];
  patterns: DetectedPattern[];
}

export interface SentenceContext {
  sentences: string[];
  index: number;
  fullText: string;
}

// ============ HUMANIZATION TYPES ============

export type HumanizationMode = 'standard' | 'academic' | 'creative' | 'seo' | 'professional';

export type HumanizationIntensity = 'light' | 'medium' | 'aggressive';

export interface HumanizationResult {
  original: string;
  humanized: string;
  beforeScore: number;
  afterScore: number;
  mode: HumanizationMode;
  changes: TextChange[];
  stageResults: StageResult[];
  processingTimeMs: number;
}

export interface TextChange {
  original: string;
  replacement: string;
  stage: string;
  position: number;
}

export interface StageResult {
  stageName: string;
  inputText: string;
  outputText: string;
  changesCount: number;
}

export interface ModeConfig {
  name: HumanizationMode;
  label: string;
  description: string;
  icon: string;
  sentenceVariance: number;
  vocabularyAggressiveness: number; // 0-1
  preserveFormalTone: boolean;
  addColloquialisms: boolean;
  maxIterations: number;
  targetScoreThreshold: number; // max acceptable AI score after humanization
}

export interface HumanizationStage {
  name: string;
  order: number;
  process(text: string, config: ModeConfig): string;
}

// ============ STORAGE TYPES ============

export interface Document {
  id: string;
  text: string;
  type: 'detection' | 'humanization' | 'analysis';
  detectionResult?: DetectionResult;
  humanizationResult?: HumanizationResult;
  createdAt: string;
}

export interface UsageRecord {
  wordsUsedToday: number;
  wordsLimit: number;
  plan: 'free' | 'pro' | 'enterprise';
  resetsAt: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  defaultMode: HumanizationMode;
  detectionWeights: Record<string, number>;
}

export interface IStorageProvider {
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | null>;
  saveDocument(doc: Document): Promise<void>;
  deleteDocument(id: string): Promise<void>;
  getUsage(): Promise<UsageRecord>;
  updateUsage(words: number): Promise<void>;
  getSettings(): Promise<UserSettings>;
  saveSettings(settings: UserSettings): Promise<void>;
}

// ============ API TYPES ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DetectionRequest {
  text: string;
  options?: {
    detailed?: boolean;
    perSentence?: boolean;
    weights?: Record<string, number>;
  };
}

export interface HumanizationRequest {
  text: string;
  mode: HumanizationMode;
  options?: {
    intensity?: HumanizationIntensity;
    preserveKeywords?: string[];
  };
}

export interface AnalyzeRequest {
  text: string;
  mode?: HumanizationMode;
}

export interface AnalyzeResponse {
  detection: DetectionResult;
  humanization: HumanizationResult;
}
