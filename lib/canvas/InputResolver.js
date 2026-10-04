/**
 * AI E-commerce Operating System - Input Resolver
 * 
 * Responsibilities:
 * 1. Merge global project context.
 * 2. Merge upstream node outputs based on connections.
 * 3. Apply manual user overrides.
 * 4. Verify required inputs are met for a skill.
 */

export function resolveSkillInput(params) {
  const {
    skillDef,
    nodeInputs = {},          // Manual user inputs/overrides on this specific node
    globalContext = {},       // e.g., { productName: "Smart Watch", currency: "DZD" }
    connectedOutputs = {}     // e.g., { product_research: { demandLevel: "HIGH" }, buyer_persona: { ... } }
  } = params;

  // 1. Start with global context
  let resolved = { ...globalContext };

  // 2. Auto-map fields from connected upstream nodes
  // Flatten all connected outputs into the resolved context.
  // Advanced version could allow explicit field mapping (e.g. sourceNode.x -> targetNode.y)
  Object.values(connectedOutputs).forEach(outputObj => {
    if (outputObj && typeof outputObj === "object") {
      resolved = { ...resolved, ...outputObj };
    }
  });

  // 3. Apply direct manual overrides
  resolved = { ...resolved, ...nodeInputs };

  // 4. Validate against skill definition
  const missingInputs = [];
  const finalInput = {};

  if (skillDef.requiredInputs) {
    skillDef.requiredInputs.forEach(req => {
      if (resolved[req] === undefined || resolved[req] === null || resolved[req] === "") {
        missingInputs.push(req);
      } else {
        finalInput[req] = resolved[req];
      }
    });
  }

  if (skillDef.optionalInputs) {
    skillDef.optionalInputs.forEach(opt => {
      if (resolved[opt] !== undefined) {
        finalInput[opt] = resolved[opt];
      }
    });
  }

  return {
    isReady: missingInputs.length === 0,
    missingInputs,
    resolvedInput: finalInput,
    rawMergedContext: resolved // Useful for debugging or advanced prompts
  };
}
