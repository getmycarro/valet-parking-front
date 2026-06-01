module.exports = {
  apps: [
    {
      name: 'valet-web',
      script: 'npx',
      args: 'serve -s dist -l 3000',
      cwd: '/home/deploy/valet-parking',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
