// ─── Flow Lab Execution Engine ────────────────────────────────────────────────
// Pure client-side, no backend required.
// Takes React Flow nodes + edges, runs them in topological order,
// and yields execution events with a delay between each node so the
// animated data-flow is visually followable.

import { NODE_DEFINITIONS } from './nodeDefinitions';

const STEP_DELAY_MS = 600; // ms between node executions

// ─── Topological Sort (Kahn's algorithm) ──────────────────────────────────────
function topoSort(nodes, edges) {
  const inDegree = {};
  const adj = {}; // nodeId → [childId]

  nodes.forEach(n => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach(e => {
    adj[e.source] = adj[e.source] || [];
    adj[e.source].push(e.target);
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
  });

  const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  const order = [];

  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);
    (adj[id] || []).forEach(child => {
      inDegree[child]--;
      if (inDegree[child] === 0) queue.push(child);
    });
  }

  return order;
}

// ─── Resolve Incoming Data ────────────────────────────────────────────────────
// A node's input is the merged output of all its predecessor nodes.
// For If/Else, we additionally check the branch handle matches.
function resolveInput(nodeId, edges, outputs, nodes) {
  const incomingEdges = edges.filter(e => e.target === nodeId);
  if (incomingEdges.length === 0) return {};

  // Find the upstream node for If/Else branching
  let merged = {};
  for (const edge of incomingEdges) {
    const sourceOutput = outputs[edge.source];
    if (!sourceOutput) continue;

    // If the source is an if_else node, only pass data if the branch matches
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode?.data?.type === 'if_else') {
      const expectedBranch = edge.sourceHandle; // 'true' or 'false'
      if (sourceOutput._branch !== expectedBranch) continue;
    }

    merged = { ...merged, ...sourceOutput };
  }
  return merged;
}

// ─── Build adjacency for finding downstream nodes of a loop ──────────────────
function getDownstreamNodes(startId, edges, nodeMap, excludeIds = new Set()) {
  const result = [];
  const visited = new Set(excludeIds);
  const queue = [startId];
  while (queue.length > 0) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    if (id !== startId) result.push(nodeMap[id]);
    const children = edges.filter(e => e.source === id).map(e => e.target);
    queue.push(...children);
  }
  return result;
}

// ─── Main Execution Function ──────────────────────────────────────────────────
// Returns an async generator that yields step events.
// Consumers use: for await (const event of runWorkflow(...)) { ... }
//
// Event shapes:
//   { type: 'node_start',    nodeId }
//   { type: 'node_done',     nodeId, input, output, edgeIds }
//   { type: 'node_skipped',  nodeId, reason }
//   { type: 'visual_effect', nodeId, effect, data }
//   { type: 'loop_item',     nodeId, index, total, item }
//   { type: 'done' }
//   { type: 'error',         nodeId, message }

