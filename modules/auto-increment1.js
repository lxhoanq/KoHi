let nextProductId = 1; // Initial ID

function getNextId(entity) {
  switch (entity) {
    case 'product_size_id':
      return nextProductId++;
    // Add cases for other entities if needed
    default:
      throw new Error(`Unknown entity: ${entity}`);
  }
}

module.exports = {
  getNextId
};