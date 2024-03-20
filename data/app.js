// Import datasets from your datasets.js file
import { v1Datasets } from './datasets.js';
// If you're not using modules, ensure datasets.js is loaded before this script in your HTML
// This function fetches and processes a single dataset
// Names of the organs for labeling
  const organs = Object.keys(v1Datasets);

  var counts = organs.map(organ => ({ organ, ct1: 1, as1: 1, bg1: 1, bp1: 1 }));

  function processData(url, organ) {
    let skipRows = 0; // Number of rows to skip
    d3.csv(url, (row, index) => {
      if (index < skipRows) return null; // Skip the row
      return row; // Return the row data if not skipped
    }).then(function(data) {
      // Now 'data' will only include rows after the first 10
      const ct1Count = data.filter(row => row['CT/1'] !== null && row['CT/1'] !== undefined && row['CT/1'] !== '').length;
      const as1Count = data.filter(row => row['AS/1'] !== null && row['AS/1'] !== undefined && row['AS/1'] !== '').length;
    
      let bg1Count = 0, bp1Count = 0;

      try {
        bg1Count = data.filter(d => d['BGene/1']).length;
      } catch (error) {
        console.log(organ, "has no BGene");
      }

      try {
        bp1Count = data.filter(d => d['BProtein/1']).length;
      } catch (error) {
        console.log(organ, "has no BProtein");
      }
         // Store the counts
         // Iterate through the counts array
      counts.forEach(count => {
        if (count.organ === organ) {
          count.ct1 = ct1Count;
          count.as1 = as1Count;
          count.bg1 = bg1Count;
          count.bp1 = bp1Count;

          console.log(ct1Count, as1Count, bg1Count, bp1Count, organ);
  }
});  
    });
}
// Process all datasets
organs.forEach(organ => {
  processData(v1Datasets[organ], organ);
});

// Set a timeout to wait for the data processing to (hopefully) complete
setTimeout(() => {
  drawChart(counts);
}, 3000); // Waits 5 seconds before calling drawChart


// Function to draw the chart using D3.js
function drawChart(counts) {
  // Set up the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 100, left: 60 },
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            `translate(${margin.left},${margin.top})`);

  // Add X axis
  const x = d3.scaleBand()
    .domain(organs)
    .range([0, width])
    .padding(1);
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0,d3.max(counts, d => d.ct1)])
    .range([height,0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  console.log(counts); // Log the counts array to check its contents

  // Define the lines
  const ct1Line = d3.line()
    .x(d => x(d.organ))
    .y(d => y(d.ct1));
  const as1Line = d3.line()
    .x(d => x(d.organ))
    .y(d => y(d.as1));
  const bg1Line = d3.line()
    .x(d => x(d.organ))
    .y(d => y(d.bg1));
  const bp1Line = d3.line()
    .x(d => x(d.organ))
    .y(d => y(d.bp1));

//Draw the lines
// Assuming this code comes after you've appended your paths:

// Define legend properties

svg.append("path")
.datum(counts) 
.attr("class", "line")
.attr("d", ct1Line)
.style("fill", "none")
.style("stroke", "blue")
.style("stroke-width", "2");

svg.append("path")
.datum(counts) 
.attr("class", "line")
.attr("d", as1Line)
.style("fill", "none")
.style("stroke", "green")
.style("stroke-width", "2");

svg.append("path")
.datum(counts) 
.attr("class", "line")
.attr("d", bg1Line)
.style("fill", "none")
.style("stroke", "red")
.style("stroke-width", "2");

svg.append("path")
.datum(counts) 
.attr("class", "line")
.attr("d", bp1Line)
.style("fill", "none")
.style("stroke", "orange")
.style("stroke-width", "2");
// Add legend to the SVG
// Assume that legendData is defined as shown previously
const markerShapes = {
  circle: d => `
  M ${d.x - d.r} ${d.y} 
  a ${d.r} ${d.r} 0 1 0 ${2 * d.r} 0 
  a ${d.r} ${d.r} 0 1 0 -${2 * d.r} 0
`,
  diamond: d => `M${d.x},${d.y - d.r} L${d.x + d.r},${d.y} L${d.x},${d.y + d.r} L${d.x - d.r},${d.y} Z`,
  square: d => `M${d.x - d.r},${d.y - d.r} L${d.x + d.r},${d.y - d.r} L${d.x + d.r},${d.y + d.r} L${d.x - d.r},${d.y + d.r} Z`,
  triangle: d => `M ${d.x - d.r} ${d.y + d.r} L ${d.x} ${d.y - d.r} L ${d.x + d.r} ${d.y + d.r} Z`,
};

const legendData = [
  { label: 'CT/1', color: 'blue', shape: 'square' },
  { label: 'AS/1', color: 'green', shape: 'triangle' },
  { label: 'BG/1', color: 'red', shape: 'diamond' },
  { label: 'BP/1', color: 'orange', shape: 'circle' }
];

// Add labels to the legend
// Positioning the entire legend group
const legendLabelWidth = 18;
const legend = svg.selectAll('.legend')
.data(legendData)
.enter().append('g')
.attr('class', 'legend')
.attr('transform', (d, i) => `translate(${width - legendLabelWidth - 24}, ${i * 25})`);

// Append shapes to the legend, adjust positions based on label width
legend.each(function(d) {
d3.select(this).append('path')
  .attr('d', markerShapes[d.shape]({
    x: legendLabelWidth + 24, // X position based on the label width
    y: 0, // Centered vertically in the legend group
    r: 5 // Adjust the size as needed
  }))
  .style('fill', d.color);
});

// Append text to the legend
legend.append('text')
.attr('x', 0) // Text starts at the beginning of the legend group
.attr('y', 0)
.attr('dy', '0.35em') // Vertically center
.text(d => d.label)
.style('font-size', '12px')
.style('text-anchor', 'end'); // Text anchored at the end for right alignment

// Create a tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("text-align", "center")
  .style("width", "60px")
  .style("height", "28px")
  .style("padding", "2px")
  .style("font", "12px sans-serif")
  .style("background", "lightsteelblue")
  .style("border", "0px")
  .style("border-radius", "8px")
  .style("pointer-events", "none");

  // Function to add markers with different shapes and tooltips
  function getTooltipContent(d, lineType) {
    return `${d.organ}<br/>${lineType}: ${d[lineType]}`;
  }

  
function addMarkersWithShapes(data, line, shape, color) {
  svg.selectAll(`.dot-${line}`)
    .data(data)
    .enter().append('path')
    .attr("class", `dot-${line}`)
    .attr("d", d => markerShapes[shape]({ x: x(d.organ), y: y(d[line]), r: 5 }))
    .style("fill", color)
    .each(function(d) {
      // Add the x-coordinate to the data object for later comparison
      d.screenX = x(d.organ);
    })
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(getTooltipContent(d, line))
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
}

// Add different markers for each line
addMarkersWithShapes(counts, 'ct1', 'square', 'blue');
addMarkersWithShapes(counts, 'as1', 'triangle', 'green');
addMarkersWithShapes(counts, 'bg1', 'diamond', 'red');
addMarkersWithShapes(counts, 'bp1', 'circle', 'orange');




};
