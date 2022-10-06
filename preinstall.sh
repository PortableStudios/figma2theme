#!/bin/bash
read -p "Specify the Figma API key: " && echo "{\n  \"apiKey\": \"$REPLY\"\n}" > $HOME/.figma2themerc
