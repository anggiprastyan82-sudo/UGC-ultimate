
export type Category = 'Problem Solving' | 'Unboxing' | 'Storytelling' | 'Soft Selling' | 'Hard Selling';

export type AspectRatio = '9:16' | '1:1' | '16:9';

export interface GenerationSettings {
  productName: string;
  category: Category;
  ratio: AspectRatio;
  quantity: number;
  prompt: string;
}

export interface GeneratedContent {
  hook: string;
  cta: string;
  narrative: string;
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  content: GeneratedContent;
  settings: GenerationSettings;
}
