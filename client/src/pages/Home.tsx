import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Copy, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Part {
  id: string;
  name: string;
  size: number;
  unit: 'MB' | 'GB';
  downloadUrl: string;
}

interface GeneratorState {
  fileName: string;
  fileType: string;
  parts: Part[];
}

export default function Home() {
  const [state, setState] = useState<GeneratorState>(() => {
    const saved = localStorage.getItem('4gamer_generator_state');
    return saved
      ? JSON.parse(saved)
      : {
          fileName: '',
          fileType: 'ZIP',
          parts: [],
        };
  });

  const [generatedCode, setGeneratedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const codeRef = useRef<HTMLDivElement>(null);

  // حفظ الحالة في Local Storage
  useEffect(() => {
    localStorage.setItem('4gamer_generator_state', JSON.stringify(state));
  }, [state]);

  const addPart = () => {
    const newPart: Part = {
      id: Date.now().toString(),
      name: `Part ${state.parts.length + 1}`,
      size: 1,
      unit: 'GB',
      downloadUrl: '',
    };
    setState({
      ...state,
      parts: [...state.parts, newPart],
    });
  };

  const removePart = (id: string) => {
    setState({
      ...state,
      parts: state.parts.filter((p) => p.id !== id),
    });
  };

  const updatePart = (id: string, updates: Partial<Part>) => {
    setState({
      ...state,
      parts: state.parts.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    });
  };

  const calculateTotalSize = () => {
    let totalMB = 0;
    state.parts.forEach((part) => {
      const sizeInMB = part.unit === 'GB' ? part.size * 1024 : part.size;
      totalMB += sizeInMB;
    });
    if (totalMB >= 1024) {
      return (totalMB / 1024).toFixed(2) + ' GB';
    }
    return totalMB.toFixed(2) + ' MB';
  };

  const generateCode = () => {
    if (!state.fileName.trim()) {
      toast.error('يرجى إدخال اسم الملف');
      return;
    }
    if (state.parts.length === 0) {
      toast.error('يرجى إضافة جزء واحد على الأقل');
      return;
    }
    if (state.parts.some((p) => !p.downloadUrl.trim())) {
      toast.error('يرجى ملء رابط التحميل لجميع الأجزاء');
      return;
    }

    const partsHTML = state.parts
      .map(
        (part, index) => `
    <div class="download-part" data-part-id="${part.id}">
      <div class="part-header">
        <div class="part-info">
          <span class="part-name">${part.name}</span>
          <span class="part-size">${part.size} ${part.unit}</span>
        </div>
        <div class="part-status">
          <span class="status-text">جاهز للتحميل</span>
        </div>
      </div>
      <div class="part-progress">
        <div class="progress-bar" style="width: 0%"></div>
      </div>
      <a href="${part.downloadUrl}" class="download-btn" download>
        <span>تحميل الجزء ${index + 1}</span>
      </a>
    </div>
  `
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.fileName} - صفحة التحميل</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #001a0a 0%, #003d1a 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 20px;
            background: rgba(22, 185, 31, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(22, 185, 31, 0.3);
        }

        .header h1 {
            font-size: 2.5em;
            color: #16b91f;
            margin-bottom: 10px;
            text-shadow: 0 0 10px rgba(22, 185, 31, 0.5);
        }

        .header p {
            color: #a0a0a0;
            font-size: 1.1em;
        }

        .file-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .info-card {
            background: rgba(20, 40, 30, 0.8);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #16b91f;
        }

        .info-label {
            color: #16b91f;
            font-size: 0.9em;
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .info-value {
            font-size: 1.3em;
            color: #e0e0e0;
            font-weight: bold;
        }

        .downloads-section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 1.5em;
            color: #16b91f;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(22, 185, 31, 0.3);
        }

        .downloads-list {
            display: grid;
            gap: 15px;
        }

        .download-part {
            background: rgba(20, 40, 30, 0.6);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid rgba(22, 185, 31, 0.2);
            transition: all 0.3s ease;
        }

        .download-part:hover {
            background: rgba(20, 40, 30, 0.9);
            border-color: rgba(22, 185, 31, 0.5);
            box-shadow: 0 0 15px rgba(22, 185, 31, 0.2);
        }

        .part-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .part-info {
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .part-name {
            font-weight: bold;
            color: #e0e0e0;
            font-size: 1.1em;
        }

        .part-size {
            color: #16b91f;
            font-size: 0.9em;
            background: rgba(22, 185, 31, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
        }

        .part-status {
            text-align: right;
        }

        .status-text {
            color: #16b91f;
            font-size: 0.9em;
        }

        .part-progress {
            width: 100%;
            height: 6px;
            background: rgba(22, 185, 31, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 15px;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #16b91f, #22d93a);
            border-radius: 3px;
            transition: width 0.3s ease;
        }

        .download-btn {
            display: inline-block;
            width: 100%;
            padding: 12px 20px;
            background: linear-gradient(135deg, #16b91f, #22d93a);
            color: #001a0a;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            text-align: center;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 1em;
        }

        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(22, 185, 31, 0.4);
        }

        .download-btn:active {
            transform: translateY(0);
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(22, 185, 31, 0.2);
            color: #808080;
            font-size: 0.9em;
        }

        .reset-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background: rgba(22, 185, 31, 0.2);
            color: #16b91f;
            border: 1px solid #16b91f;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 0.9em;
        }

        .reset-btn:hover {
            background: rgba(22, 185, 31, 0.3);
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }

            .part-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }

            .part-status {
                text-align: left;
            }

            .file-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${state.fileName}</h1>
            <p>صفحة التحميل الرسمية</p>
        </div>

        <div class="file-info">
            <div class="info-card">
                <div class="info-label">نوع الملف</div>
                <div class="info-value">${state.fileType}</div>
            </div>
            <div class="info-card">
                <div class="info-label">عدد الأجزاء</div>
                <div class="info-value">${state.parts.length}</div>
            </div>
            <div class="info-card">
                <div class="info-label">الحجم الكلي</div>
                <div class="info-value">${calculateTotalSize()}</div>
            </div>
        </div>

        <div class="downloads-section">
            <h2 class="section-title">تحميل الأجزاء</h2>
            <div class="downloads-list">
                ${partsHTML}
            </div>
        </div>

        <div class="footer">
            <button class="reset-btn" onclick="location.reload()">إعادة تعيين التقدم</button>
            <p>© 2024 - جميع الحقوق محفوظة</p>
        </div>
    </div>

    <script>
        // حفظ حالة التحميل في Local Storage
        const downloadStates = JSON.parse(localStorage.getItem('downloadStates') || '{}');

        document.querySelectorAll('.download-part').forEach((part) => {
            const partId = part.getAttribute('data-part-id');
            const progressBar = part.querySelector('.progress-bar');
            const statusText = part.querySelector('.status-text');
            const downloadBtn = part.querySelector('.download-btn');

            // استعادة الحالة المحفوظة
            if (downloadStates[partId]) {
                progressBar.style.width = downloadStates[partId].progress + '%';
                statusText.textContent = downloadStates[partId].status;
            }

            // محاكاة تقدم التحميل
            downloadBtn.addEventListener('click', (e) => {
                if (downloadStates[partId] && downloadStates[partId].progress === 100) {
                    return;
                }

                e.preventDefault();

                let progress = downloadStates[partId]?.progress || 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 30;
                    if (progress > 100) progress = 100;

                    progressBar.style.width = progress + '%';
                    downloadStates[partId] = {
                        progress: progress,
                        status: progress === 100 ? 'تم التحميل' : 'جاري التحميل...',
                    };
                    statusText.textContent = downloadStates[partId].status;
                    localStorage.setItem('downloadStates', JSON.stringify(downloadStates));

                    if (progress === 100) {
                        clearInterval(interval);
                        // تنزيل الملف الفعلي
                        window.location.href = downloadBtn.href;
                    }
                }, 300);
            });
        });
    </script>
</body>
</html>`;

    setGeneratedCode(html);
    toast.success('تم توليد الكود بنجاح!');
  };

  const copyCode = () => {
    if (!generatedCode) {
      toast.error('يرجى توليد الكود أولاً');
      return;
    }
    navigator.clipboard.writeText(generatedCode);
    toast.success('تم نسخ الكود إلى الحافظة');
  };

  const downloadCode = () => {
    if (!generatedCode) {
      toast.error('يرجى توليد الكود أولاً');
      return;
    }
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/html;charset=utf-8,' + encodeURIComponent(generatedCode)
    );
    element.setAttribute('download', `${state.fileName || 'download'}.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('تم تحميل الملف');
  };

  const exportSettings = () => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2))
    );
    element.setAttribute('download', `${state.fileName || 'settings'}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('تم تصدير الإعدادات');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setState(imported);
        toast.success('تم استيراد الإعدادات بنجاح');
      } catch {
        toast.error('خطأ في قراءة الملف');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">
            🎮 مولد صفحات التحميل 4GAMER
          </h1>
          <p className="mt-2 text-muted-foreground">
            أنشئ صفحات تحميل احترافية بتصميم 4GAMER بكل سهولة
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="mb-6 text-2xl font-bold text-primary">
                بيانات الملف
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileName" className="mb-2 block">
                    اسم الملف
                  </Label>
                  <Input
                    id="fileName"
                    placeholder="مثال: لعبة PS5"
                    value={state.fileName}
                    onChange={(e) =>
                      setState({ ...state, fileName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="fileType" className="mb-2 block">
                    نوع الملف
                  </Label>
                  <Select
                    value={state.fileType}
                    onValueChange={(value) =>
                      setState({ ...state, fileType: value })
                    }
                  >
                    <SelectTrigger id="fileType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZIP">ZIP</SelectItem>
                      <SelectItem value="RAR">RAR</SelectItem>
                      <SelectItem value="7Z">7Z</SelectItem>
                      <SelectItem value="TAR">TAR</SelectItem>
                      <SelectItem value="PKG">PKG</SelectItem>
                      <SelectItem value="ISO">ISO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>الحجم الكلي:</strong> {calculateTotalSize()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Parts Management */}
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">الأجزاء</h2>
                <Button
                  onClick={addPart}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة جزء
                </Button>
              </div>

              <div className="space-y-4">
                {state.parts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    لم تضف أي أجزاء بعد
                  </p>
                ) : (
                  state.parts.map((part, index) => (
                    <div
                      key={part.id}
                      className="space-y-3 rounded-lg border border-border bg-background p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          الجزء {index + 1}
                        </h3>
                        <Button
                          onClick={() => removePart(part.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="mb-2 block text-xs">
                            اسم الجزء
                          </Label>
                          <Input
                            value={part.name}
                            onChange={(e) =>
                              updatePart(part.id, { name: e.target.value })
                            }
                            placeholder="مثال: Part 1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="mb-2 block text-xs">الحجم</Label>
                            <Input
                              type="number"
                              value={part.size}
                              onChange={(e) =>
                                updatePart(part.id, {
                                  size: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="1"
                              min="0"
                              step="0.1"
                            />
                          </div>
                          <div>
                            <Label className="mb-2 block text-xs">الوحدة</Label>
                            <Select
                              value={part.unit}
                              onValueChange={(value) =>
                                updatePart(part.id, {
                                  unit: value as 'MB' | 'GB',
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MB">MB</SelectItem>
                                <SelectItem value="GB">GB</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <Label className="mb-2 block text-xs">
                            رابط التحميل
                          </Label>
                          <Input
                            value={part.downloadUrl}
                            onChange={(e) =>
                              updatePart(part.id, {
                                downloadUrl: e.target.value,
                              })
                            }
                            placeholder="https://example.com/file"
                            type="url"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={generateCode}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                توليد الصفحة
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={exportSettings}
                  variant="outline"
                  size="sm"
                >
                  <Download className="ml-2 h-4 w-4" />
                  تصدير
                </Button>
                <label className="flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium cursor-pointer hover:bg-accent">
                  <Upload className="ml-2 h-4 w-4" />
                  استيراد
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">الكود</TabsTrigger>
                <TabsTrigger value="preview">المعاينة</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <Card className="p-6">
                  <div className="mb-4 flex gap-2">
                    <Button
                      onClick={copyCode}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="ml-2 h-4 w-4" />
                      نسخ
                    </Button>
                    <Button
                      onClick={downloadCode}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="ml-2 h-4 w-4" />
                      تحميل
                    </Button>
                  </div>
                  <div
                    ref={codeRef}
                    className="max-h-96 overflow-auto rounded-lg bg-background p-4 font-mono text-xs text-foreground border border-border"
                  >
                    {generatedCode ? (
                      <pre className="whitespace-pre-wrap break-words">
                        {generatedCode}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground">
                        الكود سيظهر هنا بعد التوليد
                      </p>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <Card className="p-6">
                  {generatedCode ? (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <iframe
                        srcDoc={generatedCode}
                        className="w-full h-96 border-0"
                        title="معاينة الصفحة"
                      />
                    </div>
                  ) : (
                    <div className="flex h-96 items-center justify-center text-muted-foreground">
                      المعاينة ستظهر هنا بعد التوليد
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
