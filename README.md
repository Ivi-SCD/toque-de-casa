# 🍳 Toque de Casa: A receita que salva vidas.

![Banner do App](./assets/images/icon.png)

**"Imagine baixar um app de receitas e descobrir que ele pode salvar sua vida."**

O **Toque de Casa** é o primeiro aplicativo do Brasil que utiliza uma camuflagem perfeita para proteger mulheres em situação de violência doméstica. Na superfície, é um aplicativo de receitas culinárias funcional e convincente. Por baixo, é uma poderosa ferramenta de segurança, invisível aos olhos de um agressor.

---

## 🎭 Camuflagem Perfeita

A genialidade do Toque de Casa está em sua dupla camada. Para o mundo exterior e, mais importante, para um possível agressor, ele é apenas mais um app de receitas. No entanto, com um gesto secreto — **manter o dedo pressionado por 5 segundos em uma área específica** — a usuária acessa um ecossistema completo de proteção e apoio.

---

## ✨ Funcionalidades de Proteção (Disfarçadas de Culinária)

Cada funcionalidade foi meticulosamente desenhada para parecer parte de um aplicativo de culinária, enquanto oferece um recurso de segurança real.

### 1. **Quiz de Avaliação de Risco ("Verificador de Utensílios")**
-   **Disfarce:** Um "quiz culinário" para verificar se a usuária tem os "utensílios necessários".
-   **Realidade:** Uma tradução completa do **Formulário Nacional de Avaliação de Risco**. Perguntas como *"Você tem todos os utensílios necessários?"* são, na verdade, *"Seu parceiro controla seus recursos financeiros?"*. As respostas são analisadas por uma IA para identificar o nível de risco, sempre se comunicando através de metáforas culinárias.

### 2. **Mapa da Rede de Apoio ("Onde Comprar")**
-   **Disfarce:** Um mapa que mostra "pontos gastronômicos" como mercados, feiras e padarias.
-   **Realidade:** Um mapeamento georreferenciado da rede de proteção do DF. O CREAS se torna o "Mercado Central", a Delegacia da Mulher é a "Feira Orgânica", e o CAPS é a "Padaria Artesanal", mostrando rotas seguras para o local de acolhimento mais próximo.

### 3. **Chat Seguro ("Grupo de Receitas")**
-   **Disfarce:** Um grupo de chat para trocar dicas e receitas.
-   **Realidade:** Um canal de comunicação seguro com códigos de alerta que salvam vidas.
    -   `"Preciso de sal"`: Aciona o protocolo para violência psicológica.
    -   `"Queimei o jantar"`: Indica uma escalada de violência física.
    -   `"Vou fazer um bolo"`: Sinaliza a necessidade de uma saída de emergência.
-   A IA responde mantendo o disfarce enquanto alerta discretamente a rede de apoio da usuária.

### 4. **Mentoria ("Cozinheiras Experientes")**
-   **Disfarce:** Uma seção para receber dicas de "cozinheiras experientes".
-   **Realidade:** Uma rede de mentoras reais — mulheres que sobreviveram a situações de violência e agora oferecem orientação e apoio para outras, mantendo sempre a narrativa culinária como fachada.

### 5. **Botão de Pânico ("Modo Limpeza")**
-   **Disfarce:** Uma funcionalidade para "limpar o cache de receitas".
-   **Realidade:** Um botão de pânico que apaga todos os rastros de uso da parte de segurança do app, revertendo-o para um simples app de receitas sem comprometer seu funcionamento normal.

---

## 🔒 Segurança e Privacidade

-   **Criptografia de Ponta a Ponta:** Todas as comunicações são seguras.
-   **Anonimato:** O sistema foi projetado para não coletar dados pessoais identificáveis.
-   **Backup Seguro:** As informações são salvas de forma segura na nuvem.
-   **Funcionalidade Offline:** Recursos essenciais funcionam mesmo sem conexão com a internet.

---

## 🚀 Executando o Projeto Localmente

**Aviso Importante:** Este é um projeto de alta sensibilidade. Ao executá-lo, lembre-se do seu propósito e da segurança dos dados.

### Pré-requisitos

