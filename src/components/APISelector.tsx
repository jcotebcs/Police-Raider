import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, ExternalLink } from 'lucide-react';
import type { RapidAPIEndpoint, APICategory } from '../data/rapidapi-endpoints';

interface APISelectorProps {
  apis: RapidAPIEndpoint[];
  selectedAPIs: RapidAPIEndpoint[];
  onSelectionChange: (selectedAPIs: RapidAPIEndpoint[]) => void;
  categories: readonly APICategory[];
}

const APISelector: React.FC<APISelectorProps> = ({
  apis,
  selectedAPIs,
  onSelectionChange,
  categories
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleAPI = (api: RapidAPIEndpoint) => {
    const isSelected = selectedAPIs.some(selected => selected.id === api.id);
    if (isSelected) {
      onSelectionChange(selectedAPIs.filter(selected => selected.id !== api.id));
    } else {
      onSelectionChange([...selectedAPIs, api]);
    }
  };

  const toggleAllInCategory = (category: string) => {
    const categoryAPIs = apis.filter(api => api.category === category);
    const allSelected = categoryAPIs.every(api => 
      selectedAPIs.some(selected => selected.id === api.id)
    );
    
    if (allSelected) {
      // Deselect all in category
      onSelectionChange(selectedAPIs.filter(selected => 
        !categoryAPIs.some(api => api.id === selected.id)
      ));
    } else {
      // Select all in category
      const newSelected = [...selectedAPIs];
      categoryAPIs.forEach(api => {
        if (!newSelected.some(selected => selected.id === api.id)) {
          newSelected.push(api);
        }
      });
      onSelectionChange(newSelected);
    }
  };

  const selectAll = () => {
    onSelectionChange(apis);
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'Identity Verification': '🆔',
      'Criminal Background': '🚨',
      'Employment Verification': '💼',
      'Contact Verification': '📧',
      'License Verification': '📋',
      'Vehicle Verification': '🚗',
      'Military Verification': '🎖️',
      'Business Verification': '🏢',
      'Property Verification': '🏠'
    };
    return iconMap[category] || '📄';
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-blue-800/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Select APIs</h2>
        <div className="flex space-x-2">
          <button
            onClick={selectAll}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
          >
            All
          </button>
          <button
            onClick={deselectAll}
            className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
          >
            None
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map(category => {
          const categoryAPIs = apis.filter(api => api.category === category);
          const selectedInCategory = categoryAPIs.filter(api => 
            selectedAPIs.some(selected => selected.id === api.id)
          ).length;
          const isExpanded = expandedCategories.has(category);
          const allSelected = selectedInCategory === categoryAPIs.length;
          const someSelected = selectedInCategory > 0;

          return (
            <div key={category} className="border border-blue-800/30 rounded-lg">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-800/20 transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-blue-300" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-blue-300" />
                  )}
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <div>
                    <h3 className="font-semibold text-white">{category}</h3>
                    <p className="text-sm text-blue-300">
                      {selectedInCategory}/{categoryAPIs.length} selected
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllInCategory(category);
                  }}
                  className={`p-1 rounded transition-colors ${
                    allSelected 
                      ? 'bg-yellow-500 text-black' 
                      : someSelected 
                        ? 'bg-yellow-500/50 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-blue-800/30 bg-black/20">
                  {categoryAPIs.map(api => {
                    const isSelected = selectedAPIs.some(selected => selected.id === api.id);
                    
                    return (
                      <div 
                        key={api.id}
                        className="flex items-center justify-between p-3 hover:bg-blue-800/20 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleAPI(api)}
                              className={`p-1 rounded transition-colors ${
                                isSelected 
                                  ? 'bg-yellow-500 text-black' 
                                  : 'bg-gray-600 hover:bg-gray-500 text-white'
                              }`}
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <div>
                              <h4 className="font-medium text-white text-sm">{api.name}</h4>
                              <p className="text-xs text-blue-300">{api.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs bg-blue-800 text-blue-200 px-2 py-0.5 rounded">
                                  {api.method}
                                </span>
                                <span className="text-xs text-blue-400">
                                  {api.parameters.length} params
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <a
                          href={api.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-300 hover:text-white transition-colors"
                          title="View on RapidAPI"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
        <h3 className="font-semibold text-yellow-400 text-sm mb-2">💡 Quick Start</h3>
        <ol className="text-xs text-blue-200 space-y-1">
          <li>1. Select the APIs you need</li>
          <li>2. Preview generated TypeScript code</li>
          <li>3. Download complete project ZIP</li>
          <li>4. Add your RapidAPI key & start coding!</li>
        </ol>
      </div>
    </div>
  );
};

export default APISelector;