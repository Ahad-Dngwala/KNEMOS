# backend/services/clusterer.py
"""
HDBSCAN density-based clustering for semantic workspace grouping.
Uses L2-normalized embeddings for better cosine-like distance behavior.
"""
import hdbscan
import numpy as np
from sklearn.preprocessing import normalize


def cluster_items(embeddings: np.ndarray, min_cluster_size: int = 2) -> list[int]:
    """
    Cluster items based on their semantic embeddings.

    Returns:
        List of integer labels. Label -1 = noise (unclassified).
        Labels 0, 1, 2, ... = distinct workspace clusters.
    """
    if len(embeddings) == 0:
        return []
    if len(embeddings) == 1:
        return [0]
    if len(embeddings) < 4:
        # Too few items for density clustering  put each in its own cluster
        return list(range(len(embeddings)))

    normalized = normalize(embeddings, norm='l2')

    clusterer = hdbscan.HDBSCAN(
        min_cluster_size=min_cluster_size,
        min_samples=1,
        metric='euclidean',
        cluster_selection_epsilon=0.35,
        prediction_data=True
    )
    labels = clusterer.fit_predict(normalized).tolist()

    # Promote noise points (-1) to singleton clusters with unique IDs
    max_label = max(labels) if labels else -1
    promoted = []
    for label in labels:
        if label == -1:
            max_label += 1
            promoted.append(max_label)
        else:
            promoted.append(label)

    return promoted
