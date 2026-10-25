
function buildPagination(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return {
      error:
        "Page must be a positive integer and limit must be between 1 and 100",
    };
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

module.exports = buildPagination;
