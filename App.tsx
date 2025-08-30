import React, { useState, useCallback } from 'react';
import { generateAndroidAppFiles } from './services/geminiService';
import type { GeneratedFile, GenerationResult } from './types';
import { CodeDisplay } from './components/CodeDisplay';
import { Instructions } from './components/Instructions';
import JSZip from 'jszip';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
    </div>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid website URL.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generationResult = await generateAndroidAppFiles(url);
      setResult(generationResult);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const handleDownloadAll = useCallback(async () => {
    if (!result) return;

    const zip = new JSZip();
    const javaPath = `app/src/main/java/${result.packageName.replace(/\./g, '/')}/MainActivity.java`;

    zip.file('app/build.gradle', result.gradleContent);
    zip.file('app/src/main/AndroidManifest.xml', result.manifestContent);
    zip.file('app/src/main/res/layout/activity_main.xml', result.layoutContent);
    zip.file(javaPath, result.mainActivityContent);

    try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        const safeAppName = result.appName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safeAppName || 'android_app'}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch(err) {
        console.error("Failed to create zip file", err);
        setError("An error occurred while creating the ZIP file.");
    }
  }, [result]);

  const generatedFiles: GeneratedFile[] | null = result ? [
      { fileName: 'AndroidManifest.xml', language: 'xml', content: result.manifestContent },
      { fileName: `app/build.gradle`, language: 'groovy', content: result.gradleContent },
      { fileName: `app/src/main/res/layout/activity_main.xml`, language: 'xml', content: result.layoutContent },
      { fileName: `app/src/main/java/${result.packageName.replace(/\./g, '/')}/MainActivity.java`, language: 'java', content: result.mainActivityContent },
  ] : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans antialiased">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/40 -z-10"
      ></div>
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <header className="text-center my-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-200 pb-2">
                Web to Android Converter
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Turn any website into a native Android app with AI.</p>
        </header>

        <form onSubmit={handleGenerate} className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg shadow-lg backdrop-blur-sm flex flex-col sm:flex-row items-center gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all"
            disabled={isLoading}
            required
            aria-label="Website URL"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex justify-center items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                </>
            ) : (
              'Generate App'
            )}
          </button>
        </form>

        <div className="mt-8">
          {isLoading && <LoadingSpinner />}
          {error && <div role="alert" className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>}
          
          {result && generatedFiles && (
            <div className="space-y-8">
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg shadow-lg backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        {result.iconUrl && <img src={result.iconUrl} alt="App Icon" className="w-16 h-16 rounded-xl bg-white p-1"/>}
                        <div>
                            <h3 className="text-2xl font-bold text-white">{result.appName}</h3>
                            <p className="text-sm font-mono text-green-400 mt-1">{result.packageName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadAll}
                        className="w-full sm:w-auto flex justify-center items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download .ZIP</span>
                    </button>
                </div>

                <Instructions />

                <div className="grid grid-cols-1 gap-6">
                    {generatedFiles.map((file) => (
                        <CodeDisplay key={file.fileName} {...file} />
                    ))}
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;