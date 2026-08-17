# Brave Barbearia - Sistema de Agendamento Online

A aplicação web da **Brave Barbearia** oferece uma experiência moderna, intuitiva e rápida para agendamento de cortes de cabelo, barba, tratamentos e consulta de produtos exclusivos.

---

## 🌟 Funcionalidades Principais

### 📱 Para o Cliente
- **Agendamento Rápido de Horários**: Escolha a data, os serviços desejados e visualize os horários disponíveis em tempo real.
- **Tabela de Serviços & Preços**: Tabela completa com os preços fixos e tempo estimado de cada procedimento.
- **Linha de Produtos & Finalizadores**: Catálogo de pomadas, leav-ins e óleos com valores e botão para consulta rápida via WhatsApp.
- **Galeria de Trabalhos**: Fotos e vídeos dos cortes e transformações realizadas.
- **Gestão de Agendamentos**: Consulta e cancelamento práticos dos seus horários agendados.

### 💈 Para o Barbeiro / Administração
- **Painel de Controle**: Gestão completa da agenda, horários marcados, status de atendimentos e configurações da barbearia.
- **Acesso Discreto**: Botão discreto no rodapé da tela inicial para login na Área do Barbeiro.

---

## 💈 Tabela de Serviços Atualizada

| Serviço | Preço (R$) | Duração |
| :--- | :--- | :--- |
| **Corte** | R$ 40,00 | 40 min |
| **Barba** | R$ 40,00 | 30 min |
| **Pezinho cabelo/ barba** | R$ 15,00 | 20 min |
| **Limpeza de pele** | R$ 55,00 | 40 min |
| **Sobrancelha** | R$ 15,00 | 15 min |
| **Depilação nariz/ orelha** | R$ 20,00 | 15 min |

---

## 🧴 Linha de Produtos

- **Pomada Modeladora** — R$ 35,00
- **Leave-in Capilar** — R$ 50,00
- **Óleo para Barba** — R$ 40,00
- **Balm para Barba** — R$ 40,00

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Servidor**: Express + Node.js

---

## 🚀 Como Rodar o Projeto

1. **Instalar dependências**:
   ```bash
   corepack enable
   pnpm install --frozen-lockfile
   ```

2. **Iniciar ambiente de desenvolvimento**:
   ```bash
   pnpm dev
   ```
   Acesse no navegador: `http://localhost:3000`

3. **Gerar build de produção**:
   ```bash
   pnpm build
   ```

4. **Iniciar em produção**:
   ```bash
   pnpm start
   ```

---

## Qualidade antes da `main`

Todo pull request para `main` executa a esteira em [`.github/workflows/quality.yml`](.github/workflows/quality.yml): lint/formatação (Biome), checagem de tipos, testes unitários e cobertura (Vitest), contratos de arquitetura, Knip, auditoria de dependências, build com orçamento de performance e teste end-to-end (Playwright).

Para executar localmente:

```bash
pnpm quality
pnpm test:e2e
```

Configure os checks do workflow como obrigatórios na proteção da branch `main`. Os requisitos manuais de segurança, privacidade e jurídico estão em [`docs/RELEASE_GATES.md`](docs/RELEASE_GATES.md).

---

## 📍 Localização & Contato

- **Endereço**: R. Pontalina, 722 - Vila Santo Eugenio, Campo Grande - MS, 79063-561
- **Telefone / WhatsApp**: (67) 9310-6619
- **Horário**: Terça a Sábado: 08:00 às 19:30
- **Instagram**: `@obryanbarbeiro_`
