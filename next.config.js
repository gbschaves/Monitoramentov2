
// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config) => {
    config.resolve.alias['@components'] = path.join(__dirname, 'src/components');
    // Adicione outros aliases conforme necessário
    return config;
  },
};
