import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface LineChartProps {
  data: {
    name: string;
    value: number;
  }[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  showDots?: boolean;
}

export function LineChart({
  data,
  width = 500,
  height = 300,
  color = "var(--primary)",
  showArea = true,
  showDots = true,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.5);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([innerHeight, 0]);

    // 添加网格线
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerWidth)
          .tickFormat(() => ""),
      )
      .selectAll("line")
      .style("stroke", "var(--border)")
      .style("stroke-opacity", 0.5)
      .style("stroke-dasharray", "3,3");

    g.selectAll(".grid .domain").remove();

    // X 轴
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("fill", "var(--muted-foreground)")
      .style("font-size", "12px");

    g.selectAll(".domain").style("stroke", "var(--border)");
    g.selectAll(".tick line").style("stroke", "var(--border)");

    // Y 轴
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `¥${d.toLocaleString()}`),
      )
      .selectAll("text")
      .style("fill", "var(--muted-foreground)")
      .style("font-size", "12px");

    // 创建线条生成器
    const line = d3
      .line<(typeof data)[0]>()
      .x((d) => x(d.name) || 0)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // 添加渐变
    const gradientId = "line-gradient";
    const defs = svg.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.3);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);

    // 添加区域
    if (showArea) {
      const area = d3
        .area<(typeof data)[0]>()
        .x((d) => x(d.name) || 0)
        .y0(innerHeight)
        .y1((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", `url(#${gradientId})`)
        .attr("d", area)
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1);
    }

    // 添加线条
    const path = g
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // 线条动画
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeQuadOut)
      .attr("stroke-dashoffset", 0);

    // 添加点
    if (showDots) {
      const dots = g
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d) => x(d.name) || 0)
        .attr("cy", (d) => y(d.value))
        .attr("r", 0)
        .attr("fill", color)
        .attr("stroke", "var(--background)")
        .attr("stroke-width", 2)
        .style("cursor", "pointer");

      // 点动画
      dots
        .transition()
        .duration(800)
        .delay((_d: any, i: number) => i * 100)
        .attr("r", 5);

      // 悬停效果
      dots
        .on("mouseover", function (event: any, d: any) {
          d3.select(this).transition().duration(200).attr("r", 7);

          const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("background", "var(--card)")
            .style("border", "1px solid var(--border)")
            .style("border-radius", "8px")
            .style("padding", "8px 12px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
            .html(
              `<div style="font-weight: 500;">${d.name}</div>
               <div style="color: var(--muted-foreground);">¥${d.value.toLocaleString()}</div>`,
            );

          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).transition().duration(200).attr("r", 5);

          d3.selectAll(".d3-tooltip").remove();
        });
    }
  }, [data, width, height, color, showArea, showDots]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
    />
  );
}
