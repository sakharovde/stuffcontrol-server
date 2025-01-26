module.exports = {
  apps: [
    {
      name: 'Server',
      script: 'yarn build && yarn start',
      watch: true,
      ignore_watch: ['node_modules', 'dist', '.idea', '.git'],
    },
    {
      name: 'Prisma',
      script: 'prisma generate --sql --watch',
      watch: true,
      ignore_watch: ['node_modules', 'dist', '.idea', '.git'],
    },
  ],
};
