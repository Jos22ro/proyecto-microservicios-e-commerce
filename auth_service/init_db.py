"""
Database initialization script
Creates all tables and seeds initial data (roles)
"""
from database import engine, SessionLocal
import models

def init_db():
    # Create all tables
    print("Creating database tables...")
    models.Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")
    
    # Seed initial roles
    db = SessionLocal()
    try:
        # Check if roles already exist
        existing_roles = db.query(models.Role).count()
        if existing_roles > 0:
            print(f"✓ Roles already exist ({existing_roles} roles found)")
            return
        
        print("Seeding initial roles...")
        roles = [
            models.Role(name="admin", description="Administrator with full access"),
            models.Role(name="customer", description="Regular customer"),
            models.Role(name="seller", description="Seller/Vendor"),
        ]
        
        for role in roles:
            db.add(role)
        
        db.commit()
        print(f"✓ Successfully created {len(roles)} roles")
        
    except Exception as e:
        print(f"✗ Error seeding roles: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    print("\n✓ Database initialization complete!")
