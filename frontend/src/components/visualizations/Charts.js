import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Line chart for vital signs trend visualization
export const LineChart = ({ 
  data, 
  width = 600, 
  height = 300, 
  margin = { top: 20, right: 30, bottom: 30, left: 50 },
  xAccessor = d => d.timestamp,
  yAccessor = d => d.value,
  xLabel = 'Time',
  yLabel = 'Value',
  color = '#0284c7',
  thresholds = null,
  className = '',
  onPointClick
}) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Calculate dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG and append group
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, xAccessor))
      .range([0, innerWidth]);
    
    let yMin = d3.min(data, yAccessor);
    let yMax = d3.max(data, yAccessor);
    
    // Add padding to y domain
    const yPadding = (yMax - yMin) * 0.1;
    yMin = Math.max(0, yMin - yPadding);
    yMax = yMax + yPadding;
    
    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]);
    
    // Create line generator
    const line = d3
      .line()
      .x(d => xScale(xAccessor(d)))
      .y(d => yScale(yAccessor(d)))
      .curve(d3.curveMonotoneX);
    
    // Add thresholds if provided
    if (thresholds) {
      // Upper threshold
      if (thresholds.upper !== undefined) {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', yScale(thresholds.upper))
          .attr('y2', yScale(thresholds.upper))
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4');
        
        g.append('text')
          .attr('x', innerWidth)
          .attr('y', yScale(thresholds.upper) - 5)
          .attr('text-anchor', 'end')
          .attr('font-size', '10px')
          .attr('fill', '#dc2626')
          .text('Upper Threshold');
      }
      
      // Lower threshold
      if (thresholds.lower !== undefined) {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', yScale(thresholds.lower))
          .attr('y2', yScale(thresholds.lower))
          .attr('stroke', '#dc2626')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4');
        
        g.append('text')
          .attr('x', innerWidth)
          .attr('y', yScale(thresholds.lower) - 5)
          .attr('text-anchor', 'end')
          .attr('font-size', '10px')
          .attr('fill', '#dc2626')
          .text('Lower Threshold');
      }
    }
    
    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%H:%M')))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '10px'));
    
    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '10px'));
    
    // Add line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line);
    
    // Add data points
    const points = g
      .selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(xAccessor(d)))
      .attr('cy', d => yScale(yAccessor(d)))
      .attr('r', 4)
      .attr('fill', 'white')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .style('cursor', onPointClick ? 'pointer' : 'default');
    
    if (onPointClick) {
      points.on('click', (event, d) => {
        onPointClick(d);
      });
    }
    
    // Add a tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #cbd5e1')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
    
    points
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 6);
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>Time:</strong> ${d3.timeFormat('%H:%M:%S')(xAccessor(d))}<br>
            <strong>Value:</strong> ${yAccessor(d).toFixed(2)}
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 4);
        
        tooltip.style('visibility', 'hidden');
      });
    
    // Add axis labels
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 5)
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text(xLabel);
    
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -margin.top - innerHeight / 2)
      .attr('y', 15)
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text(yLabel);
    
  }, [data, width, height, margin, xAccessor, yAccessor, xLabel, yLabel, color, thresholds, onPointClick]);
  
  return (
    <div className={`line-chart ${className}`}>
      <svg ref={svgRef} />
    </div>
  );
};

// Bar chart for risk visualization
export const BarChart = ({ 
  data, 
  width = 600, 
  height = 300, 
  margin = { top: 20, right: 30, bottom: 30, left: 50 },
  xAccessor = d => d.label,
  yAccessor = d => d.value,
  xLabel = '',
  yLabel = '',
  color = '#0284c7',
  className = '',
  maxValue = 1.0,
  onBarClick
}) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Calculate dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG and append group
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map(xAccessor))
      .range([0, innerWidth])
      .padding(0.3);
    
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([innerHeight, 0]);
    
    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '10px'));
    
    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d * 100 + '%'))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '10px'));
    
    // Add bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(xAccessor(d)))
      .attr('y', d => yScale(yAccessor(d)))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(yAccessor(d)))
      .attr('fill', d => {
        // Color based on value
        if (yAccessor(d) >= 0.7) return '#dc2626';
        if (yAccessor(d) >= 0.4) return '#f59e0b';
        return '#16a34a';
      })
      .style('cursor', onBarClick ? 'pointer' : 'default');
    
    if (onBarClick) {
      bars.on('click', (event, d) => {
        onBarClick(d);
      });
    }
    
    // Add values on top of bars
    g.selectAll('.bar-value')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-value')
      .attr('x', d => xScale(xAccessor(d)) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(yAccessor(d)) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text(d => `${(yAccessor(d) * 100).toFixed(1)}%`);
    
    // Add axis labels
    if (xLabel) {
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', margin.left + innerWidth / 2)
        .attr('y', height - 5)
        .attr('font-size', '10px')
        .attr('fill', '#64748b')
        .text(xLabel);
    }
    
    if (yLabel) {
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -margin.top - innerHeight / 2)
        .attr('y', 15)
        .attr('font-size', '10px')
        .attr('fill', '#64748b')
        .text(yLabel);
    }
    
  }, [data, width, height, margin, xAccessor, yAccessor, xLabel, yLabel, color, maxValue, onBarClick]);
  
  return (
    <div className={`bar-chart ${className}`}>
      <svg ref={svgRef} />
    </div>
  );
};

