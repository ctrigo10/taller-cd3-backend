# Proyecto
## Curls
### Crear usuarios
```bash
curl --request POST \
  --url http://localhost:3000/api/auth/signup \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/10.3.1' \
  --data '{
  "username": "ctrigo",
  "email": "carlos.trigo@agetic.gob.bo",
  "password": "123456"
}'
```