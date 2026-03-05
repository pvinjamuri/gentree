import dagre from '@dagrejs/dagre';
import { FamilyMember, Relationship } from './types';
import { type Node, type Edge, MarkerType } from '@xyflow/react';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

export interface TreeLayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export function computeTreeLayout(
  members: FamilyMember[],
  relationships: Relationship[]
): TreeLayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 120, nodesep: 80, edgesep: 40 });

  // Add nodes
  members.forEach((member) => {
    g.setNode(member.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add parent-child edges for dagre layout
  const parentEdges = relationships.filter((r) => r.type === 'parent');
  parentEdges.forEach((r) => {
    g.setEdge(r.fromMemberId, r.toMemberId);
  });

  const spouseEdges = relationships.filter((r) => r.type === 'spouse');

  dagre.layout(g);

  // Build nodes with positions from dagre
  const nodePositions = new Map<string, { x: number; y: number }>();
  members.forEach((member) => {
    const pos = g.node(member.id);
    if (pos) {
      nodePositions.set(member.id, { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 });
    }
  });

  // Adjust spouse positions to be side by side
  const processed = new Set<string>();
  spouseEdges.forEach((r) => {
    if (processed.has(r.fromMemberId) || processed.has(r.toMemberId)) return;
    const pos1 = nodePositions.get(r.fromMemberId);
    const pos2 = nodePositions.get(r.toMemberId);
    if (pos1 && pos2) {
      const avgX = (pos1.x + pos2.x) / 2;
      const avgY = (pos1.y + pos2.y) / 2;
      pos1.x = avgX - NODE_WIDTH / 2 - 20;
      pos1.y = avgY;
      pos2.x = avgX + NODE_WIDTH / 2 + 20;
      pos2.y = avgY;
    }
    processed.add(r.fromMemberId);
    processed.add(r.toMemberId);
  });

  const nodes: Node[] = members.map((member) => {
    const pos = nodePositions.get(member.id) || { x: 0, y: 0 };
    return {
      id: member.id,
      type: 'memberNode',
      position: pos,
      data: { member },
    };
  });

  // Build edges
  const edges: Edge[] = [];

  // For each child, pick one parent edge to show (avoid duplicates)
  const addedChildEdges = new Set<string>();
  parentEdges.forEach((r) => {
    if (addedChildEdges.has(r.toMemberId)) return;
    addedChildEdges.add(r.toMemberId);
    edges.push({
      id: `edge-${r.id}`,
      source: r.fromMemberId,
      target: r.toMemberId,
      type: 'smoothstep',
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    });
  });

  // Spouse edges
  spouseEdges.forEach((r) => {
    edges.push({
      id: `edge-${r.id}`,
      source: r.fromMemberId,
      target: r.toMemberId,
      type: 'straight',
      style: { stroke: '#eab308', strokeWidth: 2, strokeDasharray: '6 3' },
    });
  });

  return { nodes, edges };
}
