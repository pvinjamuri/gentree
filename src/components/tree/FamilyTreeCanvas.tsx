'use client';

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyStore } from '@/lib/family-store';
import { FamilyMember, Relationship } from '@/lib/types';
import { MemberAvatar } from '@/components/members/MemberAvatar';
import { calculateAge, getLifeSpan } from '@/lib/date-utils';
import { NodeContextMenu } from './NodeContextMenu';
import { cn } from '@/lib/utils';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NODE_W = 200;
const NODE_H = 100;
const H_GAP = 40;
const V_GAP = 120;

interface PositionedMember {
  member: FamilyMember;
  x: number;
  y: number;
}

interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
}

function layoutTree(members: FamilyMember[], relationships: Relationship[]) {
  // Group by generation
  const genMap = new Map<number, FamilyMember[]>();
  members.forEach((m) => {
    if (!genMap.has(m.generation)) genMap.set(m.generation, []);
    genMap.get(m.generation)!.push(m);
  });

  const sortedGens = Array.from(genMap.keys()).sort((a, b) => a - b);

  // Find spouse pairs
  const spousePairs = new Map<string, string>();
  relationships.filter((r) => r.type === 'spouse').forEach((r) => {
    spousePairs.set(r.fromMemberId, r.toMemberId);
    spousePairs.set(r.toMemberId, r.fromMemberId);
  });

  // Order members in each gen: group couples together
  function orderGen(genMembers: FamilyMember[]): FamilyMember[] {
    const ordered: FamilyMember[] = [];
    const placed = new Set<string>();
    genMembers.forEach((m) => {
      if (placed.has(m.id)) return;
      placed.add(m.id);
      ordered.push(m);
      const spouseId = spousePairs.get(m.id);
      if (spouseId) {
        const spouse = genMembers.find((s) => s.id === spouseId);
        if (spouse && !placed.has(spouse.id)) {
          placed.add(spouse.id);
          ordered.push(spouse);
        }
      }
    });
    return ordered;
  }

  const positioned: PositionedMember[] = [];
  const lines: Line[] = [];

  // Position each generation
  sortedGens.forEach((gen, genIdx) => {
    const genMembers = orderGen(genMap.get(gen)!);
    const totalWidth = genMembers.length * NODE_W + (genMembers.length - 1) * H_GAP;
    const startX = -totalWidth / 2;
    const y = genIdx * (NODE_H + V_GAP);

    genMembers.forEach((m, i) => {
      positioned.push({
        member: m,
        x: startX + i * (NODE_W + H_GAP),
        y,
      });
    });
  });

  // Build position lookup
  const posMap = new Map<string, { x: number; y: number }>();
  positioned.forEach((p) => posMap.set(p.member.id, { x: p.x, y: p.y }));

  // Draw lines
  // Spouse lines (horizontal)
  relationships.filter((r) => r.type === 'spouse').forEach((r) => {
    const p1 = posMap.get(r.fromMemberId);
    const p2 = posMap.get(r.toMemberId);
    if (p1 && p2) {
      lines.push({
        id: `spouse-${r.id}`,
        x1: p1.x + NODE_W,
        y1: p1.y + NODE_H / 2,
        x2: p2.x,
        y2: p2.y + NODE_H / 2,
        dashed: true,
      });
    }
  });

  // Parent-child lines (pick one parent per child)
  const drawnChildren = new Set<string>();
  relationships.filter((r) => r.type === 'parent').forEach((r) => {
    if (drawnChildren.has(r.toMemberId)) return;
    drawnChildren.add(r.toMemberId);
    const parent = posMap.get(r.fromMemberId);
    const child = posMap.get(r.toMemberId);
    if (parent && child) {
      // Check if parent has a spouse — if so, line starts from midpoint
      const spouseId = spousePairs.get(r.fromMemberId);
      const spousePos = spouseId ? posMap.get(spouseId) : null;
      let startX: number;
      if (spousePos) {
        startX = (parent.x + NODE_W / 2 + spousePos.x + NODE_W / 2) / 2;
      } else {
        startX = parent.x + NODE_W / 2;
      }
      const startY = parent.y + NODE_H;
      const endX = child.x + NODE_W / 2;
      const endY = child.y;
      const midY = (startY + endY) / 2;

      // Two-segment line: down then across then down
      lines.push({ id: `pc-v1-${r.id}`, x1: startX, y1: startY, x2: startX, y2: midY });
      lines.push({ id: `pc-h-${r.id}`, x1: startX, y1: midY, x2: endX, y2: midY });
      lines.push({ id: `pc-v2-${r.id}`, x1: endX, y1: midY, x2: endX, y2: endY });
    }
  });

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  positioned.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + NODE_W);
    maxY = Math.max(maxY, p.y + NODE_H);
  });

  return { positioned, lines, bounds: { minX: minX - 40, minY: minY - 40, maxX: maxX + 40, maxY: maxY + 40 } };
}

