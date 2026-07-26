import importlib
import inspect
import logging
import os
import sys
from typing import Any

logger = logging.getLogger(__name__)

_hooks: dict[str, list[tuple[str, Any]]] = {}
_loaded_plugins: dict[str, Any] = {}


def discover_plugins(plugins_dir: str | None = None) -> list[dict[str, Any]]:
    if plugins_dir is None:
        plugins_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "plugins")
    if not os.path.isdir(plugins_dir):
        return []

    if plugins_dir not in sys.path:
        sys.path.insert(0, os.path.dirname(plugins_dir))

    discovered = []
    for fname in sorted(os.listdir(plugins_dir)):
        if fname.startswith("_") or not fname.endswith(".py"):
            continue
        module_name = fname[:-3]
        try:
            module = importlib.import_module(f"plugins.{module_name}")
            for _, obj in inspect.getmembers(module, inspect.isclass):
                if hasattr(obj, "_is_plugin") and obj._is_plugin:
                    discovered.append({
                        "name": getattr(obj, "name", module_name),
                        "slug": getattr(obj, "slug", module_name),
                        "description": getattr(obj, "description", ""),
                        "version": getattr(obj, "version", "1.0.0"),
                        "type": getattr(obj, "type", "custom"),
                        "class_name": f"{module_name}.{obj.__name__}",
                    })
        except Exception as e:
            logger.warning(f"Failed to load plugin module {module_name}: {e}")
    return discovered


def load_plugin(plugin_slug: str, plugins_dir: str | None = None) -> Any | None:
    if plugin_slug in _loaded_plugins:
        return _loaded_plugins[plugin_slug]

    if plugins_dir is None:
        plugins_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "plugins")
    if plugins_dir not in sys.path:
        sys.path.insert(0, os.path.dirname(plugins_dir))

    try:
        module = importlib.import_module(f"plugins.{plugin_slug}")
        for _, obj in inspect.getmembers(module, inspect.isclass):
            if hasattr(obj, "_is_plugin") and obj._is_plugin:
                instance = obj()
                _loaded_plugins[plugin_slug] = instance
                register_hooks(instance)
                return instance
    except Exception as e:
        logger.error(f"Failed to load plugin {plugin_slug}: {e}")
    return None


def register_hooks(plugin_instance: Any) -> None:
    for hook_name in [
        "before_submission",
        "after_judge",
        "on_problem_create",
        "on_review_submit",
    ]:
        method = getattr(plugin_instance, hook_name, None)
        if method and callable(method):
            if hook_name not in _hooks:
                _hooks[hook_name] = []
            _hooks[hook_name].append((plugin_instance.slug, method))
            logger.info(f"Registered hook '{hook_name}' for plugin '{plugin_instance.slug}'")


def run_hook(hook_name: str, *args: Any, **kwargs: Any) -> list[Any]:
    results = []
    for slug, method in _hooks.get(hook_name, []):
        try:
            result = method(*args, **kwargs)
            results.append((slug, result))
        except Exception as e:
            logger.error(f"Plugin '{slug}' hook '{hook_name}' failed: {e}")
            results.append((slug, None))
    return results


def get_registry() -> dict[str, Any]:
    return {
        "hooks": list(_hooks.keys()),
        "loaded_plugins": list(_loaded_plugins.keys()),
    }
