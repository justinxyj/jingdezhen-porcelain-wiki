#!/usr/bin/env python3
import csv
import networkx as nx
from pathlib import Path
p=Path(__file__).resolve().parents[1]/".ai/data/bridge_centrality_edges_20260920.csv"
G=nx.Graph()
with p.open(encoding="utf-8") as f:
    for r in csv.DictReader(f):
        G.add_edge(r["s1"], r["s2"], evidence_grade=r["evidence_grade"], relation_type=r["relation_type"])
bc=nx.betweenness_centrality(G, normalized=True, endpoints=False, weight=None)
for slug,score in sorted(bc.items(), key=lambda x:x[1], reverse=True)[:25]:
    print(f"{slug}\t{score:.8f}")
