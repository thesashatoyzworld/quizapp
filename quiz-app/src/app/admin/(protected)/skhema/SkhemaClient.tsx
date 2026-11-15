'use client';

/* Редактируемая блок-схема. Рисуем пайплайны вместе: Саша правит мышкой,
   Claude пишет в ту же таблицу admin_board. Сохраняется само, чужие правки
   подтягиваются опросом раз в 4 секунды. */

import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  NodeResizer,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import type { BoardListItem, BoardView } from '@/lib/board/data';
import styles from './skhema.module.css';

type Kind = 'step' | 'goal' | 'decision' | 'input' | 'note';
type StepData = { label: string; kind: Kind; editing?: boolean };
type StepNode = Node<StepData, 'step'>;

const KINDS: { kind: Kind; label: string }[] = [
  { kind: 'step', label: 'Шаг' },
  { kind: 'decision', label: 'Решение / проверка' },
  { kind: 'input', label: 'Вход / данные' },
  { kind: 'goal', label: 'Результат' },
  { kind: 'note', label: 'Заметка' },
];

const EDGE_DEFAULTS = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
};

/* ── узел ─────────────────────────────────────────────── */

function LabelEditor({ id, label }: { id: string; label: string }) {
  const { updateNodeData } = useReactFlow();
  const [draft, setDraft] = useState(label);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.focus();
      ref.current?.select();
    }, 30);
    return () => clearTimeout(t);
  }, []);

  const commit = () => updateNodeData(id, { label: draft.trim() || label, editing: false });

  return (
    <textarea
      ref={ref}
      autoFocus
      className={`${styles.nodeInput} nodrag nowheel`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          commit();
        }
        if (e.key === 'Escape') updateNodeData(id, { editing: false });
      }}
    />
  );
}

function StepNodeView({ id, data, selected }: NodeProps<StepNode>) {
  return (
    <div className={`${styles.node} ${styles[`k_${data.kind}`] ?? ''}`}>
      <NodeResizer isVisible={selected} minWidth={120} minHeight={44} lineClassName={styles.resizeLine} handleClassName={styles.resizeHandle} />
      {(['top', 'right', 'bottom', 'left'] as const).map((p) => (
        <Handle key={p} id={p} type="source" position={Position[(p[0].toUpperCase() + p.slice(1)) as 'Top']} className={styles.handle} />
      ))}
      {data.editing ? <LabelEditor id={id} label={data.label} /> : <div className={styles.nodeText}>{data.label || '…'}</div>}
    </div>
  );
}

const nodeTypes = { step: StepNodeView };

/* ── сериализация: только то, что надо хранить ───────── */

type Saved = { nodes: unknown[]; edges: unknown[] };

function serialize(nodes: Node[], edges: Edge[]): Saved {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'step',
      position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
      ...(n.width ? { width: Math.round(n.width) } : {}),
      ...(n.height ? { height: Math.round(n.height) } : {}),
      data: { label: (n.data as StepData).label ?? '', kind: (n.data as StepData).kind ?? 'step' },
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
      ...(e.targetHandle ? { targetHandle: e.targetHandle } : {}),
      ...(e.label ? { label: String(e.label) } : {}),
    })),
  };
}

function hydrate(data: BoardView['data']): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: (data.nodes as Node[]).map((n) => ({ ...n, type: 'step' })),
    edges: (data.edges as Edge[]).map((e) => ({ ...EDGE_DEFAULTS, ...e })),
  };
}

const newId = () => Math.random().toString(36).slice(2, 10);

/* ── холст ────────────────────────────────────────────── */

type Status = 'saved' | 'dirty' | 'saving' | 'error' | 'conflict';

