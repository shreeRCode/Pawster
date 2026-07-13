// Returns a keyboard handler that triggers `handler` on Enter or Space, so
// elements that are only clickable by mouse (e.g. a div acting as a button)
// become operable by keyboard users. Pair with role="button" and tabIndex={0}.
export function keyActivate(handler) {
  return (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler(e);
    }
  };
}
