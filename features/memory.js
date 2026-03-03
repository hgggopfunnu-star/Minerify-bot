const warnings = new Map();

function addWarning(guildId, userId) {
    const key = `${guildId}-${userId}`;
    const count = (warnings.get(key) || 0) + 1;
    warnings.set(key, count);
    return count;
}

function getWarnings(guildId, userId) {
    const key = `${guildId}-${userId}`;
    return warnings.get(key) || 0;
}

function clearWarnings(guildId, userId) {
    const key = `${guildId}-${userId}`;
    warnings.delete(key);
}

module.exports = {
    addWarning,
    getWarnings,
    clearWarnings
};
