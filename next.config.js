/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    agentFeedback: true,
    // El entorno de evaluación bloquea la creación de procesos hijos.
    // Usamos un solo worker con hilos para que `next build` pueda terminar.
    cpus: 1,
    workerThreads: true,
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
