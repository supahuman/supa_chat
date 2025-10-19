export default async function redirectPageHandler(action) {
  const { params = {} } = action;
  const { url } = params;
  if (!url) throw new Error("Missing 'url' param for redirect-page");
  // Return directive for frontend to handle
  return { type: "redirect", url };
}
