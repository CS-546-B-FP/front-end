export function toPlaceholderPageModel({ title, routeGroup, description, pagePath, todoItems = [] }) {
  return {
    title,
    routeGroup,
    description,
    pagePath,
    todoItems
  };
}
