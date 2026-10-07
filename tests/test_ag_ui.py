import asyncio
import json

import httpx
import pytest
from pydantic_ai import Agent
from pydantic_ai.messages import ToolReturnPart
from pydantic_ai.models.function import DeltaToolCall, FunctionModel
from pydantic_ai.ui import StateDeps

from backend.main import create_app


@pytest.mark.parametrize('greeting', ['Quero viajar de Chicago para Miami 04/11 e 04/12', 'Chicago to Miami 04/11 to 04/12'])
def test_ag_ui_discovers_calendar_and_resumes_with_human_dates(monkeypatch, greeting):
    observed = []

    async def model(messages, info):
        observed.append(messages)
        assert any(tool.name == 'show_date_confirmation' for tool in info.function_tools)
        results = [part for message in messages for part in message.parts if isinstance(part, ToolReturnPart)]
        if not results:
            yield {0: DeltaToolCall(name='show_date_confirmation', json_args='{"departureDate":"04/11","returnDate":"04/12"}', tool_call_id='calendar-1')}
        else:
            content = results[-1].content
            result = json.loads(content) if isinstance(content, str) else content
            assert result['period'] == {'departureDate': '2026-11-04', 'returnDate': '2026-12-04'}
            assert result['datesConfirmed'] is True
            yield 'FINAL: Dates received. Choose a simulated flight.'

    agent = Agent(FunctionModel(stream_function=model), deps_type=StateDeps[dict])
    monkeypatch.setattr('backend.main.build_conversational_agent', lambda: agent)
    payload = {
        'threadId': 'calendar-test', 'runId': 'run-1', 'state': {},
        'messages': [{'id': 'user-1', 'role': 'user', 'content': greeting}],
        'tools': [{'name': 'show_date_confirmation', 'description': 'Confirm travel dates', 'parameters': {'type': 'object', 'properties': {'departureDate': {'type': 'string'}, 'returnDate': {'type': 'string'}}, 'required': ['departureDate', 'returnDate']}}],
        'context': [], 'forwardedProps': {},
    }

    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app()), base_url='http://test') as client:
            first = await client.post('/api/assistant/ag-ui', json=payload)
            assert first.status_code == 200
            events = [json.loads(line[5:]) for line in first.text.splitlines() if line.startswith('data:')]
            assert any(event['type'] == 'TOOL_CALL_START' and event['toolCallId'] == 'calendar-1' for event in events)
            assert any(event['type'] == 'RUN_FINISHED' for event in events)
            result = {'datesConfirmed': True, 'period': {'departureDate': '2026-11-04', 'returnDate': '2026-12-04'}}
            payload['messages'].extend([
                {'id': 'assistant-1', 'role': 'assistant', 'content': '', 'toolCalls': [{'id': 'calendar-1', 'type': 'function', 'function': {'name': 'show_date_confirmation', 'arguments': '{"departureDate":"04/11","returnDate":"04/12"}'}}]},
                {'id': 'result-1', 'role': 'tool', 'toolCallId': 'calendar-1', 'content': json.dumps(result)},
            ])
            payload['state'] = result
            payload['runId'] = 'run-2'
            second = await client.post('/api/assistant/ag-ui', json=payload)
            assert second.status_code == 200
            assert 'Dates received' in second.text
            assert 'RUN_ERROR' not in second.text

    asyncio.run(exercise())
    assert len(observed) == 2
