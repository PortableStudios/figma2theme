# figma2theme 🎨

This is a Portable tool designed to allow us to extract
design tokens (colour palettes, typography, spacing scales, etc.)
from a Figma file and then use them to generate a theme.

**Figma template:**
https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/

## Getting Started

First, create your .env file:

```
FIGMA_API_KEY=
FIGMA_FILE_URL=
```

Enter your Figma API key (these can be generated under the
'Personal Access Tokens' section of the settings) and the URL of the
Figma file you want to use (the template above can be used for testing).

Now run:

```bash
yarn install
yarn start
```
