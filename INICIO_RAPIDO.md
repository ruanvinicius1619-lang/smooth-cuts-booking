# ⚡ Início Rápido - Smooth Cuts Booking

## 🎯 Para Começar AGORA

### 1️⃣ Primeiro Passo: Instalar Node.js

**❌ Node.js não está instalado no seu sistema!**

**Solução Rápida:**
1. Acesse: https://nodejs.org/
2. Clique em "Download" (versão LTS)
3. Execute o arquivo baixado
4. Reinicie o terminal

### 2️⃣ Segundo Passo: Executar Script Automático

```powershell
# No PowerShell, execute:
.\inicializar.ps1
```

**O script fará automaticamente:**
- ✅ Verificar Node.js e npm
- ✅ Instalar dependências
- ✅ Configurar banco de dados
- ✅ Iniciar aplicação

### 3️⃣ Terceiro Passo: Configurar Supabase

Quando solicitado, você precisará:

1. **Acessar**: https://supabase.com/dashboard
2. **Projeto**: `jheywkeofcttgdgquawm`
3. **Ir em**: Settings > API
4. **Copiar**: "service_role" key
5. **Colar** quando o script solicitar

## 🌐 Resultado

Após a configuração, a aplicação estará disponível em:
**http://localhost:5173**

## 🆘 Problemas Comuns

### "npm não é reconhecido"
- **Causa**: Node.js não instalado
- **Solução**: Instale o Node.js e reinicie o terminal

### "Erro de permissão no PowerShell"
```powershell
# Execute primeiro:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Erro de conexão com banco"
- **Causa**: Chave do Supabase incorreta
- **Solução**: Verifique se copiou a "service_role" key

## 📞 Precisa de Ajuda?

1. **Guia Completo**: `GUIA_INICIALIZACAO.md`
2. **Setup Automático**: `SETUP_AUTOMATED.md`
3. **Verificar Sistema**: `node scripts/check-prerequisites.js`

---

**🎉 Em 5 minutos você terá sua barbearia online funcionando!**