1.  **Node.js e NPM:** [Baixe aqui](https://nodejs.org/).
2.  **Java Development Kit (JDK):** Recomendado JDK 17. [Baixe aqui (Adoptium)](https://adoptium.net/temurin/releases/?version=17).
3.  **Android Studio:** Para o SDK do Android e emulador. [Baixe aqui](https://developer.android.com/studio).
4.  Configure as variáveis de ambiente `JAVA_HOME` e `ANDROID_HOME`.

### Instalação e Execução

1.  **Clone o repositório e instale as dependências:**
    ```sh
    git clone https://github.com/Ivi-SCD/toque-de-casa.git
    cd toque-de-casa
    npm install
    ```

2.  **Para rodar com Expo Go (Desenvolvimento Rápido):**
    ```sh
    npx expo start
    ```
    Escaneie o QR Code com o app Expo Go. (Funcionalidades nativas podem ser limitadas).

3.  **Para rodar um Build de Desenvolvimento Completo (Recomendado):**
    ```sh
    npx expo run:android
    ```
    Este comando compila o aplicativo completo e o instala em seu emulador ou dispositivo conectado. É a maneira correta de testar todas as funcionalidades.

---

## 🏗️ Estrutura do Projeto

```
toque-de-casa/
├── app/                    # Telas do aplicativo (expo-router)
│   ├── (tabs)/            # Navegação por abas
│   ├── _layout.tsx        # Layout principal
│   └── ...                # Outras telas
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface
│   └── ...               # Componentes temáticos
├── constants/            # Constantes e configurações
│   ├── Colors.ts         # Sistema de cores
│   └── Config.ts         # Configurações globais
├── hooks/                # Hooks personalizados
├── services/             # Serviços de negócio
│   ├── security.ts       # Serviço de segurança
│   ├── notificationService.ts # Serviço de notificações
│   └── aiService.ts      # Serviço de IA e alibis
├── assets/               # Recursos estáticos
└── scripts/              # Scripts utilitários
```

---

## 🛠️ Tecnologias Utilizadas

- **React Native + Expo:** Framework principal
- **TypeScript:** Tipagem estática
- **Expo Router:** Navegação baseada em arquivos
- **AsyncStorage:** Armazenamento local
- **Expo Notifications:** Sistema de notificações
- **Expo Calendar:** Integração com calendário
- **Expo Local Authentication:** Autenticação biométrica
- **Expo Crypto:** Criptografia de dados

---

## 🤝 Contribuição

Este é um projeto desenvolvido no [Hackathon da Campus Party Brasilia 2025](https://brasil.campus-party.org/cpbr17/hackathons/desafio-mulher-mais-segura/) com uma missão crítica. Se você deseja contribuir, por favor, abra uma *issue* para discutir suas ideias ou um *pull request* com suas melhorias.

### Diretrizes de Contribuição

1. **Segurança em Primeiro Lugar:** Qualquer mudança deve manter a segurança e privacidade dos usuários.
2. **Testes Rigorosos:** Todas as funcionalidades devem ser testadas antes do merge.
3. **Documentação:** Mantenha a documentação atualizada.
4. **Código Limpo:** Siga as boas práticas de desenvolvimento.

---

## 📄 Licença

Este projeto é desenvolvido com propósito humanitário. Por favor, respeite a natureza sensível do projeto e seu objetivo de ajudar mulheres em situação de vulnerabilidade.

---

*Uma pequena dedicatória no final*

> Mais um hackathon desenvolvendo uma solução ao lado dessa pessoa incrível chamada **Daniela dos Anjos**, foi numa Campus Party que nos conhecemos e trabalhamos juntos desde lá, e cá estamos mais uma vez desenvolvendo soluções em outra Campus Party, sempre com o propósito da inovação e ajudar as outras pessoas, vamos ainda participar e desenvolver muitas soluções juntos, sou eternamente grato por ter te conhecido e a gente ter desenvolvido essa amizade no meio de todo esse ecossistema maravilhoso hehe ✨✨ dos hackathons, da inovação, da tecnologia para a vida 💕💕

*Aos avaliadores, peço que ignorem a mensagem acima para avaliação hahaha!!*