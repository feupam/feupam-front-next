# Sistema de Download de Termos - Acampamentos

## Funcionamento

Para os eventos **AcampsReinoKids** e **AcampsReinoPreAdole**, foi implementado um sistema de download obrigatório de documentos antes de aceitar os termos.

## Fluxo do Usuário

1. **Última Etapa do Formulário** - O usuário chega na seção "📄 Termos e Condições"

2. **Botão de Download Aparece**
   - Um botão verde com o texto "Baixar Documento de Termos e Condições" é exibido
   - Ícone de download visível

3. **Usuário Clica no Botão**
   - O arquivo específico do evento é baixado automaticamente:
     - `AcampsReinoKids` → baixa `/docs/AcampsReinoKids.docx`
     - `AcampsReinoPreAdole` → baixa `/docs/AcampsReinoPreAdole.docx`
   - Botão muda de cor para verde claro
   - Ícone muda para check (✓)
   - Texto muda para "Documento baixado com sucesso"

4. **Campo de Aceitação Liberado**
   - Apenas após o download, o usuário pode marcar "Aceito os termos e condições"
   - Se tentar avançar sem baixar, a validação bloqueia

## Validação

- O campo `termos_baixados` deve ter o valor `'downloaded'` para ser válido
- Mensagem de erro se tentar avançar sem baixar: "Você deve baixar o documento de termos antes de prosseguir"

## Arquivos Necessários

Certifique-se de que os seguintes arquivos existem em `/public/docs/`:
- `AcampsReinoKids.docx`
- `AcampsReinoPreAdole.docx`

## Detecção Automática

O sistema detecta automaticamente qual documento usar baseado no nome do evento:
```typescript
// Se o evento contém "AcampsReinoKids" → usa AcampsReinoKids.docx
// Se o evento contém "AcampsReinoPreAdole" → usa AcampsReinoPreAdole.docx
```

## Componentes Modificados

1. **types/acampamento-form.ts**
   - Adicionado campo `termos_baixados` na interface
   - Funções `getTermosFileName()` e `getTermosDownloadUrl()`
   - Validação customizada para garantir o download

2. **components/forms/MultiStepForm.tsx**
   - Renderização especial para o campo `termos_baixados`
   - Botão de download com feedback visual
   - Atualização automática após o clique

## Estados Visuais

### Antes do Download
```
[📥 Baixar Documento de Termos e Condições]  (botão verde)
```

### Depois do Download
```
[✓ Documento baixado com sucesso]  (botão verde claro)
✓ Você já baixou o documento. Leia-o antes de aceitar os termos.
```

## Observações Importantes

- O download é obrigatório antes de prosseguir
- Cada evento tem seu próprio documento
- O campo `termos_baixados` não é enviado para o backend (apenas controle de fluxo)
- O usuário pode baixar múltiplas vezes se necessário
