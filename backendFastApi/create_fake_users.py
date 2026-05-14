"""
Script para crear usuarios fake con RUTs chilenos válidos
"""
import random
from faker import Faker

fake = Faker('es_CL')

def calcular_dv_rut(rut_sin_dv):
    """Calcula el dígito verificador de un RUT chileno"""
    reversed_digits = map(int, reversed(str(rut_sin_dv)))
    factors = [2, 3, 4, 5, 6, 7]
    s = sum(d * factors[i % 6] for i, d in enumerate(reversed_digits))
    dv = 11 - (s % 11)
    if dv == 11:
        return '0'
    elif dv == 10:
        return 'K'
    else:
        return str(dv)

def generar_rut_chileno():
    """Genera un RUT chileno válido"""
    rut_sin_dv = random.randint(10000000, 25000000)
    dv = calcular_dv_rut(rut_sin_dv)
    return f"{rut_sin_dv}-{dv}"

# Generar 10 usuarios
usuarios = []
for i in range(10):
    first_name = fake.first_name()
    last_name = f"{fake.last_name()} {fake.last_name()}"
    rut = generar_rut_chileno()
    email = f"{first_name.lower()}.{last_name.split()[0].lower()}@example.com"
    username = f"{first_name.lower()}{last_name.split()[0].lower()}"
    phone = fake.phone_number()
    
    usuarios.append({
        'first_name': first_name,
        'last_name': last_name,
        'rut': rut,
        'email': email,
        'username': username,
        'phone': phone,
        'password': 'Password123!'  # Contraseña por defecto
    })

# Generar SQL
print("-- Insertar 10 usuarios fake con RUTs chilenos válidos")
print("-- Contraseña para todos: Password123!")
print()

for i, user in enumerate(usuarios, 1):
    # Hash bcrypt de "Password123!" (generado previamente)
    hashed_password = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNx8yZqXu"
    
    sql = f"""
INSERT INTO users (first_name, last_name, email, username, hashed_password, phone, document_id, rut, role, is_active)
VALUES (
    '{user['first_name']}',
    '{user['last_name']}',
    '{user['email']}',
    '{user['username']}',
    '{hashed_password}',
    '{user['phone']}',
    '{user['rut']}',
    '{user['rut']}',
    'USER',
    true
);"""
    print(sql)

print("\n-- Verificar usuarios creados")
print("SELECT id, first_name, last_name, rut, email, username FROM users WHERE role = 'USER' ORDER BY id;")
