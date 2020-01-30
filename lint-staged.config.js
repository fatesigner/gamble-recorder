module.exports = {
  'build/**/*.{js,jsx}': [
    'eslint --fix --cache --quiet',
    'prettier --write --ignore-path .eslintignore',
    'git add'
  ],
  'src/**/*.{js,jsx}': [
    'eslint --fix --cache --quiet',
    'prettier --write --ignore-path .eslintignore',
    'git add'
  ],
  'src/**/*.{ts,tsx}': [
    'eslint --fix --cache --quiet',
    'prettier --write --ignore-path .eslintignore --parser typescript',
    'git add'
  ],
  'src/**/*.{vue}': ['eslint --fix --cache --quiet', 'git add'],
  'src/**/*.{css,scss}': ['stylelint --fix --cache --quiet', 'git add']
};
