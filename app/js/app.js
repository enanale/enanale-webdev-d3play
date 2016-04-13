(function(){

  // ready!
  $( document ).ready(function() {
      console.log( "ready!" );
  });

  /*
   * From http://codepen.io/MadeByMike/pen/xrEzC
   */

  // A completely frivolous d3 animation for the purpose of learning about force layouts
  var width = 600,
      height = 400,
      stars = 500,
      frame = 1,  
    // This is the distance from the centre where nodes should placed, it just happens to be 1/6th the width or height... which ever is larger.
    // My thinking is anything closer gets sucked into that black-hole, it might not make sense but this is my universe.
      galatic_centre = (height/6) > (width/6) ? (width/6) : (height/6); 

  var fill = d3.scale.ordinal().range(["#FFB8FF", "#FFEECC","#D5FCFF","#BADCFF","#FFDCDA"]).domain(d3.range(0,5));

  var nodes = d3.range(stars).map(function(i) {
    return {index: i};
  });

  var force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .charge(-10) // This controls how the particles interact. Adjust to play god!
    .gravity(.01)
    .on("tick", tick)
    .start();

  // var svg = d3.select("body").append("svg")
  //   .attr("width", width)
  //   .attr("height", height);

  var svg = d3.select("body")
   .append("div")
   .classed("svg-container", true) //container class to make it responsive
   .append("svg")
   //responsive SVG needs these 2 attributes and no width and height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 600 400")
   //class to make it responsive
   .classed("svg-content-responsive", true); 

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 3)
      .style("fill", function(d, i) { return fill(d.speed); })
      // .style("stroke", function(d, i) { return d3.rgb(fill(d.speed)).darker(2); })
      .attr('stroke-width', 0)
      .call(force.drag);

  svg.style("opacity", 1e-6) 
    .transition()
    .duration(1000)
    .style("opacity", 1);

  // central circle
  svg.append("circle")
    .attr("cx", (width/2))
    .attr("cy", (height/2))
    .attr("r", 25)
    .style("fill", "#C7DFE8");


  function tick(e) {

    force.resume(); // Keep it going!
    var max=0; 
    frame++;
    if(frame > 359){
      frame = 1;
    }
    
    nodes.forEach(function(o, i) {

      var dx = o.x || 1;
      var dy = o.y || 1;

    // Speed is equal to the distance from the centre
      o.speed = Math.sqrt(
        ((width/2) - dx) * ((width/2) - dx) + // A squared
        ((height/2) - dy) * ((height/2) - dy) // B squared
      );

    // We're getting the max so we can apply a range later
      if(o.speed > max){
        max=o.speed; 
      }
    });

    // Let's change the colour based on distance from centre. Just because.
    svg.selectAll(".node").style("fill", function(d, i) { 
    var speed = Math.round((d.speed/max)*5); // Get num 1-5 to apply my colours
    return fill(speed); 
    }).style("stroke", function(d, i) { 
    var speed = Math.round((d.speed/max)*5);
    return d3.rgb(fill(d.speed)).darker(2); 
    });
    
    nodes.forEach(function(o, i) {
      // All layout and animation is calculated here
      layout_galaxy(o,i,e.alpha,frame,max);
    });

    node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
  }

  function layout_galaxy(data, index, alpha, frame, max_speed) {
    var D2R = Math.PI / 180;
    var drag=140; // This means the outer edge of a spiral will drag 140 degrees behind the inner
    var spiral_arms = 10; // How many arms, Also fun to change.
    spiral_arms = 360/spiral_arms; // Get the number of deg between each arm 
    // Here is where most of the layout happens
    var currentAngle = (spiral_arms * index) + frame + (drag*(data.speed/max_speed)); 
    // (spiral_arms * index) - Group nodes into the arms around the circle
    // frame - Adjust position depending on the frame 1-360
    // (drag*(data.speed/max_speed) - Adjust position based on distance from centre (speed) (watch what happens when you change the + to a - here!)
    var currentAngleRadians = currentAngle * D2R; 
    // Magic positioning
    var radialPoint = {
      x: (width/2) + galatic_centre * Math.cos(currentAngleRadians),
      y: (height/2) + galatic_centre * Math.sin(currentAngleRadians)
    };

    // Throttle based on energy in the system this allows other forces like charge to work
    var affectSize = alpha * 0.5; 
    data.x += (radialPoint.x - data.x) * affectSize;
    data.y += (radialPoint.y - data.y) * affectSize;

  }


}());