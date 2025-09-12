import { useState, useEffect, useCallback } from 'react';
import { Download, Shield, Code, Copy, ExternalLink, Github } from 'lucide-react';
import { POLICE_RAIDER_APIS, API_CATEGORIES } from './data/rapidapi-endpoints';
import { generateTypeScript, type GeneratedCode } from './utils/codeGenerator';
import { createZipFile, downloadZip, copyToClipboard } from './utils/fileUtils';
import APISelector from './components/APISelector';
import CodePreview from './components/CodePreview';
import './App.css';

function App() {
  const [selectedAPIs, setSelectedAPIs] = useState(POLICE_RAIDER_APIS);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [activeTab, setActiveTab] = useState('types');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const generateCode = useCallback(async () => {
    setIsGenerating(true);
    try {
      const code = generateTypeScript(selectedAPIs);
      setGeneratedCode(code);
    } catch (error) {
      console.error('Code generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedAPIs]);

  useEffect(() => {
    generateCode();
  }, [generateCode]);

  const handleDownload = async () => {
    if (!generatedCode) return;
    
    try {
      const zipBlob = await createZipFile(generatedCode);
      downloadZip(zipBlob, 'police-raider-api-client.zip');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await copyToClipboard(code);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const tabs = [
    { id: 'types', label: 'Types', icon: Code },
    { id: 'client', label: 'Client', icon: Shield },
    { id: 'examples', label: 'Examples', icon: ExternalLink },
    { id: 'readme', label: 'README', icon: Github }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-blue-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Police-Raider</h1>
                <p className="text-blue-200 text-sm">RapidAPI Code Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-200 text-sm">
                {selectedAPIs.length} APIs Selected
              </span>
              <button
                onClick={handleDownload}
                disabled={!generatedCode || isGenerating}
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download ZIP</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* API Selection Panel */}
          <div className="lg:col-span-1">
            <APISelector
              apis={POLICE_RAIDER_APIS}
              selectedAPIs={selectedAPIs}
              onSelectionChange={setSelectedAPIs}
              categories={API_CATEGORIES}
            />
          </div>

          {/* Code Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-blue-800/30 overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-blue-800/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white border-b-2 border-yellow-400'
                        : 'text-blue-200 hover:text-white hover:bg-blue-800/50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Code Content */}
              <div className="relative">
                {copySuccess && (
                  <div className="absolute top-4 right-16 bg-green-500 text-white px-3 py-1 rounded text-sm z-10">
                    {copySuccess}
                  </div>
                )}
                <button
                  onClick={() => generatedCode && handleCopy(generatedCode[activeTab as keyof GeneratedCode])}
                  className="absolute top-4 right-4 p-2 text-blue-300 hover:text-white hover:bg-blue-800/50 rounded transition-colors z-10"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
                
                {isGenerating ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-blue-200">Generating code...</div>
                  </div>
                ) : generatedCode ? (
                  <CodePreview
                    code={generatedCode[activeTab as keyof GeneratedCode]}
                    language={activeTab === 'readme' ? 'markdown' : 'typescript'}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-blue-200">Select APIs to generate code</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-black/20 backdrop-blur-sm rounded-xl border border-blue-800/30 p-6">
          <h2 className="text-xl font-bold text-white mb-4">🚀 About Police-Raider RapidAPI Generator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-blue-200">
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">🎯 Features</h3>
              <ul className="space-y-1 text-sm">
                <li>• TypeScript code generation</li>
                <li>• Complete project structure</li>
                <li>• Error handling & retry logic</li>
                <li>• Production-ready code</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">🔧 Generated Files</h3>
              <ul className="space-y-1 text-sm">
                <li>• types.ts - Interface definitions</li>
                <li>• client.ts - API client class</li>
                <li>• examples.ts - Usage examples</li>
                <li>• README.md - Documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">📦 Ready to Use</h3>
              <ul className="space-y-1 text-sm">
                <li>• npm install & setup</li>
                <li>• TypeScript compilation</li>
                <li>• ESLint configuration</li>
                <li>• Git repository ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
