import React, { useState, useEffect } from 'react';
import { 
  Plus, BookOpen, Grid, Trash2, Edit2, Play, ChevronLeft, Layout, 
  Settings, Share2, Search, FileText, HelpCircle, CheckCircle2, Music, Video, List 
} from 'lucide-react';
import { cn } from './lib/utils';
import { ContentItem, ContentType, BookData, CrosswordData } from './types';
import ModernEditor from './components/ModernEditor';
import CrosswordEditor from './components/CrosswordEditor';
import InteractiveBookViewer from './components/InteractiveBookViewer';
import CrosswordViewer from './components/CrosswordViewer';
import { FillInBlanksEditor } from './components/LMS/FillInBlanksEditor';
import { GuessTheAnswerEditor } from './components/LMS/GuessTheAnswerEditor';
import { MultipleChoiceEditor } from './components/LMS/MultipleChoiceEditor';
import { TrueFalseEditor } from './components/LMS/TrueFalseEditor';
import { AudioEditor } from './components/LMS/AudioEditor';
import { VideoEditor } from './components/LMS/VideoEditor';
import { SummaryEditor } from './components/LMS/SummaryEditor';
import { PagesView } from './components/LMS/PagesView';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';

type ViewState = 'dashboard' | 'editor' | 'viewer' | 'pages';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
  const [newContentType, setNewContentType] = useState<ContentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // LMS Modal states
  const [showFillInBlanks, setShowFillInBlanks] = useState(false);
  const [showGuessTheAnswer, setShowGuessTheAnswer] = useState(false);
  const [showMultipleChoice, setShowMultipleChoice] = useState(false);
  const [showTrueFalse, setShowTrueFalse] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data);
    } catch (err) {
      console.error('Failed to fetch content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = (type: ContentType) => {
    setNewContentType(type);
    setActiveItem(null);
    setView('editor');
  };

  const handleEdit = (item: ContentItem) => {
    setActiveItem(item);
    setNewContentType(null);
    setView('editor');
  };

  const handleView = (item: ContentItem) => {
    setActiveItem(item);
    setView('viewer');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await fetch(`/api/content/${id}`, { method: 'DELETE' });
      setContent(content.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleSave = async (title: string, data: any) => {
    const isNew = !activeItem;
    const url = isNew ? '/api/content' : `/api/content/${activeItem.id}`;
    const method = isNew ? 'POST' : 'PUT';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isNew ? newContentType : activeItem.type,
          title,
          data
        })
      });
      
      if (res.ok) {
        await fetchContent();
        setView('dashboard');
        setShowFillInBlanks(false);
        setShowGuessTheAnswer(false);
        setShowMultipleChoice(false);
        setShowTrueFalse(false);
        setShowAudio(false);
        setShowVideo(false);
        setShowSummary(false);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const filteredContent = content.filter(item => 
    item.type === 'interactive-book' &&
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f1f3f5] font-sans text-zinc-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-12">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('dashboard')}
          >
            <div className="w-10 h-10 bg-[#1f6fb2] rounded flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900">School Magazine</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Interactive Magazine Creator</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setView('dashboard')}
              className={cn(
                "text-sm font-bold transition-colors",
                view === 'dashboard' ? "text-[#1f6fb2]" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-zinc-100 rounded px-4 py-1.5 border border-zinc-200 focus-within:ring-2 focus-within:ring-[#1f6fb2] transition-all">
            <Search className="w-4 h-4 text-zinc-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search content..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-48"
            />
          </div>
          <div className="w-8 h-8 bg-zinc-200 rounded overflow-hidden border border-zinc-300 cursor-pointer hover:ring-2 hover:ring-[#1f6fb2] transition-all">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
          </div>
        </div>
      </nav>

      <main className={cn("mx-auto py-8", (view === 'editor' || view === 'pages') ? "max-w-none px-0" : "max-w-7xl px-6")}>
        <AnimatePresence mode="wait">
          {view === 'pages' && (
            <motion.div
              key="pages"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <PagesView onSelectType={(type) => {
                if (type === 'interactive-book') {
                  handleCreateNew('interactive-book');
                } else {
                  // Start a new book with this content type as the first page
                  setNewContentType('interactive-book');
                  const pageId = uuidv4();
                  const rowId = uuidv4();
                  const colId = uuidv4();
                  const blockId = uuidv4();
                  
                  const getDefaultContent = (type: string) => {
                    switch (type) {
                      case 'multiple-choice':
                        return { question: '', options: [{ id: uuidv4(), text: '', isCorrect: false }] };
                      case 'true-false':
                        return { question: '', isCorrect: true };
                      case 'fill-blanks':
                        return { text: '' };
                      case 'summary':
                        return { text: '' };
                      case 'guess-answer':
                        return { question: '', answer: '' };
                      default:
                        return '';
                    }
                  };

                  const initialData: BookData = {
                    pages: [
                      {
                        id: pageId,
                        title: '',
                        rows: [
                          {
                            id: rowId,
                            columns: [
                              {
                                id: colId,
                                elements: [
                                  {
                                    id: blockId,
                                    type: type as any,
                                    content: getDefaultContent(type)
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  };
                  setActiveItem({
                    id: 'temp-' + uuidv4(),
                    type: 'interactive-book',
                    title: '',
                    data: initialData,
                    published: false,
                    updatedAt: new Date().toISOString()
                  });
                  setView('editor');
                }
              }} />
            </motion.div>
          )}
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {content.some(item => item.type === 'interactive-book') && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Magazine Library</h2>
                    <p className="text-zinc-500">Create and manage your school magazines and articles.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setView('pages')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#1f6fb2] text-white rounded hover:bg-[#1a5e96] transition-all shadow-md font-bold text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Content
                    </button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-zinc-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : filteredContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContent.map((item) => (
                    <div 
                      key={item.id} 
                      className="group bg-white rounded border border-zinc-200 overflow-hidden hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="aspect-video bg-zinc-100 relative overflow-hidden border-b border-zinc-100">
                        {item.type === 'interactive-book' ? (
                          <img 
                            src={(item.data as BookData).coverImage || `https://picsum.photos/seed/${item.id}/400/225`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            {item.type === 'crossword' ? <Grid className="w-16 h-16 opacity-20" /> : <FileText className="w-16 h-16 opacity-20" />}
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur rounded text-[10px] font-bold uppercase tracking-wider text-zinc-600 shadow-sm border border-zinc-200">
                          {item.type.replace('-', ' ')}
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-zinc-900 mb-1 group-hover:text-[#1f6fb2] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
                          {item.type === 'interactive-book' 
                            ? (item.data as BookData).description || 'No description provided.'
                            : `Enterprise interactive content module.`}
                        </p>
                        <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleView(item)}
                              className="p-2 text-zinc-400 hover:text-[#1f6fb2] hover:bg-blue-50 rounded transition-all"
                              title="View"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded border border-zinc-200">
                  <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="w-10 h-10 text-zinc-300" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">Your library is empty</h3>
                  <p className="text-zinc-500 max-w-xs text-center mb-8">
                    Start creating interactive books and learning modules to build your collection.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleCreateNew('interactive-book')}
                      className="px-6 py-2.5 bg-[#1f6fb2] text-white rounded font-bold shadow-md hover:bg-[#1a5e96] transition-all"
                    >
                      Create First Magazine
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6"
            >
              {(newContentType || activeItem?.type) === 'interactive-book' ? (
                <ModernEditor
                  initialTitle={activeItem?.title}
                  initialData={activeItem?.data as BookData}
                  crosswords={content.filter(c => c.type === 'crossword')}
                  onSave={(title, data) => {
                    handleSave(title, data);
                  }}
                />
              ) : (
                <div className="max-w-4xl mx-auto">
                  <CrosswordEditor
                    initialData={activeItem?.data as CrosswordData}
                    onSave={(data) => {
                      const title = 'Untitled Crossword';
                      handleSave(title, data);
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {view === 'viewer' && activeItem && (
            <motion.div
              key="viewer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              {activeItem.type === 'interactive-book' ? (
                <InteractiveBookViewer 
                  id={activeItem.id}
                  title={activeItem.title}
                  data={activeItem.data as BookData} 
                  allContent={content} 
                />
              ) : (
                <div className="max-w-4xl mx-auto">
                  <CrosswordViewer data={activeItem.data as CrosswordData} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* LMS Modals */}
      <FillInBlanksEditor 
        isOpen={showFillInBlanks} 
        onClose={() => setShowFillInBlanks(false)}
        onSave={(data) => handleSave(data.title, data)}
      />
      <GuessTheAnswerEditor 
        isOpen={showGuessTheAnswer} 
        onClose={() => setShowGuessTheAnswer(false)}
        onSave={(data) => handleSave(data.title, data)}
      />
      <MultipleChoiceEditor
        isOpen={showMultipleChoice}
        onClose={() => setShowMultipleChoice(false)}
        onSave={(data) => handleSave(data.title, data)}
      />
      <TrueFalseEditor
        isOpen={showTrueFalse}
        onClose={() => setShowTrueFalse(false)}
        onSave={(data) => handleSave(data.title, data)}
      />
      <AudioEditor
        isOpen={showAudio}
        onClose={() => setShowAudio(false)}
        onSave={(data) => handleSave(data.title, data)}
      />
      <VideoEditor
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        onSave={(data) => handleSave(data.title, data)}
      />
      <SummaryEditor
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        onSave={(data) => handleSave(data.title, data)}
      />
    </div>
  );
}
