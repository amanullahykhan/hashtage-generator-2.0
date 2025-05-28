
import React, { useState, useCallback } from 'react';
import { generateHashtagsFromApi } from './services/geminiService';
import { Button } from './components/ui/Button';
import { Spinner } from './components/ui/Spinner';
import { HashtagChip } from './components/HashtagChip';
import { SparklesIcon, ClipboardIcon, DownloadIcon, AlertTriangleIcon } from './constants';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const apiKey = process.env.API_KEY;

  const handleGenerateHashtags = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate hashtags.');
      return;
    }
    if (!apiKey) {
      setError('API Key is not configured. Please set the API_KEY environment variable.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHashtags([]);

    try {
      const generated = await generateHashtagsFromApi(topic);
      setHashtags(generated);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setHashtags([]);
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKey]);

  const handleCopyToClipboard = () => {
    if (hashtags.length === 0) return;
    const hashtagsString = hashtags.join(' ');
    navigator.clipboard.writeText(hashtagsString)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy hashtags: ', err);
        setError('Failed to copy hashtags to clipboard.');
      });
  };

  const handleDownloadTxt = () => {
    if (hashtags.length === 0) return;
    const hashtagsString = hashtags.join('\n');
    const blob = new Blob([hashtagsString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hashtags.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 py-8 px-4 flex flex-col items-center">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          Professional Hashtag Generator
        </h1>
        <p className="text-xl text-indigo-200">
          Leverage AI to discover high-ranking hashtags for your content.
        </p>
      </header>

      {!apiKey && (
         <div className="w-full max-w-2xl p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-lg flex items-center">
            <AlertTriangleIcon className="h-6 w-6 mr-3 text-red-500" />
            <div>
              <p className="font-semibold">API Key Missing</p>
              <p>The Gemini API key is not configured. Please ensure the API_KEY environment variable is set.</p>
            </div>
          </div>
      )}

      <main className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your topic or keywords
          </label>
          <textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., digital marketing trends, sustainable fashion, AI in healthcare"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            disabled={isLoading || !apiKey}
          />
        </div>

        <Button
          onClick={handleGenerateHashtags}
          disabled={isLoading || !topic.trim() || !apiKey}
          className="w-full flex items-center justify-center text-lg py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Spinner className="w-5 h-5 mr-2" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Generate Hashtags
            </>
          )}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-md shadow">
            <p><span className="font-medium">Error:</span> {error}</p>
          </div>
        )}

        {hashtags.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold text-gray-800">Generated Hashtags:</h2>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-60 overflow-y-auto shadow-inner">
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <HashtagChip key={index} tag={tag} />
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleCopyToClipboard}
                className="flex-1 flex items-center justify-center py-2.5 px-5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transition duration-150 ease-in-out"
              >
                <ClipboardIcon className="w-5 h-5 mr-2" />
                {copied ? 'Copied!' : 'Copy All'}
              </Button>
              <Button
                onClick={handleDownloadTxt}
                className="flex-1 flex items-center justify-center py-2.5 px-5 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition duration-150 ease-in-out"
              >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download .txt
              </Button>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-12 text-center">
        <p className="text-sm text-indigo-200">
          Created by Amanullah Khan.
        </p>
        <p className="text-sm text-indigo-200">
          Powered by AI
        </p>
      </footer>
    </div>
  );
};

export default App;
    