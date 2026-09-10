#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="${FONT_SRC:-$PWD/.fontsrc}"
mkdir -p "$SRC" public/fonts

G=https://raw.githubusercontent.com/google/fonts/main/ofl
fetch () { [ -f "$2" ] || curl -sL -o "$2" "$1"; }
fetch "$G/stixtwotext/STIXTwoText%5Bwght%5D.ttf"        "$SRC/text.ttf"
fetch "$G/stixtwotext/STIXTwoText-Italic%5Bwght%5D.ttf" "$SRC/italic.ttf"
fetch "$G/stixtwomath/STIXTwoMath-Regular.ttf"          "$SRC/math.ttf"

TEXT_U='U+0020-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+0370-03FF,U+0400-045F,U+2010-2015,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2032-2033,U+2039-203A,U+2044,U+2070,U+2074-2079,U+207F,U+2080-2089,U+20AC,U+2113,U+2116,U+2122,U+2124,U+2016,U+2212,U+00A0,U+2007,U+2009,U+200A,U+2011'
MATH_U='U+2203,U+2208,U+2209,U+2211,U+220F,U+221A,U+2245,U+2248,U+2260,U+2261,U+2264,U+2265,U+22C5,U+230A,U+230B,U+2192,U+2197,U+27F9,U+27FA,U+2205,U+2286'

sub () { # src out unicodes  — статический инстанс wght=400, вариативность не нужна
  local tmp="$SRC/.inst.ttf"
  if fonttools varLib.instancer -q -o "$tmp" "$1" wght=400 2>/dev/null; then :; else cp "$1" "$tmp"; fi
  pyftsubset "$tmp" --output-file="$2" --flavor=woff2 --unicodes="$3" \
    --layout-features='kern,liga,calt' --no-hinting --desubroutinize --drop-tables+=DSIG
  rm -f "$tmp"
}
sub "$SRC/text.ttf"   public/fonts/stix-text.woff2   "$TEXT_U"
sub "$SRC/italic.ttf" public/fonts/stix-italic.woff2 "$TEXT_U"
sub "$SRC/math.ttf"   public/fonts/stix-math.woff2   "$MATH_U"
ls -l public/fonts/*.woff2 | awk '{printf "%8d  %s\n", $5, $9}'
