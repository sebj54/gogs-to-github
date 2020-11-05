module.exports = {
    env: {
        browser: false,
        es2021: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    globals: {
        console: 'readonly',
        module: 'writable',
        process: 'readonly',
        require: 'readonly',
    },
    rules: {
        'comma-dangle': ['error', 'always-multiline'],
        indent: [
            'error',
            4,
        ],
        'linebreak-style': [
            'error',
            'unix',
        ],
        'quote-props': ['error', 'as-needed'],
        quotes: [
            'error',
            'single',
        ],
        semi: [
            'error',
            'never',
        ],
    },
}
