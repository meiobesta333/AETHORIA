# Segurança

Controles presentes: password_hash/password_verify; regeneração do ID de sessão no login; cookie HttpOnly, SameSite=Lax e Secure quando HTTPS; token CSRF; PDO prepared statements; escape HTML; verificação de propriedade do personagem; erros genéricos para usuário e registro no error_log.

Pendências antes de produção: rate limiting persistente, recuperação de senha, CSP, testes automatizados de abuso, revisão de permissões e provisionamento seguro de administrador. Esta fase não representa auditoria completa.
