"""
STANDMAP - Standards Relationship Graph Model
Utilizes NetworkX (with graceful native fallback) to build a directed, typed knowledge graph connecting
procurement requirements, primary recommended standards, and normative/cross-referenced standards
(Test Methods, Safety Standards, Installation Codes, and Related Products).
"""

from typing import List, Dict, Any

try:
    import networkx as nx
    HAS_NETWORKX = True
except ImportError:
    HAS_NETWORKX = False

class StandardsGraphEngine:
    def __init__(self):
        self.nodes = {}
        self.edges = []
        if HAS_NETWORKX:
            self.graph = nx.DiGraph()

    def build_analysis_graph(self, requirements: List[Dict[str, Any]], recommendations: List[Dict[str, Any]], all_standards_map: Dict[str, Any]) -> Dict[str, Any]:
        self.nodes = {}
        self.edges = []
        if HAS_NETWORKX:
            self.graph.clear()
        
        # 1. Add Requirement Nodes
        for req in requirements:
            node_id = req["id"]
            node_data = {
                "id": node_id,
                "node_type": "REQUIREMENT",
                "label": req["category"],
                "title": req["text"][:45] + "...",
                "category": req["category"],
                "source_info": f"Page {req.get('source_page', 1)} | {req.get('source_section', '')}"
            }
            self.nodes[node_id] = node_data
            if HAS_NETWORKX:
                self.graph.add_node(node_id, **node_data)
            
        # 2. Add Primary Recommended Standard Nodes & Edges
        primary_stds_added = set()
        
        for rec in recommendations:
            req_id = rec["requirement_id"]
            std_id = rec["standard_id"]
            std_obj = all_standards_map.get(std_id, {})
            
            if std_id not in primary_stds_added:
                node_data = {
                    "id": std_id,
                    "node_type": "PRIMARY_STANDARD",
                    "label": std_obj.get("is_number", std_id),
                    "title": std_obj.get("title", "Standard"),
                    "domain": std_obj.get("domain", ""),
                    "status": std_obj.get("status", "CURRENT"),
                    "certification": std_obj.get("certification_status", "VOLUNTARY")
                }
                self.nodes[std_id] = node_data
                if HAS_NETWORKX:
                    self.graph.add_node(std_id, **node_data)
                primary_stds_added.add(std_id)
                
            # Edge: Requirement -> Primary Standard
            edge_data = {
                "source": req_id,
                "target": std_id,
                "edge_type": "RECOMMENDED_FOR",
                "label": rec.get("applicability_status", "APPLICABLE"),
                "match_score": rec.get("match_score", 0.8)
            }
            self.edges.append(edge_data)
            if HAS_NETWORKX:
                self.graph.add_edge(req_id, std_id, **edge_data)
            
            # 3. Add Normative & Cross-Referenced Standards Nodes & Edges
            relationships = std_obj.get("relationships", [])
            for rel in relationships:
                target_is = rel["target_is"]
                target_id = f"STD-{target_is.replace(' ', '-').replace('/', '-')}"
                rel_type = rel["relationship_type"]
                
                if target_id not in self.nodes:
                    node_data = {
                        "id": target_id,
                        "node_type": "RELATED_STANDARD",
                        "label": target_is,
                        "title": rel.get("target_title", target_is),
                        "rel_type": rel_type,
                        "description": rel.get("description", "")
                    }
                    self.nodes[target_id] = node_data
                    if HAS_NETWORKX:
                        self.graph.add_node(target_id, **node_data)
                    
                # Edge: Primary Standard -> Related Standard
                edge_data = {
                    "source": std_id,
                    "target": target_id,
                    "edge_type": rel_type,
                    "label": rel_type.replace("_", " ").title(),
                    "description": rel.get("description", "")
                }
                self.edges.append(edge_data)
                if HAS_NETWORKX:
                    self.graph.add_edge(std_id, target_id, **edge_data)

        nodes_list = list(self.nodes.values())
        return {
            "total_nodes": len(nodes_list),
            "total_edges": len(self.edges),
            "nodes": nodes_list,
            "links": self.edges
        }
