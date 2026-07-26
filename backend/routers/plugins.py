import json
import logging
from datetime import datetime, timezone

from core.database import get_session
from core.models import User
from core.models_plugin import Plugin, PluginInstallation
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.auth import get_current_user
from services.plugin_engine import discover_plugins, get_registry, load_plugin
from sqlmodel import Session, select

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/plugins", tags=["plugins"])


class PluginInstallInput(BaseModel):
    name: str
    slug: str
    description: str | None = None
    version: str = "1.0.0"
    config: dict = {}


@router.post("/install")
def install_plugin(
    data: PluginInstallInput,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    existing = session.exec(select(Plugin).where(Plugin.slug == data.slug)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Plugin already installed")

    plugin = Plugin(
        name=data.name,
        slug=data.slug,
        description=data.description,
        version=data.version,
    )
    session.add(plugin)
    session.commit()
    session.refresh(plugin)

    installation = PluginInstallation(
        plugin_id=plugin.id,
        user_id=user.id,
        config_json=json.dumps(data.config),
    )
    session.add(installation)
    session.commit()

    load_plugin(data.slug)
    return plugin


@router.get("")
def list_plugins(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    plugins = session.exec(select(Plugin)).all()
    return plugins


@router.get("/{plugin_id}")
def get_plugin(
    plugin_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    plugin = session.get(Plugin, plugin_id)
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return plugin


@router.put("/{plugin_id}/toggle")
def toggle_plugin(
    plugin_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    plugin = session.get(Plugin, plugin_id)
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")
    plugin.is_active = not plugin.is_active
    plugin.updated_at = datetime.now(timezone.utc)
    session.add(plugin)
    session.commit()
    session.refresh(plugin)
    return plugin


@router.delete("/{plugin_id}")
def uninstall_plugin(
    plugin_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    plugin = session.get(Plugin, plugin_id)
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")

    installations = session.exec(
        select(PluginInstallation).where(PluginInstallation.plugin_id == plugin_id)
    ).all()
    for inst in installations:
        session.delete(inst)
    session.delete(plugin)
    session.commit()
    return {"detail": "Plugin uninstalled"}


@router.get("/marketplace")
def marketplace(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    discovered = discover_plugins()
    installed = {p.slug for p in session.exec(select(Plugin)).all()}
    for p in discovered:
        p["installed"] = p["slug"] in installed
    inventory = get_registry()
    return {
        "available": discovered,
        "registry": inventory,
    }
