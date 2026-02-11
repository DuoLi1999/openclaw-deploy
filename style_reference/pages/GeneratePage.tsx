import { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Save, 
  Send,
  BookOpen,
  MessageSquare,
  Scale,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export function GeneratePage() {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['weibo']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTab, setActiveTab] = useState('weibo');

  const styles = [
    { id: 'formal', label: '严肃正式', icon: '📋' },
    { id: 'friendly', label: '亲民温和', icon: '😊' },
    { id: 'humorous', label: '幽默风趣', icon: '😄' },
    { id: 'warning', label: '警示教育', icon: '⚠️' },
  ];

  const platforms = [
    { id: 'weibo', label: '微博', limit: '≤140字' },
    { id: 'wechat', label: '微信公众号', limit: '800-2000字' },
    { id: 'douyin', label: '抖音/快手', limit: '≤300字' },
    { id: 'toutiao', label: '头条号', limit: '500-1500字' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Mock generation
    setTimeout(() => {
      setGeneratedContent(`【${topic}】

亲爱的司机朋友们，春节返程高峰即将到来！🚗

为了您和家人的平安，请注意：
✅ 提前检查车况，确保安全
✅ 合理规划路线，避开高峰时段
✅ 保持安全车距，谨慎驾驶
✅ 疲劳时及时休息，切勿强行赶路

根据《道路交通安全法》第二十二条规定："机动车驾驶人应当遵守道路交通安全法律、法规的规定，按照操作规范安全驾驶、文明驾驶。"

平安到家，才是最好的归途！🏠

#交通安全 #春节返程`);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">AI 文案生成</h2>
          <p className="text-sm text-gray-600">
            智能生成多平台适配的交通安全宣传文案
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-700" />
              生成参数
            </h3>

            {/* Topic Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                主题关键词 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="例如：春节返程高速安全"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                补充描述（选填）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="补充说明文案的重点、目标受众等"
              />
            </div>

            {/* Style Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                文案风格
              </label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => toggleStyle(style.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition text-sm font-medium ${
                      selectedStyles.includes(style.id)
                        ? 'border-blue-700 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="mr-1">{style.icon}</span>
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                目标平台
              </label>
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <label
                    key={platform.id}
                    className="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition hover:bg-gray-50"
                    style={{
                      borderColor: selectedPlatforms.includes(platform.id) ? '#1e40af' : '#e5e7eb',
                      backgroundColor: selectedPlatforms.includes(platform.id) ? '#eff6ff' : 'white'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => togglePlatform(platform.id)}
                        className="w-4 h-4 text-blue-700 rounded"
                      />
                      <span className="font-medium text-gray-700">{platform.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{platform.limit}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!topic || isGenerating}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  生成文案
                </>
              )}
            </button>
          </div>

          {/* Material Reference */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">素材引用</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <BookOpen className="w-5 h-5 text-blue-700" />
                <div>
                  <div className="text-sm font-semibold text-gray-700">案例库</div>
                  <div className="text-xs text-gray-500">引用优秀案例</div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <MessageSquare className="w-5 h-5 text-blue-700" />
                <div>
                  <div className="text-sm font-semibold text-gray-700">话术库</div>
                  <div className="text-xs text-gray-500">使用常用话术</div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <Scale className="w-5 h-5 text-blue-700" />
                <div>
                  <div className="text-sm font-semibold text-gray-700">法规库</div>
                  <div className="text-xs text-gray-500">引用法律条文</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow border border-gray-200 h-full flex flex-col">
            {/* Platform Tabs */}
            <div className="border-b border-gray-200 px-6 pt-4">
              <div className="flex gap-2 overflow-x-auto">
                {platforms
                  .filter(p => selectedPlatforms.includes(p.id))
                  .map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setActiveTab(platform.id)}
                      className={`px-4 py-2 font-medium text-sm transition border-b-2 whitespace-nowrap ${
                        activeTab === platform.id
                          ? 'border-blue-700 text-blue-700'
                          : 'border-transparent text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {platform.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              {generatedContent ? (
                <div className="space-y-4">
                  {/* Sensitive Word Check */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                    <span className="text-green-700 font-medium">敏感词检测通过</span>
                  </div>

                  {/* Content Editor */}
                  <div className="border border-gray-200 rounded-lg p-4 min-h-[400px] whitespace-pre-wrap">
                    {generatedContent}
                  </div>

                  {/* Word Count */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>字数统计：{generatedContent.length} 字</span>
                    <span className="text-blue-700">符合平台要求</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      <RefreshCw className="w-4 h-4" />
                      重新生成
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      <Copy className="w-4 h-4" />
                      复制文案
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      <Save className="w-4 h-4" />
                      保存草稿
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
                      <Send className="w-4 h-4" />
                      提交审核
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">等待生成内容</p>
                    <p className="text-sm mt-2">填写左侧参数后点击"生成文案"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
