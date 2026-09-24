# Plano de Resposta a Incidentes de Segurança

**Versão:** 1.0
**Última atualização:** 20/09/2026
**Responsável:** [A DEFINIR — DPO]

---

## 1. Objetivo

Definir o procedimento a ser seguido em caso de incidente de segurança
que envolva dados pessoais tratados pela plataforma **Agendy**, em
conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018),
especialmente o art. 48.

---

## 2. Definição de Incidente

Considera-se incidente de segurança qualquer evento que comprometa a
confidencialidade, integridade ou disponibilidade de dados pessoais,
incluindo, mas não se limitando a:

- Acesso não autorizado ao banco de dados ou a sistemas internos.
- Vazamento de credenciais, tokens ou dados pessoais.
- Perda ou destruição de dados por falha técnica ou ação maliciosa.
- Alteração não autorizada de dados.
- Interceptação de comunicações.
- Ransomware ou qualquer ataque cibernético bem-sucedido.

---

## 3. Classificação do Incidente

| Nível | Descrição | Prazo de resposta |
|-------|-----------|-------------------|
| Baixo | Sem exposição de dados pessoais (ex.: tentativa frustrada) | Investigar em até 48h |
| Médio | Exposição limitada de dados não sensíveis | Resposta em até 24h |
| Alto | Exposição de dados sensíveis ou de muitos titulares | Resposta imediata + notificação |

---

## 4. Fluxo de Resposta

### 4.1 Detecção e Contenção (imediato)

1. Identificar a origem e o escopo do incidente.
2. Isolar sistemas afetados (desconectar servidor, revogar tokens).
3. Preservar evidências (logs, snapshots, backups).

### 4.2 Análise (primeiras 24h)

1. Determinar quais dados foram afetados.
2. Identificar quantos titulares foram impactados.
3. Avaliar o risco ou dano relevante.
4. Documentar o ocorrido.

### 4.3 Notificação (até 3 dias úteis)

Se houver risco relevante:

- **ANPD**: notificação pelo site oficial (https://www.gov.br/anpd)
- **Titulares afetados**: comunicação clara por e-mail

### 4.4 Remediação

1. Corrigir a vulnerabilidade.
2. Reforçar controles de segurança.
3. Monitorar por acessos indevidos posteriores.

---

## 5. Informações obrigatórias na notificação à ANPD

- Descrição da natureza dos dados afetados.
- Informações sobre os titulares envolvidos.
- Medidas técnicas e de segurança adotadas.
- Riscos relacionados ao incidente.
- Motivos da demora (se aplicável).
- Medidas de mitigação adotadas.

---

## 6. Comunicação aos titulares

Modelo de e-mail a ser enviado:

**Assunto:** Comunicado sobre incidente de segurança

Prezado(a) [NOME],

Informamos que identificamos um incidente de segurança em nossos
sistemas em [DATA]. Os dados potencialmente afetados foram: [DADOS].

As medidas adotadas foram: [MEDIDAS]. Recomendamos que você:
- Troque sua senha.
- Fique atento a comunicações suspeitas.

Estamos à disposição em [E-MAIL DO DPO] para quaisquer esclarecimentos.

Atenciosamente,
[RESPONSÁVEL]

---

## 7. Registro de Incidentes

Todo incidente deve ser registrado no arquivo `docs/incidents/` com:

- Data e hora da detecção.
- Descrição do incidente.
- Dados afetados.
- Ações tomadas.
- Notificações enviadas.
- Status final.

---

## 8. Revisão

Este plano deve ser revisado:

- Anualmente.
- Após qualquer incidente relevante.
- Quando houver mudança significativa na arquitetura.