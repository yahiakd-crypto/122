/**
 * AI E-commerce Operating System - Graph Execution Engine
 * 
 * Handles DAG (Directed Acyclic Graph) resolution for node execution.
 */

export class GraphEngine {
  constructor(nodes, connections) {
    this.nodes = nodes || [];
    this.connections = connections || [];
  }

  /**
   * Retrieves all upstream nodes directly connected to a given node.
   */
  getUpstreamNodes(targetNodeId) {
    const upstreamIds = this.connections
      .filter(c => c.toId === targetNodeId)
      .map(c => c.fromId);
    return this.nodes.filter(n => upstreamIds.includes(n.id));
  }

  /**
   * Retrieves all upstream outputs for a node.
   */
  getUpstreamOutputs(targetNodeId) {
    const upstreamNodes = this.getUpstreamNodes(targetNodeId);
    const outputs = {};
    upstreamNodes.forEach(n => {
      if (n.result) {
        outputs[n.id] = n.result;
      }
    });
    return outputs;
  }

  /**
   * Builds an execution plan determining the order in which nodes must run.
   * Starts from a specific node or plans the whole graph.
   * Throws an error if a circular dependency is detected.
   */
  buildExecutionPlan(targetNodeId = null) {
    const plan = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      if (visiting.has(nodeId)) {
        throw new Error(`Circular dependency detected involving node: ${nodeId}`);
      }

      visiting.add(nodeId);

      const upstreamNodes = this.getUpstreamNodes(nodeId);
      for (const un of upstreamNodes) {
        visit(un.id);
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      plan.push(nodeId);
    };

    if (targetNodeId) {
      visit(targetNodeId);
    } else {
      this.nodes.forEach(n => visit(n.id));
    }

    return plan;
  }

  /**
   * Determines which nodes in the plan actually need execution.
   * (Skips nodes that already have a successful result, unless forced)
   */
  getPendingExecutionPlan(targetNodeId = null, forceRun = false) {
    const fullPlan = this.buildExecutionPlan(targetNodeId);
    if (forceRun) return fullPlan;

    // Filter out nodes that already have a result
    return fullPlan.filter(nodeId => {
      const node = this.nodes.find(n => n.id === nodeId);
      return !node || node.status !== "done" || !node.result;
    });
  }
}
