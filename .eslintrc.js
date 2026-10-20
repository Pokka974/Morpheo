module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-native/all',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react', 'react-native'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-native/no-unused-styles': 'error',
    // Design-system enforcement. Every colour and every style value must come from
    // src/theme/tokens.ts — these are errors, not warnings, so a hardcoded hex fails
    // CI instead of quietly accumulating. If a value is genuinely missing from the
    // tokens, add it there rather than inlining it here.
    'react-native/no-inline-styles': 'error',
    'react-native/no-color-literals': 'error',
    'react-native/sort-styles': 'off',
    // The theme is the only place raw hex belongs.
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@shared/tokens/colors',
            message: 'Superseded by @theme/tokens — import { colors } from "@theme/tokens".',
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.js',
    '!babel.config.js',
    '!jest.config.js',
    '!.eslintrc.js',
    // Deno Edge Functions: separate runtime, use remote URL imports, and are explicitly
    // excluded from tsconfig.json — not part of this project's type-checked TS program.
    'supabase/functions/',
  ],
  overrides: [
    {
      // Jest test files and service mocks legitimately need loose typing (jest.fn(), require(),
      // untyped mock chains, no-op async stubs to satisfy an interface) that the strict
      // type-checked ruleset is not meant to police outside of real app source.
      files: ['tests/**/*.{ts,tsx}', 'src/**/__mocks__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
      rules: {
        // Tests assert on raw values (contrast ratios, hex fixtures) by design.
        'react-native/no-color-literals': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'react/display-name': 'off',
      },
    },
    {
      // i18n enforcement (issue #62): every user-facing string in a screen or feature
      // component must go through t() and land in src/i18n/locales/{en,fr}.json — a
      // literal here has no key, so tests/unit/i18n/locales.test.ts (which only checks
      // parity *between* the two locale files) can never catch it.
      //
      // 'jsx-only' mode checks both JSX text children and JSX attribute values (e.g.
      // placeholder, accessibilityLabel) but leaves plain code strings alone — route
      // paths, object keys, SVG presentation attrs. The jsx-attributes/callees excludes
      // below were derived by running this rule against the existing (translated)
      // codebase and allow-listing every false positive it surfaced (testID, SVG props,
      // router.push/replace/navigate); a fresh false positive should be added here with
      // the same reasoning, not silenced with a blanket disable.
      //
      // Alert.alert()'s arguments sit in a handler function, not the JSX tree, so
      // 'jsx-only' can't see them — no-restricted-syntax below targets that call
      // directly, since every Alert.alert() in this codebase is user-facing.
      files: ['src/app/**/*.tsx', 'src/features/**/*.tsx'],
      plugins: ['i18next'],
      rules: {
        'i18next/no-literal-string': [
          'error',
          {
            mode: 'jsx-only',
            'jsx-attributes': {
              exclude: [
                'className',
                'styleName',
                'style',
                'type',
                'key',
                'id',
                'width',
                'height',
                'testID',
                'href',
                'name',
                'fill',
                'stroke',
                'strokeDasharray',
                'strokeWidth',
                'strokeLinecap',
                'strokeLinejoin',
                'viewBox',
                'd',
                'points',
                'cx',
                'cy',
                'r',
                'rx',
                'ry',
                'x',
                'y',
                'x1',
                'y1',
                'x2',
                'y2',
                'transform',
                'offset',
                'stopColor',
                'gradientUnits',
                'patternUnits',
                'clipPath',
                'clipRule',
                'fillRule',
              ],
            },
            callees: {
              exclude: [
                'i18n(ext)?',
                't',
                'require',
                'addEventListener',
                'removeEventListener',
                'postMessage',
                'getElementById',
                'dispatch',
                'commit',
                'includes',
                'indexOf',
                'endsWith',
                'startsWith',
                'push',
                'replace',
                'navigate',
              ],
            },
            words: {
              exclude: [
                '[0-9!-/:-@[-`{-~]+',
                '[A-Z_-]+',
                require('eslint-plugin-i18next/lib/options/htmlEntities'),
                /^\p{Emoji}+$/u,
                // Expand/collapse glyphs (InterpretationResultView) — not copy to translate.
                /^[▲▼]+$/,
              ],
            },
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "CallExpression[callee.object.name='Alert'][callee.property.name='alert'] > Literal.arguments",
            message: 'Alert.alert() text must go through t() — add a key to src/i18n/locales/{en,fr}.json.',
          },
        ],
      },
    },
  ],
};
