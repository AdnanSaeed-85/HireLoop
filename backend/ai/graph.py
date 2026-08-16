from langgraph.graph import START, END, StateGraph
from backend.ai.agents.analyzer import analyzer_agent
from backend.ai.agents.jd_fetch import jd_fetch_agent
from backend.ai.agents.cv_parser import cv_parser_agent
from backend.ai.state import PipelineState
from backend.ai.agents.scheduling import send_interview_notification, send_hr_notification

def route_after_analyzer(state: PipelineState) -> str:
    score = state.get("score", {})
    overall_score = score.get("overall_score", 0)
    threshold = 7.0

    if overall_score >= threshold:
        return "send_interview_notification"
    else:
        return "send_hr_notification"

graph = StateGraph(PipelineState)

graph.add_node("send_hr_notification", send_hr_notification)
graph.add_edge("send_hr_notification", END)
graph.add_node("cv_parser_agent", cv_parser_agent)
graph.add_node("jd_fetch_agent", jd_fetch_agent)
graph.add_node("analyzer_agent", analyzer_agent)
graph.add_node("send_interview_notification", send_interview_notification)

graph.add_edge(START, "cv_parser_agent")
graph.add_edge("cv_parser_agent", "jd_fetch_agent")
graph.add_edge("jd_fetch_agent", "analyzer_agent")
graph.add_conditional_edges("analyzer_agent", route_after_analyzer)
graph.add_edge("send_interview_notification", END)

pipeline = graph.compile()