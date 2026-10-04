import React from 'react';
import { Palette, PenTool, Layout, Megaphone, Hash } from 'lucide-react';

const elements = [
  { type: 'brandColor', label: 'Brand Color', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-100' },
  { type: 'logoDesign', label: 'Logo Design', icon: PenTool, color: 'text-purple-500', bg: 'bg-purple-100' },
  { type: 'landingPage', label: 'Landing Page', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-100' },
  { type: 'adCreative', label: 'Ad Creative', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-100' },
  { type: 'keyword', label: 'Keyword', icon: Hash, color: 'text-green-500', bg: 'bg-green-100' },
];

export default function Sidebar() {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10 relative">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Elements</h2>
        <p className="text-xs text-gray-500 mt-1">Drag elements to the canvas</p>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {/* Group Node - Special Node */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Structure</h3>
          <div
            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-shadow"
            onDragStart={(e) => onDragStart(e, 'group', 'New Group')}
            draggable
          >
            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-600">
              <Layout size={16} />
            </div>
            <span className="font-medium text-gray-700 text-sm">Group</span>
          </div>
        </div>

        {/* Action Nodes */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Actions</h3>
          {elements.map((el) => (
            <div
              key={el.type}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-shadow mb-3"
              onDragStart={(e) => onDragStart(e, 'action', el.label)}
              draggable
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center ${el.bg} ${el.color}`}>
                <el.icon size={16} />
              </div>
              <span className="font-medium text-gray-700 text-sm">{el.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
