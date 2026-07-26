import logging

from plugins import BasePlugin

logger = logging.getLogger(__name__)


class ExamplePlugin(BasePlugin):
    name = "Example Plugin"
    slug = "example_plugin"
    description = "An example plugin demonstrating the hook system"
    version = "1.0.0"
    type = "example"

    def before_submission(self, submission, **kwargs):
        logger.info(f"[ExamplePlugin] before_submission: {submission.id if submission else 'unknown'}")
        return submission

    def after_judge(self, result, **kwargs):
        logger.info(f"[ExamplePlugin] after_judge: score={result.get('score') if result else 'N/A'}")
        return result

    def on_problem_create(self, problem, **kwargs):
        logger.info(f"[ExamplePlugin] on_problem_create: {problem.title if problem else 'unknown'}")
        return problem

    def on_review_submit(self, review, **kwargs):
        logger.info(f"[ExamplePlugin] on_review_submit: review_id={review.id if review else 'unknown'}")
        return review
