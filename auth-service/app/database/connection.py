from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings

# Crear engine de base de datos
engine = create_engine(settings.DATABASE_URL)

# Crear SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear base para modelos
Base = declarative_base()

# Dependency para obtener sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Crea todas las tablas en la base de datos"""
    from app.models.user import User
    Base.metadata.create_all(bind=engine)