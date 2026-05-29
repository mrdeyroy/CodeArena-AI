'use client';

import * as React from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Handle, 
  Position, 
  NodeProps,
  Edge,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Sparkles, BrainCircuit, X, CheckCircle, AlertTriangle, Lock, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockSkillNodes } from '@/lib/mock-data';
import Link from 'next/link';

// ==========================================
// Custom Node Component
// ==========================================
function SkillGraphNode({ data }: { data: any }) {
  const status = data.status as 'mastered' | 'learning' | 'weak' | 'locked';
  
  const statusStyles = {
    mastered: 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    learning: 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    weak: 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    locked: 'border-slate-800 bg-slate-900/60 text-slate-500'
  };

  const icons = {
    mastered: <CheckCircle className="w-3.5 h-3.5" />,
    learning: <Sparkles className="w-3.5 h-3.5 animate-pulse" />,
    weak: <AlertTriangle className="w-3.5 h-3.5" />,
    locked: <Lock className="w-3.5 h-3.5" />
  };

  return (
    <div className={`px-4 py-3 border-2 rounded-xl text-center font-bold tracking-tight text-xs flex flex-col items-center gap-1.5 min-w-[140px] ${statusStyles[status]}`}>
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="!bg-slate-700 !border-slate-950" />
      
      <div className="flex items-center gap-1.5">
        {icons[status]}
        <span>{data.label}</span>
      </div>
      
      {status !== 'locked' && (
        <span className="text-[10px] font-mono opacity-80">
          Mastery: {data.mastery}%
        </span>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-slate-700 !border-slate-950" />
    </div>
  );
}

// Map custom nodes
const nodeTypes = {
  skill: SkillGraphNode,
};

// ==========================================
// Main Graph Page Component
// ==========================================
import { fetchGraph, fetchNodeInsights } from '@/lib/api';
import { SkillNode as SkillNodeType } from '@/lib/types';

export default function SkillGraphPage() {
  const [selectedNode, setSelectedNode] = React.useState<any>(null);
  const [loadedNodes, setLoadedNodes] = React.useState<SkillNodeType[]>([]);
  const [nodes, setNodes] = React.useState<Node[]>([]);
  const [edges, setEdges] = React.useState<Edge[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Position nodes logically to represent an algorithm syllabus tree
  const positionNode = (label: string) => {
    if (label.includes('Arrays') || label.includes('Hashing')) return { x: 250, y: 50 };
    if (label.includes('Two Pointers') || label.includes('Pointers')) return { x: 250, y: 150 };
    if (label.includes('Sliding Window') || label.includes('Window')) return { x: 250, y: 250 };
    if (label.includes('Binary Trees') || label.includes('Trees')) return { x: 100, y: 350 };
    if (label.includes('Graphs')) return { x: 100, y: 460 };
    if (label.includes('Dynamic Programming') || label.includes('DP')) return { x: 400, y: 350 };
    if (label.includes('Greedy Algorithms') || label.includes('Greedy')) return { x: 250, y: 580 };
    return { x: 250, y: 50 };
  };

  const nstatusToAnimated = (status?: string) => {
    return status === 'mastered' || status === 'learning';
  };

  React.useEffect(() => {
    async function load() {
      try {
        const { nodes: backendNodes, edges: backendEdges } = await fetchGraph();
        setLoadedNodes(backendNodes);
        
        const initialNodes: Node[] = backendNodes.map((n) => ({
          id: n.id,
          type: 'skill',
          position: positionNode(n.label),
          data: { label: n.label, status: n.status, mastery: n.mastery }
        }));
        
        const initialEdges: Edge[] = backendEdges.map((e, idx) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          animated: nstatusToAnimated(backendNodes.find(node => node.id === e.source)?.status)
        }));

        setNodes(initialNodes);
        setEdges(initialEdges);
      } catch (e) {
        console.error('Failed to load graph:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleNodeClick = async (_: any, node: Node) => {
    const baseNode = loadedNodes.find(n => n.id === node.id);
    if (!baseNode) return;
    
    setSelectedNode({
      ...baseNode,
      aiInsight: 'Analyzing mastery gaps via AI Coach...',
      recommendedProblems: []
    });

    try {
      const insights = await fetchNodeInsights(node.id);
      setSelectedNode({
        ...baseNode,
        aiInsight: insights.ai_insight,
        recommendedProblems: insights.recommended_problems || []
      });
    } catch (e) {
      console.error(e);
      setSelectedNode({
        ...baseNode,
        aiInsight: 'Weakness detected. Focus on cyclic DFS path structures to improve mastery.'
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'mastered': return 'success';
      case 'learning': return 'primary';
      case 'weak': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 max-w-[1600px] mx-auto overflow-hidden relative">
      
      {/* 1. LEFT COLUMN: GRAPH CANVAS */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl relative flex flex-col overflow-hidden">
        {/* Canvas Toolbar Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-400" /> Interactive Skill Dependency Graph
            </h1>
            <p className="text-[10px] text-slate-500">Click any syllabus node to analyze mastery gaps and view recommended practice cases.</p>
          </div>
          
          {/* Legend */}
          <div className="flex gap-3 text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500" /> Mastered</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 border border-indigo-500" /> Learning</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500" /> Weak</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" /> Locked</span>
          </div>
        </div>

        {/* Canvas Wrapper */}
        <div className="flex-1 bg-slate-950/20 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-950/20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Loading Skill Graph...</span>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={handleNodeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.5}
              maxZoom={1.5}
            >
              <Background color="#334155" gap={24} size={1} />
              <Controls className="!bg-slate-900 !border-slate-800 !text-slate-400" />
              <MiniMap 
                style={{ height: 100, width: 140, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} 
                nodeColor={(node) => {
                  const status = node.data?.status;
                  if (status === 'mastered') return '#10b981';
                  if (status === 'learning') return '#6366f1';
                  if (status === 'weak') return '#f59e0b';
                  return '#1e293b';
                }}
                maskColor="rgba(15, 23, 42, 0.6)"
              />
            </ReactFlow>
          )}
        </div>
      </div>

      {/* 2. RIGHT COLUMN: DETAILS DRAWER */}
      {selectedNode && (
        <div className="w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-xl flex flex-col shrink-0 animate-slide-up h-full overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Skill Details</span>
              <h2 className="text-sm font-bold text-slate-200">{selectedNode.label}</h2>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body content scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* Status Indicator */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <span className="text-xs text-slate-500 font-bold uppercase">Status</span>
              <Badge variant={getStatusBadgeVariant(selectedNode.status)} className="capitalize">
                {selectedNode.status}
              </Badge>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</span>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">{selectedNode.description}</p>
            </div>

            {/* Progress indicators if unlocked */}
            {selectedNode.status !== 'locked' && (
              <div className="space-y-3.5 border-t border-b border-slate-850 py-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px]">Mastery Score</span>
                    <span className="text-indigo-400">{selectedNode.mastery}%</span>
                  </div>
                  <Progress value={selectedNode.mastery} color={selectedNode.status === 'weak' ? 'warning' : 'primary'} />
                </div>

                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Solved Modules</span>
                  <span className="text-slate-200">{selectedNode.problemsSolved} / {selectedNode.problemsCount}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last active: {new Date(selectedNode.lastActivity).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {/* AI Insights and dynamic coaching */}
            {selectedNode.status !== 'locked' && (
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3.5 space-y-2">
                <p className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" /> AI Coach Analytics
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                  &quot;{selectedNode.aiInsight}&quot;
                </p>
              </div>
            )}

            {/* Recommended Problems */}
            {selectedNode.status !== 'locked' && selectedNode.recommendedProblems.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recommended Tasks</span>
                {selectedNode.recommendedProblems.map((slug: string) => (
                  <div key={slug} className="bg-slate-950/60 border border-slate-850 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-200 capitalize">{slug.replace(/-/g, ' ')}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Arrays &amp; pointers</p>
                    </div>
                    <Link href={`/practice/${slug}`}>
                      <Button size="sm" variant="outline" className="text-xs">Solve</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {selectedNode.status === 'locked' && (
              <div className="text-slate-500 text-center py-10 space-y-1">
                <Lock className="w-6 h-6 mx-auto text-slate-650" />
                <p className="text-xs font-bold text-slate-450 uppercase">Locked syllabus track</p>
                <p className="text-[10px] leading-relaxed max-w-[200px] mx-auto font-medium">Complete Sliding Window and Dynamic Programming to unlock.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
