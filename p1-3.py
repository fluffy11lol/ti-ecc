""""""

"""
Задача1:
Для заданного простого числа M (вводится с клавиатуры), найти такие коэффициенты a и b, чтобы кривая вида:
y^2 = x^3 + a*x + b (mod M)
удовлетворяла условию:
4*a^3 + 27*b^2 != 0 (mod M)
(Это условие означает, что дискриминант кривой не равен нулю, что гарантирует, что кривая не вырождена).
"""

"""
Задача2:
Найти все пары (x,y), которые удовлетворяют уравнению кривой над полем по модулю M, включая точку на бесконечности (O).
"""

"""
Задача3:
Алгоритм обмена ключами на эллиптических кривых (ECDH)

Алгоритм Диффи-Хеллмана с использованием эллиптической группы.
Используются:
1. Общая для всех эллиптическая кривая.
2. Общая базовая точка G (генератор) на этой кривой.

Процесс:
1. Alice:
   - Выбирает случайный секретный (приватный) ключ 'a' (целое число).
   - Вычисляет свой публичный ключ A = a*G (умножение точки G на скаляр 'a').
   - Отправляет A Бобу.

2. Bob:
   - Выбирает случайный секретный (приватный) ключ 'b' (целое число).
   - Вычисляет свой публичный ключ B = b*G.
   - Отправляет B Алисе.

3. Вычисление общего секрета:
   - Alice вычисляет: S_A = a*B = a*(b*G) = (a*b)*G.
   - Bob вычисляет:   S_B = b*A = b*(a*G) = (b*a)*G.

Результат:
S_A и S_B равны (S_A = S_B = S). Это и есть общий секретный ключ, который могут использовать Alice и Bob.
Значение S (или его производная) используется для симметричного шифрования.

Безопасность основана на сложности вычисления дискретного логарифма в группе точек эллиптической кривой: 
	зная G и A=a*G (или G и B=b*G), вычислить 'a' (или 'b') практически невозможно 
	для правильно выбранных параметров кривой
"""

import random


# Проверка простоты (простое — для эллиптического поля)
def is_prime(n):
	if n <= 1:
		return False
	if n <= 3:
		return True
	if n % 2 == 0 or n % 3 == 0:
		return False
	i = 5
	while i * i <= n:
		if n % i == 0 or n % (i + 2) == 0:
			return False
		i += 6
	return True


# Поиск a и b, удовлетворяющих условию невырожденной кривой
def is_valid_curve(a, b, M):
	return (4 * a ** 3 + 27 * b ** 2) % M != 0


def find_curve_parameters(M):
	while True:
		a = random.randint(0, M - 1)
		b = random.randint(0, M - 1)
		if is_valid_curve(a, b, M):
			return a, b


# Использует свойство Эйлера: (a/p) = a^((p-1)/2) (mod p).
# Вычисляет символ Лежандра
#  Возвращает 1, если a — квадратичный вычет по модулю p (т.е. существует x такой, что x^2 = a (mod p)), и a % p != 0.
def legendre_symbol(a, p):
	return pow(a, (p - 1) // 2, p)


# Квадратный корень по модулю (наивный способ)
def sqrt_mod(a, p):
	for x in range(p):
		if x * x % p == a % p:
			return x
	return None


def generate_points(a, b, M):
	points = [("O", "O")]  # точка на бесконечности
	for x in range(M):
		rhs = (x ** 3 + a * x + b) % M
		if rhs == 0:
			points.append((x, 0))
		elif legendre_symbol(rhs, M) == 1:  # является ли квадратичным вычетом по модулю M, то есть существуют два
			# различных ненулевых y таких, что y^2 = rhs (mod M)
			y = sqrt_mod(rhs, M)
			points.append((x, y))
			if y != M - y:
				points.append((x, M - y))
	return points


# Арифметика точек

# Нахождение обратного x, чтобы выполнялось: a*x = 1 (mod p)
def modinv(a, p):
	return pow(a, -1, p)


def point_add(P, Q, a, p):
	if P == ("O", "O"):
		return Q
	if Q == ("O", "O"):
		return P
	x1, y1 = P
	x2, y2 = Q

	if x1 == x2 and y1 != y2:
		return "O", "O"

	if P != Q:
		m = ((y2 - y1) * modinv(x2 - x1, p)) % p
	else:
		if y1 == 0:
			return "O", "O"
		m = ((3 * x1 ** 2 + a) * modinv(2 * y1, p)) % p

	x3 = (m ** 2 - x1 - x2) % p
	y3 = (m * (x1 - x3) - y1) % p
	return x3, y3


def scalar_mult(k, P, a, p):
	R = ("O", "O")
	while k:
		if k & 1:
			R = point_add(R, P, a, p)
		P = point_add(P, P, a, p)
		k >>= 1
	return R


def main():
	M = int(input("Введите простое число M: "))
	if not is_prime(M):
		print("Ошибка: M должно быть простым числом.")
		return

	print("\n===> [1] Поиск параметров эллиптической кривой")
	a, b = find_curve_parameters(M)
	print(f"Параметры эллиптической кривой: a = {a}, b = {b}")
	print(f"Найдена кривая: y^2 = x^3 + {a}x + {b} (mod {M})")

	print("\n===> [2] Генерация всех точек эллиптической группы EM(a, b)")
	points = generate_points(a, b, M)
	print(f"Найдено {len(points)} точек:")
	for pt in points:
		print(pt)

	print("\n===> [3] Алгоритм обмена ключами ECDH")
	# Выбираем генераторную точку G — не точку на бесконечности
	G = None
	for pt in points:
		if pt != ("O", "O"):
			G = pt
			break
	if not G:
		print("Не удалось найти подходящую генераторную точку.")
		return
	print(f"Выбрана базовая точка G = {G}")

	a_priv = random.randint(1, M - 1)
	b_priv = random.randint(1, M - 1)
	print(f"Приватный ключ Alice: {a_priv}")
	print(f"Приватный ключ Bob: {b_priv}")

	A_pub = scalar_mult(a_priv, G, a, M)
	B_pub = scalar_mult(b_priv, G, a, M)
	shared_A = scalar_mult(a_priv, B_pub, a, M)
	shared_B = scalar_mult(b_priv, A_pub, a, M)

	print(f"Открытый ключ Alice: {A_pub}")
	print(f"Открытый ключ Bob: {B_pub}")
	print(f"Общий ключ, вычисленный Alice: {shared_A}")
	print(f"Общий ключ, вычисленный Bob: {shared_B}")


if __name__ == "__main__":
	main()
