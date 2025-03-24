# Proyecto
## Curls
### Crear usuarios
```bash
curl --request POST \
  --url http://localhost:3000/api/auth/signup \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/10.3.1' \
  --data '{
  "username": "123456",
  "email": "prueba@prueba.bo",
  "password": "123456"
}'
```