from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class Plugin(SQLModel, table=True):
    __tablename__ = "plugins"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(index=True, unique=True)
    description: str | None = None
    version: str = Field(default="1.0.0")
    type: str = Field(default="custom")
    config_schema_json: str | None = None
    is_active: bool = Field(default=True, index=True)
    installed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None


class PluginInstallation(SQLModel, table=True):
    __tablename__ = "plugin_installations"
    id: int | None = Field(default=None, primary_key=True)
    plugin_id: int = Field(foreign_key="plugins.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    config_json: str | None = None
    enabled: bool = Field(default=True, index=True)
    installed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
