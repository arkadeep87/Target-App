async function resolvePath(countryCode, policyType, requestedWorkflowPath) {
  if (requestedWorkflowPath === 'MAIN' || requestedWorkflowPath === 'ALT_TAX') {
    return requestedWorkflowPath;
  }
  return 'MAIN';
}

module.exports = { resolvePath };
