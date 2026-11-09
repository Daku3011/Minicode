from core.models import Problem
from main import app
from services.auth import get_current_user


def test_catalog_searches_beyond_first_page(client, session, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    session.add_all([Problem(title=f"Exercise {i}", description="Practice") for i in range(60)])
    session.add(Problem(title="Unique target", description="Practice", difficulty="Hard", xp_reward=500))
    session.add(Problem(title="Unique secret", description="Private", visibility="private"))
    session.add(Problem(title="Unique deleted", description="Deleted", is_deleted=True))
    session.commit()
    result = client.get('/problems', params={'search': 'unique', 'limit': 1}).json()
    assert result['total_count'] == 1
    assert result['items'][0]['title'] == 'Unique target'
    result = client.get('/problems', params={'skip': 50, 'limit': 10}).json()
    assert len(result['items']) == 10
    assert result['total_count'] == 61
    result = client.get('/problems', params={'difficulty': 'Hard', 'sort': 'xp'}).json()
    assert result['total_count'] == 1
    assert result['items'][0]['xp_reward'] == 500


def test_catalog_literal_search_and_bounds(client, session, test_user):
    app.dependency_overrides[get_current_user] = lambda: test_user
    session.add_all([Problem(title='100% coverage', description='A'), Problem(title='Other', description='B')])
    session.commit()
    result = client.get('/problems', params={'search': '%'}).json()
    assert result['total_count'] == 1
    for params in ({'skip': -1}, {'limit': 101}, {'sort': 'invalid'}, {'difficulty': 'invalid'}):
        assert client.get('/problems', params=params).status_code == 422


def test_faculty_can_search_private_catalog(client, session, test_faculty):
    app.dependency_overrides[get_current_user] = lambda: test_faculty
    session.add(Problem(title='Private lab', description='A', visibility='private', subject='python'))
    session.commit()
    result = client.get('/problems', params={'subject': 'python', 'sort': 'title'}).json()
    assert result['total_count'] == 1
    assert result['items'][0]['title'] == 'Private lab'


def test_student_sees_only_assigned_private_labs(client, session, test_user, test_faculty):
    from core.models import Cohort, Lab, LabProblemLink, UserCohortLink

    app.dependency_overrides[get_current_user] = lambda: test_user
    cohort = Cohort(name='Class', faculty_id=test_faculty.id)
    session.add(cohort)
    session.commit()
    lab = Lab(name='Lab', cohort_id=cohort.id)
    session.add(lab)
    session.add(UserCohortLink(user_id=test_user.id, cohort_id=cohort.id))
    assigned = Problem(title='Assigned', description='A', visibility='private')
    session.add(assigned)
    session.add(Problem(title='Unassigned', description='B', visibility='private'))
    session.commit()
    session.add(LabProblemLink(lab_id=lab.id, problem_id=assigned.id))
    session.commit()
    result = client.get('/problems').json()
    assert result['total_count'] == 1
    assert result['items'][0]['title'] == 'Assigned'
