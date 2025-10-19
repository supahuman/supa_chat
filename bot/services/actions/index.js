import { createDefaultActionExecutor } from "./ActionExecutor.js";
import sendEmail from "./handlers/sendEmail.js";
import redirectPage from "./handlers/redirectPage.js";
import showDocumentation from "./handlers/showDocumentation.js";
import escalateHuman from "./handlers/escalateHuman.js";

export function createActionExecutor() {
  return createDefaultActionExecutor({
    "send-email": sendEmail,
    "redirect-page": redirectPage,
    "show-documentation": showDocumentation,
    "escalate-human": escalateHuman,
  });
}
