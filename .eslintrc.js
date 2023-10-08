module.exports = {
    extends: [
        'plugin:react-hooks/recommended',
        'plugin:react/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        "react/react-in-jsx-scope": 0,
        "react/prop-types": 0
    },
}