function Canvas({ boards: initialBoards, initial }: { boards: BoardListItem[]; initial: BoardView | null }) {
  const [boards, setBoards] = useState(initialBoards);
  const [board, setBoard] = useState(initial);
  const start = useMemo(() => hydrate(initial?.data ?? { nodes: [], edges: [] }), [initial]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(start.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(start.edges);
  const [status, setStatus] = useState<Status>('saved');
  const [conflict, setConflict] = useState<BoardView | null>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const version = useRef(initial?.version ?? 0);
  const savedJson = useRef(JSON.stringify(serialize(start.nodes, start.edges)));
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editingNow = nodes.some((n) => (n.data as StepData).editing);
  const currentJson = useMemo(() => JSON.stringify(serialize(nodes, edges)), [nodes, edges]);
  const dirty = currentJson !== savedJson.current;

  /* ── режим «пройти по шагам» ── */
  const [walk, setWalk] = useState<string[] | null>(null);
  const current = walk?.[walk.length - 1] ?? null;
  const kindOf = (id: string) => ((nodes.find((n) => n.id === id)?.data as StepData | undefined)?.kind ?? 'step');
  const isSide = (id: string) => ['input', 'note'].includes(kindOf(id));
  const labelOf = (id: string) => ((nodes.find((n) => n.id === id)?.data as StepData | undefined)?.label ?? '');
  const inputsOf = (id: string) => edges.filter((e) => e.target === id && isSide(e.source)).map((e) => e.source);
  const exits = current ? edges.filter((e) => e.source === current && !(isSide(e.target) && !e.label)) : [];

  const startWalk = () => {
    const flow = nodes.filter((n) => !isSide(n.id));
    const starts = flow.filter((n) => !edges.some((e) => e.target === n.id && !isSide(e.source)));
    const first = (starts.length ? starts : flow).sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)[0];
    if (first) setWalk([first.id]);
  };
  const go = (id: string) => setWalk((w) => (w ? [...w, id] : w));
  const back = () => setWalk((w) => (w && w.length > 1 ? w.slice(0, -1) : w));

  const visible = useMemo(() => {
    if (!walk) return null;
    const v = new Set(walk);
    for (const id of walk) for (const e of edges) if (e.target === id && isSide(e.source)) v.add(e.source);
    return v;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walk, edges, nodes]);

  const shownNodes = useMemo(
    () =>
      visible
        ? nodes.map((n) => ({
            ...n,
            hidden: !visible.has(n.id),
            draggable: false,
            className: n.id === current ? styles.walkCurrent : walk?.includes(n.id) ? styles.walkPast : styles.walkSide,
          }))
        : nodes,
    [nodes, visible, current, walk],
  );
  const shownEdges = useMemo(
    () =>
      visible
        ? edges.map((e) => ({
            ...e,
            hidden: !(visible.has(e.source) && visible.has(e.target)),
            animated: !!walk && walk.length > 1 && e.source === walk[walk.length - 2] && e.target === current,
          }))
        : edges,
    [edges, visible, walk, current],
  );

  useEffect(() => {
    if (!current) return;
    const ids = [current, ...inputsOf(current)];
    const t = setTimeout(() => fitView({ nodes: ids.map((id) => ({ id })), duration: 500, padding: 0.6, maxZoom: 1.5 }), 30);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    if (!walk) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWalk(null);
      if (e.key === 'ArrowLeft') back();
      if ((e.key === 'ArrowRight' || e.key === 'Enter') && exits.length === 1) go(exits[0].target);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const load = useCallback(
    (b: BoardView) => {
      const h = hydrate(b.data);
      setNodes(h.nodes);
      setEdges(h.edges);
      version.current = b.version;
      savedJson.current = JSON.stringify(serialize(h.nodes, h.edges));
      setBoard(b);
      setConflict(null);
      setStatus('saved');
    },
    [setNodes, setEdges],
  );

  const save = useCallback(
    async (force = false) => {
      if (!board || inFlight.current) return;
      const json = currentJson;
      inFlight.current = true;
      setStatus('saving');
      try {
        const base = force && conflict ? conflict.version : version.current;
        const res = await fetch('/api/admin/board', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', slug: board.slug, data: JSON.parse(json), baseVersion: base }),
        });
        const body = await res.json();
        if (res.status === 409) {
          setConflict(body.board);
          setStatus('conflict');
          return;
        }
        if (!res.ok) throw new Error(body.error);
        version.current = body.board.version;
        savedJson.current = json;
        setConflict(null);
        setStatus('saved');
      } catch {
        setStatus('error');
      } finally {
        inFlight.current = false;
      }
    },
    [board, currentJson, conflict],
  );

  // автосохранение
  useEffect(() => {
    if (!dirty || editingNow || status === 'conflict') return;
    setStatus((s) => (s === 'saving' ? s : 'dirty'));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(), 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [currentJson, dirty, editingNow, status, save]);

  // чужие правки (в том числе Claude)
  useEffect(() => {
    if (!board) return;
    const t = setInterval(async () => {
      if (inFlight.current || dirty || editingNow || document.hidden) return;
      const res = await fetch(`/api/admin/board?slug=${encodeURIComponent(board.slug)}`, { cache: 'no-store' }).catch(() => null);
      if (!res?.ok) return;
      const { board: fresh } = (await res.json()) as { board: BoardView };
      if (fresh.version > version.current) load(fresh);
    }, 4000);
    return () => clearInterval(t);
  }, [board, dirty, editingNow, load]);

  const addNode = useCallback(
    (kind: Kind, at?: { x: number; y: number }) => {
      const pos = at ?? screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const id = newId();
      setNodes((ns) => {
        // не кладём блок поверх другого: сдвигаем вниз, пока место занято
        const x = pos.x - 90;
        let y = pos.y - 24;
        const busy = (yy: number) =>
          ns.some((n) => {
            const w = n.measured?.width ?? n.width ?? 180;
            const h = n.measured?.height ?? n.height ?? 50;
            return x < n.position.x + w + 20 && x + 180 > n.position.x - 20 && yy < n.position.y + h + 20 && yy + 50 > n.position.y - 20;
          });
        for (let i = 0; i < 30 && busy(y); i++) y += 80;
        return [
        ...ns.map((n) => ({ ...n, selected: false })),
        { id, type: 'step', position: { x, y }, selected: true, data: { label: KINDS.find((k) => k.kind === kind)!.label, kind, editing: true } },
        ];
      });
    },
    [screenToFlowPosition, setNodes],
  );

  const onConnect = useCallback((c: Connection) => setEdges((es) => addEdge({ ...c, id: newId(), ...EDGE_DEFAULTS }, es)), [setEdges]);

  const setKind = (kind: Kind) => setNodes((ns) => ns.map((n) => (n.selected ? { ...n, data: { ...n.data, kind } } : n)));
  const selectedNodes = nodes.filter((n) => n.selected);

  const openBoard = async (slug: string) => {
    if (dirty) await save();
    const res = await fetch(`/api/admin/board?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return;
    load((await res.json()).board);
    window.history.replaceState(null, '', `?b=${slug}`);
    requestAnimationFrame(() => fitView({ padding: 0.2 }));
  };

  const newBoard = async () => {
    const title = window.prompt('Название новой схемы');
    if (!title?.trim()) return;
    const res = await fetch('/api/admin/board', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create', title }) });
    if (!res.ok) return;
    const { board: b } = (await res.json()) as { board: BoardView };
    setBoards((bs) => [{ slug: b.slug, title: b.title, updatedAt: b.updatedAt }, ...bs]);
    load(b);
    window.history.replaceState(null, '', `?b=${b.slug}`);
  };

  const statusText: Record<Status, string> = {
    saved: 'сохранено',
    dirty: 'есть правки…',
    saving: 'сохраняю…',
    error: 'не сохранилось, пробую ещё',
    conflict: 'схему поменяли параллельно',
  };

  if (!board) {
    return (
      <div className={styles.empty}>
        Схем пока нет. <button className={styles.btn} onClick={newBoard}>Создать схему</button>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <select className={styles.select} value={board.slug} onChange={(e) => openBoard(e.target.value)}>
          {boards.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.title}
            </option>
          ))}
        </select>
        <button className={styles.btnGhost} onClick={newBoard}>+ схема</button>
        <span className={styles.sep} />
        {walk ? (
          <button className={styles.btn} onClick={() => { setWalk(null); requestAnimationFrame(() => fitView({ padding: 0.2, duration: 400 })); }}>
            ✕ выйти из прохода
          </button>
        ) : (
          <button className={styles.btn} onClick={startWalk}>▶ пройти по шагам</button>
        )}
        <span className={styles.sep} />
        {!walk && KINDS.map((k) => (
          <button key={k.kind} className={`${styles.add} ${styles[`a_${k.kind}`]}`} onClick={() => addNode(k.kind)}>
            + {k.label}
          </button>
        ))}
        {!walk && selectedNodes.length > 0 && (
          <>
            <span className={styles.sep} />
            <span className={styles.muted}>тип:</span>
            {KINDS.map((k) => (
              <button key={k.kind} title={k.label} className={`${styles.dot} ${styles[`a_${k.kind}`]}`} onClick={() => setKind(k.kind)} />
            ))}
          </>
        )}
        <span className={`${styles.status} ${styles[`s_${status}`]}`}>{statusText[status]}</span>
      </div>

      {conflict && (
        <div className={styles.conflict}>
          Пока ты правил, схему сохранили в другом месте.
          <button className={styles.btn} onClick={() => load(conflict)}>Взять свежую</button>
          <button className={styles.btnGhost} onClick={() => save(true)}>Оставить мою</button>
        </div>
      )}

      <div className={styles.row}>
      <div className={styles.canvas}>
        <ReactFlow
          nodes={shownNodes}
          edges={shownEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={EDGE_DEFAULTS}
          colorMode="dark"
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
          deleteKeyCode={walk ? null : ['Backspace', 'Delete']}
          nodesConnectable={!walk}
          elementsSelectable={!walk}
          zoomOnDoubleClick={false}
          onDoubleClick={(e) => {
            if (walk) return;
            if ((e.target as HTMLElement).classList.contains('react-flow__pane')) addNode('step', screenToFlowPosition({ x: e.clientX, y: e.clientY }));
          }}
          onNodeDoubleClick={(_, n) => !walk && setNodes((ns) => ns.map((x) => (x.id === n.id ? { ...x, data: { ...x.data, editing: true } } : x)))}
          onEdgeDoubleClick={(_, edge) => {
            if (walk) return;
            const label = window.prompt('Подпись стрелки (пусто = убрать)', String(edge.label ?? ''));
            if (label === null) return;
            setEdges((es) => es.map((x) => (x.id === edge.id ? { ...x, label: label.trim() || undefined } : x)));
          }}
        >
          <Background gap={24} size={1} />
          <Controls showInteractive={false} />
          {!walk && <MiniMap pannable zoomable className={styles.minimap} />}
        </ReactFlow>
      </div>
        {walk && current && (
          <div className={styles.walkPanel}>
            <div className={styles.walkStep}>шаг {walk.length}</div>
            <div className={styles.walkTitle}>{labelOf(current)}</div>
            {inputsOf(current).length > 0 && (
              <div className={styles.walkInputs}>
                <span>на входе:</span>
                {inputsOf(current).map((id) => (
                  <span key={id} className={styles.walkChip}>{labelOf(id)}</span>
                ))}
              </div>
            )}
            <div className={styles.walkActions}>
              <button className={styles.btnGhost} onClick={back} disabled={walk.length < 2}>← назад</button>
              {exits.length === 0 && <span className={styles.muted}>конец схемы</span>}
              {exits.map((e) => (
                <button key={e.id} className={styles.walkGo} onClick={() => go(e.target)}>
                  {e.label ? <b>{String(e.label)}</b> : <b>дальше</b>} → {labelOf(e.target).slice(0, 48)}
                  {labelOf(e.target).length > 48 ? '…' : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.hint} hidden={!!walk}>
        Двойной клик по пустому месту: новый шаг. Двойной клик по блоку: править текст (Enter сохранить, Shift+Enter новая строка).
        Тяни от точки на краю блока к другому блоку: стрелка. Двойной клик по стрелке: подпись. Выделить и Backspace: удалить.
      </div>
    </div>
  );
}

export default function SkhemaClient(props: { boards: BoardListItem[]; initial: BoardView | null }) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
