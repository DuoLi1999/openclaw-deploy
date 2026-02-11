import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  BookOpen,
  MessageSquare,
  Scale,
  Edit,
  Trash2,
  Star,
  Database,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cases, templates, regulations } from "@/data/mock";
import materialsData from "@/data/materials.json";
import { MaterialCard, type Material } from "@/components/materials/MaterialCard";
import { MaterialSearchBar } from "@/components/materials/MaterialSearchBar";
import { TagFilter } from "@/components/materials/TagFilter";
import { MaterialUploadDialog } from "@/components/materials/MaterialUploadDialog";
import { runMediaSearchWorkflow } from "@/services/dify";

const staticMaterials: Material[] = materialsData as Material[];
const USER_MATERIALS_KEY = "userMaterials";

function loadUserMaterials(): Material[] {
  try {
    const raw = localStorage.getItem(USER_MATERIALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function MaterialsPage() {
  const [activeTab, setActiveTab] = useState("materials");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<string[] | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [userMaterials, setUserMaterials] = useState<Material[]>([]);

  useEffect(() => {
    setUserMaterials(loadUserMaterials());
  }, []);

  const materials = useMemo(
    () => [...userMaterials, ...staticMaterials],
    [userMaterials]
  );

  // Extract all unique tags from materials
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    materials.forEach((m) => m.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, []);

  // Filter materials based on search term and selected tags
  const filteredMaterials = useMemo(() => {
    // If AI search results exist, show those
    if (aiResults) {
      return materials.filter((m) => aiResults.includes(m.id));
    }

    return materials.filter((m) => {
      const matchesSearch =
        !searchTerm ||
        m.title.includes(searchTerm) ||
        m.description.includes(searchTerm) ||
        m.tags.some((t) => t.includes(searchTerm));
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => m.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [searchTerm, selectedTags, aiResults]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setAiResults(null);
    setAiSummary(null);
  };

  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;
    setAiSearching(true);
    setAiSummary(null);
    try {
      const result = await runMediaSearchWorkflow({
        query,
        material_type: "all",
      });
      // Parse matches_json to get matched IDs
      try {
        const matches = JSON.parse(result.matches_json);
        if (Array.isArray(matches)) {
          setAiResults(matches.map((m: { id: string }) => m.id));
        }
      } catch {
        setAiResults(null);
      }
      setAiSummary(result.result);
    } catch {
      setAiSummary("AI 搜索暂不可用，请使用关键词搜索");
    } finally {
      setAiSearching(false);
    }
  };

  const handleSaveMaterial = useCallback((material: Material) => {
    const updated = [material, ...userMaterials];
    setUserMaterials(updated);
    localStorage.setItem(USER_MATERIALS_KEY, JSON.stringify(updated));
  }, [userMaterials]);

  const handleDeleteMaterial = useCallback((id: string) => {
    // Only allow deleting user-added materials
    if (!id.startsWith("mat-user-")) return;
    const updated = userMaterials.filter((m) => m.id !== id);
    setUserMaterials(updated);
    localStorage.setItem(USER_MATERIALS_KEY, JSON.stringify(updated));
  }, [userMaterials]);

  const tabs = [
    { id: "materials", label: "素材库", icon: Database, count: materials.length },
    { id: "cases", label: "案例库", icon: BookOpen, count: cases.length },
    {
      id: "templates",
      label: "话术库",
      icon: MessageSquare,
      count: templates.length,
    },
    {
      id: "regulations",
      label: "法规库",
      icon: Scale,
      count: regulations.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">素材库管理</h2>
          <p className="text-sm text-gray-600">
            管理素材、案例、话术和法规，支持 AI 语义搜索
          </p>
        </div>
        <button
          onClick={() => setShowUploadDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
        >
          <Plus className="w-5 h-5" />
          新建素材
        </button>
      </div>

      <Card className="shadow border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-700 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              <MaterialSearchBar
                onSearch={handleSearch}
                onAISearch={handleAISearch}
                isSearching={aiSearching}
                placeholder="搜索素材标题、描述、标签..."
              />

              <TagFilter
                tags={allTags}
                selected={selectedTags}
                onChange={setSelectedTags}
              />

              {aiSummary && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
                  <span className="font-medium">AI 分析：</span>
                  {aiSummary}
                </div>
              )}

              <div className="text-sm text-gray-500">
                共 {filteredMaterials.length} 个素材
                {aiResults && (
                  <button
                    onClick={() => {
                      setAiResults(null);
                      setAiSummary(null);
                    }}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    清除 AI 搜索结果
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredMaterials.map((material) => (
                  <div key={material.id} className="relative">
                    <MaterialCard material={material} />
                    {material.id.startsWith("mat-user-") && (
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="absolute top-3 right-3 p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition shadow-sm"
                        title="删除素材"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
                {filteredMaterials.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    未找到匹配的素材
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === "cases" && (
            <div className="space-y-4">
              {cases.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>
                        {item.favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>来源：{item.source}</span>
                        <span>日期：{item.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        className="bg-blue-50 text-blue-700 border-transparent rounded-full"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              {templates.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>
                        <Badge className="bg-purple-50 text-purple-700 border-transparent rounded-full">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.content}
                      </p>
                      <div className="text-xs text-gray-500">
                        使用次数：{item.usageCount}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regulations Tab */}
          {activeTab === "regulations" && (
            <div className="space-y-4">
              {regulations.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {item.title}
                        </h4>
                        <Badge className="bg-green-50 text-green-700 border-transparent rounded-full">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                    <button className="ml-4 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition">
                      引用
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <MaterialUploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSave={handleSaveMaterial}
        existingTags={allTags}
      />
    </div>
  );
}
