#!/usr/bin/env node

/**
 * Script de Reset do Projeto Toque de Casa
 * 
 * Este script é usado para resetar o projeto para um estado limpo.
 * Ele move ou deleta os diretórios /app, /components, /hooks, /scripts e /constants
 * baseado na entrada do usuário e cria um novo diretório /app com arquivos básicos.
 * 
 * Funcionalidades:
 * - Move arquivos existentes para /app-example (opcional)
 * - Deleta arquivos existentes (opcional)
 * - Cria nova estrutura básica do app
 * - Fornece instruções pós-reset
 * 
 * Após executar este script, você pode remover o script 'reset-project'
 * do package.json e deletar este arquivo com segurança.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Configurações do script
const root = process.cwd(); // Diretório raiz do projeto
const oldDirs = ["app", "components", "hooks", "constants", "scripts"]; // Diretórios a serem movidos/deletados
const exampleDir = "app-example"; // Diretório de backup
const newAppDir = "app"; // Novo diretório do app
const exampleDirPath = path.join(root, exampleDir);

/**
 * Conteúdo padrão para o arquivo index.tsx
 * Tela inicial básica do aplicativo
 */
const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

/**
 * Conteúdo padrão para o arquivo _layout.tsx
 * Layout básico do expo-router
 */
const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

// Interface para leitura de entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Função principal que executa o reset do projeto
 * 
 * @param userInput - Resposta do usuário ('y' para mover, 'n' para deletar)
 */
const moveDirectories = async (userInput) => {
  try {
    // Se o usuário escolheu mover os arquivos
    if (userInput === "y") {
      // Cria o diretório app-example
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Processa cada diretório antigo
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          // Move o diretório para app-example
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          // Deleta o diretório
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Cria o novo diretório /app
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /app directory created.");

    // Cria o arquivo index.tsx
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 app/index.tsx created.");

    // Cria o arquivo _layout.tsx
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 app/_layout.tsx created.");

    // Exibe instruções pós-reset
    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit app/index.tsx to edit the main screen.${
        userInput === "y"
          ? `\n3. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

// Solicita entrada do usuário
rl.question(
  "Do you want to move existing files to /app-example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);
