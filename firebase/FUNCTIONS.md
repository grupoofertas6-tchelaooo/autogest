# Cloud Functions para AutoGest
# Notificações automáticas para clientes

# Para implantar:
# 1. cd functions
# 2. npm install
# 3. npm run deploy

Crie a pasta `functions` na raiz do Firebase Console ou use:
```
firebase init functions
```

### Funções sugeridas:

1. **checkOilChanges** - Executa diariamente via cron, verifica trocas de óleo próximas do vencimento e envia notificações push
2. **checkMaintenance** - Executa diariamente, verifica manutenções programadas próximas do vencimento
3. **sendWelcomeNotification** - Envia notificação de boas-vindas quando um cliente é cadastrado