// Feature contribution chart for SHAP explanations
export const FeatureContributionChart = ({
  data, 
  width = 600, 
  height = 300, 
  margin = { top: 20, right: 30, bottom: 30, left: 150 },
  className = ''
}) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Sort data by absolute contribution value
    const sortedData = [...data].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    
    // Calculate dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG and append group
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const yScale = d3
      .scaleBand()
      .domain(sortedData.map(d => d.feature))
      .range([0, innerHeight])
      .padding(0.3);
    
    const contributionMax = d3.max(sortedData, d => Math.abs(d.contribution));
    const xScale = d3
      .scaleLinear()
      .domain([-contributionMax, contributionMax])
      .range([0, innerWidth])
      .nice();
    
    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '10px'));
    
    // Add center line
    g.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4');
    
    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('text-anchor', 'end')
      );
    
    // Add bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => d.contribution < 0 ? xScale(d.contribution) : xScale(0))
      .attr('y', d => yScale(d.feature))
      .attr('width', d => Math.abs(xScale(d.contribution) - xScale(0)))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.contribution < 0 ? '#dc2626' : '#16a34a');
    
    // Add contribution values
    g.selectAll('.contribution-value')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'contribution-value')
      .attr('x', d => d.contribution < 0 ? xScale(d.contribution) - 5 : xScale(d.contribution) + 5)
      .attr('y', d => yScale(d.feature) + yScale.bandwidth() / 2)
      .attr('text-anchor', d => d.contribution < 0 ? 'end' : 'start')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text(d => d.contribution.toFixed(3));
    
    // Add x-axis label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 5)
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text('Feature Contribution');
    
  }, [data, width, height, margin]);
  
  return (
    <div className={`feature-contribution-chart ${className}`}>
      <svg ref={svgRef} />
    </div>
  );
};

// Heatmap for risk visualization over time
export const Heatmap = ({
  data,
  width = 600,
  height = 300,
  margin = { top: 20, right: 30, bottom: 30, left: 50 },
  xAccessor = d => d.x,
  yAccessor = d => d.y,
  valueAccessor = d => d.value,
  xLabel = '',
  yLabel = '',
  className = '',
  colorScale = d3.interpolateRdYlGn,
  onCellClick
}) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Calculate dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Get unique x and y values
    const xValues = Array.from(new Set(data.map(xAccessor)));
    const yValues = Array.from(new Set(data.map(yAccessor)));
    
    // Create SVG and append group
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(xValues)
      .range([0, innerWidth])
      .padding(0.1);
    
    const yScale = d3
      .scaleBand()
      .domain(yValues)
      .range([0, innerHeight])
      .padding(0.1);
    
    const color = d3
      .scaleSequential()
      .domain([1, 0]) // Reversed for correct color mapping
      .interpolator(colorScale);
    
    // Add cells
    const cells = g
      .selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(xAccessor(d)))
      .attr('y', d => yScale(yAccessor(d)))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => color(valueAccessor(d)))
      .style('cursor', onCellClick ? 'pointer' : 'default');
    
    if (onCellClick) {
      cells.on('click', (event, d) => {
        onCellClick(d);
      });
    }
    
    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-45)')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
      );
    
    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
      .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '10px'));
    
    // Add tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #cbd5e1')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
    
    cells
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('stroke', '#000')
          .attr('stroke-width', 2);
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${xAccessor(d)}</strong><br>
            <strong>${yAccessor(d)}:</strong> ${(valueAccessor(d) * 100).toFixed(1)}%
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('stroke', 'none');
        
        tooltip.style('visibility', 'hidden');
      });
    
    // Add color legend
    const legendHeight = 10;
    const legendWidth = 100;
    const legendX = width - margin.right - legendWidth;
    const legendY = margin.top;
    
    const legendScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, legendWidth]);
    
    const defs = svg.append('defs');
    
    const linearGradient = defs
      .append('linearGradient')
      .attr('id', 'linear-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    
    linearGradient.selectAll('stop')
      .data(d3.ticks(0, 1, 10))
      .enter()
      .append('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => color(d));
    
    svg.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#linear-gradient)');
    
    svg.append('text')
      .attr('x', legendX)
      .attr('y', legendY - 5)
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text('Low Risk');
    
    svg.append('text')
      .attr('x', legendX + legendWidth)
      .attr('y', legendY - 5)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .text('High Risk');
    
    // Add axis labels
    if (xLabel) {
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', margin.left + innerWidth / 2)
        .attr('y', height - 5)
        .attr('font-size', '10px')
        .attr('fill', '#64748b')
        .text(xLabel);
    }
    
    if (yLabel) {
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -margin.top - innerHeight / 2)
        .attr('y', 15)
        .attr('font-size', '10px')
        .attr('fill', '#64748b')
        .text(yLabel);
    }
    
  }, [data, width, height, margin, xAccessor, yAccessor, valueAccessor, xLabel, yLabel, colorScale, onCellClick]);
  
  return (
    <div className={`heatmap ${className}`}>
      <svg ref={svgRef} />
    </div>
  );
};
