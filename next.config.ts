import type { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';

const contentDir = path.join(process.cwd(), 'content', 'games');

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Allow build to proceed with both webpack and turbopack configs present
  turbopack: {},
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      config.plugins = config.plugins ?? [];
      config.plugins.push({
        apply(compiler: any) {
          compiler.hooks.thisCompilation.tap('WatchContentDir', (compilation: any) => {
            if (fs.existsSync(contentDir)) {
              fs.readdirSync(contentDir)
                .filter((f) => f.endsWith('.mdx'))
                .forEach((f) => compilation.fileDependencies.add(path.join(contentDir, f)));
            }
            compilation.contextDependencies.add(contentDir);
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;
