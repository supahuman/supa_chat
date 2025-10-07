/**
 * BaseController - Shared functionality for all controllers
 * Provides common error handling, response formatting, and utilities
 */
class BaseController {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} error - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Additional error details
   */
  sendError(res, error = 'Internal server error', statusCode = 500, details = null) {
    const response = {
      success: false,
      error
    };

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {string} error - Validation error message
   * @param {Object} validationErrors - Specific validation errors
   */
  sendValidationError(res, error = 'Validation failed', validationErrors = null) {
    const response = {
      success: false,
      error
    };

    if (validationErrors) {
      response.validationErrors = validationErrors;
    }

    return res.status(400).json(response);
  }

  /**
   * Send not found error response
   * @param {Object} res - Express response object
   * @param {string} resource - Resource name that was not found
   */
  sendNotFound(res, resource = 'Resource') {
    return this.sendError(res, `${resource} not found`, 404);
  }

  /**
   * Send unauthorized error response
   * @param {Object} res - Express response object
   * @param {string} message - Unauthorized message
   */
  sendUnauthorized(res, message = 'Unauthorized access') {
    return this.sendError(res, message, 401);
  }

  /**
   * Handle async controller methods with error catching
   * @param {Function} fn - Async controller method
   * @returns {Function} Wrapped controller method
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validate required fields in request body
   * @param {Object} body - Request body
   * @param {Array} requiredFields - Array of required field names
   * @returns {Object} Validation result with isValid and missingFields
   */
  validateRequiredFields(body, requiredFields) {
    const missingFields = requiredFields.filter(field => 
      body[field] === undefined || body[field] === null || body[field] === ''
    );

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Extract company and user info from request
   * @param {Object} req - Express request object
   * @returns {Object} Company and user info
   */
  getCompanyContext(req) {
    return {
      companyId: req.companyId || req.company?.companyId,
      userId: req.userId || req.company?.userId,
      company: req.company
    };
  }

  /**
   * Log controller action
   * @param {string} action - Action being performed
   * @param {Object} context - Additional context
   */
  logAction(action, context = {}) {
    console.log(`[${this.constructor.name}] ${action}`, context);
  }

  /**
   * Log error with context
   * @param {string} action - Action that failed
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  logError(action, error, context = {}) {
    console.error(`[${this.constructor.name}] ❌ ${action} failed:`, {
      error: error.message,
      stack: error.stack,
      ...context
    });
  }
}

export default BaseController;
