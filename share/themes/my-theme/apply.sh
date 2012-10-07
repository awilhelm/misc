#!/bin/sh

[ "$THEME" ] || THEME="$1"
[ "$THEME" ] || THEME="$(basename "$(dirname "$(readlink -f "$0")")")"

gsettings set org.gnome.shell.extensions.user-theme name "$THEME"
