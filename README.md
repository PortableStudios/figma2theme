# figma2theme 🎨

This CLI is a Portable tool designed to allow us to extract
design tokens (colour palettes, typography, spacing scales, etc.)
from a Figma file and then use them to generate a theme.

**Figma template:**
https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit

**Example Storybook generated from the Figma template:**
https://figma2theme.netlify.app/

## Usage

### 1. Authenticate via NPM

To ensure you can install private Portable packages, login to our GitHub repo via NPM:

(This only has to be done once per computer, skip this step if you've already done this)

```bash
npm login --registry=https://npm.pkg.github.com
```

When prompted for "Username", enter your GitHub username.

When prompted for "Password", enter a "Personal Access Token".
To generate a token follow these instructions:

- In GitHub visit Settings > Developer settings > Personal access tokens
- Press "Generate new token"
- Name the new token "portable_npm_login" or something similar
- Select the "repo", "write:packages" and "read:packages" permissions

Finally, when prompted for "Email" enter your Portable email address.

### 2. Add `figma2theme` to your project

Create an `.npmrc` file in your project root with the following contents:

```
@portablestudios:registry=https://npm.pkg.github.com
```

Install `figma2theme` to your package.json:

```bash
yarn add --dev @portablestudios/figma2theme
```

### 3. Define your variables

Create a `.figma2themerc` file in your project containing the
Figma file URL, here's an example using the URL of our Figma template:

```json
{
  "fileUrl": "https://www.figma.com/file/m1rARkfdPU6dB7n9ofBRHw/Portable-UI-Kit"
}
```

Now add your Figma API key to the `.env` file of your project.
A key can be generated under the 'Personal Access Tokens' section of the Figma settings.

```
FIGMA_API_KEY=
```

Both of these variables can be provided through either the `.figma2themerc` file, the
environment variables or the CLI arguments. We recommend the above setup for most projects.

### 4. Generate your theme

Run the following command to generate your Chakra UI theme:

```bash
yarn figma2theme generate-chakra
```

By default the generated theme file(s) will be saved to `./theme`.

### 5. Import the theme

Update your imports from `import { theme } from '@chakra-ui/react'` to the generated theme location.

### 6. Import the stories (Optional)

`figma2theme` provides a variety of Storybook stories that allow you to view elements of your
current Chakra UI theme, including foundational values (e.g. colour palettes, font sizes, etc.)
and component styles (e.g. button variants, text styles, etc.)

To view these stories in the Storybook of your project, open `.storybook/main.js` and insert
the following glob to the `stories` array:

`../node_modules/@portablestudios/figma2theme/lib/**/*.stories.js`

## Development

First set up your environment variables by duplicating the template:

```bash
cp .env.dist .env
```

Then generate a Figma API key and use it for the `FIGMA_API_KEY` environment variable.
A key can be generated under the 'Personal Access Tokens' section of the Figma settings.

### Running the CLI

While developing the CLI you can use it by running:

```bash
yarn dev
```

This is equivalent to running `figma2theme` in a project.

For example, to generate a Chakra UI theme run the following:

```bash
yarn dev generate-chakra
```

---

If you want to test `figma2theme` globally run the following:

```bash
yarn global:install
```

This will build the CLI and use Yarn to install it globally,
allowing you to run the CLI by typing `figma2theme` anywhere.

To remove the globally installed package run the following:

```bash
yarn global:remove
```

### Storybook

The provided stories can be previewed by running:

```bash
yarn storybook
```

Ensure you have generated a theme beforehand using `yarn dev generate-chakra`.
