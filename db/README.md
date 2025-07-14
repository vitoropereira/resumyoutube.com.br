# Database Structure

Esta pasta contém todos os arquivos SQL organizados por categoria:

## 📁 Estrutura

- **`migrations/`** - Scripts de migração do banco de dados
- **`debug/`** - Scripts para debug e troubleshooting
- **`seeds/`** - Scripts para popular o banco com dados de teste
- **`functions/`** - Funções SQL/PostgreSQL personalizadas
- **`policies/`** - Políticas RLS (Row Level Security)

## 🚀 Como usar

### Migrations
```bash
# Execute as migrations em ordem
psql -f db/migrations/001_initial_tables.sql
psql -f db/migrations/002_add_indexes.sql
```

### Debug
```bash
# Para investigar problemas
psql -f db/debug/check_user_permissions.sql
psql -f db/debug/analyze_rls_policies.sql
```

### Seeds
```bash
# Para popular dados de teste
psql -f db/seeds/sample_users.sql
psql -f db/seeds/sample_channels.sql
```

## 📝 Convenções

- **Migrations**: `001_description.sql`, `002_description.sql`
- **Debug**: `check_*.sql`, `analyze_*.sql`, `debug_*.sql`
- **Seeds**: `sample_*.sql`, `demo_*.sql`
- **Functions**: `function_name.sql`
- **Policies**: `table_name_policies.sql`

## ⚠️ Importante

- Sempre teste scripts em ambiente de desenvolvimento primeiro
- Faça backup antes de executar migrations em produção
- Documente mudanças significativas no banco