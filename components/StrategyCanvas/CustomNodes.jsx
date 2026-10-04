import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Palette, PenTool, Layout, Megaphone, Hash } from 'lucide-react';

const iconMap = {
  'Brand Color': Palette,
  'Logo Design': PenTool,
  'Landing Page': Layout,
  'Ad Creative': Megaphone,
  'Keyword': Hash,
};

// --- Action Node (e.g. Brand Color, Logo Design) ---
export const ActionNode = memo(({ data, isConnectable }) => {
  const Icon = iconMap[data.label] || Layout;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-w-[150px] transition-all hover:shadow-md hover:border-blue-300">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      
      <div className="p-3 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.bg || 'bg-gray-100'} ${data.color || 'text-gray-600'}`}>
          <Icon size={16} />
        </div>
        <div>
          <div className="font-semibold text-gray-800 text-sm">{data.label}</div>
          {data.status && (
             <div className="text-[10px] text-green-600 font-medium uppercase mt-1">{data.status}</div>
          )}
        </div>
      </div>
      
      {data.result && (
        <div className="px-3 pb-3">
            <div className="bg-gray-50 text-xs text-gray-700 p-2 rounded border border-gray-100 mt-1">
                {data.result}
            </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
    </div>
  );
});
ActionNode.displayName = 'ActionNode';


// --- Group Node ---
export const GroupNode = memo(({ data, isConnectable }) => {
  return (
    <div className="bg-gray-50/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-xl min-w-[200px] min-h-[100px] shadow-sm relative group hover:border-blue-400 transition-colors">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      <div className="p-3">
        <div className="font-bold text-gray-700 text-sm mb-1">{data.label || 'New Group'}</div>
        <div className="text-xs text-gray-500">Connect elements here</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
});
GroupNode.displayName = 'GroupNode';
