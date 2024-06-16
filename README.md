# figma2theme 🎨

This CLI is a Portable tool designed to allow us to extract
design tokens (colour palettes, typography, spacing scales, etc.)
from a UI Kit Figma file and then use them to generate a theme.

figma2theme supports theme exports for the following UI frameworks:

- [Tailwind CSS](https://tailwindcss.com/)
- [Chakra UI](https://chakra-ui.com/)

## Resources

**UI Kit Figma template:**

https://www.figma.com/design/b6tcOWalyHLDfsD0IBSXyE/Portable-UI-Kit-v2

**Example Storybook generated from the template above using figma2theme and Chakra UI:**

https://figma2theme.netlify.app/

## Usage

### 1. Add `figma2theme` to your project

```bash
yarn add --dev figma2theme
```

### 2. Set your environment variables

a. Create a `.figma2themerc` file in your project repo and add the URL of your project's UI Kit file.
Here's an example with the UI Kit template file:

```json
{
  "fileUrl": "https://www.figma.com/design/b6tcOWalyHLDfsD0IBSXyE/Portable-UI-Kit-v2"
}
```

b. Generate a Figma API key and add it to the `.env` file of your project.
An API key can be generated under the 'Personal Access Tokens' section of the Figma settings.

```
FIGMA_API_KEY=
```

### 3. Generate your theme

#### Tailwind CSS

Run the following command to generate your Tailwind CSS theme:

```bash
yarn figma2theme generate-tailwind
```

By default the generated file will be saved as `tailwind.figma2theme.js` in the root of your project.

#### Chakra UI

Run the following command to generate your Chakra UI theme:

```bash
yarn figma2theme generate-chakra
```

By default the generated files will be saved to the `./theme` directory.

### 4. Import the theme

#### Tailwind CSS

Open your `tailwind.config.js` file and add the following line to the top of the config:

```js
presets: [require('./tailwind.figma2theme.js')],
```

This setting will use the generated theme as the base for your Tailwind configuration,
giving you access to all the tokens from the UI Kit while still allowing you to extend
or override them in your `tailwind.config.js` file as needed.

For more information on this setting see the Tailwind docs: https://tailwindcss.com/docs/presets

#### Chakra UI

Change your imports from `import { theme } from '@chakra-ui/react'` to the generated theme
location so that the generated theme is used instead of the default Chakra UI theme.

### 5. Import the stories (Optional)

`figma2theme` provides a variety of Storybook stories that allow you to view elements of your
current Chakra UI theme, including foundational values (e.g. colour palettes, font sizes, etc.)
and component styles (e.g. button variants, text styles, etc.)
These stories are currently only available for Chakra UI.

To view these stories in the Storybook of your project, open `.storybook/main.js` and insert
the following glob to the `stories` array:

`../node_modules/@portablestudios/figma2theme/lib/**/*.stories.js`

## Development

Want to work on figma2theme? Here's how to get started.

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
