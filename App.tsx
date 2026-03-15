
import React, { useState, useRef } from 'react';
import { Button } from './components/Button';
import { Category, AspectRatio, GenerationResult } from './types';
import { generateUGCImage, generateMarketingContent } from './services/geminiService';

const CATEGORIES: Category[] = [
  'Problem Solving',
  'Unboxing',
  'Storytelling',
  'Soft Selling',
  'Hard Selling'
];

const RATIOS: { label: string; value: AspectRatio }[] = [
  { label: 'TikTok/Reels (9:16)', value: '9:16' },
  { label: 'Instagram (1:1)', value: '1:1' },
  { label: 'YouTube (16:9)', value: '16:9' },
];

const App: React.FC = () => {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [category, setCategory] = useState<Category>('Soft Selling');
  const [ratio, setRatio] = useState<AspectRatio>('9:16');
  const [quantity, setQuantity] = useState<number>(1);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'model') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') setProductImage(reader.result as string);
        else setModelImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!productImage || !modelImage) {
      setError("Mohon upload foto produk DAN foto referensi model.");
      return;
    }
    if (!productName.trim()) {
      setError("Mohon isi nama produk Anda.");
      return;
    }
    if (!prompt.trim()) {
      setError("Mohon isi instruksi visual.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const newResults: GenerationResult[] = [];

      for (let i = 0; i < quantity; i++) {
        const [imageUrl, marketingContent] = await Promise.all([
          generateUGCImage(productImage, modelImage, productName, prompt, category, ratio),
          generateMarketingContent(productName, category, prompt)
        ]);

        newResults.push({
          id: Math.random().toString(36).substr(2, 9),
          imageUrl,
          content: marketingContent,
          settings: { productName, category, ratio, quantity, prompt }
        });
      }

      setResults(prev => [...newResults, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError("Gagal membuat konten. Pastikan API Key valid dan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">U</div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">UGC AI Studio <span className="text-indigo-600 font-medium text-sm ml-2 px-2 py-0.5 bg-indigo-50 rounded-full">Pro</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        {/* Input Section */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center mb-8">
            <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold shadow-md shadow-indigo-100">1</span>
            <h2 className="text-xl font-bold text-slate-800">Detail Konten & Referensi</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Dual Image Upload */}
            <div className="lg:col-span-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Foto Produk</label>
                  <div 
                    onClick={() => productInputRef.current?.click()}
                    className={`relative aspect-[3/4] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${productImage ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'}`}
                  >
                    <input type="file" ref={productInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'product')} />
                    {productImage ? (
                      <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm mb-2 inline-block">
                          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase">Upload Produk</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Model Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ref. Model/Gaya</label>
                  <div 
                    onClick={() => modelInputRef.current?.click()}
                    className={`relative aspect-[3/4] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${modelImage ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-pink-400 bg-slate-50'}`}
                  >
                    <input type="file" ref={modelInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'model')} />
                    {modelImage ? (
                      <img src={modelImage} alt="Model Reference" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm mb-2 inline-block">
                          <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase">Upload Model</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic text-center">AI akan menggabungkan produk Anda ke dalam gaya/pose referensi model.</p>
            </div>

            {/* Right: Form Settings */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Produk</label>
                <input 
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Skincare Serum Brightening, Sepatu Lari Pro, dsb."
                  className="w-full bg-slate-50 border-slate-200 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Tujuan Konten (Style)</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${category === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ratio & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Format</label>
                  <select 
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value as AspectRatio)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {RATIOS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Varian Foto</label>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {[1, 2, 3, 4].map(q => (
                      <option key={q} value={q}>{q} Foto</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Instruksi Visual (Prompt)</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ceritakan detail fotonya, misal: 'Model sedang memegang produk serum sambil tersenyum ke kamera, latar belakang kamar aesthetic saat pagi hari...'"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-10">
            <Button 
              onClick={handleGenerate} 
              loading={isGenerating}
              className="w-full h-16 text-xl rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900"
            >
              🚀 Buat Konten Sekarang
            </Button>
          </div>
        </section>

        {/* Results Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center">
              <span className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold shadow-md shadow-pink-100">2</span>
              <h2 className="text-xl font-bold text-slate-800">Gallery Hasil AI</h2>
            </div>
            <div className="text-right">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{results.length} item</span>
            </div>
          </div>

          {results.length === 0 && !isGenerating ? (
            <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-slate-800 text-lg font-bold">Siap Membuat Konten Viral?</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">Upload foto produk dan referensi gaya di atas, lalu tekan tombol buat untuk melihat keajaiban AI.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {results.map((result) => (
                <div key={result.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row group animate-in zoom-in-95 fade-in duration-700">
                  {/* Image Part */}
                  <div className={`relative bg-slate-100 shrink-0 w-full md:w-[350px] aspect-[9/16] flex items-center justify-center overflow-hidden`}>
                    <img src={result.imageUrl} alt="Generated UGC" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        {result.settings.category}
                      </span>
                      <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-200">
                        {result.settings.productName}
                      </span>
                    </div>
                  </div>

                  {/* Content Part */}
                  <div className="p-10 flex-1 space-y-8 bg-gradient-to-br from-white to-slate-50">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                         <span className="h-px w-8 bg-indigo-200"></span>
                         <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Viral Hook Strategy</p>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 leading-[1.2]">
                        {result.content.hook}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Authentic Narrative</p>
                      <div className="bg-white/50 border border-slate-100 p-5 rounded-2xl">
                         <p className="text-md text-slate-600 leading-relaxed italic">
                          "{result.content.narrative}"
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.2em]">Call to Action</p>
                      <p className="text-xl font-bold text-slate-800">
                        {result.content.cta}
                      </p>
                    </div>

                    <div className="pt-8 flex flex-wrap gap-3 border-t border-slate-100">
                      <Button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = result.imageUrl;
                          link.download = `ugc-studio-${result.id}.png`;
                          link.click();
                        }}
                        variant="primary"
                        className="rounded-2xl px-8 shadow-indigo-100"
                      >
                        Download Foto
                      </Button>
                      <Button 
                        onClick={() => {
                          const textToCopy = `PRODUK: ${result.settings.productName}\n\nHOOK: ${result.content.hook}\n\nNARASI: ${result.content.narrative}\n\nCTA: ${result.content.cta}`;
                          navigator.clipboard.writeText(textToCopy);
                          alert("Narasi marketing berhasil disalin!");
                        }}
                        variant="outline"
                        className="rounded-2xl px-8"
                      >
                        Salin Script
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Scroll Top (Mobile) */}
      {results.length > 2 && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors border border-slate-100 z-50 md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>
      )}
    </div>
  );
};

export default App;
