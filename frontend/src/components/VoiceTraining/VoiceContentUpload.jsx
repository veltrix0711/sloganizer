import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Upload, 
  FileText, 
  Globe, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Type,
  Link
} from 'lucide-react';

const VoiceContentUpload = ({ brandProfileId, onUploadComplete }) => {
  const [activeMethod, setActiveMethod] = useState('text');
  const [loading, setLoading] = useState(false);
  
  // Text upload state
  const [textContent, setTextContent] = useState('');
  const [textSource, setTextSource] = useState('manual');
  const [sourceUrl, setSourceUrl] = useState('');
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Website scraping state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [maxPages, setMaxPages] = useState(5);

  // Results state
  const [uploadResults, setUploadResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleTextUpload = async () => {
    if (!textContent.trim() || textContent.trim().length < 100) {
      alert('Please enter at least 100 characters of content');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/voice-training/profiles/${brandProfileId}/upload-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: textContent,
          source: textSource,
          sourceUrl: sourceUrl || undefined,
          contentType: 'manual'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadResults([result]);
        setShowResults(true);
        setTextContent('');
        setSourceUrl('');
        onUploadComplete?.();
      } else {
        alert(result.error || 'Failed to upload content');
      }
    } catch (error) {
      console.error('Text upload error:', error);
      alert('Failed to upload content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/voice-training/profiles/${brandProfileId}/upload-files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      setUploadResults(result.results || []);
      setShowResults(true);
      setSelectedFiles([]);
      
      if (result.errors && result.errors.length > 0) {
        alert(`Some files failed to upload: ${result.errors.map(e => e.error).join(', ')}`);
      }
      
      onUploadComplete?.();
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteScrape = async () => {
    if (!websiteUrl.trim() || !websiteUrl.startsWith('http')) {
      alert('Please enter a valid website URL');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/voice-training/profiles/${brandProfileId}/scrape-website`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: websiteUrl,
          maxPages
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadResults([result]);
        setShowResults(true);
        setWebsiteUrl('');
        onUploadComplete?.();
      } else {
        alert(result.error || 'Website scraping feature coming soon');
      }
    } catch (error) {
      console.error('Website scraping error:', error);
      alert('Failed to scrape website');
    } finally {
      setLoading(false);
    }
  };

  const uploadMethods = [
    {
      id: 'text',
      name: 'Paste Text',
      icon: Type,
      description: 'Directly paste your brand content'
    },
    {
      id: 'file',
      name: 'Upload Files',
      icon: FileText,
      description: 'Upload .txt, .pdf, .docx, .csv, or .json files'
    },
    {
      id: 'website',
      name: 'Scrape Website',
      icon: Globe,
      description: 'Extract content from your website'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {uploadMethods.map((method) => {
          const Icon = method.icon;
          return (
            <Card 
              key={method.id}
              className={`cursor-pointer transition-all duration-200 ${
                activeMethod === method.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setActiveMethod(method.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${
                  activeMethod === method.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <h3 className="font-medium text-gray-900 mb-1">{method.name}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload Forms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(uploadMethods.find(m => m.id === activeMethod)?.icon, { className: 'w-5 h-5' })}
            {uploadMethods.find(m => m.id === activeMethod)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMethod === 'text' && (
            <>
              <div>
                <Label htmlFor="content">Brand Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your brand content here (minimum 100 characters)..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={8}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {textContent.length} characters (minimum 100 required)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Content Source</Label>
                  <select
                    id="source"
                    value={textSource}
                    onChange={(e) => setTextSource(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="website">Website Copy</option>
                    <option value="social">Social Media</option>
                    <option value="email">Email Content</option>
                    <option value="marketing">Marketing Material</option>
                    <option value="blog">Blog Post</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="sourceUrl">Source URL (optional)</Label>
                  <Input
                    id="sourceUrl"
                    type="url"
                    placeholder="https://example.com/page"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                onClick={handleTextUpload}
                disabled={loading || textContent.length < 100}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Text Content
                  </>
                )}
              </Button>
            </>
          )}

          {activeMethod === 'file' && (
            <>
              <div>
                <Label htmlFor="files">Select Files *</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept=".txt,.pdf,.docx,.csv,.json"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: .txt, .pdf, .docx, .csv, .json (max 5 files, 10MB each)
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Selected Files:</h4>
                  <ul className="space-y-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button 
                onClick={handleFileUpload}
                disabled={loading || selectedFiles.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Files...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </>
                )}
              </Button>
            </>
          )}

          {activeMethod === 'website' && (
            <>
              <div>
                <Label htmlFor="websiteUrl">Website URL *</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://your-website.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="maxPages">Maximum Pages to Scrape</Label>
                <Input
                  id="maxPages"
                  type="number"
                  min="1"
                  max="20"
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value) || 5)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 5-10 pages for best results
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-800 font-medium">Coming Soon</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      Website scraping feature is currently in development. Please use manual text upload for now.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleWebsiteScrape}
                disabled={loading || !websiteUrl}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scraping Website...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Scrape Website Content
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Results */}
      {showResults && uploadResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadResults.map((result, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-green-800 font-medium">Content Uploaded Successfully</h4>
                      <p className="text-green-700 text-sm mt-1">
                        {result.message || 'Content has been queued for voice analysis'}
                      </p>
                      {result.fileName && (
                        <p className="text-green-600 text-sm">File: {result.fileName}</p>
                      )}
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Upload 10+ samples of different content types (emails, blog posts, social media, etc.)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Include content that represents your brand's typical tone and style
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Each sample should be at least 100 characters long for meaningful analysis
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Quality over quantity - authentic brand content works better than generic text
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceContentUpload;