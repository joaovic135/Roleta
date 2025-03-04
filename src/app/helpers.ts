export function getPaginatedItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number,
) {
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(items.length / itemsPerPage)

  return {
    currentItems,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
  }
}
