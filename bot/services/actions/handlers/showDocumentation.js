export default async function showDocumentationHandler(action) {
  const { params = {} } = action;
  const { docs = [] } = params; // array of { title, url }
  return { type: "show_docs", docs };
}
