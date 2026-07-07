import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'node_modules',
    'docs/**',
    'e2e/**',
    'src/features/**',
    'src/shared/api/**',
    'src/shared/components/data/**',
    'src/shared/components/feedback/**',
    'src/shared/components/forms/**',
    'src/shared/components/layout/**',
    'src/shared/components/overlays/**',
    'src/shared/components/ui/Button.tsx',
    'src/shared/components/ui/Card.tsx',
    'src/shared/components/ui/Chip.tsx',
    'src/shared/components/ui/Icon.tsx',
    'src/shared/components/ui/StatusBadge.tsx',
    'src/shared/constants/**',
    'src/shared/errors/**',
    'src/shared/hooks/useDebouncedValue.ts',
    'src/shared/hooks/useDisclosure.ts',
    'src/shared/hooks/useDocumentTitle.ts',
    'src/shared/hooks/usePagination.ts',
    'src/shared/hooks/useResponsiveLayout.ts',
    'src/mocks/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
