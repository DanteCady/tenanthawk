/** PM2 process file — used on the Lightsail host after CI deploy. */
module.exports = {
  apps: [
    {
      name: "tenanthawk",
      cwd: "/var/www/tenanthawk/app",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
