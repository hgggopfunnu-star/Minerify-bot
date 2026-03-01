const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const featureFiles = fs.readdirSync(__dirname)
        .filter(file => file !== 'loadFeatures.js' && file.endsWith('.js'));

    for (const file of featureFiles) {
        const feature = require(path.join(__dirname, file));
        feature(client);
    }
};
