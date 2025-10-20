import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Custom highlight style for Punctual that matches Strudel's theme
 * Based on strudel-theme.mjs colors
 */
export const punctualHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#c792ea' },           // Purple for keywords
  { tag: t.operator, color: '#89ddff' },          // Cyan for operators
  { tag: t.number, color: '#c3e88d' },            // Green for numbers
  { tag: t.string, color: '#c3e88d' },            // Green for strings
  { tag: t.comment, color: '#7d8799' },           // Gray for comments
  { tag: t.variableName, color: '#c792ea' },      // Purple for variables
  { tag: t.definition(t.variableName), color: '#82aaff' }, // Blue for definitions
  { tag: t.bracket, color: '#525154' },           // Dark gray for brackets
  { tag: t.punctuation, color: '#82aaff' },       // Blue for punctuation
  { tag: t.atom, color: '#89ddff' },              // Cyan for atoms
  { tag: t.bool, color: '#89ddff' },              // Cyan for booleans
]);

export const punctualSyntaxHighlighting = syntaxHighlighting(punctualHighlightStyle);
