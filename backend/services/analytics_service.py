from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case
import models
import datetime
from collections import defaultdict

class AnalyticsService:
    """OLAP-style analytics service for event analysis and mining"""
    
    def get_time_series_data(self, db: Session, granularity: str = "hourly", days: int = 7):
        """
        Get time-series aggregated data for events/transactions
        Granularity: hourly, daily, weekly
        """
        end_time = datetime.datetime.utcnow()
        start_time = end_time - datetime.timedelta(days=days)
        
        if granularity == "hourly":
            time_format = func.strftime('%Y-%m-%d %H:00:00', models.Transaction.timestamp)
        elif granularity == "daily":
            time_format = func.date(models.Transaction.timestamp)
        else:  # weekly
            time_format = func.strftime('%Y-W%W', models.Transaction.timestamp)
        
        results = db.query(
            time_format.label('period'),
            func.count(models.Transaction.id).label('total'),
            func.sum(case((models.Transaction.status == 'BLOCK', 1), else_=0)).label('blocked'),
            func.sum(case((models.Transaction.status == 'ALLOW', 1), else_=0)).label('allowed'),
            func.sum(case((models.Transaction.status == 'CHALLENGE', 1), else_=0)).label('challenged'),
            func.avg(models.Transaction.amount).label('avg_amount'),
            func.sum(models.Transaction.amount).label('total_volume')
        ).filter(
            models.Transaction.timestamp >= start_time
        ).group_by(time_format).order_by(time_format).all()
        
        return [
            {
                "period": str(r.period),
                "total": r.total,
                "blocked": r.blocked or 0,
                "allowed": r.allowed or 0,
                "challenged": r.challenged or 0,
                "avg_amount": float(r.avg_amount or 0),
                "total_volume": float(r.total_volume or 0),
                "fraud_rate": (r.blocked / r.total) if r.total > 0 else 0
            }
            for r in results
        ]
    
    def get_pattern_sequences(self, db: Session, min_support: int = 3):
        """
        Detect patterns in transaction sequences
        Find common user-merchant-device combinations
        """
        # Get frequent user-merchant-device triplets
        patterns = db.query(
            models.Transaction.user_id,
            models.Transaction.merchant,
            models.Transaction.device_id,
            func.count(models.Transaction.id).label('frequency'),
            func.sum(case((models.Transaction.status == 'BLOCK', 1), else_=0)).label('fraud_count')
        ).group_by(
            models.Transaction.user_id,
            models.Transaction.merchant,
            models.Transaction.device_id
        ).having(
            func.count(models.Transaction.id) >= min_support
        ).order_by(func.count(models.Transaction.id).desc()).limit(50).all()
        
        return [
            {
                "pattern": f"{p.user_id} → {p.merchant} → {p.device_id}",
                "user_id": p.user_id,
                "merchant": p.merchant,
                "device_id": p.device_id,
                "frequency": p.frequency,
                "fraud_count": p.fraud_count or 0,
                "confidence": (p.fraud_count / p.frequency) if p.frequency > 0 else 0,
                "is_suspicious": (p.fraud_count / p.frequency) > 0.3 if p.frequency > 0 else False
            }
            for p in patterns
        ]
    
    def get_entity_relationships(self, db: Session, entity_type: str = "all", limit: int = 100):
        """
        Get graph-based entity relationships
        Returns nodes and edges for graph visualization
        """
        nodes = []
        edges = []
        
        # Get transactions with relationships
        transactions = db.query(models.Transaction).limit(limit).all()
        
        user_nodes = set()
        merchant_nodes = set()
        device_nodes = set()
        
        for tx in transactions:
            # Create nodes
            if tx.user_id not in user_nodes:
                user_nodes.add(tx.user_id)
                nodes.append({
                    "id": f"user_{tx.user_id}",
                    "name": tx.user_id,
                    "type": "user",
                    "category": 0
                })
            
            if tx.merchant not in merchant_nodes:
                merchant_nodes.add(tx.merchant)
                nodes.append({
                    "id": f"merchant_{tx.merchant}",
                    "name": tx.merchant,
                    "type": "merchant",
                    "category": 1
                })
            
            if tx.device_id not in device_nodes:
                device_nodes.add(tx.device_id)
                nodes.append({
                    "id": f"device_{tx.device_id}",
                    "name": tx.device_id,
                    "type": "device",
                    "category": 2
                })
            
            # Create edges
            edges.append({
                "source": f"user_{tx.user_id}",
                "target": f"merchant_{tx.merchant}",
                "value": tx.amount,
                "status": tx.status
            })
            edges.append({
                "source": f"user_{tx.user_id}",
                "target": f"device_{tx.device_id}",
                "value": tx.amount,
                "status": tx.status
            })
        
        return {
            "nodes": nodes[:200],  # Limit for performance
            "edges": edges[:200],
            "categories": [
                {"name": "Users"},
                {"name": "Merchants"},
                {"name": "Devices"}
            ]
        }
    
    def get_root_cause_analysis(self, db: Session, time_window_hours: int = 24):
        """
        Perform root cause analysis for fraud patterns
        Identify common factors in blocked transactions
        """
        end_time = datetime.datetime.utcnow()
        start_time = end_time - datetime.timedelta(hours=time_window_hours)
        
        # Analyze blocked transactions
        blocked_txs = db.query(models.Transaction).filter(
            models.Transaction.status == 'BLOCK',
            models.Transaction.timestamp >= start_time
        ).all()
        
        if not blocked_txs:
            return {"factors": [], "total_analyzed": 0}
        
        # Aggregate by different dimensions
        location_dist = defaultdict(int)
        merchant_dist = defaultdict(int)
        device_dist = defaultdict(int)
        amount_ranges = {"0-100": 0, "100-500": 0, "500-1000": 0, "1000+": 0}
        
        for tx in blocked_txs:
            location_dist[tx.location] += 1
            merchant_dist[tx.merchant] += 1
            device_dist[tx.device_id] += 1
            
            if tx.amount < 100:
                amount_ranges["0-100"] += 1
            elif tx.amount < 500:
                amount_ranges["100-500"] += 1
            elif tx.amount < 1000:
                amount_ranges["500-1000"] += 1
            else:
                amount_ranges["1000+"] += 1
        
        factors = []
        
        # Top locations
        for loc, count in sorted(location_dist.items(), key=lambda x: x[1], reverse=True)[:5]:
            factors.append({
                "dimension": "location",
                "value": loc,
                "count": count,
                "percentage": (count / len(blocked_txs)) * 100
            })
        
        # Top merchants
        for merch, count in sorted(merchant_dist.items(), key=lambda x: x[1], reverse=True)[:5]:
            factors.append({
                "dimension": "merchant",
                "value": merch,
                "count": count,
                "percentage": (count / len(blocked_txs)) * 100
            })
        
        # Amount distribution
        for range_name, count in amount_ranges.items():
            if count > 0:
                factors.append({
                    "dimension": "amount_range",
                    "value": range_name,
                    "count": count,
                    "percentage": (count / len(blocked_txs)) * 100
                })
        
        return {
            "total_analyzed": len(blocked_txs),
            "time_window_hours": time_window_hours,
            "factors": factors
        }

analytics_service = AnalyticsService()
