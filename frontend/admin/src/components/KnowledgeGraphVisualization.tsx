const renderGraph = () => {
  if (!svgRef.current || !graph || !graph.nodes.length) return;

  const width = svgRef.current.clientWidth;
  const actualHeight = isFullscreen ? window.innerHeight - 120 : height;

  // 清除之前的所有元素
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  const g = svg.append("g")
    .attr("transform", `scale(${zoom})`);

  // 定义箭头标记
  svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#999");

  // 确保节点和关系数据有效
  if (!graph.nodes || graph.nodes.length === 0 || !graph.relations) {
    console.error("图谱数据无效", graph);
    return;
  }

  // 确保每个节点都有合法的id
  const validNodes = graph.nodes.filter(node => node && node.id !== undefined);
  const validRelations = graph.relations.filter(relation => 
    relation && 
    relation.source && 
    relation.target && 
    // 确保source和target都是存在的节点
    validNodes.some(node => node.id === (typeof relation.source === 'object' ? relation.source.id : relation.source)) &&
    validNodes.some(node => node.id === (typeof relation.target === 'object' ? relation.target.id : relation.target))
  );

  if (validNodes.length === 0 || validRelations.length === 0) {
    console.error("图谱数据无效，节点或关系不完整", {
      原始节点: graph.nodes.length,
      有效节点: validNodes.length,
      原始关系: graph.relations.length,
      有效关系: validRelations.length
    });
    return;
  }

  // 创建力导向模拟
  let simulation;

  if (layoutType === 'force') {
    // 力导向布局
    try {
      simulation = d3.forceSimulation(validNodes)
        .force('link', d3.forceLink()
          .id((d: any) => d.id)
          .links(validRelations)
          .distance(linkDistance)
        )
        .force('charge', d3.forceManyBody().strength(chargeStrength))
        .force('center', d3.forceCenter(width / 2, actualHeight / 2))
        .on('tick', ticked);
    } catch (error) {
      console.error("创建力导向模拟失败:", error);
      errorHandler.logError('graph-visualization', '力导向模拟失败', error);
      return;
    }
  } else if (layoutType === 'radial') {
    // ... existing code ...
  }
} 