export function FamilyTreeCanvas() {
  const router = useRouter();
  const members = useFamilyStore((s) => s.members);
  const relationships = useFamilyStore((s) => s.relationships);

  const { positioned, lines, bounds } = useMemo(
    () => layoutTree(members, relationships),
    [members, relationships]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    member: FamilyMember;
  } | null>(null);

  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;

  // Fit view on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / contentWidth;
    const scaleY = rect.height / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9;
    setZoom(scale);
    setPan({
      x: (rect.width - contentWidth * scale) / 2 - bounds.minX * scale,
      y: (rect.height - contentHeight * scale) / 2 - bounds.minY * scale,
    });
  }, [contentWidth, contentHeight, bounds.minX, bounds.minY]);

  const fitView = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / contentWidth;
    const scaleY = rect.height / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9;
    setZoom(scale);
    setPan({
      x: (rect.width - contentWidth * scale) / 2 - bounds.minX * scale,
      y: (rect.height - contentHeight * scale) / 2 - bounds.minY * scale,
    });
  }, [contentWidth, contentHeight, bounds.minX, bounds.minY]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.1, Math.min(3, z * delta)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-gray-50 select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {/* Background dots */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <defs>
          <pattern id="dots" x={pan.x % (20 * zoom)} y={pan.y % (20 * zoom)} width={20 * zoom} height={20 * zoom} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={1} fill="#d1d5db" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Tree content */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          zIndex: 1,
        }}
      >
        {/* Lines */}
        <svg
          style={{
            position: 'absolute',
            left: bounds.minX,
            top: bounds.minY,
            width: contentWidth,
            height: contentHeight,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {lines.map((line) => (
            <line
              key={line.id}
              x1={line.x1 - bounds.minX}
              y1={line.y1 - bounds.minY}
              x2={line.x2 - bounds.minX}
              y2={line.y2 - bounds.minY}
              stroke={line.dashed ? '#eab308' : '#6366f1'}
              strokeWidth={2 / zoom}
              strokeDasharray={line.dashed ? '6 3' : undefined}
            />
          ))}
        </svg>

        {/* Nodes */}
        {positioned.map(({ member, x, y }) => (
          <MemberCard
            key={member.id}
            member={member}
            x={x}
            y={y}
            onClick={() => router.push(`/member/${member.id}`)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ x: e.clientX, y: e.clientY, member });
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-20 left-4 md:bottom-4 z-10 flex flex-col gap-1">
        <Button variant="outline" size="icon" className="bg-white shadow-sm h-8 w-8" onClick={() => setZoom((z) => Math.min(3, z * 1.2))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white shadow-sm h-8 w-8" onClick={() => setZoom((z) => Math.max(0.1, z * 0.8))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white shadow-sm h-8 w-8" onClick={fitView}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          member={contextMenu.member}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

function MemberCard({
  member,
  x,
  y,
  onClick,
  onContextMenu,
}: {
  member: FamilyMember;
  x: number;
  y: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const age = calculateAge(member.dateOfBirth, member.dateOfDeath);
  const lifeSpan = getLifeSpan(member.dateOfBirth, member.dateOfDeath);
  const isDeceased = !!member.dateOfDeath;
  const borderColor = member.gender === 'male' ? 'border-blue-400' : member.gender === 'female' ? 'border-pink-400' : 'border-purple-400';

  return (
    <div
      style={{ position: 'absolute', left: x, top: y, width: NODE_W }}
      className={cn(
        'bg-white rounded-xl border-2 shadow-md px-4 py-3 cursor-pointer',
        'hover:shadow-lg transition-shadow duration-200',
        isDeceased ? 'border-gray-400 opacity-80' : borderColor
      )}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center gap-3">
        <MemberAvatar member={member} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-gray-900 truncate">{member.name}</p>
          <p className="text-xs text-gray-500">{lifeSpan}</p>
          {age !== null && (
            <p className="text-xs text-gray-400">
              {isDeceased ? `Lived ${age} years` : `Age ${age}`}
            </p>
          )}
        </div>
      </div>
      {member.location && (
        <p className="text-xs text-gray-400 mt-1 truncate">📍 {member.location}</p>
      )}
    </div>
  );
}
