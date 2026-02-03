
# Arquitetura Técnica: Pergunta que Dói

Este documento detalha a implementação proposta usando **Supabase** para garantir segurança, anonimato e escalabilidade.

## 1. Estrutura de Banco de Dados
O script completo de criação de tabelas, enums e políticas de segurança pode ser encontrado em `supabase_setup.sql`.

### Entidades Principais:
- `questions`: Onde residem as perguntas diárias.
- `responses`: Reflexões dos usuários com lógica de visualização restrita.
- `reactions`: Interações silenciosas ("Identificado", "Orando").

## 2. Segurança e Row Level Security (RLS)

- **Regra de Ouro**: O usuário só pode realizar o `SELECT` em respostas de terceiros se ele já possuir um registro próprio (`INSERT`) para a mesma `question_id`.
- **Proteção de Identidade**: O `user_id` é protegido via RLS. Consultas coletivas retornam apenas metadados de exibição (`display_mode`).
- **Unicidade**: Restrições de banco de dados (`UNIQUE constraints`) impedem múltiplas respostas para a mesma pergunta, mantendo a integridade da jornada diária.

## 3. Autenticação

- **Anonymous Auth**: Essencial para reduzir a fricção inicial e permitir honestidade imediata.
- **Persistent Auth**: Opção de vincular email para não perder o histórico de jornada ao trocar de dispositivo.

## 4. Moderação Inteligente

- **is_flagged**: Campo booleano que, quando verdadeiro, oculta a resposta da visualização coletiva automaticamente via política de RLS.
- **Edge Functions**: Sugere-se o uso de uma função `on_response_created` que envia o texto para a Gemini API para análise de toxicidade ou risco de vida.
