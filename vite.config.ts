import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'lodash': 'lodash-es',
    },
  },
  server: {
    port: 8000,
    // 注意：proxy 配置仅在开发模式（pnpm dev）下生效
    // 生产环境中，API 请求由 Nginx 反向代理处理（见 blog.conf）
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:28080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/mp': {
        target: 'http://127.0.0.1:28080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:28080',
        changeOrigin: true,
      },
      '/sitemap.xml': {
        target: 'http://127.0.0.1:28080',
        changeOrigin: true,
      },
      '/rss.xml': {
        target: 'http://127.0.0.1:28080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 精细的代码分割策略
          if (id.includes('node_modules')) {
            if (id.includes('react') && !id.includes('react-dom')) {
              return 'react';
            }
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react-router-dom')) {
              return 'react-router';
            }
            if (id.includes('antd') && !id.includes('@ant-design')) {
              return 'antd-core';
            }
            if (id.includes('@ant-design/icons')) {
              return 'antd-icons';
            }
            if (id.includes('@ant-design/pro-components')) {
              return 'antd-pro';
            }
            if (id.includes('@ant-design/plots')) {
              return 'antd-plots';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            if (id.includes('md-editor-rt')) {
              return 'markdown-editor';
            }
            if (id.includes('marked')) {
              return 'markdown-parser';
            }
            if (id.includes('zustand')) {
              return 'zustand';
            }
            if (id.includes('lodash') || id.includes('lodash-es')) {
              return 'lodash';
            }
            if (id.includes('dayjs')) {
              return 'dayjs';
            }
            if (id.includes('classnames')) {
              return 'utils';
            }
            // 排除不需要的语法高亮模块
            const excludeLanguages = [
              'apl', 'asciiarmor', 'asn1', 'asterisk', 'brainfuck', 'clojure', 'cmake', 'cobol',
              'coffeescript', 'commonlisp', 'crystal', 'cypher', 'd', 'diff', 'dockerfile', 'dtd',
              'dylan', 'ebnf', 'ecl', 'eiffel', 'elm', 'erlang', 'factor', 'fcl', 'forth', 'fortran',
              'gas', 'gherkin', 'groovy', 'haskell', 'haxe', 'http', 'idl', 'julia', 'livescript',
              'lua', 'mathematica', 'mbox', 'mirc', 'mllike', 'modelica', 'mscgen', 'mumps',
              'nginx', 'nsis', 'ntriples', 'octave', 'oz', 'pascal', 'perl', 'pig', 'powershell',
              'properties', 'protobuf', 'pug', 'puppet', 'q', 'r', 'ruby', 'sas', 'scheme',
              'sieve', 'smalltalk', 'solr', 'sparql', 'spreadsheet', 'stex', 'stylus', 'swift',
              'tcl', 'textile', 'tiddlywiki', 'tiki', 'toml', 'troff', 'ttcn', 'vb', 'vbscript',
              'velocity', 'verilog', 'vhdl', 'xquery', 'yacas', 'z80'
            ];
            for (const lang of excludeLanguages) {
              if (id.includes(lang)) {
                return null; // 不生成这些模块的单独文件
              }
            }
            // 其他第三方库打包到 vendor
            return 'vendor';
          }
        },
      },
    },
    // 启用代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 生成sourcemap以便调试
    sourcemap: false,
    // chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      '@tanstack/react-query',
      'zustand',
      'dayjs',
    ],
  },
})
