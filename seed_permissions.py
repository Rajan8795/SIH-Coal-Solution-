from app.database import SessionLocal
from app.models.permission import Role, Permission

db = SessionLocal()

# Step A: sab permissions define karo
permissions_list = [
    ("user:create", "Create new users"),
    ("user:delete", "Delete users"),
    ("audit:view", "View audit logs"),
    ("inspection:create", "Create inspection reports"),
    ("inspection:approve", "Approve/reject compliance"),
    ("mine:view_all", "View all mines"),
    ("mine:edit_own", "Edit own mine data"),
    ("document:upload", "Upload documents"),
]

for code, desc in permissions_list:
    if not db.query(Permission).filter(Permission.code == code).first():
        db.add(Permission(code=code, description=desc))
db.commit()

# Step B: roles banao aur unko permissions assign karo
role_permission_map = {
    "admin": [p[0] for p in permissions_list],  # admin ko sab kuch
    "mine_official": ["mine:edit_own", "document:upload"],
    "inspector": ["inspection:create", "inspection:approve", "mine:view_all", "document:upload"],
    "contractor": ["document:upload"],
}

for role_name, perm_codes in role_permission_map.items():
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name)
        db.add(role)
        db.commit()
        db.refresh(role)

    role.permissions = db.query(Permission).filter(Permission.code.in_(perm_codes)).all()
    db.commit()

print("✅ Roles and permissions seeded successfully")
db.close()