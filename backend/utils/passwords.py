import bcrypt

class Passwords: 
  @staticmethod 
  def checkPassword(hashed: str, password: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

  @staticmethod 
  def hashPassword(password: str) -> bytes:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())

  