export async function* runWorkflow(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    yield { type: 'error', nodeId: null, message: 'Canvas is empty — add some nodes first!' };
    return;
  }

  const hasTrigger = nodes.some(n => n.data?.type === 'trigger' || n.data?.type === 'webhook');
  if (!hasTrigger) {
    yield { type: 'error', nodeId: null, message: 'Workflow needs a Trigger or Webhook node to start!' };
    return;
  }

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const fullOrder = topoSort(nodes, edges);
  const outputs = {}; // nodeId → output data
  const skipped = new Set(); // nodeIds to skip (wrong branch or already handled in loop)
  const activatedEdges = new Set();

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Recursive generator to run a specific list of nodes
  async function* executeNodeList(nodeList, delayMs) {
    for (const nodeId of nodeList) {
      if (skipped.has(nodeId)) continue; // might have been skipped by a branch or outer loop

      const node = nodeMap[nodeId];
      if (!node) continue;

      const nodeType = node.data?.type;
      const config = node.data?.config || {};
      const definition = NODE_DEFINITIONS[nodeType];

      if (!definition) {
        yield { type: 'node_skipped', nodeId, reason: 'Unknown node type' };
        continue;
      }

      // Resolve input from upstream
      const input = resolveInput(nodeId, edges, outputs, nodes);

      // Branch gating
      const incomingEdges = edges.filter(e => e.target === nodeId);
      let shouldSkip = false;
      for (const edge of incomingEdges) {
        const sourceNode = nodeMap[edge.source];
        if (sourceNode?.data?.type === 'if_else') {
          const sourceOutput = outputs[edge.source];
          if (sourceOutput && sourceOutput._branch !== edge.sourceHandle) {
            shouldSkip = true;
            break;
          }
        }
        if (skipped.has(edge.source)) {
          shouldSkip = true;
          break;
        }
      }

      if (shouldSkip) {
        skipped.add(nodeId);
        yield { type: 'node_skipped', nodeId, reason: 'Branch not taken' };
        continue;
      }

      yield { type: 'node_start', nodeId };
      await sleep(delayMs);

      let output;
      try {
        if (nodeType === 'loop' && definition.isLoop) {
          // ── Loop Execution ──────────────────────────────────────────────────
          const arrayField = config.arrayField || 'items';
          const arr = input?.[arrayField] || [
            { id: 1, name: 'Item A' },
            { id: 2, name: 'Item B' },
            { id: 3, name: 'Item C' },
          ];

          // Find downstream nodes
          const downstreamIds = getDownstreamNodes(nodeId, edges, nodeMap).map(n => n.id);
          
          // Prevent them from running in the outer execution scope
          for (const dId of downstreamIds) skipped.add(dId);

          const childEdges = edges.filter(e => e.source === nodeId);
          const childEdgeIds = childEdges.map(e => e.id);
          childEdgeIds.forEach(id => activatedEdges.add(id));

          // Run the sub-graph for each item
          for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            yield { type: 'loop_item', nodeId, index: i, total: arr.length, item };

            // The output of the loop node for this iteration
            const loopItemOutput = { ...item, _loopIndex: i, _loopTotal: arr.length };
            outputs[nodeId] = loopItemOutput;

            yield { type: 'node_done', nodeId, input, output: loopItemOutput, edgeIds: childEdgeIds };

            // Un-skip the downstream nodes just for this iteration
            for (const dId of downstreamIds) skipped.delete(dId);
            
            // Execute downstream sub-graph with faster animation
            yield* executeNodeList(downstreamIds, Math.max(50, delayMs / 2));
            
            // Re-skip them so the outer loop doesn't catch them
            for (const dId of downstreamIds) skipped.add(dId);
            
            await sleep(100);
          }
          
          // Final state of the loop node after all iterations
          outputs[nodeId] = { _loopComplete: true, _processedItems: arr.length };
          continue;
        } else {
          output = definition.mockOutput(input, config);
        }
      } catch (err) {
        yield { type: 'error', nodeId, message: `Node "${definition.label}" threw: ${err.message}` };
        output = { ...input, _error: err.message };
      }

      outputs[nodeId] = output;

      // Activated edges for animation
      const outEdges = edges.filter(e => e.source === nodeId);
      let activeEdgeIds;
      if (nodeType === 'if_else') {
        const branch = output._branch;
        activeEdgeIds = outEdges.filter(e => e.sourceHandle === branch).map(e => e.id);
      } else {
        activeEdgeIds = outEdges.map(e => e.id);
      }
      activeEdgeIds.forEach(id => activatedEdges.add(id));

      yield { type: 'node_done', nodeId, input, output, edgeIds: activeEdgeIds };

      if (definition.visualEffect) {
        yield { type: 'visual_effect', nodeId, effect: definition.visualEffect, data: output };
      }

      await sleep(100);
    }
  }

  // Start execution with the full top-level order
  yield* executeNodeList(fullOrder, STEP_DELAY_MS);

  yield { type: 'done', activatedEdges: [...activatedEdges], allOutputs: outputs };
}

// ─── Validate Workflow ────────────────────────────────────────────────────────
export function validateWorkflow(nodes, edges) {
  const errors = [];

  if (nodes.length === 0) {
    errors.push('Canvas is empty.');
    return errors;
  }

  const triggers = nodes.filter(n => n.data?.type === 'trigger' || n.data?.type === 'webhook');
  if (triggers.length === 0) errors.push('Add a Trigger or Webhook node to start the workflow.');
  if (triggers.length > 1)  errors.push('Only one Trigger/Webhook is allowed per workflow.');

  // Check all non-trigger nodes have at least one incoming edge
  const targetIds = new Set(edges.map(e => e.target));
  nodes.forEach(n => {
    const def = NODE_DEFINITIONS[n.data?.type];
    if (!def) return;
    if (def.maxInputs > 0 && !targetIds.has(n.id)) {
      errors.push(`"${def.label}" node is not connected to anything.`);
    }
  });

  return errors;
}
