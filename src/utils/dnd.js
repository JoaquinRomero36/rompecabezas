export function findDropTarget(x, y) {
  const el = document.elementFromPoint(x, y)
  let node = el
  while (node && node !== document.body) {
    if (node.dataset && node.dataset.cell !== undefined) {
      return {
        target: 'cell',
        row: Number(node.dataset.row),
        col: Number(node.dataset.col),
      }
    }
    if (node.dataset && node.dataset.tray !== undefined) {
      return { target: 'tray' }
    }
    node = node.parentElement
  }
  return { target: 'none' }
}