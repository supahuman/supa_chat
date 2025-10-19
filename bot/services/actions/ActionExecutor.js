export class ActionExecutor {
  constructor(registry = {}) {
    this.registry = registry; // { [actionType]: handler }
  }

  register(actionType, handler) {
    this.registry[actionType] = handler;
  }

  async execute(action, context = {}) {
    const handler = this.registry[action.do];
    if (!handler) {
      return { success: false, error: `No handler for action: ${action.do}` };
    }
    try {
      const result = await handler(action, context);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// Default registry helper
export function createDefaultActionExecutor(handlers) {
  const executor = new ActionExecutor();
  Object.entries(handlers).forEach(([k, v]) => executor.register(k, v));
  return executor;
}
