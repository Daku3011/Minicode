from typing import Any


class BasePlugin:
    _is_plugin = True

    name: str = ""
    slug: str = ""
    description: str = ""
    version: str = "1.0.0"
    type: str = "custom"

    def before_submission(self, submission: Any, **kwargs: Any) -> Any:
        pass

    def after_judge(self, result: Any, **kwargs: Any) -> Any:
        pass

    def on_problem_create(self, problem: Any, **kwargs: Any) -> Any:
        pass

    def on_review_submit(self, review: Any, **kwargs: Any) -> Any:
        pass
