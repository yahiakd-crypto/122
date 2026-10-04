import React, { useState, useRef, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './Sidebar';
import { ActionNode, GroupNode } from './CustomNodes';
import { Play, Loader2 } from 'lucide-react';

const nodeTypes = {
  action: ActionNode,
  group: GroupNode,
};

const initialNodes = [];
const initialEdges = [];

const StrategyCanvasContent = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Default styling logic based on type could go here, or we pass it down
      let bg = 'bg-gray-100';
      let color = 'text-gray-600';
      
      if (label === 'Brand Color') { bg = 'bg-pink-100'; color = 'text-pink-500'; }
      else if (label === 'Logo Design') { bg = 'bg-purple-100'; color = 'text-purple-500'; }
      else if (label === 'Landing Page') { bg = 'bg-blue-100'; color = 'text-blue-500'; }
      else if (label === 'Ad Creative') { bg = 'bg-orange-100'; color = 'text-orange-500'; }
      else if (label === 'Keyword') { bg = 'bg-green-100'; color = 'text-green-500'; }

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: { label: label, bg, color },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const handleRun = async () => {
    setIsRunning(true);
    
    // Simulate finding connected nodes and running AI
    // In a real app, you'd traverse the graph (edges) to find what is connected to what
    // and then call your AI endpoints.
    
    // For demonstration, we'll just mock updating the nodes with a result after a delay
    setNodes((nds) => 
        nds.map((node) => {
            if (node.type === 'action') {
                return { ...node, data: { ...node.data, status: 'Processing...' } };
            }
            return node;
        })
    );

    setTimeout(() => {
        setNodes((nds) => 
            nds.map((node) => {
                if (node.type === 'action') {
                    let mockResult = 'Generated successfully.';
                    if (node.data.label === 'Brand Color') mockResult = '#FF5733, #33FF57';
                    if (node.data.label === 'Keyword') mockResult = 'ai tools, productivity, automation';

                    return { 
                        ...node, 
                        data: { 
                            ...node.data, 
                            status: 'Done',
                            result: mockResult
                        } 
                    };
                }
                return node;
            })
        );
        setIsRunning(false);
    }, 2500);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 flex-row">
      <Sidebar />
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Background color="#ccc" gap={16} />
          <Controls className="bg-white border-gray-200 shadow-sm fill-gray-600" />
          <Panel position="top-right" className="m-4">
             <button 
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isRunning ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                {isRunning ? 'Running Analysis...' : 'Run Strategy'}
             </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default function StrategyCanvas() {
  return (
    <ReactFlowProvider>
      <StrategyCanvasContent />
    </ReactFlowProvider>
  );
}
