/**
 * Configuração do ESLint para o projeto Toque de Casa
 * 
 * Este arquivo configura o linter ESLint para garantir qualidade
 * e consistência do código TypeScript/React Native.
 * 
 * Baseado na configuração oficial do Expo com regras personalizadas.
 * 
 * @see https://docs.expo.dev/guides/using-eslint/
 */

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  // Configuração base do Expo para React Native
  expoConfig,
  {
    // Arquivos e pastas ignorados pelo linter
    ignores: ['dist/*'], // Ignora a pasta de build/distribuição
  },
]);
