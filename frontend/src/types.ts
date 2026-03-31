export type ContentType = 'interactive-book' | 'crossword';

export type BlockType = 
  | 'text' | 'image' | 'video' | 'audio' 
  | 'multiple-choice' | 'single-choice' | 'true-false' 
  | 'fill-blanks' | 'drag-words' | 'drag-drop' 
  | 'mark-words' | 'question-set' | 'summary' 
  | 'course-presentation' | 'interactive-video' 
  | 'image-hotspots' | 'accordion' | 'dialog-cards' | 'link'
  | 'crossword' | 'guess-answer';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: any; // Can be string or object depending on type
  metadata?: {
    altText?: string;
    hoverText?: string;
    isDecorative?: boolean;
  };
}

export interface LayoutRow {
  id: string;
  columns: {
    id: string;
    elements: ContentBlock[];
  }[];
}

export interface BookPage {
  id: string;
  title: string;
  rows: LayoutRow[];
}

export interface BookData {
  coverImage?: string;
  coverText?: string;
  showCover?: boolean;
  description?: string;
  pages: BookPage[];
}

export interface CrosswordWord {
  answer: string;
  clue: string;
  x: number;
  y: number;
  direction: 'across' | 'down';
}

export interface CrosswordData {
  words: CrosswordWord[];
  gridSize: number;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  data: BookData | CrosswordData;
  published: boolean;
  updatedAt: string;
}
