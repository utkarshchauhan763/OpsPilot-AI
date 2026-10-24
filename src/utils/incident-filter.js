
const allowedSeverities = [
  "low",
  "medium",
  "high",
  "critical",
];

const allowedStatuses = [
  "open",
  "investigating",
  "resolved",
];

function buildIncidentFilter(query) {
  const { severity, status, service } = query;

  if (severity && !allowedSeverities.includes(severity)) {
    return { error: "Invalid severity filter" };
  }

  if (status && !allowedStatuses.includes(status)) {
    return { error: "Invalid status filter" };
  }

  const filter = {};

  if (severity) {
    filter.severity = severity;
  }

  if (status) {
    filter.status = status;
  }

  if (service && service.trim()) {
    filter.service = service.trim();
  }

  return { filter };
}

module.exports = buildIncidentFilter;
