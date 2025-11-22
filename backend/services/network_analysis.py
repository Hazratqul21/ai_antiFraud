"""
Network analysis for transaction relationships
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from collections import defaultdict
import math

def build_transaction_network(db: Session, limit: int = 100):
    """
    Build network graph of transaction relationships
    
    Nodes: Users, Merchants, Locations
    Edges: Transactions between them
    """
    transactions = db.query(models.Transaction).order_by(
        models.Transaction.timestamp.desc()
    ).limit(limit).all()
    
    nodes = {}
    edges = []
    node_id_counter = 0
    
    # Track relationships
    user_transactions = defaultdict(lambda: {'count': 0, 'risk': []})
    merchant_transactions = defaultdict(lambda: {'count': 0, 'risk': []})
    
    for tx in transactions:
        risk = db.query(models.RiskScore).filter(
            models.RiskScore.transaction_id == tx.id
        ).first()
        risk_score = risk.score if risk else 0.0
        
        # Add user node
        if tx.user_id not in nodes:
            nodes[tx.user_id] = {
                'id': f'user_{node_id_counter}',
                'label': tx.user_id[:8],
                'type': 'user',
                'transactionCount': 0,
                'risk': 0
            }
            node_id_counter += 1
        
        # Add merchant node
        if tx.merchant not in nodes:
            nodes[tx.merchant] = {
                'id': f'merchant_{node_id_counter}',
                'label': tx.merchant[:15],
                'type': 'merchant',
                'transactionCount': 0,
                'risk': 0
            }
            node_id_counter += 1
        
        # Update transaction counts and risks
        nodes[tx.user_id]['transactionCount'] += 1
        nodes[tx.merchant]['transactionCount'] += 1
        user_transactions[tx.user_id]['count'] += 1
        user_transactions[tx.user_id]['risk'].append(risk_score)
        merchant_transactions[tx.merchant]['count'] += 1
        merchant_transactions[tx.merchant]['risk'].append(risk_score)
        
        # Add edge
        edges.append({
            'source': nodes[tx.user_id]['id'],
            'target': nodes[tx.merchant]['id'],
            'weight': tx.amount,
            'risk': risk_score
        })
    
    # Calculate average risks
    for user_id, data in user_transactions.items():
        if data['risk']:
            nodes[user_id]['risk'] = sum(data['risk']) / len(data['risk'])
    
    for merchant_id, data in merchant_transactions.items():
        if data['risk']:
            nodes[merchant_id]['risk'] = sum(data['risk']) / len(data['risk'])
    
    # Generate positions (simple circle layout)
    node_list = list(nodes.values())
    angle_step = 2 * math.pi / len(node_list)
    
    for i, node in enumerate(node_list):
        angle = i * angle_step
        radius = 100
        node['x'] = radius * math.cos(angle)
        node['y'] = radius * math.sin(angle)
    
    return {
        'nodes': node_list,
        'edges': edges,
        'stats': {
            'total_nodes': len(node_list),
            'total_edges': len(edges),
            'users': sum(1 for n in node_list if n['type'] == 'user'),
            'merchants': sum(1 for n in node_list if n['type'] == 'merchant')
        }
    }

def get_fraud_pattern_3d(db: Session, limit: int = 200):
    """
    Get 3D fraud pattern data (Amount, Time, Risk)
    """
    transactions = db.query(models.Transaction).order_by(
        models.Transaction.timestamp.desc()
    ).limit(limit).all()
    
    amounts = []
    times = []
    risks = []
    labels = []
    
    for tx in transactions:
        risk = db.query(models.RiskScore).filter(
            models.RiskScore.transaction_id == tx.id
        ).first()
        risk_score = risk.score if risk else 0.0
        
        # Extract hour from timestamp
        hour = tx.timestamp.hour if tx.timestamp else 0
        
        amounts.append(float(tx.amount))
        times.append(float(hour))
        risks.append(float(risk_score))
        labels.append(
            f"ID: {tx.transaction_id[:8]}<br>"
            f"Amount: {tx.amount:,.0f} so'm<br>"
            f"Time: {hour:02d}:00<br>"
            f"Risk: {risk_score:.1f}%<br>"
            f"Status: {tx.status}"
        )
    
    return {
        'amounts': amounts,
        'times': times,
        'risks': risks,
        'labels': labels,
        'count': len(transactions)
    }
