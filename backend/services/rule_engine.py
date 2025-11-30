from typing import List, Dict, Any

from data.rules_config import RULES


def _get_value(key: str, context: Dict[str, Any], default=None):
    return context.get(key, default)


def _match_condition(condition: Dict[str, Any], transaction: Dict[str, Any], enrichment: Dict[str, Any]) -> bool:
    cond_type = condition["type"]
    derived = enrichment.get("derived_features", {})
    signals = enrichment.get("signals", {})
    if cond_type == "amount_greater_than":
        return transaction["amount"] > condition["value"]
    if cond_type == "amount_less_than":
        return transaction["amount"] < condition["value"]
    if cond_type == "amount_between":
        return condition["min"] <= transaction["amount"] <= condition["max"]
    if cond_type == "country_in":
        return (enrichment.get("geo_country") or "").upper() in condition["value"]
    if cond_type == "ip_risk_above":
        return (enrichment.get("ip_risk_score") or 0) > condition["value"]
    if cond_type == "ip_reputation_equals":
        return (enrichment.get("ip_reputation") or "") == condition["value"]
    if cond_type == "velocity_flag_equals":
        flag = derived.get("velocity_flag") if derived else transaction.get("velocity_flag")
        return flag == condition["value"]
    if cond_type == "device_change_equals":
        val = derived.get("device_change") if derived else transaction.get("device_change")
        return val == condition["value"]
    if cond_type == "user_segment_in":
        segment = enrichment.get("user_segment") or signals.get("behavioral", {}).get("segment")
        return segment in condition["value"]
    return False


def evaluate_rules(transaction: Dict[str, Any], enrichment: Dict[str, Any]) -> List[Dict[str, Any]]:
    hits = []
    for rule in RULES:
        matched = all(_match_condition(cond, transaction, enrichment) for cond in rule["conditions"])
        if matched:
            hits.append({
                "rule_id": rule["id"],
                "rule_name": rule["name"],
                "severity": rule["severity"],
                "action": rule["action"],
                "reason": rule.get("reason", ""),
            })
    return hits


def decide_action(rule_hits: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not rule_hits:
        return {"action": "ALLOW", "status_override": None, "reason": "No rule triggered."}

    priority = {"BLOCK": 3, "CHALLENGE": 2, "ALLOW": 1}
    top_hit = max(rule_hits, key=lambda hit: priority.get(hit["action"], 0))
    status_map = {
        "BLOCK": "BLOCK",
        "CHALLENGE": "CHALLENGE",
        "ALLOW": None,
    }
    return {
        "action": top_hit["action"],
        "status_override": status_map[top_hit["action"]],
        "reason": top_hit["reason"],
        "triggered_rules": [hit["rule_id"] for hit in rule_hits],
    }




